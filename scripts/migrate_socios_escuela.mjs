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
  console.log('--- Iniciando migración de columnas en socios ---');
  await sql`
    ALTER TABLE socios 
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
    ADD COLUMN IF NOT EXISTS direccion TEXT,
    ADD COLUMN IF NOT EXISTS localidad VARCHAR(100),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(100) DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS tanda VARCHAR(50);
  `;

  // Asegurar que registros existentes sin subcategoria tengan 'general'
  await sql`
    UPDATE socios 
    SET subcategoria = 'general' 
    WHERE subcategoria IS NULL;
  `;

  console.log('--- Columnas agregadas exitosamente ---');
  const cols = await sql`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'socios';
  `;
  console.log('Columnas de socios actualizadas:', cols);
}

migrate().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
