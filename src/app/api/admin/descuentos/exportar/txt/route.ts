import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const presupuestoIdStr = searchParams.get('presupuestoId');

        if (!presupuestoIdStr) {
            return NextResponse.json({ error: 'Falta el ID del presupuesto' }, { status: 400 });
        }

        const presupuestoId = parseInt(presupuestoIdStr);
        if (isNaN(presupuestoId)) {
            return NextResponse.json({ error: 'ID de presupuesto inválido' }, { status: 400 });
        }

        // 1. Obtener cabecera del presupuesto
        const cabecera = await sql`
            SELECT * FROM descuento_presupuestos WHERE id = ${presupuestoId} LIMIT 1
        `;
        if (cabecera.length === 0) {
            return NextResponse.json({ error: 'Presupuestos no encontrado' }, { status: 404 });
        }

        const pres = cabecera[0];
        const mes = String(pres.mes).padStart(2, '0');
        const anio = String(pres.anio);
        const codigoDescuento = String(pres.codigo_descuento || '514').padStart(3, '0');
        const unidadEjecutora = String(pres.unidad_ejecutora || '19').padStart(3, '0');

        // 2. Obtener socios del presupuesto que sean del método 'haberes' y ordenados ascendentemente
        const socios = await sql`
            SELECT 
                s.cedula,
                d.importe
            FROM descuento_presupuestos_detalle d
            JOIN socios s ON d.socio_id = s.id
            WHERE d.presupuesto_id = ${presupuestoId} AND s.metodo_pago = 'haberes'
            ORDER BY CAST(s.cedula AS BIGINT) ASC
        `;

        // 3. Generar líneas de ancho fijo de 44 caracteres
        let txtContent = '';

        for (const socio of socios) {
            // Limpiar cédula (solo dígitos)
            const cleanCI = String(socio.cedula).replace(/\D/g, '');
            
            // Construir los campos
            const regType = 'S02'; // Fijo (3 chars)
            const orgCode = `04${unidadEjecutora}000`; // UE formateada (8 chars) -> 04 + 019 + 000 = 04019000
            const descConcept = `000${codigoDescuento}`; // Concepto (6 chars) -> 000 + 514 = 000514
            const ciField = cleanCI.padStart(15, '0'); // Cédula (15 chars)
            
            // Importe en centésimos rellenado a 8 caracteres (importe * 100)
            const importeCents = Math.round(Number(socio.importe) * 100);
            const importeField = String(importeCents).padStart(8, '0'); // Importe (8 chars) -> 14000 = 00014000
            
            const constantSuffix = '0000'; // Sufijo constante (4 chars)

            const line = `${regType}${orgCode}${descConcept}${ciField}${importeField}${constantSuffix}`;
            
            // Validar que mida exactamente 44 caracteres antes de añadirla
            if (line.length !== 44) {
                console.warn(`Advertencia: La línea para CI ${cleanCI} mide ${line.length} en vez de 44 caracteres: "${line}"`);
            }

            txtContent += line + '\r\n'; // Usar Carriage Return + Line Feed para compatibilidad con Windows/MS-DOS
        }

        // 4. Crear cabeceras para forzar la descarga del archivo plano
        const fileName = `514 ${mes} ${anio}.txt`;
        const headers = new Headers();
        headers.set('Content-Type', 'text/plain; charset=utf-8');
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

        return new NextResponse(txtContent, {
            status: 200,
            headers
        });

    } catch (error: any) {
        console.error('Error al exportar TXT:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
