import fs from 'fs';
import path from 'path';

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
    console.error('Error loading env:', e);
}

import { getSql } from '../src/lib/db';

async function checkAlexandra() {
    const sql = getSql();
    
    console.log('--- BUSCANDO POR NOMBRE "Alexandra" O "Alvarez" ---');
    const socios = await sql`
        SELECT * FROM socios 
        WHERE LOWER(nombre) LIKE '%alexandra%' 
           OR LOWER(nombre) LIKE '%alvarez%' 
           OR LOWER(nombre) LIKE '%álvarez%'
    `;
    console.log('SOCIOS ENCONTRADOS:', JSON.stringify(socios, null, 2));

    if (socios.length > 0) {
        for (const s of socios) {
            const detalles = await sql`
                SELECT dpd.*, dp.anio, dp.mes 
                FROM descuento_presupuestos_detalle dpd
                JOIN descuento_presupuestos dp ON dp.id = dpd.presupuesto_id
                WHERE dpd.socio_id = ${s.id}
            `;
            console.log(`DETALLES PRESUPUESTOS JEFATURA PARA SOCIO ${s.id} (${s.nombre}):`, JSON.stringify(detalles, null, 2));
        }
    }
}

checkAlexandra().catch(err => console.error(err));
