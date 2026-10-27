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

        // 2. Conteo de socios de Escuela de Policía y tandas (activos)
        const escuelaCountRes = await sql`
            SELECT 
                COUNT(*)::int as total_escuela,
                COUNT(CASE WHEN tanda = 'tanda_1' THEN 1 END)::int as tanda_1,
                COUNT(CASE WHEN tanda = 'tanda_2' THEN 1 END)::int as tanda_2
            FROM socios
            WHERE estado = 'activo' AND subcategoria = 'escuela_policia'
        `;
        const escuelaCount = escuelaCountRes[0]?.total_escuela || 0;
        const tanda1Count = escuelaCountRes[0]?.tanda_1 || 0;
        const tanda2Count = escuelaCountRes[0]?.tanda_2 || 0;

        // 3. Conteo de bajas y listado completo para gestión administrativa
        const bajasCountRes = await sql`
            SELECT COUNT(*)::int as cantidad
            FROM socios
            WHERE estado = 'baja'
        `;
        const bajasCount = bajasCountRes[0]?.cantidad || 0;

        const bajasLista = await sql`
            SELECT 
                id,
                cedula,
                digito_verificador,
                nombre,
                metodo_pago,
                estado,
                telefono,
                direccion,
                localidad,
                email,
                subcategoria,
                tanda,
                motivo_baja,
                fecha_baja,
                created_at
            FROM socios
            WHERE estado = 'baja'
            ORDER BY fecha_baja DESC NULLS LAST, id DESC
        `;

        // 4. Comparativa histórica respecto al hito fundacional de la web (02/07/2026)
        // Al comienzo: 186 activos vigentes y 1 sola baja inicial por registro duplicado (Jorge Gutierrez).
        // Las bajas de Mirtha Gonzalez y Melani Ferreira ocurrieron posteriormente por solicitud de baja.
        const baseActivos = 186;
        const nuevosSocios = totalSocios - baseActivos;
        const porcentajeCrecimiento = baseActivos > 0 
            ? Number(((nuevosSocios / baseActivos) * 100).toFixed(1))
            : 0;

        const comparativaHistorica = {
            inicioWeb: {
                total: 187,
                activos: 186,
                haberes: 96,
                externos: 90,
                bajas: 1, // Jorge Gutierrez (Socio duplicado)
                fecha: '02/07/2026'
            },
            actual: {
                total: totalSocios + bajasCount,
                activos: totalSocios,
                haberes: haberesCount,
                externos: externosCount,
                escuela: escuelaCount,
                tanda1: tanda1Count,
                tanda2: tanda2Count,
                bajas: bajasCount
            },
            crecimiento: {
                nuevosSocios,
                porcentajeCrecimiento,
                nuevosEscuela: escuelaCount
            },
            bajasCount
        };

        // 5. Obtener el presupuesto más reciente
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
                escuelaCount,
                tanda1Count,
                tanda2Count,
                bajasCount,
                haberesLiquidadosCount,
                recaudacionHaberes,
                recaudacionExternosHipotetica,
                recaudacionTotalEstimada,
                sociosHaberesSinPresupuestoCount,
                sociosHaberesSinPresupuestoList,
                ultimoPresupuesto: ultimoPresupuestoInfo,
                comparativaHistorica,
                bajas: bajasLista
            },
            comparativaHistorica,
            bajas: bajasLista,
            bajasCount
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al generar estadísticas de recaudación:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
