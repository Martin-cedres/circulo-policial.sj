import fs from 'fs';
import path from 'path';

// Cargar variables de .env.local manualmente
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
    console.error('Error cargando .env.local:', e);
}

import { getSql } from '../src/lib/db';

async function seedAbastoConvenio() {
    console.log('🚀 Iniciando publicación de la noticia y convenio de Complejo El Abasto...');
    const sql = getSql();

    // 1. Asegurar tabla posts
    await sql`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(500),
            content TEXT NOT NULL,
            image_url VARCHAR(500),
            author VARCHAR(100) DEFAULT 'Círculo Policial San José',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            seo_description VARCHAR(500),
            seo_keywords VARCHAR(500),
            is_featured BOOLEAN DEFAULT FALSE,
            is_new BOOLEAN DEFAULT TRUE,
            category VARCHAR(100) DEFAULT 'Convenios',
            gallery_urls JSONB DEFAULT '[]'::jsonb,
            slug VARCHAR(255) UNIQUE
        )
    `;

    // 2. Noticia de Complejo El Abasto
    const noticiaData = {
        title: 'El Círculo Policial firma convenio con Complejo El Abasto brindando tarifa preferencial en alquiler de cancha de Fútbol 5',
        subtitle: 'Los socios de la institución accederán a una tarifa bonificada de $1.000 por hora de alquiler (precio habitual $1.200).',
        image_url: '/images/convenio-el-abasto.jpg',
        author: 'Círculo Policial San José',
        category: 'Convenios',
        is_featured: true,
        is_new: true,
        slug: 'convenio-complejo-el-abasto-futbol-5',
        seo_description: 'El Círculo Policial de San José anuncia convenio con Complejo El Abasto: alquiler de cancha de Fútbol 5 a $1.000 (precio habitual $1.200) para socios.',
        seo_keywords: 'complejo el abasto san jose, cancha futbol 5 abasto san jose, alquiler cancha futbol 5 san jose de mayo, convenio circulo policial futbol 5',
        content: `
            <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                El Círculo Policial de San José anuncia la firma de un convenio deportivo y de esparcimiento con el <strong>Complejo El Abasto</strong>, mediante el cual todos los socios de la institución contarán con una tarifa preferencial en el alquiler de su cancha de fútbol 5.
            </p>

            <p>
                A través de esta nueva alianza, nuestros asociados podrán disfrutar de instalaciones deportivas equipadas con césped sintético de alta calidad e iluminación LED para la práctica deportiva nocturna y recreativa.
            </p>

            <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">⚽ Beneficios Exclusivos para Socios</h3>
                <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                    <li><strong>Tarifa Bonificada:</strong> <strong>$1.000 UYU</strong> por hora de cancha (precio habitual al público: $1.200 UYU).</li>
                    <li><strong>Ahorro:</strong> $200 UYU de descuento directo por alquiler de hora.</li>
                    <li><strong>Requisito e Identificación:</strong> Exhibir el carné de socio del Círculo Policial de San José junto a la Cédula de Identidad al momento de ingresar o coordinar la reserva.</li>
                </ul>
            </div>

            <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📲 Reservas y Contacto Directo</h4>
                <p style="margin-bottom: 8px; color: #1E293B;">🌐 <strong>Reserva de turnos en línea:</strong> <a href="https://abasto.gt.tc/" target="_blank" rel="noopener noreferrer" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">abasto.gt.tc</a></p>
                <p style="margin-bottom: 6px; color: #1E293B;">📞 <strong>Líneas telefónicas y WhatsApp de reservas:</strong></p>
                <ul style="margin: 0; padding-left: 20px; color: #1E293B; line-height: 1.6;">
                    <li><a href="https://wa.me/59895551445" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">095 551 445</a></li>
                    <li><a href="https://wa.me/59891029306" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">091 029 306</a></li>
                    <li><a href="https://wa.me/59892276523" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">092 276 523</a></li>
                </ul>
            </div>

            <p style="font-style: italic; color: #64748B;">
                Invitamos a todos los afiliados a aprovechar esta nueva propuesta deportiva para organizar sus partidos y encuentros recreativos con familiares y compañeros.
            </p>
        `
    };

    // Insertar o actualizar noticia en posts
    const existingPost = await sql`
        SELECT id FROM posts WHERE slug = ${noticiaData.slug} OR title LIKE '%Complejo El Abasto%' LIMIT 1
    `;

    if (existingPost.length > 0) {
        const id = existingPost[0].id;
        await sql`
            UPDATE posts SET
                title = ${noticiaData.title},
                subtitle = ${noticiaData.subtitle},
                content = ${noticiaData.content},
                image_url = ${noticiaData.image_url},
                author = ${noticiaData.author},
                seo_description = ${noticiaData.seo_description},
                seo_keywords = ${noticiaData.seo_keywords},
                is_featured = ${noticiaData.is_featured},
                is_new = ${noticiaData.is_new},
                category = ${noticiaData.category}
            WHERE id = ${id}
        `;
        console.log(`ℹ️ Noticia de Complejo El Abasto actualizada correctamente (ID: ${id})`);
    } else {
        const inserted = await sql`
            INSERT INTO posts (
                title, subtitle, content, image_url, author, seo_description, seo_keywords, is_featured, is_new, category, slug
            ) VALUES (
                ${noticiaData.title}, ${noticiaData.subtitle}, ${noticiaData.content}, ${noticiaData.image_url}, 
                ${noticiaData.author}, ${noticiaData.seo_description}, ${noticiaData.seo_keywords}, 
                ${noticiaData.is_featured}, ${noticiaData.is_new}, ${noticiaData.category}, ${noticiaData.slug}
            ) RETURNING id
        `;
        console.log(`✅ Noticia de Complejo El Abasto publicada con éxito (ID: ${inserted[0].id})`);
    }

    // 3. Registrar también en la tabla convenios si existe
    try {
        const existingConvenio = await sql`
            SELECT id FROM convenios WHERE nombre LIKE '%El Abasto%' LIMIT 1
        `;

        if (existingConvenio.length > 0) {
            await sql`
                UPDATE convenios SET
                    nombre = 'Complejo El Abasto',
                    categoria = 'Deporte',
                    beneficio = 'Cancha Fútbol 5 a $1.000/hs (Habitual $1.200)',
                    descripcion = 'Cancha de fútbol 5 con césped sintético e iluminación LED. Beneficio exclusivo para socios.',
                    logo_url = '/images/convenio-el-abasto.jpg',
                    sitio_web = 'https://abasto.gt.tc/',
                    whatsapp = '095551445',
                    telefono = '095 551 445 / 091 029 306 / 092 276 523',
                    destacado = TRUE,
                    visible = TRUE
                WHERE id = ${existingConvenio[0].id}
            `;
            console.log(`ℹ️ Registro de convenio Complejo El Abasto actualizado (ID: ${existingConvenio[0].id})`);
        } else {
            await sql`
                INSERT INTO convenios (
                    nombre, categoria, beneficio, descripcion, logo_url, sitio_web, whatsapp, telefono, destacado, visible
                ) VALUES (
                    'Complejo El Abasto', 'Deporte', 'Cancha Fútbol 5 a $1.000/hs (Habitual $1.200)',
                    'Cancha de fútbol 5 con césped sintético e iluminación LED. Beneficio exclusivo para socios.',
                    '/images/convenio-el-abasto.jpg', 'https://abasto.gt.tc/', '095551445',
                    '095 551 445 / 091 029 306 / 092 276 523', TRUE, TRUE
                )
            `;
            console.log(`✅ Registro de convenio Complejo El Abasto insertado con éxito.`);
        }
    } catch (e) {
        console.log('Tabla convenios no lista o ya actualizada:', e);
    }

    console.log('🎉 Proceso finalizado.');
}

seedAbastoConvenio().catch(err => {
    console.error('❌ Error registrando convenio El Abasto:', err);
    process.exit(1);
});
