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

const alumnos = [
  // Tanda 1
  {
    tanda: 'tanda_1',
    nombre: 'MARÍA VALENTINA CASTRO ALFANO',
    cedula: '5024862',
    digito_verificador: '2',
    telefono: '099 980 977',
    direccion: 'Rincón 164',
    localidad: 'San José',
    email: 'valentinamateoperez@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'AGUSTINA NICOL CASTRO ALFANO',
    cedula: '5573416',
    digito_verificador: '7',
    telefono: '091 989 013',
    direccion: 'Brasil 146',
    localidad: 'San José',
    email: 'nicolalfanoes@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'KATERIN DENIS CUALIA SOSA',
    cedula: '5390864',
    digito_verificador: '9',
    telefono: '092 230 804',
    direccion: 'Vidal 1026',
    localidad: 'San José',
    email: 'sabrinasuarezcualia@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'LEONARDO GABRIEL DÍAZ BRAVO',
    cedula: '5083232',
    digito_verificador: '6',
    telefono: '096 098 062',
    direccion: 'Flores 811',
    localidad: 'San José',
    email: null
  },
  {
    tanda: 'tanda_1',
    nombre: 'AGUSTÍN PASTORINO',
    cedula: '5635153',
    digito_verificador: '4',
    telefono: '098 164 405',
    direccion: 'David Chiossone 3663',
    localidad: 'Montevideo',
    email: 'machinagus35@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'SANTIAGO MARTÍNEZ',
    cedula: '5722010',
    digito_verificador: '4',
    telefono: '095 272 898',
    direccion: 'Carlos Gardel 564',
    localidad: 'San José',
    email: 'santiagomar20d@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'BRAIAN ROCCATI',
    cedula: '5397393',
    digito_verificador: '5',
    telefono: '098 684 063',
    direccion: 'Colonia 467',
    localidad: 'San José',
    email: 'roccatibrai16@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'KAREN VELÁZQUEZ',
    cedula: '5616824',
    digito_verificador: '8',
    telefono: '092 367 179',
    direccion: 'Cerro Largo 612',
    localidad: 'San José',
    email: 'karenvelazquez18@hotmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'SOL LUNA MORALES ARANDA',
    cedula: '5412986',
    digito_verificador: '0',
    telefono: '092 432 994',
    direccion: 'Ituzaingó 230, Block C, 301',
    localidad: 'San José de Mayo',
    email: 'r.sol.20040104@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'KAEL ARANDA RODRÍGUEZ',
    cedula: '5740770',
    digito_verificador: '2',
    telefono: '092 270 263',
    direccion: 'Ituzaingó 230, Block C, 301',
    localidad: 'San José de Mayo',
    email: 'kaelaranda2007@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'JESICA CAMILA REYES ALAYÓN',
    cedula: '5683690',
    digito_verificador: '8',
    telefono: '099 584 087',
    direccion: 'Perú 1009',
    localidad: 'San José',
    email: 'camilareyes25@hotmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'TATIANA MICAELA SELLENES DÍAZ',
    cedula: '5417732',
    digito_verificador: '8',
    telefono: '098 709 200',
    direccion: 'Perú 1009',
    localidad: 'San José',
    email: 'ttaattiiaannaaddiiaazz@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'LAURA FABIANA GONZÁLEZ',
    cedula: '4925101',
    digito_verificador: '0',
    telefono: '094 520 123',
    direccion: 'Viera y Benavídez 434',
    localidad: 'San José',
    email: 'laurisdelfi@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'KEVIN EXEQUIEL TEXEIRA DE LEÓN',
    cedula: '5629749',
    digito_verificador: '7',
    telefono: '098 207 251',
    direccion: 'Ruta 3 Km 94, Viv. 14',
    localidad: 'San José',
    email: 'kevin.texeira@icloud.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'LUCAS ANDRÉS PÁEZ VALDENEGRO',
    cedula: '5568450',
    digito_verificador: '2',
    telefono: '094 318 041',
    direccion: 'Carlos Larriera 886',
    localidad: 'San José',
    email: 'lucaspaez3804p@gmail.com'
  },
  {
    tanda: 'tanda_1',
    nombre: 'LUCIANO GABRIEL LORENZO CORREA',
    cedula: '5511672',
    digito_verificador: '5',
    telefono: '091 980 266',
    direccion: 'José Enrique Rodó 1215',
    localidad: 'San José',
    email: 'lorenzoluciano140@gmail.com'
  },

  // Tanda 2
  {
    tanda: 'tanda_2',
    nombre: 'JORDY SÁNCHEZ LARA',
    cedula: '5568341',
    digito_verificador: '7',
    telefono: '095 589 470',
    direccion: 'Av. Lagdeto M73 S24',
    localidad: 'San José',
    email: 'sjordy789@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'LEANDRO NICOLÁS AMARILLO BARAGÁN',
    cedula: '5339115',
    digito_verificador: '7',
    telefono: '094 919 289',
    direccion: 'Santa Victoria M6 S11',
    localidad: 'San José',
    email: 'nicolasamarillo@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'VALENTINA MANCEBO',
    cedula: '4966038',
    digito_verificador: '0',
    telefono: '098 042 547',
    direccion: 'Zudáñez 752 Ap. 121',
    localidad: 'San José',
    email: 'v479015@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'NATALIA REBOIRAS',
    cedula: '5363648',
    digito_verificador: '4',
    telefono: '099 848 557',
    direccion: 'Av. Brasil 749 Bis',
    localidad: 'San José',
    email: 'carinareboiras8@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'NOELIA SERENA',
    cedula: '5359449',
    digito_verificador: '8',
    telefono: '098 776 816',
    direccion: 'Suiza 1129',
    localidad: 'San José',
    email: 'noeliaserena97@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'PRICILA YANEL AGUETE BISCAYZACÚ',
    cedula: '5673565',
    digito_verificador: '1',
    telefono: '099 684 520',
    direccion: 'Zudáñez 738 Casa 24',
    localidad: 'San José',
    email: 'pipii8493@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'MARTÍN DELGADO',
    cedula: '5412580',
    digito_verificador: '8',
    telefono: '091 055 921',
    direccion: 'Instrucciones 888',
    localidad: 'San José',
    email: 'delgadomartin8@hotmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'ANÍBAL EZEQUIEL RÍOS GONZÁLEZ',
    cedula: '5653094',
    digito_verificador: '2',
    telefono: '095 229 476',
    direccion: 'Einstein 1289',
    localidad: 'Libertad',
    email: 'ezequielrios2126@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'HENRY JEAN BRAVO PIMIENTA',
    cedula: '4644638',
    digito_verificador: '1',
    telefono: '092 710 468',
    direccion: 'Horacio Santos 1587',
    localidad: 'San José',
    email: 'hbhenrybravo23@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'MARÍA BELÉN AGUIAR ORTELLI',
    cedula: '5360116',
    digito_verificador: '2',
    telefono: '093 594 035',
    direccion: 'Leandro Gómez 1131',
    localidad: 'Libertad',
    email: 'belenaguiar712@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'BRAHIAN NICOLÁS VERDE RODRÍGUEZ',
    cedula: '5554035',
    digito_verificador: '8',
    telefono: '094 850 899',
    direccion: 'MEVIR III 24786',
    localidad: 'Ecilda Paullier',
    email: 'brahianverde226@gmail.com'
  },
  {
    tanda: 'tanda_2',
    nombre: 'ALEXANDER NAHUEL VILLANUEVA PIMIENTA',
    cedula: '5362828',
    digito_verificador: '5',
    telefono: '094 739 814',
    direccion: 'Costa Rica 7798',
    localidad: 'San José',
    email: 'alexandervillanueva1203@gmail.com'
  }
];

async function ingest() {
  console.log(`Iniciando ingesta de ${alumnos.length} alumnos de la Escuela de Policía...`);
  let inserted = 0;
  let updated = 0;

  for (const alumno of alumnos) {
    const existing = await sql`
      SELECT id FROM socios WHERE cedula = ${alumno.cedula} LIMIT 1
    `;

    let socioId;
    if (existing.length > 0) {
      socioId = existing[0].id;
      await sql`
        UPDATE socios
        SET 
          digito_verificador = ${alumno.digito_verificador},
          nombre = ${alumno.nombre},
          metodo_pago = 'externo',
          estado = 'activo',
          carnet_entregado = FALSE,
          subcategoria = 'escuela_policia',
          tanda = ${alumno.tanda},
          telefono = ${alumno.telefono},
          direccion = ${alumno.direccion},
          localidad = ${alumno.localidad},
          email = ${alumno.email}
        WHERE id = ${socioId}
      `;
      updated++;
    } else {
      const res = await sql`
        INSERT INTO socios (
          cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado,
          subcategoria, tanda, telefono, direccion, localidad, email
        ) VALUES (
          ${alumno.cedula}, ${alumno.digito_verificador}, ${alumno.nombre}, 'externo', 'activo', FALSE,
          'escuela_policia', ${alumno.tanda}, ${alumno.telefono}, ${alumno.direccion}, ${alumno.localidad}, ${alumno.email}
        )
        RETURNING id
      `;
      socioId = res[0].id;
      inserted++;
    }

    // Como método_pago = 'externo', aseguramos que no esté en presupuestos de haberes de Jefatura
    await sql`
      DELETE FROM descuento_presupuestos_detalle WHERE socio_id = ${socioId}
    `;
  }

  console.log(`✅ Ingesta finalizada: ${inserted} insertados, ${updated} actualizados (Total: ${alumnos.length})`);

  // Verificar en BD
  const t1 = await sql`SELECT count(*) FROM socios WHERE subcategoria = 'escuela_policia' AND tanda = 'tanda_1'`;
  const t2 = await sql`SELECT count(*) FROM socios WHERE subcategoria = 'escuela_policia' AND tanda = 'tanda_2'`;
  console.log(`Verificación: Tanda 1 = ${t1[0].count}, Tanda 2 = ${t2[0].count}`);
}

ingest().catch(err => {
  console.error('Error durante la ingesta:', err);
  process.exit(1);
});
