import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import ExcelJS from 'exceljs';

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
            return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
        }

        const pres = cabecera[0];
        const mesStr = String(pres.mes).padStart(2, '0');
        const anioStr = String(pres.anio);
        const responsableFirma = pres.responsable || 'DARCY GONZALEZ';

        // Auto-sincronizar socios de haberes activos antes de exportar
        await sql`
            INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
            SELECT ${presupuestoId}, id, 140.00
            FROM socios
            WHERE metodo_pago = 'haberes' AND estado = 'activo'
            ON CONFLICT (presupuesto_id, socio_id) DO NOTHING
        `;

        // 2. Obtener socios del presupuesto ordenados numéricamente por cédula
        const socios = await sql`
            SELECT 
                s.cedula,
                s.digito_verificador,
                s.nombre,
                d.importe
            FROM descuento_presupuestos_detalle d
            JOIN socios s ON d.socio_id = s.id
            WHERE d.presupuesto_id = ${presupuestoId} AND s.metodo_pago = 'haberes'
            ORDER BY CAST(s.cedula AS BIGINT) ASC
        `;

        // 3. Crear el libro de Excel con exceljs
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Hoja1', {
            views: [{ showGridLines: true }]
        });

        // Configurar anchos de columna similares a la planilla original
        worksheet.getColumn(1).width = 15; // C.I. No.
        worksheet.getColumn(2).width = 8;  // DIG.
        worksheet.getColumn(3).width = 40; // APELLIDO Y NOMBRE
        worksheet.getColumn(4).width = 12; // IMPORTE
        worksheet.getColumn(5).width = 8;  // Correlativo

        // Estilo de fuente global Arial
        const fontName = 'Arial';

        // Fila 1: Título de la planilla
        const cellTitle = worksheet.getCell('C1');
        cellTitle.value = `${pres.codigo_descuento || '514'} CIRCULO POLICIAL DE SAN JOSÉ`;
        cellTitle.font = { name: fontName, size: 14, bold: true };

        // Fila 3: Período del presupuesto
        const cellPeriod = worksheet.getCell('C3');
        cellPeriod.value = `PRESUPUESTO ${mesStr}/${anioStr}`;
        cellPeriod.font = { name: fontName, size: 11, bold: true };

        // Fila 5: Cabecera de la tabla
        const headerRow = worksheet.getRow(5);
        headerRow.values = ['C.I. No. ', 'DIG.', 'APELLIDO Y NOMBRE ', 'IMPORTE ', ''];
        
        const borderStyle: Partial<ExcelJS.Border> = {
            style: 'thin',
            color: { argb: 'FF000000' }
        };

        headerRow.eachCell((cell, colNumber) => {
            cell.font = { name: fontName, size: 10, bold: true };
            // Alinear centrado excepto la columna de nombre
            cell.alignment = { 
                horizontal: colNumber === 3 ? 'left' : 'center',
                vertical: 'middle' 
            };
            // Bordes superiores e inferiores
            cell.border = {
                top: borderStyle,
                bottom: borderStyle
            };
        });

        // Fila 6+: Cargar los registros
        let currentRowIndex = 6;
        let correlativo = 1;

        for (const socio of socios) {
            const row = worksheet.getRow(currentRowIndex);
            
            // Forzar formatos numéricos correctos
            const ciNum = parseInt(socio.cedula);
            const dvRaw = String(socio.digito_verificador || '').trim();
            const dvVal = (dvRaw && dvRaw !== 'undefined' && dvRaw !== 'null') ? dvRaw : '';

            row.values = [
                ciNum,
                dvVal,
                socio.nombre.toUpperCase(),
                Number(socio.importe),
                correlativo
            ];

            // Alinear celdas
            row.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }; // CI
            row.getCell(1).numFmt = '0'; // Formato número entero sin decimales
            
            row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }; // DIG
            row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };   // NOMBRE
            
            row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };  // IMPORTE
            row.getCell(4).numFmt = '#,##0'; // Formato de número entero con separador de miles
            
            row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }; // Correlativo

            // Aplicar fuente Arial a todas las celdas de la fila
            row.eachCell((cell) => {
                cell.font = { name: fontName, size: 10 };
            });

            currentRowIndex++;
            correlativo++;
        }

        // Fila en blanco posterior
        currentRowIndex++; // Salta una fila

        // Fila de TOTAL
        const totalRow = worksheet.getRow(currentRowIndex);
        const totalCount = socios.length;
        
        totalRow.getCell(3).value = `TOTAL ${totalCount}`;
        totalRow.getCell(3).font = { name: fontName, size: 10, bold: true };
        totalRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

        // Colocar la fórmula de SUMA para los importes: SUM(D6:D[currentRowIndex-2])
        const firstRowIndex = 6;
        const lastRowIndex = currentRowIndex - 2;
        totalRow.getCell(4).value = {
            formula: `SUM(D${firstRowIndex}:D${lastRowIndex})`,
            result: socios.reduce((sum, s) => sum + Number(s.importe), 0)
        };
        totalRow.getCell(4).font = { name: fontName, size: 10, bold: true };
        totalRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
        totalRow.getCell(4).numFmt = '#,##0';

        // Bordes finos de total superior y doble inferior (o simple en su defecto)
        totalRow.getCell(3).border = { top: borderStyle, bottom: borderStyle };
        totalRow.getCell(4).border = { top: borderStyle, bottom: borderStyle };

        // Filas vacías adicionales y luego la firma
        currentRowIndex += 6; // Deja 5 filas vacías
        
        const signRow = worksheet.getRow(currentRowIndex);
        signRow.getCell(3).value = responsableFirma.toUpperCase();
        signRow.getCell(3).font = { name: fontName, size: 10, bold: true };
        signRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

        // 4. Generar el buffer del archivo de Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // 5. Retornar el archivo como descarga binaria
        const fileName = `Excel 514 mes ${pres.mes} ${pres.anio}.xlsx`;
        const headers = new Headers();
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

        return new NextResponse(buffer as any, {
            status: 200,
            headers
        });

    } catch (error: any) {
        console.error('Error al exportar Excel:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
