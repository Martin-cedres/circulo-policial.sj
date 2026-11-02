import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import {
    getPeriodoActual,
    calcularCoberturaPago,
    generarRangoPeriodos,
    formatearPeriodoCorto,
} from '@/lib/periodos';
import { enviarConfirmacionAcreditacionPago } from '@/lib/recordatorios';

export const runtime = 'nodejs';

async function ensureSchema(sql: ReturnType<typeof getSql>) {
    await sql`ALTER TABLE socios ADD COLUMN IF NOT EXISTS pagado_hasta VARCHAR(7)`;

    await sql`
        CREATE TABLE IF NOT EXISTS pagos_transferencia (
            id SERIAL PRIMARY KEY,
            cedula VARCHAR(50) NOT NULL,
            socio_id INTEGER,
            nombre VARCHAR(255),
            monto NUMERIC(10, 2) DEFAULT 140.00,
            cantidad_meses INTEGER DEFAULT 1,
            periodo_desde VARCHAR(7),
            periodo_hasta VARCHAR(7),
            periodos_detalle TEXT,
            archivo_nombre VARCHAR(255),
            archivo_tamano INTEGER,
            observaciones TEXT,
            estado VARCHAR(50) DEFAULT 'pendiente',
            confirmado_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS cantidad_meses INTEGER DEFAULT 1`;
    await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS periodo_desde VARCHAR(7)`;
    await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS periodo_hasta VARCHAR(7)`;
    await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS periodos_detalle TEXT`;
    await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS confirmado_at TIMESTAMP WITH TIME ZONE`;

    // Normalizar registros antiguos con estado 'recibido' a 'pendiente'
    const mesActual = getPeriodoActual();
    const detalleActual = formatearPeriodoCorto(mesActual);
    await sql`
        UPDATE pagos_transferencia
        SET 
            estado = CASE WHEN estado = 'recibido' THEN 'pendiente' ELSE estado END,
            cantidad_meses = COALESCE(cantidad_meses, 1),
            periodo_desde = COALESCE(periodo_desde, ${mesActual}),
            periodo_hasta = COALESCE(periodo_hasta, ${mesActual}),
            periodos_detalle = COALESCE(periodos_detalle, ${detalleActual})
        WHERE estado = 'recibido' OR periodo_desde IS NULL OR periodo_hasta IS NULL
    `;

    // Vincular pagos huérfanos cuyo socio_id sea null pero coincida la cédula
    await sql`
        UPDATE pagos_transferencia pt
        SET 
            socio_id = s.id,
            nombre = s.nombre
        FROM socios s
        WHERE pt.socio_id IS NULL
          AND (
              pt.cedula = s.cedula
              OR pt.cedula = CONCAT(s.cedula, COALESCE(s.digito_verificador, ''))
              OR SUBSTRING(pt.cedula, 1, GREATEST(LENGTH(pt.cedula) - 1, 1)) = s.cedula
          )
    `;
}

async function recalcularCoberturaSocio(sql: ReturnType<typeof getSql>, socioId: number | null) {
    if (!socioId) return null;
    const maxRes = await sql`
        SELECT MAX(periodo_hasta) AS max_hasta
        FROM pagos_transferencia
        WHERE socio_id = ${socioId}
          AND estado = 'confirmado'
          AND periodo_hasta IS NOT NULL
    `;
    const nuevoHasta = maxRes[0]?.max_hasta || null;
    await sql`
        UPDATE socios
        SET pagado_hasta = ${nuevoHasta}
        WHERE id = ${socioId}
    `;
    return nuevoHasta;
}

export async function GET() {
    const sql = getSql();
    try {
        await ensureSchema(sql);

        const periodoActual = getPeriodoActual();

        const pagos = await sql`
            SELECT 
                pt.id,
                pt.cedula,
                pt.socio_id,
                COALESCE(s.nombre, pt.nombre) AS nombre,
                s.cedula AS socio_cedula,
                s.digito_verificador AS socio_dv,
                s.email AS socio_email,
                s.telefono AS socio_telefono,
                s.pagado_hasta AS socio_pagado_hasta,
                pt.monto,
                pt.cantidad_meses,
                pt.periodo_desde,
                pt.periodo_hasta,
                pt.periodos_detalle,
                pt.archivo_nombre,
                pt.archivo_tamano,
                pt.observaciones,
                pt.estado,
                pt.confirmado_at,
                pt.created_at
            FROM pagos_transferencia pt
            LEFT JOIN socios s ON pt.socio_id = s.id
            ORDER BY 
                CASE WHEN pt.estado = 'pendiente' THEN 0 ELSE 1 END ASC,
                pt.created_at DESC
        `;

        const sociosBrou = await sql`
            SELECT 
                s.id,
                s.cedula,
                s.digito_verificador,
                s.nombre,
                s.email,
                s.telefono,
                s.direccion,
                s.localidad,
                s.metodo_pago,
                s.subcategoria,
                s.pagado_hasta,
                (
                    SELECT COUNT(*)::int 
                    FROM pagos_transferencia pt 
                    WHERE pt.socio_id = s.id AND pt.estado = 'confirmado'
                ) AS pagos_confirmados_count,
                (
                    SELECT COUNT(*)::int 
                    FROM pagos_transferencia pt 
                    WHERE pt.socio_id = s.id AND pt.estado = 'pendiente'
                ) AS pagos_pendientes_count,
                (
                    SELECT COALESCE(SUM(pt.monto), 0)::numeric 
                    FROM pagos_transferencia pt 
                    WHERE pt.socio_id = s.id AND pt.estado = 'confirmado'
                ) AS total_abonado
            FROM socios s
            WHERE s.estado = 'activo'
              AND (
                  s.subcategoria = 'particular_transferencia' 
                  OR s.subcategoria = 'transferencia'
                  OR EXISTS (SELECT 1 FROM pagos_transferencia pt WHERE pt.socio_id = s.id)
              )
            ORDER BY s.nombre ASC
        `;

        // Calcular todos los meses cubiertos por socio para la grilla anual
        const pagosConfirmados = pagos.filter((p: any) => p.estado === 'confirmado');
        const coberturaPorSocio: Record<number, string[]> = {};

        for (const p of pagosConfirmados) {
            if (!p.socio_id || !p.periodo_desde) continue;
            const lista = generarRangoPeriodos(p.periodo_desde, Number(p.cantidad_meses) || 1);
            if (!coberturaPorSocio[p.socio_id]) {
                coberturaPorSocio[p.socio_id] = [];
            }
            for (const per of lista) {
                if (!coberturaPorSocio[p.socio_id].includes(per)) {
                    coberturaPorSocio[p.socio_id].push(per);
                }
            }
        }

        const sociosConMeses = sociosBrou.map((s: any) => {
            const mesesCubiertos = coberturaPorSocio[s.id] ? [...coberturaPorSocio[s.id]].sort() : [];
            // Si tiene pagado_hasta manual pero no está en la lista, asegurarlo
            if (s.pagado_hasta && !mesesCubiertos.includes(s.pagado_hasta)) {
                mesesCubiertos.push(s.pagado_hasta);
                mesesCubiertos.sort();
            }
            return {
                ...s,
                meses_cubiertos: mesesCubiertos,
            };
        });

        const pendientesConfirmar = pagos.filter((p: any) => p.estado === 'pendiente').length;
        const totalSociosBrou = sociosConMeses.length;
        const sociosAlDia = sociosConMeses.filter((s: any) => s.pagado_hasta === periodoActual).length;
        const sociosAdelantados = sociosConMeses.filter((s: any) => s.pagado_hasta && s.pagado_hasta > periodoActual).length;
        const sociosAdeudanMes = sociosConMeses.filter((s: any) => !s.pagado_hasta || s.pagado_hasta < periodoActual).length;

        const recaudacionTotalConfirmada = pagosConfirmados.reduce(
            (acc: number, p: any) => acc + (parseFloat(p.monto) || 0),
            0
        );
        const totalCuotasConfirmadas = pagosConfirmados.reduce(
            (acc: number, p: any) => acc + (Number(p.cantidad_meses) || 1),
            0
        );

        return NextResponse.json({
            success: true,
            periodoActual,
            pagos,
            sociosBrou: sociosConMeses,
            resumen: {
                periodoActual,
                pendientesConfirmar,
                totalSociosBrou,
                sociosAlDia,
                sociosAdelantados,
                sociosCubiertosTotal: sociosAlDia + sociosAdelantados,
                sociosAdeudanMes,
                recaudacionTotalConfirmada,
                totalCuotasConfirmadas,
            },
        });
    } catch (error: any) {
        console.error('Error en GET /api/admin/pagos:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        await ensureSchema(sql);

        const body = await request.json();
        const {
            socioId,
            cantidadMeses = 1,
            periodoDesde,
            monto,
            observaciones = '',
            estado = 'confirmado',
        } = body;

        if (!socioId) {
            return NextResponse.json({ error: 'Debe seleccionar un socio.' }, { status: 400 });
        }

        const socioRows = await sql`
            SELECT id, cedula, digito_verificador, nombre, email, pagado_hasta, subcategoria
            FROM socios
            WHERE id = ${socioId}
            LIMIT 1
        `;

        if (socioRows.length === 0) {
            return NextResponse.json({ error: 'Socio no encontrado.' }, { status: 404 });
        }

        const socio = socioRows[0];
        const cant = Math.max(1, Math.min(36, Number(cantidadMeses) || 1));
        const cobertura = calcularCoberturaPago(socio.pagado_hasta, cant, periodoDesde);
        const montoFinal = monto !== undefined && monto !== null && monto !== ''
            ? Number(monto)
            : cant * 140;

        // Si el socio no tenía subcategoría de transferencia, aseguramos que quede en transferencia si así se desea
        const estadoFinal = estado === 'pendiente' ? 'pendiente' : 'confirmado';
        const confirmadoAt = estadoFinal === 'confirmado' ? new Date().toISOString() : null;

        const insertRes = await sql`
            INSERT INTO pagos_transferencia (
                cedula, socio_id, nombre, monto, cantidad_meses,
                periodo_desde, periodo_hasta, periodos_detalle,
                archivo_nombre, observaciones, estado, confirmado_at
            )
            VALUES (
                ${socio.cedula},
                ${socio.id},
                ${socio.nombre},
                ${montoFinal},
                ${cant},
                ${cobertura.periodoDesde},
                ${cobertura.periodoHasta},
                ${cobertura.periodosDetalle},
                'Registro Manual Admin',
                ${observaciones.trim() || null},
                ${estadoFinal},
                ${confirmadoAt}
            )
            RETURNING id
        `;

        let nuevoPagadoHasta = socio.pagado_hasta;
        if (estadoFinal === 'confirmado') {
            nuevoPagadoHasta = await recalcularCoberturaSocio(sql, socio.id);

            // Enviar correo de confirmación de cuota acreditada al socio
            if (socio.email && socio.email.includes('@')) {
                try {
                    await enviarConfirmacionAcreditacionPago({
                        socio: {
                            id: socio.id,
                            nombre: socio.nombre,
                            email: socio.email,
                            cedula: socio.cedula,
                            digito_verificador: socio.digito_verificador,
                        },
                        cantidadMeses: cant,
                        periodoHasta: cobertura.periodoHasta,
                        periodosLista: cobertura.periodosLista,
                        periodosDetalle: cobertura.periodosDetalle,
                        monto: montoFinal,
                    });
                } catch (emailErr) {
                    console.error('Error enviando email de acreditación de cuota:', emailErr);
                }
            }
        }

        return NextResponse.json({
            success: true,
            id: insertRes[0].id,
            pagadoHasta: nuevoPagadoHasta,
            message: estadoFinal === 'confirmado'
                ? `Pago registrado y confirmado para ${socio.nombre} (${cobertura.periodosDetalle} — $${montoFinal}).`
                : `Pago registrado como pendiente para ${socio.nombre}.`,
        });
    } catch (error: any) {
        console.error('Error en POST /api/admin/pagos:', error);
        return NextResponse.json({ error: error.message || 'Error al registrar pago' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const sql = getSql();
    try {
        await ensureSchema(sql);

        const body = await request.json();
        const {
            id,
            accion, // 'confirmar' | 'rechazar' | 'editar'
            socioId,
            cantidadMeses,
            periodoDesde,
            monto,
            observaciones,
            estado,
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID de pago requerido.' }, { status: 400 });
        }

        const pagoRows = await sql`
            SELECT * FROM pagos_transferencia WHERE id = ${id} LIMIT 1
        `;

        if (pagoRows.length === 0) {
            return NextResponse.json({ error: 'Registro de pago no encontrado.' }, { status: 404 });
        }

        const pagoActual = pagoRows[0];
        const targetSocioId = socioId !== undefined ? socioId : pagoActual.socio_id;

        if (accion === 'rechazar') {
            await sql`
                UPDATE pagos_transferencia
                SET estado = 'rechazado'
                WHERE id = ${id}
            `;
            const nuevoHasta = await recalcularCoberturaSocio(sql, targetSocioId);
            return NextResponse.json({
                success: true,
                pagadoHasta: nuevoHasta,
                message: `El registro de pago #${id} fue marcado como rechazado.`,
            });
        }

        // Obtener socio para calcular cobertura si aplica
        let socioPagadoHasta: string | null = null;
        let socioNombre = pagoActual.nombre;
        let socioParaMail: any = null;
        if (targetSocioId) {
            const sRows = await sql`
                SELECT id, cedula, digito_verificador, nombre, email, pagado_hasta 
                FROM socios 
                WHERE id = ${targetSocioId} 
                LIMIT 1
            `;
            if (sRows.length > 0) {
                socioPagadoHasta = sRows[0].pagado_hasta;
                socioNombre = sRows[0].nombre;
                socioParaMail = sRows[0];
            }
        }

        const cantFinal = cantidadMeses !== undefined
            ? Math.max(1, Math.min(36, Number(cantidadMeses) || 1))
            : (Number(pagoActual.cantidad_meses) || 1);

        const inicioBase = periodoDesde || pagoActual.periodo_desde;
        const cobertura = calcularCoberturaPago(socioPagadoHasta, cantFinal, inicioBase);

        const montoFinal = monto !== undefined && monto !== null && monto !== ''
            ? Number(monto)
            : (cantidadMeses !== undefined ? cantFinal * 140 : Number(pagoActual.monto));

        const obsFinal = observaciones !== undefined ? (observaciones.trim() || null) : pagoActual.observaciones;
        const estadoFinal = accion === 'confirmar'
            ? 'confirmado'
            : (estado || pagoActual.estado);

        const confirmadoAt = estadoFinal === 'confirmado'
            ? (pagoActual.confirmado_at || new Date().toISOString())
            : null;

        await sql`
            UPDATE pagos_transferencia
            SET 
                socio_id = ${targetSocioId},
                nombre = ${socioNombre},
                cantidad_meses = ${cantFinal},
                periodo_desde = ${cobertura.periodoDesde},
                periodo_hasta = ${cobertura.periodoHasta},
                periodos_detalle = ${cobertura.periodosDetalle},
                monto = ${montoFinal},
                observaciones = ${obsFinal},
                estado = ${estadoFinal},
                confirmado_at = ${confirmadoAt}
            WHERE id = ${id}
        `;

        const nuevoPagadoHasta = await recalcularCoberturaSocio(sql, targetSocioId);

        // Si se confirmó el pago, enviar correo automático de confirmación al socio
        if (estadoFinal === 'confirmado' && (accion === 'confirmar' || pagoActual.estado !== 'confirmado')) {
            if (socioParaMail?.email && socioParaMail.email.includes('@')) {
                try {
                    await enviarConfirmacionAcreditacionPago({
                        socio: {
                            id: socioParaMail.id,
                            nombre: socioParaMail.nombre,
                            email: socioParaMail.email,
                            cedula: socioParaMail.cedula,
                            digito_verificador: socioParaMail.digito_verificador,
                        },
                        cantidadMeses: cantFinal,
                        periodoHasta: cobertura.periodoHasta,
                        periodosLista: cobertura.periodosLista,
                        periodosDetalle: cobertura.periodosDetalle,
                        monto: montoFinal,
                    });
                } catch (emailErr) {
                    console.error('Error enviando email de acreditación de cuota:', emailErr);
                }
            }
        }

        return NextResponse.json({
            success: true,
            pagadoHasta: nuevoPagadoHasta,
            message: accion === 'confirmar'
                ? `✅ Pago confirmado: ${socioNombre} quedó cubierto por ${cantFinal} ${cantFinal === 1 ? 'mes' : 'meses'} (${cobertura.periodosDetalle}).`
                : `Registro de pago actualizado correctamente (${cobertura.periodosDetalle}).`,
        });
    } catch (error: any) {
        console.error('Error en PUT /api/admin/pagos:', error);
        return NextResponse.json({ error: error.message || 'Error al actualizar pago' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const existing = await sql`SELECT socio_id FROM pagos_transferencia WHERE id = ${id} LIMIT 1`;
        const socioId = existing[0]?.socio_id || null;

        await sql`DELETE FROM pagos_transferencia WHERE id = ${id}`;

        const nuevoHasta = await recalcularCoberturaSocio(sql, socioId);

        return NextResponse.json({
            success: true,
            pagadoHasta: nuevoHasta,
            message: 'Registro de pago eliminado y cobertura recalculada.',
        });
    } catch (error: any) {
        console.error('Error en DELETE /api/admin/pagos:', error);
        return NextResponse.json({ error: error.message || 'Error al eliminar pago' }, { status: 500 });
    }
}
