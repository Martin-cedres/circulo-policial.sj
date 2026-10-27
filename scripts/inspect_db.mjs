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
  const sample = await sql`SELECT id, cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado FROM socios LIMIT 5`;
  console.log('Sample socios:', sample);

  const detailConstraints = await sql`
    SELECT conname, contype 
    FROM pg_constraint 
    WHERE conrelid = 'descuento_presupuestos_detalle'::regclass;
  `;
  console.log('Constraints on descuento_presupuestos_detalle:', detailConstraints);
}

inspect().catch(console.error);
