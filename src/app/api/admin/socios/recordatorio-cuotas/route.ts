import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { enviarRecordatorioCuota, SocioRecordatorio } from '@/lib/recordatorios';
import { getPeriodoActual, formatearPeriodoLargo } from '@/lib/periodos';

export const runtime = 'nodejs';

interface SocioConCobertura extends SocioRecordatorio {
    pagado_hasta?: string | null;
}

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        await sql`ALTER TABLE socios ADD COLUMN IF NOT EXISTS pagado_hasta VARCHAR(7)`;

        const body = await request.json().catch(() => ({}));
        const { socioId } = body;
        const periodoActual = getPeriodoActual();

        if (socioId) {
            // Envío individual manual a una persona específica
            const rows = (await sql`
                SELECT id, nombre, email, cedula, digito_verificador, pagado_hasta
                FROM socios
                WHERE id = ${socioId} AND estado = 'activo' AND email IS NOT NULL AND TRIM(email) != ''
            `) as SocioConCobertura[];

            if (rows.length === 0) {
                return NextResponse.json({
                    success: true,
                    count: 0,
                    message: 'El socio no tiene email registrado o no está activo.',
                    destinatarios: [],
                });
            }

            const socio = rows[0];
            const res = await enviarRecordatorioCuota(socio);

            return NextResponse.json({
                success: true,
                count: res.success ? 1 : 0,
                total: 1,
                message: res.success
                    ? `Recordatorio enviado correctamente a ${socio.nombre} (${socio.email}).`
                    : `Error al enviar el correo a ${socio.nombre}.`,
                destinatarios: [{
                    id: socio.id,
                    nombre: socio.nombre,
                    email: socio.email,
                    success: !!res.success,
                }],
            });
        }

        // Envío masivo a socios de transferencia bancaria que AÚN NO tienen cubierto el mes actual
        const todosSociosBrou = (await sql`
            SELECT id, nombre, email, cedula, digito_verificador, pagado_hasta
            FROM socios
            WHERE estado = 'activo' 
              AND email IS NOT NULL 
              AND TRIM(email) != ''
              AND (subcategoria = 'particular_transferencia' OR subcategoria = 'transferencia')
            ORDER BY nombre ASC
        `) as SocioConCobertura[];

        if (todosSociosBrou.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: 'No hay socios activos con método de pago por transferencia y email registrado.',
                destinatarios: [],
            });
        }

        const sociosPendientes = todosSociosBrou.filter(
            s => !s.pagado_hasta || s.pagado_hasta < periodoActual
        );
        const sociosOmitidos = todosSociosBrou.filter(
            s => s.pagado_hasta && s.pagado_hasta >= periodoActual
        );

        if (sociosPendientes.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                omitidosCount: sociosOmitidos.length,
                message: `¡Todos al día! Los ${sociosOmitidos.length} socios de transferencia ya tienen cubierto ${formatearPeriodoLargo(periodoActual)} (o meses adelantados), por lo que no se enviaron correos.`,
                destinatarios: [],
            });
        }

        const results: Array<{ id: number; nombre: string; email: string; success: boolean }> = [];

        for (const socio of sociosPendientes) {
            try {
                const res = await enviarRecordatorioCuota(socio);
                results.push({
                    id: socio.id,
                    nombre: socio.nombre,
                    email: socio.email,
                    success: !!res.success,
                });
            } catch (err) {
                console.error(`Error enviando recordatorio a socio ${socio.id} (${socio.email}):`, err);
                results.push({
                    id: socio.id,
                    nombre: socio.nombre,
                    email: socio.email,
                    success: false,
                });
            }
        }

        const exitosos = results.filter(r => r.success).length;
        const notaOmitidos = sociosOmitidos.length > 0
            ? ` (${sociosOmitidos.length} socio(s) omitidos automáticamente por tener ${formatearPeriodoLargo(periodoActual)} ya cubierto).`
            : '';

        return NextResponse.json({
            success: true,
            count: exitosos,
            total: sociosPendientes.length,
            omitidosCount: sociosOmitidos.length,
            message: `Se enviaron ${exitosos} de ${sociosPendientes.length} recordatorios de cuota ($140).${notaOmitidos}`,
            destinatarios: results,
        });

    } catch (error: any) {
        console.error('Error al enviar recordatorios manuales:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
