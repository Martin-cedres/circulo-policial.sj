import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
env.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.replace('DATABASE_URL=', '').trim();
    if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
      dbUrl = dbUrl.slice(1, -1);
    }
  }
});

const sql = neon(dbUrl);

async function inspect() {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'socios';
  `;
  console.log('Columnas socios:', cols.map(c => c.column_name));

  const bajas = await sql`
    SELECT id, cedula, nombre, estado, created_at 
    FROM socios 
    WHERE id IN (122, 173, 189, 190);
  `;
  console.log('Socios 122, 173, 189, 190:', bajas);

  const counts = await sql`
    SELECT estado, count(*)::int as count
    FROM socios
    GROUP BY estado;
  `;
  console.log('Counts por estado:', counts);

  const escuelaCounts = await sql`
    SELECT subcategoria, tanda, count(*)::int as count
    FROM socios
    WHERE estado = 'activo'
    GROUP BY subcategoria, tanda;
  `;
  console.log('Escuela / tandas counts:', escuelaCounts);
}

inspect().catch(console.error);
