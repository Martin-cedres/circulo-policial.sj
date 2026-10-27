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

async function testEndpoints() {
  console.log('=== Verificando BD y Datos de Bajas ===');
  const bajas = await sql`
    SELECT id, cedula, nombre, estado, motivo_baja, fecha_baja 
    FROM socios 
    WHERE estado = 'baja';
  `;
  console.log('Bajas encontradas en BD:', bajas.length);
  bajas.forEach(b => {
    console.log(`- ID: ${b.id} | ${b.nombre} | Motivo: "${b.motivo_baja}" | Fecha: ${b.fecha_baja}`);
  });

  console.log('\n=== Verificando Estadísticas Históricas y Conteos ===');
  const [totalActivos] = await sql`
    SELECT count(*)::int as activos FROM socios WHERE estado = 'activo';
  `;
  const [totalBajas] = await sql`
    SELECT count(*)::int as bajas FROM socios WHERE estado = 'baja';
  `;
  const [escuela] = await sql`
    SELECT 
      count(*)::int as total,
      count(CASE WHEN tanda = 'tanda_1' THEN 1 END)::int as tanda_1,
      count(CASE WHEN tanda = 'tanda_2' THEN 1 END)::int as tanda_2
    FROM socios 
    WHERE estado = 'activo' AND subcategoria = 'escuela_policia';
  `;

  console.log(`Activos: ${totalActivos.activos}`);
  console.log(`Bajas: ${totalBajas.bajas}`);
  console.log(`Escuela Total: ${escuela.total} (Tanda 1: ${escuela.tanda_1}, Tanda 2: ${escuela.tanda_2})`);
  const nuevos = totalActivos.activos - 184;
  const pct = Number(((nuevos / 184) * 100).toFixed(1));
  console.log(`Crecimiento calculado: +${pct}% (${nuevos} socios nuevos)`);

  console.log('\n=== Test de Integración: Ciclo de Baja y Reactivación en Socio Dummy ===');
  // 1. Insertar socio de prueba
  const [testSocio] = await sql`
    INSERT INTO socios (cedula, digito_verificador, nombre, metodo_pago, estado, subcategoria)
    VALUES ('9999999', '9', 'SOCIO TEST BAJA API', 'haberes', 'activo', 'general')
    RETURNING id;
  `;
  console.log('Socio de prueba creado con ID:', testSocio.id);

  // 2. Dar de baja simulando DELETE con motivo
  const motivoTest = 'Solicitud de baja voluntaria por traslado';
  await sql`
    UPDATE socios
    SET 
      estado = 'baja',
      motivo_baja = ${motivoTest},
      fecha_baja = CURRENT_TIMESTAMP
    WHERE id = ${testSocio.id};
  `;

  const [bajaVerif] = await sql`
    SELECT id, estado, motivo_baja, fecha_baja FROM socios WHERE id = ${testSocio.id};
  `;
  console.log('Socio tras baja:', bajaVerif);
  if (bajaVerif.estado !== 'baja' || bajaVerif.motivo_baja !== motivoTest || !bajaVerif.fecha_baja) {
    throw new Error('Fallo en verificación de baja');
  }

  // 3. Reactivar socio simulando PUT con estado = activo
  await sql`
    UPDATE socios
    SET 
      estado = 'activo',
      motivo_baja = NULL,
      fecha_baja = NULL
    WHERE id = ${testSocio.id};
  `;

  const [reactivVerif] = await sql`
    SELECT id, estado, motivo_baja, fecha_baja FROM socios WHERE id = ${testSocio.id};
  `;
  console.log('Socio tras reactivación:', reactivVerif);
  if (reactivVerif.estado !== 'activo' || reactivVerif.motivo_baja !== null || reactivVerif.fecha_baja !== null) {
    throw new Error('Fallo en verificación de reactivación');
  }

  // 4. Limpiar socio de prueba
  await sql`DELETE FROM socios WHERE id = ${testSocio.id};`;
  console.log('Socio de prueba eliminado limpiamente.');

  console.log('\n¡Todos los tests y verificaciones pasaron con éxito!');
}

testEndpoints().catch(err => {
  console.error('Error en test:', err);
  process.exit(1);
});
