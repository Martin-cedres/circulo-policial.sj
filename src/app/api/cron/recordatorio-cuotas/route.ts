import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { enviarRecordatorioCuota, SocioRecordatorio } from '@/lib/recordatorios';
import { getPeriodoActual } from '@/lib/periodos';

export const runtime = 'nodejs';

interface SocioConCobertura extends SocioRecordatorio {
    pagado_hasta?: string | null;
}

export async function GET(request: NextRequest) {
    // Verificación de seguridad para Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const sql = getSql();
    try {
        await sql`ALTER TABLE socios ADD COLUMN IF NOT EXISTS pagado_hasta VARCHAR(7)`;

        const periodoActual = getPeriodoActual();

        const todosSociosBrou = (await sql`
            SELECT id, nombre, email, cedula, digito_verificador, pagado_hasta
            FROM socios
            WHERE estado = 'activo' 
              AND email IS NOT NULL 
              AND TRIM(email) != ''
              AND (subcategoria = 'particular_transferencia' OR subcategoria = 'transferencia')
            ORDER BY nombre ASC
        `) as SocioConCobertura[];

        // Filtrar solo aquellos que NO tienen cubierto el mes actual
        const sociosPendientes = todosSociosBrou.filter(
            s => !s.pagado_hasta || s.pagado_hasta < periodoActual
        );
        const sociosAlDiaOmitidos = todosSociosBrou.filter(
            s => s.pagado_hasta && s.pagado_hasta >= periodoActual
        );

        if (sociosPendientes.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Todos los socios por transferencia están al día con el mes actual o no hay pendientes.',
                periodoActual,
                count: 0,
                omitidosPorCobertura: sociosAlDiaOmitidos.length,
            });
        }

        let exitosos = 0;
        for (const socio of sociosPendientes) {
            try {
                const res = await enviarRecordatorioCuota(socio);
                if (res.success) exitosos++;
            } catch (err) {
                console.error(`Error enviando cron recordatorio a socio ${socio.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            periodoActual,
            totalBrou: todosSociosBrou.length,
            pendientes: sociosPendientes.length,
            omitidosPorCobertura: sociosAlDiaOmitidos.length,
            enviados: exitosos,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error en cron de recordatorio de cuotas:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
