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

async function seedInmobiliariaMontanoNoticia() {
    console.log('🚀 Iniciando publicación de la noticia de convenio con Inmobiliaria Montaño...');
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

    const noticiaData = {
        title: 'El Círculo Policial firma convenio con Inmobiliaria Montaño ofreciendo 10% de descuento en nuevos alquileres',
        subtitle: 'Los afiliados a la institución podrán acceder a un beneficio exclusivo del 10% de bonificación en la concreción de nuevos alquileres en San José.',
        image_url: '/images/convenio-inmobiliaria-montano.jpg',
        author: 'Círculo Policial San José',
        category: 'Convenios',
        is_featured: true,
        is_new: true,
        slug: 'convenio-inmobiliaria-montano-alquileres',
        seo_description: 'Conocé el convenio firmado entre el Círculo Policial de San José e Inmobiliaria Montaño. Los socios acceden a un 10% de descuento en nuevos contratos de alquiler.',
        seo_keywords: 'inmobiliaria montano san jose, alquileres san jose de mayo, convenio inmobiliaria circulo policial, descuento alquileres san jose',
        content: `
            <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                El Círculo Policial de San José anuncia con agrado la firma de un nuevo convenio comercial e institucional con <strong>Inmobiliaria Montaño</strong>, brindando a todos nuestros socios y sus familias un beneficio exclusivo del <strong>10% de descuento</strong> en el trámite de nuevos alquileres.
            </p>

            <p>
                Con esta alianza estratégica junto a una destacada firma del sector inmobiliario de nuestro departamento, la comisión directiva del Círculo Policial continúa trabajando activamente para brindar soluciones concretas y facilitar el acceso a la vivienda y alquileres para todos los integrantes de nuestra comunidad policial.
            </p>

            <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">🏠 Detalles del Beneficio e Información para Socios</h3>
                <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                    <li><strong>Descuento exclusivo:</strong> 10% OFF al concretar nuevos contratos de alquiler de inmuebles.</li>
                    <li><strong>Alcance:</strong> Aplica a todos los socios activos y jubilados del Círculo Policial de San José.</li>
                    <li><strong>Requisito e Identificación:</strong> Presentar la acreditación de socio vigente (carné del Círculo Policial de San José) junto a la Cédula de Identidad al momento de gestionar la operación.</li>
                </ul>
            </div>

            <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📍 Información de Atención y Contacto</h4>
                <p style="margin-bottom: 6px; color: #1E293B;"><strong>Comercio:</strong> Inmobiliaria Montaño</p>
                <p style="margin-bottom: 6px; color: #1E293B;"><strong>Ubicación:</strong> San José de Mayo, Uruguay</p>
                <p style="margin-bottom: 0; color: #1E293B;">ℹ️ <em>Para consultas de propiedades disponibles y coordinación de visitas, dirigirse directamente a la firma inmobiliaria o consultar en la sede del Círculo Policial.</em></p>
            </div>

            <p style="font-style: italic; color: #64748B;">
                Invitamos a todos los afiliados interesados en concretar nuevos alquileres a hacer uso de este importante beneficio institucional.
            </p>
        `
    };

    // Insertar o actualizar noticia en posts
    const existingPost = await sql`
        SELECT id FROM posts WHERE slug = ${noticiaData.slug} OR title LIKE '%Inmobiliaria Montaño%' LIMIT 1
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
        console.log(`ℹ️ Noticia de Inmobiliaria Montaño actualizada correctamente (ID: ${id})`);
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
        console.log(`✅ Noticia de Inmobiliaria Montaño publicada con éxito (ID: ${inserted[0].id})`);
    }

    // 2. Registrar/actualizar también en la tabla convenios si existe
    try {
        const existingConvenio = await sql`
            SELECT id FROM convenios WHERE nombre LIKE '%Montaño%' OR nombre LIKE '%Montano%' LIMIT 1
        `;

        if (existingConvenio.length > 0) {
            await sql`
                UPDATE convenios SET
                    nombre = 'Inmobiliaria Montaño',
                    categoria = 'Servicios / Inmobiliaria',
                    beneficio = '10% de descuento en nuevos alquileres',
                    descripcion = '10% de descuento en nuevos contratos de alquiler para socios del Círculo Policial San José.',
                    logo_url = '/images/convenio-inmobiliaria-montano.jpg',
                    destacado = TRUE,
                    visible = TRUE
                WHERE id = ${existingConvenio[0].id}
            `;
            console.log(`ℹ️ Registro de convenio Inmobiliaria Montaño actualizado en la tabla convenios (ID: ${existingConvenio[0].id})`);
        } else {
            await sql`
                INSERT INTO convenios (
                    nombre, categoria, beneficio, descripcion, logo_url, destacado, visible
                ) VALUES (
                    'Inmobiliaria Montaño', 'Servicios / Inmobiliaria', '10% de descuento en nuevos alquileres',
                    '10% de descuento en nuevos contratos de alquiler para socios del Círculo Policial San José.',
                    '/images/convenio-inmobiliaria-montano.jpg', TRUE, TRUE
                )
            `;
            console.log(`✅ Registro de convenio Inmobiliaria Montaño insertado en la tabla convenios.`);
        }
    } catch (e) {
        console.log('Tabla convenios no lista o aviso:', e);
    }

    console.log('🎉 Noticia publicada en la base de datos.');
}

seedInmobiliariaMontanoNoticia().catch(err => {
    console.error('❌ Error registrando noticia Inmobiliaria Montaño:', err);
    process.exit(1);
});
