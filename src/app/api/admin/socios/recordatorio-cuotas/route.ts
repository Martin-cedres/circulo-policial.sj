import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { enviarRecordatorioCuota, SocioRecordatorio } from '@/lib/recordatorios';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json().catch(() => ({}));
        const { socioId } = body;

        let query;
        if (socioId) {
            query = sql`
                SELECT id, nombre, email, cedula, digito_verificador
                FROM socios
                WHERE id = ${socioId} AND estado = 'activo' AND email IS NOT NULL AND email != ''
            `;
        } else {
            // Todos los socios activos que pagan por transferencia bancaria
            query = sql`
                SELECT id, nombre, email, cedula, digito_verificador
                FROM socios
                WHERE estado = 'activo' 
                  AND email IS NOT NULL 
                  AND TRIM(email) != ''
                  AND (subcategoria = 'particular_transferencia' OR subcategoria = 'transferencia')
                ORDER BY nombre ASC
            `;
        }

        const socios = (await query) as SocioRecordatorio[];

        if (socios.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: socioId 
                    ? 'El socio no tiene email registrado o no está activo.' 
                    : 'No hay socios activos con método de pago por transferencia y email registrado.',
                destinatarios: [],
            });
        }

        const results: Array<{ id: number; nombre: string; email: string; success: boolean }> = [];

        for (const socio of socios) {
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

        return NextResponse.json({
            success: true,
            count: exitosos,
            total: socios.length,
            message: `Se enviaron ${exitosos} de ${socios.length} recordatorios de cuota ($140) con los datos del BROU.`,
            destinatarios: results,
        });

    } catch (error: any) {
        console.error('Error al enviar recordatorios manuales:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
