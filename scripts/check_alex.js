const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

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

const sql = neon(process.env.DATABASE_URL);

async function run() {
    console.log('=== BUSQUEDA ALEXANDRA ===');
    const alex = await sql`
        SELECT * FROM socios 
        WHERE LOWER(nombre) LIKE '%alexandra%'
    `;
    console.log('Busqueda Alexandra:', JSON.stringify(alex, null, 2));

    console.log('=== BUSQUEDA ALVAREZ ===');
    const alvarez = await sql`
        SELECT * FROM socios 
        WHERE LOWER(nombre) LIKE '%alvarez%' OR LOWER(nombre) LIKE '%álvarez%'
    `;
    console.log('Busqueda Alvarez:', JSON.stringify(alvarez, null, 2));
}

run().catch(console.error);
