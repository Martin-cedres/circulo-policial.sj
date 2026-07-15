import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const sql = getSql();
    try {
        const { id } = await context.params;
        const presupuestoId = parseInt(id);

        if (isNaN(presupuestoId)) {
            return NextResponse.json({ error: 'ID de presupuesto inválido' }, { status: 400 });
        }

        // 1. Obtener cabecera
        const cabecera = await sql`
            SELECT * FROM descuento_presupuestos WHERE id = ${presupuestoId} LIMIT 1
        `;

        if (cabecera.length === 0) {
            return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
        }

        // 2. Obtener detalle de socios asociados, ordenados numéricamente por cédula
        const detalles = await sql`
            SELECT 
                d.id as detalle_id,
                d.importe,
                s.id as socio_id,
                s.cedula,
                s.digito_verificador,
                s.nombre,
                s.metodo_pago
            FROM descuento_presupuestos_detalle d
            JOIN socios s ON d.socio_id = s.id
            WHERE d.presupuesto_id = ${presupuestoId}
            ORDER BY CAST(s.cedula AS BIGINT) ASC
        `;

        return NextResponse.json({
            success: true,
            presupuesto: cabecera[0],
            socios: detalles
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al obtener presupuesto:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const sql = getSql();
    try {
        const { id } = await context.params;
        const presupuestoId = parseInt(id);
        const body = await request.json();
        const { estado, responsable } = body;

        if (isNaN(presupuestoId)) {
            return NextResponse.json({ error: 'ID de presupuesto inválido' }, { status: 400 });
        }

        // Actualizar cabecera
        await sql`
            UPDATE descuento_presupuestos
            SET 
                estado = COALESCE(${estado}, estado),
                responsable = COALESCE(${responsable}, responsable)
            WHERE id = ${presupuestoId}
        `;

        return NextResponse.json({ success: true, message: 'Presupuesto actualizado con éxito' }, { status: 200 });

    } catch (error: any) {
        console.error('Error al actualizar presupuesto:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const sql = getSql();
    try {
        const { id } = await context.params;
        const presupuestoId = parseInt(id);

        if (isNaN(presupuestoId)) {
            return NextResponse.json({ error: 'ID de presupuesto inválido' }, { status: 400 });
        }

        await sql`
            DELETE FROM descuento_presupuestos WHERE id = ${presupuestoId}
        `;

        return NextResponse.json({ success: true, message: 'Presupuesto eliminado con éxito' }, { status: 200 });

    } catch (error: any) {
        console.error('Error al eliminar presupuesto:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
