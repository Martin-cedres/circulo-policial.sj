import { NextRequest, NextResponse } from 'next/server';

function parseRetencionesCsv(csvText: string) {
    const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (rawLines.length <= 1) {
        return { rows: [], fechaLiq: '' };
    }

    const headerParts = rawLines[0].split(';');
    const headers: string[] = [];
    const seen = new Set<string>();

    headerParts.forEach((h, idx) => {
        let cleanH = h.trim();
        if (!cleanH) cleanH = `COL_${idx}`;
        if (seen.has(cleanH)) {
            cleanH = `${cleanH}_${idx}`;
        }
        seen.add(cleanH);
        headers.push(cleanH);
    });

    let fechaLiq = '';
    const rows: any[] = [];

    for (let i = 1; i < rawLines.length; i++) {
        const parts = rawLines[i].split(';');
        if (parts.length < 5) continue;

        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
            rowObj[h] = parts[idx] ? parts[idx].trim() : '';
        });

        if (!fechaLiq && rowObj['FECHA LIQ']) {
            fechaLiq = rowObj['FECHA LIQ'];
        }

        rowObj['_rawLine'] = rawLines[i];
        rows.push(rowObj);
    }

    return { rows, fechaLiq };
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const fileAnterior = formData.get('fileAnterior') as File | null;
        const fileActual = formData.get('fileActual') as File | null;

        if (!fileAnterior || !fileActual) {
            return NextResponse.json({ error: 'Debe proporcionar ambos archivos CSV (Mes Anterior y Mes Actual)' }, { status: 400 });
        }

        const textAnterior = await fileAnterior.text();
        const textActual = await fileActual.text();

        const dataAnterior = parseRetencionesCsv(textAnterior);
        const dataActual = parseRetencionesCsv(textActual);

        const parseNum = (val: string) => {
            if (!val) return 0;
            const clean = val.replace(',', '.');
            const n = parseFloat(clean);
            return isNaN(n) ? 0 : n;
        };

        const extractPersons = (rows: any[]) => {
            const map = new Map<string, { ci: string; nombre: string; aDesc: number; noDesc: number; desc: number; rawLine: string }>();
            for (const r of rows) {
                const ci = (r['CEDULA'] || '').trim();
                const nombre = (r['NOMBRE'] || '').trim();
                const aDesc = parseNum(r['A DESCONTAR']);
                const noDesc = parseNum(r['NO DESCONTADO']);
                const desc = parseNum(r['DESCONTADO']);

                if (ci && /^\d+$/.test(ci)) {
                    map.set(ci, { ci, nombre, aDesc, noDesc, desc, rawLine: r['_rawLine'] || '' });
                }
            }
            return map;
        };

        const mapAnterior = extractPersons(dataAnterior.rows);
        const mapActual = extractPersons(dataActual.rows);

        let sumADescAnt = 0, sumDescAnt = 0, sumNoDescAnt = 0, impagosAntCount = 0;
        let cuotaBaseAnt = 120;

        mapAnterior.forEach(p => {
            sumADescAnt += p.aDesc;
            sumDescAnt += p.desc;
            sumNoDescAnt += p.noDesc;
            if (p.desc === 0) impagosAntCount++;
            if (p.aDesc > 0) cuotaBaseAnt = p.aDesc;
        });

        let sumADescAct = 0, sumDescAct = 0, sumNoDescAct = 0, impagosActCount = 0;
        let cuotaBaseAct = 140;

        mapActual.forEach(p => {
            sumADescAct += p.aDesc;
            sumDescAct += p.desc;
            sumNoDescAct += p.noDesc;
            if (p.desc === 0) impagosActCount++;
            if (p.aDesc > 0) cuotaBaseAct = p.aDesc;
        });

        const bajas: Array<{ ci: string; nombre: string; nota?: string }> = [];

        mapAnterior.forEach((pAnt, ci) => {
            if (!mapActual.has(ci)) {
                bajas.push({ ci, nombre: pAnt.nombre });
            }
        });

        for (const r of dataActual.rows) {
            const rawLine = r['_rawLine'] || '';
            if (rawLine.toUpperCase().includes('BAJA')) {
                const ciMatch = rawLine.match(/\b\d{7,8}-?\d?\b/);
                const ci = ciMatch ? ciMatch[0].replace('-', '') : '';
                const nombreMatch = rawLine.match(/[A-ZÁÉÍÓÚÑ\s]{3,},?\s+[A-ZÁÉÍÓÚÑ\s]{3,}/i);
                const nombre = nombreMatch ? nombreMatch[0] : 'Socio';

                if (ci && !bajas.some(b => b.ci === ci)) {
                    bajas.push({ ci, nombre, nota: rawLine.split(';').filter(Boolean).slice(-2).join(' - ') });
                }
            }
        }

        const recuperados: Array<{ ci: string; nombre: string; descActual: number }> = [];
        const impagosPersistentes: Array<{ ci: string; nombre: string; noDescActual: number }> = [];

        mapAnterior.forEach((pAnt, ci) => {
            const pAct = mapActual.get(ci);
            if (pAct) {
                if (pAnt.desc === 0 && pAct.desc > 0) {
                    recuperados.push({ ci, nombre: pAct.nombre, descActual: pAct.desc });
                } else if (pAnt.desc === 0 && pAct.desc === 0) {
                    impagosPersistentes.push({ ci, nombre: pAct.nombre, noDescActual: pAct.noDesc });
                }
            }
        });

        const resultado = {
            fechaAnterior: dataAnterior.fechaLiq || 'Junio 2026',
            fechaActual: dataActual.fechaLiq || 'Julio 2026',
            financiero: {
                cuotaAnterior: cuotaBaseAnt,
                cuotaActual: cuotaBaseAct,
                cuotaVar: cuotaBaseAct - cuotaBaseAnt,
                cuotaVarPct: cuotaBaseAnt > 0 ? ((cuotaBaseAct - cuotaBaseAnt) / cuotaBaseAnt) * 100 : 0,

                recaudadoAnterior: sumDescAnt,
                recaudadoActual: sumDescAct,
                recaudadoVar: sumDescAct - sumDescAnt,
                recaudadoVarPct: sumDescAnt > 0 ? ((sumDescAct - sumDescAnt) / sumDescAnt) * 100 : 0,

                impagoAnterior: sumNoDescAnt,
                impagoActual: sumNoDescAct,
                impagoVar: sumNoDescAct - sumNoDescAnt,

                sociosImpagosAnterior: impagosAntCount,
                sociosImpagosActual: impagosActCount,
                sociosImpagosVar: impagosActCount - impagosAntCount
            },
            movimientos: {
                bajas,
                recuperados,
                impagosPersistentes
            }
        };

        return NextResponse.json({ success: true, resultado });
    } catch (error: any) {
        console.error('Error en comparación de retenciones:', error);
        return NextResponse.json({ error: 'Error al procesar y comparar los archivos CSV: ' + error.message }, { status: 500 });
    }
}
