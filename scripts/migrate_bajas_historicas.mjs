import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const envPath = path.resolve(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
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

async function migrate() {
  console.log('--- Iniciando migración de columnas motivo_baja y fecha_baja ---');
  await sql`
    ALTER TABLE socios 
    ADD COLUMN IF NOT EXISTS motivo_baja TEXT,
    ADD COLUMN IF NOT EXISTS fecha_baja TIMESTAMP WITH TIME ZONE;
  `;

  console.log('--- Actualizando las 4 bajas históricas (IDs 122, 173, 189, 190) ---');
  const updated = await sql`
    UPDATE socios 
    SET 
      motivo_baja = 'Baja histórica previa a la web',
      fecha_baja = created_at
    WHERE id IN (122, 173, 189, 190)
    RETURNING id, cedula, nombre, estado, motivo_baja, fecha_baja;
  `;

  console.log('Bajas actualizadas:', updated);

  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'socios';
  `;
  console.log('Columnas finales en socios:', cols.map(c => `${c.column_name} (${c.data_type})`));
}

migrate()
  .then(() => console.log('Migración completada con éxito.'))
  .catch(err => {
    console.error('Error en migración:', err);
    process.exit(1);
  });
