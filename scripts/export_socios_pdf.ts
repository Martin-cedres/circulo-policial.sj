import fs from 'fs';
import path from 'path';

// Cargar variables de .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        for (const line of envConfig.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx > 0) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    let val = trimmed.substring(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    process.env[key] = process.env[key] || val;
                }
            }
        }
    }
} catch (e) {
    console.error('Error cargando .env.local:', e);
}

import { getSql } from '../src/lib/db';

interface Socio {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: 'haberes' | 'externo';
    estado: 'activo' | 'baja';
    carnet_entregado?: boolean;
}

function formatCedula(ci: string, dv: string) {
    const num = parseInt(ci);
    if (isNaN(num)) return `${ci}-${dv}`;
    return `${num.toLocaleString('es-UY')}-${dv}`;
}

function generateHTMLReport(
    titulo: string, 
    subtitulo: string, 
    socios: Socio[], 
    tipoLabel: string
): string {
    const fechaHora = new Date().toLocaleString('es-UY', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const entregadosCount = socios.filter(s => s.carnet_entregado).length;
    const pendientesCount = socios.filter(s => !s.carnet_entregado).length;

    const rowsHTML = socios.map((s, idx) => `
        <tr>
            <td style="text-align: center; font-weight: bold; width: 40px;">${idx + 1}</td>
            <td style="font-weight: bold; white-space: nowrap; width: 120px;">${formatCedula(s.cedula, s.digito_verificador)}</td>
            <td style="text-transform: uppercase;">${s.nombre}</td>
            <td style="text-align: center; width: 160px;">
                <span class="badge ${s.metodo_pago === 'haberes' ? 'badge-jefatura' : 'badge-externo'}">
                    ${s.metodo_pago === 'haberes' ? 'Descuento Jefatura' : 'Pago por Fuera'}
                </span>
            </td>
            <td style="text-align: center; width: 140px;">
                <span class="badge ${s.carnet_entregado ? 'badge-entregado' : 'badge-pendiente'}">
                    ${s.carnet_entregado ? '🟩 Entregado' : '🟨 Pendiente'}
                </span>
            </td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${titulo} - Círculo Policial San José</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 1.2cm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1a202c;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11pt;
        }
        .header {
            display: flex;
            align-items: center;
            border-bottom: 3px solid #D4AF37;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .logo {
            width: 75px;
            height: auto;
            margin-right: 18px;
        }
        .header-title {
            flex: 1;
        }
        .header-title h1 {
            margin: 0;
            font-size: 16pt;
            color: #002B49;
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .header-title h2 {
            margin: 3px 0 0 0;
            font-size: 12pt;
            color: #8B0000;
            font-weight: 700;
        }
        .header-title p {
            margin: 3px 0 0 0;
            font-size: 9pt;
            color: #4a5568;
        }
        .summary-box {
            display: flex;
            justify-content: space-between;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 16px;
            margin-bottom: 16px;
            font-size: 9.5pt;
        }
        .summary-item {
            text-align: center;
        }
        .summary-item .num {
            font-size: 14pt;
            font-weight: bold;
            color: #002B49;
            display: block;
        }
        .summary-item .label {
            color: #64748b;
            font-size: 8.5pt;
            text-transform: uppercase;
            font-weight: 600;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #002B49;
            color: #ffffff;
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            padding: 8px 10px;
            text-align: left;
            border: 1px solid #002B49;
        }
        td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            border-x: 1px solid #edf2f7;
            font-size: 9.5pt;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: bold;
        }
        .badge-jefatura {
            background-color: #e0f2fe;
            color: #0369a1;
            border: 1px solid #bae6fd;
        }
        .badge-externo {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .badge-entregado {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
        }
        .badge-pendiente {
            background-color: #fff7ed;
            color: #c2410c;
            border: 1px solid #ffedd5;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 8.5pt;
            color: #64748b;
        }
        .signature-box {
            text-align: center;
            width: 200px;
            border-top: 1px dashed #94a3b8;
            padding-top: 4px;
            margin-top: 40px;
            font-size: 8.5pt;
            color: #475569;
        }
        .no-print {
            background: #1e293b;
            color: white;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-radius: 6px;
        }
        .btn-print {
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
        }
        .btn-print:hover {
            background: #1d4ed8;
        }
        @media print {
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <div>
            <strong>Documento listo para impresión A4 / Exportación PDF</strong>
            <div style="font-size: 0.85em; color: #94a3b8;">${tipoLabel} | Total: ${socios.length} socios</div>
        </div>
        <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    </div>

    <div class="header">
        <img src="/logo-circulo-policial.png" alt="Logo Círculo Policial" class="logo" />
        <div class="header-title">
            <h1>CÍRCULO POLICIAL GENERAL JOSÉ ARTIGAS</h1>
            <h2>${titulo}</h2>
            <p>${subtitulo} &bull; Emisión: ${fechaHora}</p>
        </div>
    </div>

    <div class="summary-box">
        <div class="summary-item">
            <span class="num">${socios.length}</span>
            <span class="label">Total Socios (${tipoLabel})</span>
        </div>
        <div class="summary-item">
            <span class="num" style="color: #15803d;">${entregadosCount}</span>
            <span class="label">Carné Entregado</span>
        </div>
        <div class="summary-item">
            <span class="num" style="color: #c2410c;">${pendientesCount}</span>
            <span class="label">Carné Pendiente</span>
        </div>
        <div class="summary-item">
            <span class="num" style="color: #0369a1;">A4</span>
            <span class="label">Formato Impresión</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="text-align: center; width: 40px;">#</th>
                <th style="width: 120px;">Cédula</th>
                <th>Nombre y Apellido</th>
                <th style="text-align: center; width: 160px;">Método Cobro</th>
                <th style="text-align: center; width: 140px;">Estado Carné</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHTML}
        </tbody>
    </table>

    <div class="footer">
        <div>
            <strong>Círculo Policial San José</strong> &bull; San José de Mayo, Uruguay<br>
            Documento Oficial generado para control y fiscalización de padrón.
        </div>
        <div class="signature-box">
            Firma / Sello Responsable<br>
            Comisión Directiva
        </div>
    </div>
</body>
</html>`;
}

async function runExport() {
    console.log('🚀 Conectando a Neon DB para exportar padrones de socios...');
    const sql = getSql();

    const socios = (await sql`
        SELECT * FROM socios 
        WHERE estado = 'activo'
        ORDER BY CAST(cedula AS INTEGER) ASC
    `) as unknown as Socio[];

    console.log(`📊 Total de socios activos recuperados: ${socios.length}`);

    const jefaturaSocios = socios.filter(s => s.metodo_pago === 'haberes');
    const externoSocios = socios.filter(s => s.metodo_pago === 'externo');

    console.log(`  - Socios con descuento por Jefatura: ${jefaturaSocios.length}`);
    console.log(`  - Socios con pago por fuera (externo): ${externoSocios.length}`);

    const exportDir = path.resolve(process.cwd(), 'public', 'export');
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // 1. Total de Socios
    const htmlTotal = generateHTMLReport(
        'PADRÓN GENERAL - TOTAL DE SOCIOS',
        'Listado completo de socios activos del Círculo Policial San José',
        socios,
        'Padrón Total'
    );
    fs.writeFileSync(path.join(exportDir, 'padron_total_socios_A4.html'), htmlTotal, 'utf8');

    // 2. Socios Descuento Jefatura
    const htmlJefatura = generateHTMLReport(
        'PADRÓN DE SOCIOS CON DESCUENTO POR JEFATURA',
        'Socios con retención de cuota social por haberes (Jefatura de Policía UE 19)',
        jefaturaSocios,
        'Descuento Jefatura'
    );
    fs.writeFileSync(path.join(exportDir, 'padron_socios_jefatura_A4.html'), htmlJefatura, 'utf8');

    // 3. Socios Pago Por Fuera
    const htmlExterno = generateHTMLReport(
        'PADRÓN DE SOCIOS CON PAGO POR FUERA',
        'Socios con cobro particular en caja / cobrador externo (Fuera de Jefatura)',
        externoSocios,
        'Pago Por Fuera'
    );
    fs.writeFileSync(path.join(exportDir, 'padron_socios_pago_externo_A4.html'), htmlExterno, 'utf8');

    console.log('✅ Archivos A4 creados exitosamente en /public/export:');
    console.log('   1. public/export/padron_total_socios_A4.html');
    console.log('   2. public/export/padron_socios_jefatura_A4.html');
    console.log('   3. public/export/padron_socios_pago_externo_A4.html');
}

runExport().catch(err => {
    console.error('❌ Error al exportar:', err);
    process.exit(1);
});
