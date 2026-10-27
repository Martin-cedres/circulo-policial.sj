import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { tanda } = body;

        if (!tanda || (tanda !== 'tanda_1' && tanda !== 'tanda_2')) {
            return NextResponse.json({ 
                error: 'Parámetro "tanda" inválido o requerido. Debe ser "tanda_1" o "tanda_2"' 
            }, { status: 400 });
        }

        // 1. Obtener el presupuesto más reciente en el sistema
        const latestPres = await sql`
            SELECT id, anio, mes, responsable, estado 
            FROM descuento_presupuestos 
            ORDER BY anio DESC, mes DESC 
            LIMIT 1
        `;

        if (latestPres.length === 0) {
            return NextResponse.json({ 
                error: 'No se encontró ningún presupuesto en el sistema para asociar los socios' 
            }, { status: 404 });
        }

        const presupuestoId = latestPres[0].id;

        // 2. Obtener y actualizar todos los socios activos de esa tanda que estén como 'externo' a 'haberes'
        const sociosActualizados = await sql`
            UPDATE socios
            SET metodo_pago = 'haberes'
            WHERE tanda = ${tanda}
              AND estado = 'activo'
              AND metodo_pago = 'externo'
            RETURNING id, cedula, digito_verificador, nombre, metodo_pago, subcategoria, tanda
        `;

        // 3. Asociar los socios actualizados al presupuesto más reciente en descuento_presupuestos_detalle
        let insertadosCount = 0;
        for (const socio of sociosActualizados) {
            await sql`
                INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                VALUES (${presupuestoId}, ${socio.id}, 140.00)
                ON CONFLICT (presupuesto_id, socio_id)
                DO UPDATE SET importe = 140.00
            `;
            insertadosCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Migración completada con éxito. Se migraron ${sociosActualizados.length} socios de ${tanda} a haberes y se vincularon al presupuesto ${latestPres[0].mes}/${latestPres[0].anio}.`,
            presupuesto: {
                id: presupuestoId,
                anio: latestPres[0].anio,
                mes: latestPres[0].mes
            },
            totalMigrados: sociosActualizados.length,
            socios: sociosActualizados
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al migrar tanda de socios:', error);
        return NextResponse.json({ 
            error: 'Error interno del servidor al procesar la migración de tanda', 
            details: error.message 
        }, { status: 500 });
    }
}
