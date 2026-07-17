import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const rows = await sql`
            SELECT * FROM convenio_solicitudes 
            ORDER BY created_at DESC
        `;
        return NextResponse.json({ success: true, solicitudes: rows }, { status: 200 });
    } catch (error: any) {
        console.error('Error al obtener solicitudes de convenios:', error);
        return NextResponse.json(
            { error: 'Error al obtener solicitudes', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { id, leido } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID de solicitud requerida' }, { status: 400 });
        }

        const result = await sql`
            UPDATE convenio_solicitudes
            SET leido = ${leido}
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Solicitud actualizada correctamente' }, { status: 200 });
    } catch (error: any) {
        console.error('Error al actualizar solicitud de convenio:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        let idStr = searchParams.get('id');
        
        if (!idStr) {
            // Intenta leer del body por si acaso
            try {
                const body = await request.json();
                idStr = body.id;
            } catch (e) {}
        }

        if (!idStr) {
            return NextResponse.json({ error: 'ID de solicitud requerida' }, { status: 400 });
        }

        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID de solicitud inválido' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM convenio_solicitudes
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Solicitud eliminada correctamente' }, { status: 200 });
    } catch (error: any) {
        console.error('Error al eliminar solicitud de convenio:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}
