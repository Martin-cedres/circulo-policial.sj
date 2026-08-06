import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
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

        const existing = await sql`
            SELECT id FROM descuento_presupuestos WHERE anio = ${anio} AND mes = ${mes} LIMIT 1
        `;
        if (existing.length > 0) {
            return NextResponse.json({ error: `Ya existe un presupuesto creado para el período ${mes}/${anio}` }, { status: 400 });
        }

        const finalResponsable = responsable || 'DARCY GONZALEZ';
        const result = await sql`
            INSERT INTO descuento_presupuestos (anio, mes, responsable, estado)
            VALUES (${anio}, ${mes}, ${finalResponsable}, 'borrador')
            RETURNING id
        `;
        const newPresupuestoId = result[0].id;

        // Auto-población automática de TODOS los socios activos del método 'haberes'
        await sql`
            INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
            SELECT ${newPresupuestoId}, id, 140.00
            FROM socios
            WHERE metodo_pago = 'haberes' AND estado = 'activo'
            ON CONFLICT (presupuesto_id, socio_id) DO NOTHING
        `;

        const totalSocios = await sql`
            SELECT COUNT(*)::int as count FROM descuento_presupuestos_detalle WHERE presupuesto_id = ${newPresupuestoId}
        `;

        return NextResponse.json({
            success: true,
            message: `Presupuesto creado con éxito. Se incluyeron automáticamente ${totalSocios[0].count} socios de haberes activos.`,
            presupuestoId: newPresupuestoId
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error al crear presupuesto:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
