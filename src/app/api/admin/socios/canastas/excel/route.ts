import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import ExcelJS from 'exceljs';
import {
    compararPorPrimerApellido,
    formatearCedulaUY,
    formatearNombreApellidoPrimero,
} from '@/lib/cedula';

export const runtime = 'nodejs';

interface SocioCanastaRow {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: string;
    estado: string;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    email: string | null;
    subcategoria: string | null;
    tanda: string | null;
    fecha_baja: string | Date | null;
}

function buildWorksheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    titulo: string,
    subtitulo: string,
    socios: SocioCanastaRow[],
    anio: number
) {
    const ws = workbook.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
        pageSetup: {
            paperSize: 9, // A4
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.3,
                right: 0.3,
                top: 0.35,
                bottom: 0.35,
                header: 0.15,
                footer: 0.15,
            },
            printTitlesRow: '1:4',
            horizontalCentered: true,
        },
    });

    ws.columns = [
        { key: 'num', width: 5 },
        { key: 'nombre', width: 31 },
        { key: 'cedula', width: 17 },
        { key: 'telefono', width: 20 },
        { key: 'email', width: 30 },
        { key: 'direccion', width: 33 },
        { key: 'firma', width: 27 },
    ];

    const fontName = 'Arial';

    // Fila 1: Título institucional
    ws.mergeCells('A1:G1');
    const c1 = ws.getCell('A1');
    c1.value = `CÍRCULO POLICIAL GENERAL JOSÉ ARTIGAS — ${titulo}`;
    c1.font = { name: fontName, size: 13, bold: true, color: { argb: 'FF002B49' } };
    c1.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(1).height = 24;

    // Fila 2: Subtítulo + resumen
    const totalBajas = socios.filter((s) => s.estado === 'baja').length;
    const faltanDatos = socios.filter(
        (s) => !s.telefono?.trim() || !s.email?.trim() || !s.direccion?.trim()
    ).length;

    ws.mergeCells('A2:G2');
    const c2 = ws.getCell('A2');
    c2.value = `${subtitulo}  |  Total: ${socios.length} socios (incluye ${totalBajas} baja${totalBajas === 1 ? '' : 's'} ${anio})  |  Con datos por completar: ${faltanDatos}  |  Orden alfabético por apellido`;
    c2.font = { name: fontName, size: 9.5, italic: true, color: { argb: 'FF475569' } };
    c2.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(2).height = 18;

    // Fila 3: Separador / instrucción
    ws.mergeCells('A3:G3');
    const c3 = ws.getCell('A3');
    c3.value = 'INSTRUCCIONES: Verificar y actualizar teléfono, correo electrónico y dirección al momento de entregar la canasta de fin de año.';
    c3.font = { name: fontName, size: 8.5, bold: true, color: { argb: 'FF8B0000' } };
    c3.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(3).height = 16;

    // Fila 4: Cabecera de tabla
    const headerRow = ws.getRow(4);
    headerRow.values = [
        '#',
        'NOMBRE Y APELLIDO',
        'CÉDULA',
        'TELÉFONO / CELULAR',
        'CORREO ELECTRÓNICO',
        'DIRECCIÓN Y LOCALIDAD',
        'FIRMA RETIRO CANASTA',
    ];
    headerRow.height = 26;

    const headerBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'medium', color: { argb: 'FF002B49' } },
        bottom: { style: 'medium', color: { argb: 'FF002B49' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };

    headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: fontName, size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF002B49' },
        };
        cell.alignment = {
            horizontal: colNumber === 1 || colNumber === 3 || colNumber === 7 ? 'center' : 'left',
            vertical: 'middle',
            wrapText: true,
        };
        cell.border = headerBorder;
    });

    const cellBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FF64748B' } },
        bottom: { style: 'thin', color: { argb: 'FF64748B' } },
        left: { style: 'thin', color: { argb: 'FF64748B' } },
        right: { style: 'thin', color: { argb: 'FF64748B' } },
    };

    // Filas de socios con renglones amplios (48pt ≈ 1.7 cm) para escritura manuscrita
    socios.forEach((socio, idx) => {
        const row = ws.getRow(5 + idx);
        row.height = 48;

        const nombreFormateado = formatearNombreApellidoPrimero(socio.nombre).toUpperCase();
        const nombreTexto =
            socio.estado === 'baja'
                ? `${nombreFormateado}\n[BAJA ${anio}]`
                : nombreFormateado;

        const cedulaTexto = formatearCedulaUY(socio.cedula, socio.digito_verificador);
        const telefonoTexto = socio.telefono?.trim() || '';
        const emailTexto = socio.email?.trim() || '';
        const direccionPartes = [socio.direccion?.trim(), socio.localidad?.trim()].filter(Boolean);
        const direccionTexto = direccionPartes.join(' - ');

        row.values = [
            idx + 1,
            nombreTexto,
            cedulaTexto,
            telefonoTexto,
            emailTexto,
            direccionTexto,
            '',
        ];

        const isEven = idx % 2 === 1;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const isEmptyDataCell =
                (colNumber === 4 && !telefonoTexto) ||
                (colNumber === 5 && !emailTexto) ||
                (colNumber === 6 && !direccionTexto);

            cell.font = {
                name: fontName,
                size: colNumber === 7 ? 8.5 : 9.5,
                bold: colNumber === 1 || colNumber === 2 || colNumber === 3,
                color: {
                    argb:
                        colNumber === 7
                            ? 'FF64748B'
                            : socio.estado === 'baja' && colNumber === 2
                                ? 'FF991B1B'
                                : 'FF0F172A',
                },
            };

            cell.alignment = {
                horizontal: colNumber === 1 || colNumber === 3 ? 'center' : 'left',
                vertical: 'top',
                wrapText: true,
            };

            cell.border = cellBorder;

            if (isEmptyDataCell) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFBEB' }, // Amarillo muy suave para detectar faltantes al instante
                };
            } else if (isEven) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8FAFC' },
                };
            }
        });
    });

    // Pie de página para impresión
    ws.headerFooter.oddFooter = `&L${sheetName} - Canastas ${anio}&CActualización de Datos de Socios&RPágina &P de &N`;
}

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const anioParam = parseInt(searchParams.get('anio') || '', 10);
        const anio = !isNaN(anioParam) && anioParam >= 2020 && anioParam <= 2100
            ? anioParam
            : new Date().getFullYear();

        const rows = (await sql`
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
                fecha_baja
            FROM socios
            WHERE estado = 'activo'
               OR (
                   estado = 'baja'
                   AND (EXTRACT(YEAR FROM fecha_baja) = ${anio} OR fecha_baja IS NULL)
                   AND COALESCE(LOWER(motivo_baja), '') NOT LIKE '%duplicado%'
               )
        `) as SocioCanastaRow[];

        const generales = rows
            .filter((s) => !s.tanda)
            .sort((a, b) => compararPorPrimerApellido(a.nombre, b.nombre));

        const tanda1 = rows
            .filter((s) => s.tanda === 'tanda_1')
            .sort((a, b) => compararPorPrimerApellido(a.nombre, b.nombre));

        const tanda2 = rows
            .filter((s) => s.tanda === 'tanda_2')
            .sort((a, b) => compararPorPrimerApellido(a.nombre, b.nombre));

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Círculo Policial San José';
        workbook.created = new Date();

        buildWorksheet(
            workbook,
            'Socios Generales',
            `LISTA CANASTAS ${anio} — SOCIOS GENERALES`,
            'Descuento por Jefatura, Transferencia BROU, Cobrador a Domicilio y Particulares',
            generales,
            anio
        );

        buildWorksheet(
            workbook,
            'Tanda 1',
            `LISTA CANASTAS ${anio} — ESCUELA POLICIAL (TANDA 1)`,
            'Alumnos / Egresados pertenecientes a Tanda 1',
            tanda1,
            anio
        );

        buildWorksheet(
            workbook,
            'Tanda 2',
            `LISTA CANASTAS ${anio} — ESCUELA POLICIAL (TANDA 2)`,
            'Alumnos / Egresados pertenecientes a Tanda 2',
            tanda2,
            anio
        );

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="Listas_Canastas_Socios_${anio}.xlsx"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error: unknown) {
        console.error('Error al generar Excel de canastas:', error);
        const details = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json(
            { error: 'Error al generar el archivo Excel de canastas', details },
            { status: 500 }
        );
    }
}
