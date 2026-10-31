import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { enviarRecordatorioCuota, SocioRecordatorio } from '@/lib/recordatorios';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    // Verificación de seguridad para Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const sql = getSql();
    try {
        const socios = (await sql`
            SELECT id, nombre, email, cedula, digito_verificador
            FROM socios
            WHERE estado = 'activo' 
              AND email IS NOT NULL 
              AND TRIM(email) != ''
              AND (subcategoria = 'particular_transferencia' OR subcategoria = 'transferencia')
            ORDER BY nombre ASC
        `) as SocioRecordatorio[];

        if (socios.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay socios con método de transferencia para enviar recordatorio hoy.',
                count: 0,
            });
        }

        let exitosos = 0;
        for (const socio of socios) {
            try {
                const res = await enviarRecordatorioCuota(socio);
                if (res.success) exitosos++;
            } catch (err) {
                console.error(`Error enviando cron recordatorio a socio ${socio.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            total: socios.length,
            enviados: exitosos,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error en cron de recordatorio de cuotas:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
