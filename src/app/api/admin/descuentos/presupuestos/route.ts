import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        // Obtener todos los presupuestos con agregados de cantidad de socios y suma total de importes
        const rows = await sql`
            SELECT 
                p.id, p.anio, p.mes, p.codigo_descuento, p.unidad_ejecutora, p.responsable, p.estado, p.created_at,
                COUNT(d.id)::int as total_socios,
                COALESCE(SUM(d.importe), 0)::float as total_importe
            FROM descuento_presupuestos p
            LEFT JOIN descuento_presupuestos_detalle d ON p.id = d.presupuesto_id
            GROUP BY p.id
            ORDER BY p.anio DESC, p.mes DESC
        `;
        return NextResponse.json({ success: true, presupuestos: rows }, { status: 200 });
    } catch (error: any) {
        console.error('Error al obtener presupuestos:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { anio, mes, responsable } = body;

        if (!anio || !mes) {
            return NextResponse.json({ error: 'Año y mes son requeridos' }, { status: 400 });
        }

        // 1. Verificar si ya existe para este mes/año
        const existing = await sql`
            SELECT id FROM descuento_presupuestos WHERE anio = ${anio} AND mes = ${mes} LIMIT 1
        `;
        if (existing.length > 0) {
            return NextResponse.json({ error: `Ya existe un presupuesto creado para el período ${mes}/${anio}` }, { status: 400 });
        }

        // 2. Insertar cabecera del presupuesto
        const finalResponsable = responsable || 'DARCY GONZALEZ';
        const result = await sql`
            INSERT INTO descuento_presupuestos (anio, mes, responsable, estado)
            VALUES (${anio}, ${mes}, ${finalResponsable}, 'borrador')
            RETURNING id
        `;
        const newPresupuestoId = result[0].id;

        // 3. Buscar el presupuesto anterior más reciente para clonar
        const previousPresupuesto = await sql`
            SELECT id FROM descuento_presupuestos 
            WHERE id != ${newPresupuestoId}
            ORDER BY anio DESC, mes DESC LIMIT 1
        `;

        let clonadosCount = 0;

        if (previousPresupuesto.length > 0) {
            const prevId = previousPresupuesto[0].id;
            console.log(`Clonando detalles del presupuesto anterior ID: ${prevId} al nuevo ID: ${newPresupuestoId}...`);

            // Clonar los detalles
            const prevDetalles = await sql`
                SELECT socio_id, importe FROM descuento_presupuestos_detalle
                WHERE presupuesto_id = ${prevId}
            `;

            for (const det of prevDetalles) {
                // Verificar que el socio siga activo en la base de datos maestra
                const socio = await sql`
                    SELECT id FROM socios WHERE id = ${det.socio_id} AND estado = 'activo' LIMIT 1
                `;
                if (socio.length > 0) {
                    await sql`
                        INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                        VALUES (${newPresupuestoId}, ${det.socio_id}, ${det.importe})
                    `;
                    clonadosCount++;
                }
            }
        } else {
            // Si no hay presupuesto anterior, popular con todos los socios que sean 'haberes' y estén 'activo'
            console.log(`No hay presupuesto anterior. Populando con socios activos del método 'haberes'...`);
            const sociosActivosHaberes = await sql`
                SELECT id FROM socios WHERE metodo_pago = 'haberes' AND estado = 'activo'
            `;

            for (const s of sociosActivosHaberes) {
                await sql`
                    INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                    VALUES (${newPresupuestoId}, ${s.id}, 140.00)
                `;
                clonadosCount++;
            }
        }

        return NextResponse.json({
            success: true,
            presupuestoId: newPresupuestoId,
            clonadosCount,
            message: `Presupuesto creado con éxito para el período ${mes}/${anio}. Registros cargados: ${clonadosCount}`
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error al crear presupuesto:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
