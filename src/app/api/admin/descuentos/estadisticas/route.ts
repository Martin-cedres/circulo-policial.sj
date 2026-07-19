import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        // 1. Obtener conteo de socios activos por método de pago
        const sociosCount = await sql`
            SELECT metodo_pago, COUNT(*)::int as cantidad
            FROM socios
            WHERE estado = 'activo'
            GROUP BY metodo_pago
        `;

        let haberesCount = 0;
        let externosCount = 0;

        sociosCount.forEach(row => {
            if (row.metodo_pago === 'haberes') haberesCount = row.cantidad;
            if (row.metodo_pago === 'externo') externosCount = row.cantidad;
        });

        const totalSocios = haberesCount + externosCount;

        // 2. Obtener el presupuesto más reciente
        const ultimoPresupuesto = await sql`
            SELECT id, mes, anio FROM descuento_presupuestos
            ORDER BY anio DESC, mes DESC LIMIT 1
        `;

        let recaudacionHaberes = 0;
        let haberesLiquidadosCount = 0;
        let ultimoPresupuestoInfo = null;
        let sociosHaberesSinPresupuestoCount = 0;
        let sociosHaberesSinPresupuestoList: any[] = [];

        if (ultimoPresupuesto.length > 0) {
            const presId = ultimoPresupuesto[0].id;
            ultimoPresupuestoInfo = {
                id: presId,
                mes: ultimoPresupuesto[0].mes,
                anio: ultimoPresupuesto[0].anio
            };

            // Recaudación real del último presupuesto (haberes)
            const sumRes = await sql`
                SELECT COUNT(d.id)::int as cantidad, COALESCE(SUM(d.importe), 0)::float as total
                FROM descuento_presupuestos_detalle d
                JOIN socios s ON d.socio_id = s.id
                WHERE d.presupuesto_id = ${presId} AND s.metodo_pago = 'haberes'
            `;
            
            if (sumRes.length > 0) {
                haberesLiquidadosCount = sumRes[0].cantidad;
                recaudacionHaberes = sumRes[0].total;
            }

            // Identificar socios de haberes activos que NO están incluidos en este presupuesto
            const inactivosRes = await sql`
                SELECT s.id, s.cedula, s.digito_verificador, s.nombre
                FROM socios s
                WHERE s.metodo_pago = 'haberes' AND s.estado = 'activo'
                AND s.id NOT IN (
                    SELECT socio_id FROM descuento_presupuestos_detalle WHERE presupuesto_id = ${presId}
                )
                ORDER BY s.nombre ASC
            `;
            sociosHaberesSinPresupuestoCount = inactivosRes.length;
            sociosHaberesSinPresupuestoList = inactivosRes;
        } else {
            // Si no hay presupuestos, estimamos haberes hipotéticos
            recaudacionHaberes = haberesCount * 140.00;
            haberesLiquidadosCount = haberesCount;
        }

        // 3. Recaudación externa hipotética ($140 por socio externo activo)
        const cuotaBase = 140.00;
        const recaudacionExternosHipotetica = externosCount * cuotaBase;

        // 4. Totales consolidados
        const recaudacionTotalEstimada = recaudacionHaberes + recaudacionExternosHipotetica;

        return NextResponse.json({
            success: true,
            estadisticas: {
                totalSocios,
                sociosHaberes: haberesCount,
                sociosExternos: externosCount,
                haberesLiquidadosCount,
                recaudacionHaberes,
                recaudacionExternosHipotetica,
                recaudacionTotalEstimada,
                sociosHaberesSinPresupuestoCount,
                sociosHaberesSinPresupuestoList,
                ultimoPresupuesto: ultimoPresupuestoInfo
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al generar estadísticas de recaudación:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
