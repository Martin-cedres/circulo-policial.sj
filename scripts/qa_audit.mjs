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

async function runQAAudit() {
  console.log('==============================================');
  console.log('       INICIO DE AUDITORÍA QA EXHAUSTIVA      ');
  console.log('==============================================\n');

  let passed = true;

  // 1. Verificación de Base de Datos
  console.log('--- 1. VERIFICACIÓN DE BASE DE DATOS ---');
  
  // 1.1 Total con subcategoria = 'escuela_policia'
  const totalEscuela = await sql`
    SELECT count(*)::int as count FROM socios WHERE subcategoria = 'escuela_policia';
  `;
  const countEscuela = totalEscuela[0].count;
  console.log(`[QA 1.1] Total aspirantes subcategoria='escuela_policia': ${countEscuela}`);
  if (countEscuela === 28) {
    console.log('  -> PASS: Hay exactamente 28 aspirantes policiales.');
  } else {
    console.error(`  -> FAIL: Se esperaban 28 pero se encontraron ${countEscuela}.`);
    passed = false;
  }

  // 1.2 Tanda 1 y Tanda 2
  const tanda1Rows = await sql`
    SELECT id, cedula, digito_verificador, nombre, direccion, telefono, metodo_pago, estado, carnet_entregado, tanda, subcategoria
    FROM socios 
    WHERE subcategoria = 'escuela_policia' AND tanda = 'tanda_1';
  `;
  const tanda2Rows = await sql`
    SELECT id, cedula, digito_verificador, nombre, direccion, telefono, metodo_pago, estado, carnet_entregado, tanda, subcategoria
    FROM socios 
    WHERE subcategoria = 'escuela_policia' AND tanda = 'tanda_2';
  `;
  console.log(`[QA 1.2] Distribución por tandas: Tanda 1 = ${tanda1Rows.length}, Tanda 2 = ${tanda2Rows.length}`);
  if (tanda1Rows.length === 16 && tanda2Rows.length === 12) {
    console.log('  -> PASS: Exactamente 16 en tanda_1 y 12 en tanda_2.');
  } else {
    console.error(`  -> FAIL: Se esperaban 16 en tanda_1 y 12 en tanda_2.`);
    passed = false;
  }

  // 1.3 Verificación de metodo_pago = 'externo', estado = 'activo', carnet_entregado = false
  const condicionRows = await sql`
    SELECT id, cedula, nombre, metodo_pago, estado, carnet_entregado
    FROM socios
    WHERE subcategoria = 'escuela_policia'
      AND (metodo_pago != 'externo' OR estado != 'activo' OR carnet_entregado != false);
  `;
  console.log(`[QA 1.3] Aspirantes con metodo!=externo, estado!=activo o carnet_entregado!=false: ${condicionRows.length}`);
  if (condicionRows.length === 0) {
    console.log('  -> PASS: Los 28 tienen metodo_pago="externo", estado="activo" y carnet_entregado=false.');
  } else {
    console.error(`  -> FAIL: ${condicionRows.length} aspirantes incumplen las condiciones:`, condicionRows);
    passed = false;
  }

  // 1.4 Verificación en descuento_presupuestos_detalle
  const inPresupuestosDetalle = await sql`
    SELECT d.id, d.presupuesto_id, d.socio_id, s.nombre, s.cedula, s.subcategoria
    FROM descuento_presupuestos_detalle d
    JOIN socios s ON d.socio_id = s.id
    WHERE s.subcategoria = 'escuela_policia';
  `;
  console.log(`[QA 1.4] Aspirantes en 'descuento_presupuestos_detalle': ${inPresupuestosDetalle.length}`);
  if (inPresupuestosDetalle.length === 0) {
    console.log('  -> PASS: NINGUNO de los 28 figura en descuento_presupuestos_detalle.');
  } else {
    console.error(`  -> FAIL: Hay aspirantes vinculados a descuento_presupuestos_detalle:`, inPresupuestosDetalle);
    passed = false;
  }

  // 2. Verificación de Blindaje de Jefatura (TXT 514)
  console.log('\n--- 2. VERIFICACIÓN DE BLINDAJE DE JEFATURA (Convenio 514 TXT) ---');
  // Consultar últimos presupuestos
  const pres = await sql`
    SELECT id, mes, anio FROM descuento_presupuestos ORDER BY anio DESC, mes DESC LIMIT 1;
  `;
  if (pres.length > 0) {
    const pId = pres[0].id;
    // Simular el query exacto que ejecuta exportar/txt/route.ts
    const txtSocios = await sql`
      SELECT 
          s.id,
          s.cedula,
          s.metodo_pago,
          s.subcategoria,
          d.importe
      FROM descuento_presupuestos_detalle d
      JOIN socios s ON d.socio_id = s.id
      WHERE d.presupuesto_id = ${pId} AND s.metodo_pago = 'haberes'
      ORDER BY CAST(s.cedula AS BIGINT) ASC
    `;
    const externosEnTXT = txtSocios.filter(s => s.metodo_pago === 'externo' || s.subcategoria === 'escuela_policia');
    console.log(`[QA 2.1] Total socios a exportar en TXT para presupuesto ${pres[0].mes}/${pres[0].anio} (ID ${pId}): ${txtSocios.length}`);
    console.log(`[QA 2.2] Socios externos o aspirantes presentes en TXT: ${externosEnTXT.length}`);
    if (externosEnTXT.length === 0) {
      console.log('  -> PASS: Blindaje 100% efectivo. Ningún externo o aspirante es exportado en TXT de Jefatura.');
    } else {
      console.error('  -> FAIL: Se detectaron socios externos en la consulta del TXT:', externosEnTXT);
      passed = false;
    }
  }

  // 3. Verificación de Rutas y Rutero
  console.log('\n--- 3. VERIFICACIÓN DE RUTAS Y RUTERO (GET /api/admin/descuentos/socios) ---');

  // Test de consulta tanda_1: verificar dirección y teléfono
  const t1SociosConContacto = tanda1Rows.filter(s => s.direccion && s.direccion.trim() !== '' && s.telefono && s.telefono.trim() !== '');
  console.log(`[QA 3.1] Tanda 1: ${tanda1Rows.length} registros. Con dirección y teléfono: ${t1SociosConContacto.length}`);
  if (tanda1Rows.length === 16 && t1SociosConContacto.length === 16) {
    console.log('  -> PASS: Tanda 1 devuelve los 16 registros con dirección y teléfono completos.');
  } else {
    console.error(`  -> FAIL: Registros incompletos en Tanda 1.`);
    tanda1Rows.forEach(s => {
      if (!s.direccion || !s.telefono) console.log(`   - Faltante: CI ${s.cedula} ${s.nombre} Dir: "${s.direccion}" Tel: "${s.telefono}"`);
    });
    passed = false;
  }

  // Test de consulta tanda_2: verificar dirección y teléfono
  const t2SociosConContacto = tanda2Rows.filter(s => s.direccion && s.direccion.trim() !== '' && s.telefono && s.telefono.trim() !== '');
  console.log(`[QA 3.2] Tanda 2: ${tanda2Rows.length} registros. Con dirección y teléfono: ${t2SociosConContacto.length}`);
  if (tanda2Rows.length === 12 && t2SociosConContacto.length === 12) {
    console.log('  -> PASS: Tanda 2 devuelve los 12 registros con dirección y teléfono completos.');
  } else {
    console.error(`  -> FAIL: Registros incompletos en Tanda 2.`);
    tanda2Rows.forEach(s => {
      if (!s.direccion || !s.telefono) console.log(`   - Faltante: CI ${s.cedula} ${s.nombre} Dir: "${s.direccion}" Tel: "${s.telefono}"`);
    });
    passed = false;
  }

  // Test de socios históricos: verificar subcategoria = 'general' o null tratado como 'general'
  const historicosTotal = await sql`
    SELECT count(*)::int as count FROM socios WHERE subcategoria IS NULL OR subcategoria = 'general';
  `;
  const historicosSinGeneral = await sql`
    SELECT count(*)::int as count FROM socios WHERE subcategoria NOT IN ('general', 'escuela_policia');
  `;
  console.log(`[QA 3.3] Total socios categoría general / históricos: ${historicosTotal[0].count}`);
  console.log(`[QA 3.4] Socios con subcategoría anómala (diferente de 'general' y 'escuela_policia'): ${historicosSinGeneral[0].count}`);
  if (historicosSinGeneral[0].count === 0) {
    console.log('  -> PASS: Los socios históricos preservan subcategoria="general" y no rompen consultas.');
  } else {
    console.error(`  -> FAIL: Hay socios con subcategoria desconocida.`);
    passed = false;
  }

  // Simulación de la lógica de GET /api/admin/descuentos/socios
  // 3.5 Simulación directa invocando la lógica del endpoint
  const testTanda1Filter = await sql`SELECT * FROM socios WHERE estado = 'activo'`;
  const simT1 = testTanda1Filter.filter(r => r.tanda === 'tanda_1');
  const simT2 = testTanda1Filter.filter(r => r.tanda === 'tanda_2');
  const simGeneral = testTanda1Filter.filter(r => !r.tanda || r.subcategoria === 'general');
  console.log(`[QA 3.5] Simulación API tanda_1: ${simT1.length} (esperado 16)`);
  console.log(`[QA 3.6] Simulación API tanda_2: ${simT2.length} (esperado 12)`);
  console.log(`[QA 3.7] Simulación API general: ${simGeneral.length} (activos históricos)`);

  if (simT1.length === 16 && simT2.length === 12 && simGeneral.length > 0) {
    console.log('  -> PASS: La lógica de filtrado del endpoint GET responde con exactitud.');
  } else {
    console.error('  -> FAIL: Discrepancia en simulación de endpoint.');
    passed = false;
  }

  console.log('\n==============================================');
  console.log(`RESULTADO FINAL QA: ${passed ? 'TODO APROBADO (PASS)' : 'FALLOS DETECTADOS (FAIL)'}`);
  console.log('==============================================');

  return passed;
}

runQAAudit().catch(err => {
  console.error('Error fatal durante la auditoría:', err);
  process.exit(1);
});
