import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        // Asegurar que la tabla existe por si aún no se generaron visitas
        await sql`
            CREATE TABLE IF NOT EXISTS visitas_diarias (
                fecha DATE PRIMARY KEY DEFAULT CURRENT_DATE,
                visitas INT NOT NULL DEFAULT 1
            );
        `;

        // 1. Visitas de Hoy
        const hoyResult = await sql`
            SELECT COALESCE(SUM(visitas), 0)::int as total
            FROM visitas_diarias
            WHERE fecha = CURRENT_DATE;
        `;

        // 2. Visitas de Este Mes
        const mesResult = await sql`
            SELECT COALESCE(SUM(visitas), 0)::int as total
            FROM visitas_diarias
            WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE);
        `;

        // 3. Visitas de Este Año
        const anioResult = await sql`
            SELECT COALESCE(SUM(visitas), 0)::int as total
            FROM visitas_diarias
            WHERE DATE_TRUNC('year', fecha) = DATE_TRUNC('year', CURRENT_DATE);
        `;

        // 4. Visitas Totales Históricas
        const totalResult = await sql`
            SELECT COALESCE(SUM(visitas), 0)::int as total
            FROM visitas_diarias;
        `;

        // 5. Histórico reciente (últimos 30 días con visitas)
        const historial = await sql`
            SELECT fecha::text, visitas
            FROM visitas_diarias
            ORDER BY fecha DESC
            LIMIT 30;
        `;

        return NextResponse.json({
            success: true,
            estadisticas: {
                hoy: hoyResult[0]?.total || 0,
                mes: mesResult[0]?.total || 0,
                anio: anioResult[0]?.total || 0,
                totalHistorico: totalResult[0]?.total || 0,
                historial: historial || []
            }
        });
    } catch (error: any) {
        console.error('Error al obtener estadísticas de visitas:', error);
        return NextResponse.json(
            { error: 'Error al consultar estadísticas de visitas' },
            { status: 500 }
        );
    }
}
