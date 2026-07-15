import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const tipo = formData.get('tipo') as string | null; // 'haberes' o 'consolidado'
        const presupuestoIdStr = formData.get('presupuestoId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
        }
        if (!tipo || (tipo !== 'haberes' && tipo !== 'consolidado')) {
            return NextResponse.json({ error: 'Tipo de importación inválido' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        let importadosCount = 0;
        let actualizadosCount = 0;

        if (tipo === 'haberes') {
            // Importación del archivo Excel 514 mes X 2026.xls
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // Convertimos a JSON omitiendo cabeceras iniciales (comienza en la fila 5)
            // sheet_to_json puede recibir un range para empezar en la fila 4 (0-indexed)
            const rows = XLSX.utils.sheet_to_json<any>(sheet, { range: 4, defval: '' });

            console.log(`Procesando ${rows.length} filas de planilla de haberes...`);

            for (const row of rows) {
                // Buscamos columnas basándonos en nombres de cabecera estándar
                const ciRaw = row['C.I. No.'] || row['C.I. No. '];
                const dvRaw = row['DIG.'] || row['DIG'];
                const nombreRaw = row['APELLIDO Y NOMBRE'] || row['APELLIDO Y NOMBRE '];
                const importeRaw = row['IMPORTE'] || row['IMPORTE '];

                if (!ciRaw || !nombreRaw) continue;

                // Limpiar la cédula
                const cedula = String(Math.floor(Number(ciRaw))).trim();
                const digito = String(dvRaw).trim().replace('.0', '');
                const nombre = String(nombreRaw).trim().toUpperCase();
                const importe = Number(importeRaw) || 140.00;

                if (!cedula) continue;

                // 1. Insertar o actualizar en la tabla de socios
                const existing = await sql`
                    SELECT id, metodo_pago FROM socios WHERE cedula = ${cedula} LIMIT 1
                `;

                let socioId: number;

                if (existing.length > 0) {
                    socioId = existing[0].id;
                    // Actualizar nombre y asegurar que el método es haberes
                    await sql`
                        UPDATE socios 
                        SET nombre = ${nombre}, digito_verificador = ${digito}, metodo_pago = 'haberes', estado = 'activo'
                        WHERE id = ${socioId}
                    `;
                    actualizadosCount++;
                } else {
                    const result = await sql`
                        INSERT INTO socios (cedula, digito_verificador, nombre, metodo_pago, estado)
                        VALUES (${cedula}, ${digito}, ${nombre}, 'haberes', 'activo')
                        RETURNING id
                    `;
                    socioId = result[0].id;
                    importadosCount++;
                }

                // 2. Si se especificó presupuestoId, vincularlo al detalle del presupuesto mensual
                if (presupuestoIdStr) {
                    const presupuestoId = parseInt(presupuestoIdStr);
                    await sql`
                        INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                        VALUES (${presupuestoId}, ${socioId}, ${importe})
                        ON CONFLICT (presupuesto_id, socio_id) 
                        DO UPDATE SET importe = ${importe}
                    `;
                }
            }

        } else if (tipo === 'consolidado') {
            // Importación del listado general Socios_Circulo_Policial_2026.xlsx
            // Usamos la hoja "Ordenado por Cédula" por defecto si existe, sino la primera
            const sheetName = workbook.SheetNames.includes('Ordenado por Cédula') 
                ? 'Ordenado por Cédula' 
                : workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json<any>(sheet, { range: 2, defval: '' }); // Saltear cabeceras hasta la fila 3 (index 2)

            console.log(`Procesando ${rows.length} filas de planilla consolidada desde la hoja: ${sheetName}...`);

            for (const row of rows) {
                const nombreRaw = row['Nombre y Apellido'];
                const ciRaw = row['Cédula de Identidad'] || row['Cdula de Identidad'];
                const origenRaw = row['Lista de Origen'];

                if (!ciRaw || !nombreRaw) continue;

                // Evitar importar filas de totales/recuentos como socios
                const nombreUpper = String(nombreRaw).toUpperCase();
                if (nombreUpper.includes('TOTAL') || nombreUpper.includes('GENERAL') || nombreUpper.includes('CANTIDAD')) {
                    continue;
                }

                // Limpiar C.I. y extraer dígito verificador
                const cleanCI = String(ciRaw).replace(/\s+/g, '').replace(/\./g, '');
                const match = cleanCI.match(/^(\d+)-?(\d|k|K)?$/);
                if (!match) continue;

                const cedula = match[1];
                if (parseInt(cedula) < 100000) {
                    continue; // Descarta recuentos (ej: 189)
                }
                const digito = match[2] || '0'; // Cero por defecto si no tiene dígito
                const nombre = String(nombreRaw).trim().toUpperCase();
                
                // Si la lista de origen es 'Lista Activos', es haberes. Si es 'Lista Con Cédula', es externo.
                const metodoPago = String(origenRaw).toLowerCase().includes('activo') ? 'haberes' : 'externo';

                const existing = await sql`
                    SELECT id FROM socios WHERE cedula = ${cedula} LIMIT 1
                `;

                if (existing.length > 0) {
                    const socioId = existing[0].id;
                    await sql`
                        UPDATE socios 
                        SET nombre = ${nombre}, digito_verificador = ${digito}, metodo_pago = ${metodoPago}, estado = 'activo'
                        WHERE id = ${socioId}
                    `;
                    actualizadosCount++;
                } else {
                    await sql`
                        INSERT INTO socios (cedula, digito_verificador, nombre, metodo_pago, estado)
                        VALUES (${cedula}, ${digito}, ${nombre}, ${metodoPago}, 'activo')
                    `;
                    importadosCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Importación completada. Socios creados: ${importadosCount}, actualizados: ${actualizadosCount}`
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al importar socios:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
