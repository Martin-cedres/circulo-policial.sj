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
    console.error('Error:', e);
}

import { getSql } from '../src/lib/db';

async function checkMontano() {
    const sql = getSql();
    const posts = await sql`SELECT id, title, image_url FROM posts WHERE title LIKE '%Montaño%' OR title LIKE '%Montano%'`;
    console.log('POSTS:', JSON.stringify(posts, null, 2));

    const convenios = await sql`SELECT * FROM convenios WHERE nombre LIKE '%Montaño%' OR nombre LIKE '%Montano%'`;
    console.log('CONVENIOS:', JSON.stringify(convenios, null, 2));
}

checkMontano();
