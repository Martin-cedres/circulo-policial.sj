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

async function marcarTodosCarnetsEntregados() {
    console.log('🚀 Actualizando todos los socios existentes a carnet_entregado = TRUE...');
    const sql = getSql();

    const result = await sql`
        UPDATE socios 
        SET carnet_entregado = TRUE
    `;

    const count = await sql`
        SELECT COUNT(*)::int as total FROM socios WHERE carnet_entregado = TRUE
    `;

    console.log(`✅ ¡Éxito! Se actualizaron ${count[0].total} socios en la base de datos a estado ENTREGADO.`);
}

marcarTodosCarnetsEntregados().catch(err => {
    console.error('❌ Error al actualizar carnés:', err);
    process.exit(1);
});
