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

async function runTests() {
  console.log('--- 1. Verificando alumnos de Tanda 1 en BD ---');
  const tanda1 = await sql`
    SELECT id, cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado, 
           subcategoria, tanda, telefono, direccion, localidad, email
    FROM socios 
    WHERE tanda = 'tanda_1'
    ORDER BY id ASC;
  `;
  console.log(`Tanda 1 count: ${tanda1.length}`);
  console.log('Tanda 1 sample:', tanda1[0]);

  console.log('--- 2. Verificando alumnos de Tanda 2 en BD ---');
  const tanda2 = await sql`
    SELECT id, cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado, 
           subcategoria, tanda, telefono, direccion, localidad, email
    FROM socios 
    WHERE tanda = 'tanda_2'
    ORDER BY id ASC;
  `;
  console.log(`Tanda 2 count: ${tanda2.length}`);
  console.log('Tanda 2 sample:', tanda2[0]);

  console.log('--- 3. Verificando que ninguno esté en liquidaciones de haberes (descuento_presupuestos_detalle) ---');
  const inDetalle = await sql`
    SELECT d.id, d.presupuesto_id, d.socio_id, s.nombre, s.tanda
    FROM descuento_presupuestos_detalle d
    JOIN socios s ON d.socio_id = s.id
    WHERE s.subcategoria = 'escuela_policia';
  `;
  console.log(`Alumnos en descuento_presupuestos_detalle: ${inDetalle.length} (esperado 0 antes de migración)`);

  console.log('--- 4. Verificando que todos tengan metodo_pago = "externo", carnet_entregado = false, estado = "activo" ---');
  const incorrect = await sql`
    SELECT count(*) 
    FROM socios 
    WHERE subcategoria = 'escuela_policia' 
      AND (metodo_pago != 'externo' OR carnet_entregado != false OR estado != 'activo');
  `;
  console.log(`Registros con valores incorrectos: ${incorrect[0].count} (esperado 0)`);

  console.log('--- 5. Verificando presupuesto más reciente disponible ---');
  const latestPres = await sql`
    SELECT id, anio, mes, estado FROM descuento_presupuestos ORDER BY anio DESC, mes DESC LIMIT 1;
  `;
  console.log('Presupuesto más reciente:', latestPres[0]);
}

runTests().catch(console.error);
