import fs from 'fs';
import path from 'path';

// Cargar variables de .env.local manualmente
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

async function migrateSociosCarnet() {
    console.log('🚀 Ejecutando migración para columna carnet_entregado en tabla socios...');
    const sql = getSql();

    // 1. Agregar columna carnet_entregado a la tabla socios si no existe
    await sql`
        ALTER TABLE socios ADD COLUMN IF NOT EXISTS carnet_entregado BOOLEAN DEFAULT FALSE
    `;

    // 2. Si la columna recién se creó y hay nulos, establecerlos a FALSE (Pendientes)
    await sql`
        UPDATE socios SET carnet_entregado = FALSE WHERE carnet_entregado IS NULL
    `;

    console.log('✅ Migración completada con éxito. Todos los socios cuentan con el campo carnet_entregado.');
}

migrateSociosCarnet().catch(err => {
    console.error('❌ Error en migración:', err);
    process.exit(1);
});
