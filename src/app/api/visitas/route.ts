import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        // Asegurar que la tabla existe
        await sql`
            CREATE TABLE IF NOT EXISTS visitas_diarias (
                fecha DATE PRIMARY KEY DEFAULT CURRENT_DATE,
                visitas INT NOT NULL DEFAULT 1
            );
        `;

        // Incrementar o crear registro para el día actual
        await sql`
            INSERT INTO visitas_diarias (fecha, visitas)
            VALUES (CURRENT_DATE, 1)
            ON CONFLICT (fecha)
            DO UPDATE SET visitas = visitas_diarias.visitas + 1;
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error al registrar visita:', error);
        return NextResponse.json(
            { error: 'Error interno al registrar visita' },
            { status: 500 }
        );
    }
}
