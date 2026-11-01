import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import ExcelJS from 'exceljs';
import {
    getPeriodoActual,
    formatearPeriodoLargo,
    obtenerProximoMesCobro,
} from '@/lib/periodos';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const estadoFiltro = searchParams.get('estado') || 'confirmado'; // 'confirmado' | 'todos' | 'pendiente'
        const periodoFiltro = searchParams.get('periodo') || ''; // ej '2026-11'

        const periodoActual = getPeriodoActual();

        const pagosRaw = await sql`
            SELECT 
                pt.id,
                pt.cedula,
                pt.socio_id,
                COALESCE(s.nombre, pt.nombre) AS nombre,
                s.cedula AS socio_cedula,
                s.digito_verificador AS socio_dv,
                pt.monto,
                pt.cantidad_meses,
                pt.periodo_desde,
                pt.periodo_hasta,
                pt.periodos_detalle,
                pt.observaciones,
                pt.estado,
                pt.confirmado_at,
                pt.created_at
            FROM pagos_transferencia pt
            LEFT JOIN socios s ON pt.socio_id = s.id
            ORDER BY pt.created_at DESC
        `;

        const pagosFiltrados = pagosRaw.filter((p: any) => {
            if (estadoFiltro !== 'todos' && p.estado !== estadoFiltro) return false;
            if (periodoFiltro) {
                const desde = p.periodo_desde || '';
                const hasta = p.periodo_hasta || '';
                const fechaCreacion = p.created_at ? new Date(p.created_at).toISOString().slice(0, 7) : '';
                if (
                    !(desde <= periodoFiltro && hasta >= periodoFiltro) &&
                    fechaCreacion !== periodoFiltro
                ) {
                    return false;
                }
            }
            return true;
        });

        const sociosBrou = await sql`
            SELECT 
                s.id,
                s.cedula,
                s.digito_verificador,
                s.nombre,
                s.email,
                s.telefono,
                s.pagado_hasta,
                (
                    SELECT COALESCE(SUM(pt.monto), 0)::numeric 
                    FROM pagos_transferencia pt 
                    WHERE pt.socio_id = s.id AND pt.estado = 'confirmado'
                ) AS total_abonado
            FROM socios s
            WHERE s.estado = 'activo'
              AND (
                  s.subcategoria = 'particular_transferencia' 
                  OR s.subcategoria = 'transferencia'
                  OR EXISTS (SELECT 1 FROM pagos_transferencia pt WHERE pt.socio_id = s.id)
              )
            ORDER BY s.nombre ASC
        `;

        const workbook = new ExcelJS.Workbook();
        const fontName = 'Arial';

        // =========================================================================
        // HOJA 1: DETALLE DE PAGOS RECIBIDOS POR TRANSFERENCIA BROU
        // =========================================================================
        const wsPagos = workbook.addWorksheet('Pagos Transferencia BROU', {
            views: [{ showGridLines: true }],
        });

        wsPagos.columns = [
            { width: 8 },  // N°
            { width: 16 }, // Fecha
            { width: 16 }, // Cédula
            { width: 36 }, // Nombre del Socio
            { width: 14 }, // Cant. Cuotas
            { width: 32 }, // Períodos Cubiertos
            { width: 16 }, // Monto ($)
            { width: 16 }, // Estado
            { width: 35 }, // Observaciones
        ];

        wsPagos.mergeCells('A1:I1');
        const titleCell = wsPagos.getCell('A1');
        titleCell.value = 'CÍRCULO POLICIAL "GRAL. JOSÉ ARTIGAS" DE SAN JOSÉ — RENDICIÓN DE PAGOS POR TRANSFERENCIA BROU';
        titleCell.font = { name: fontName, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002B49' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        wsPagos.getRow(1).height = 28;

        wsPagos.mergeCells('A2:I2');
        const subCell = wsPagos.getCell('A2');
        const fechaHoy = new Date().toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
        subCell.value = `Informe para Comisión Directiva • Fecha de emisión: ${fechaHoy} • Cuenta BROU CA 001579728-00001 ($140/mes)`;
        subCell.font = { name: fontName, size: 10, italic: true };
        subCell.alignment = { horizontal: 'center', vertical: 'middle' };
        wsPagos.getRow(2).height = 20;

        const headerRow = wsPagos.getRow(4);
        headerRow.values = [
            'N°',
            'FECHA',
            'CÉDULA',
            'APELLIDO Y NOMBRE DEL SOCIO',
            'CUOTAS',
            'PERÍODOS CUBIERTOS',
            'IMPORTE ($)',
            'ESTADO',
            'OBSERVACIONES',
        ];
        headerRow.height = 22;

        const thinBorder: Partial<ExcelJS.Borders> = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };

        headerRow.eachCell((cell) => {
            cell.font = { name: fontName, size: 10, bold: true, color: { argb: 'FF002B49' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = thinBorder;
        });

        let rowIdx = 5;
        let sumaImporte = 0;
        let sumaCuotas = 0;

        pagosFiltrados.forEach((p: any, idx: number) => {
            const r = wsPagos.getRow(rowIdx);
            const fechaStr = p.created_at
                ? new Date(p.created_at).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '—';
            const ciCompleta = p.socio_cedula
                ? `${p.socio_cedula}${p.socio_dv ? `-${p.socio_dv}` : ''}`
                : p.cedula;
            const cant = Number(p.cantidad_meses) || 1;
            const importe = parseFloat(p.monto) || 0;

            if (p.estado !== 'rechazado') {
                sumaImporte += importe;
                sumaCuotas += cant;
            }

            r.values = [
                idx + 1,
                fechaStr,
                ciCompleta,
                p.nombre || 'Socio',
                `${cant} ${cant === 1 ? 'mes' : 'meses'}`,
                p.periodos_detalle || p.periodo_desde || '—',
                importe,
                p.estado === 'confirmado' ? 'CONFIRMADO' : p.estado === 'pendiente' ? 'PENDIENTE' : 'RECHAZADO',
                p.observaciones || '',
            ];

            r.eachCell((cell, colNumber) => {
                cell.font = { name: fontName, size: 10 };
                cell.border = thinBorder;
                if (colNumber === 7) {
                    cell.numFmt = '$#,##0.00';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                } else if ([1, 2, 3, 5, 8].includes(colNumber)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
            });

            rowIdx++;
        });

        // Fila de Totales
        const totalRow = wsPagos.getRow(rowIdx + 1);
        totalRow.values = [
            '',
            '',
            '',
            'TOTALES DEL PERÍODO:',
            `${sumaCuotas} cuotas`,
            '',
            sumaImporte,
            '',
            '',
        ];
        totalRow.height = 24;
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { name: fontName, size: 11, bold: true };
            if (colNumber >= 4 && colNumber <= 7) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
                cell.border = thinBorder;
            }
            if (colNumber === 7) {
                cell.numFmt = '$#,##0.00';
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        });

        // =========================================================================
        // HOJA 2: ESTADO DE COBERTURA Y PRÓXIMO VENCIMIENTO DE SOCIOS BROU
        // =========================================================================
        const wsSocios = workbook.addWorksheet('Cobertura Socios BROU', {
            views: [{ showGridLines: true }],
        });

        wsSocios.columns = [
            { width: 8 },  // N°
            { width: 16 }, // Cédula
            { width: 36 }, // Nombre
            { width: 16 }, // Teléfono
            { width: 30 }, // Email
            { width: 22 }, // Cubierto Hasta
            { width: 22 }, // Estado Mes Actual
            { width: 24 }, // Próximo Recordatorio Email
            { width: 18 }, // Total Abonado Histórico
        ];

        wsSocios.mergeCells('A1:I1');
        const sTitle = wsSocios.getCell('A1');
        sTitle.value = `PADRÓN DE SOCIOS POR TRANSFERENCIA BROU — ESTADO DE COBERTURA (${formatearPeriodoLargo(periodoActual).toUpperCase()})`;
        sTitle.font = { name: fontName, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002B49' } };
        sTitle.alignment = { horizontal: 'center', vertical: 'middle' };
        wsSocios.getRow(1).height = 28;

        const sHeader = wsSocios.getRow(3);
        sHeader.values = [
            'N°',
            'CÉDULA',
            'APELLIDO Y NOMBRE',
            'TELÉFONO',
            'EMAIL',
            'CUBIERTO HASTA',
            'ESTADO ACTUAL',
            'PRÓXIMO AVISO AUTOMÁTICO',
            'TOTAL ACREDITADO ($)',
        ];
        sHeader.height = 22;
        sHeader.eachCell((cell) => {
            cell.font = { name: fontName, size: 10, bold: true, color: { argb: 'FF002B49' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = thinBorder;
        });

        let sRowIdx = 4;
        sociosBrou.forEach((s: any, i: number) => {
            const r = wsSocios.getRow(sRowIdx);
            const ci = `${s.cedula}${s.digito_verificador ? `-${s.digito_verificador}` : ''}`;
            const pagadoHasta = s.pagado_hasta || null;

            let estadoTexto = 'PENDIENTE DE PAGO';
            if (pagadoHasta && pagadoHasta > periodoActual) {
                estadoTexto = 'ADELANTADO (AL DÍA)';
            } else if (pagadoHasta === periodoActual) {
                estadoTexto = 'AL DÍA';
            }

            const proximoAviso = formatearPeriodoLargo(obtenerProximoMesCobro(pagadoHasta));

            r.values = [
                i + 1,
                ci,
                s.nombre,
                s.telefono || '—',
                s.email || '—',
                pagadoHasta ? formatearPeriodoLargo(pagadoHasta) : 'Sin pagos registrados',
                estadoTexto,
                proximoAviso,
                parseFloat(s.total_abonado) || 0,
            ];

            r.eachCell((cell, colNumber) => {
                cell.font = { name: fontName, size: 10 };
                cell.border = thinBorder;
                if (colNumber === 9) {
                    cell.numFmt = '$#,##0.00';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                } else if ([1, 2, 4, 6, 7, 8].includes(colNumber)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else {
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
            });

            sRowIdx++;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `Rendicion_Pagos_BROU_Circulo_Policial_${periodoActual}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error: any) {
        console.error('Error al exportar Excel de pagos BROU:', error);
        return NextResponse.json({ error: error.message || 'Error al generar Excel' }, { status: 500 });
    }
}
