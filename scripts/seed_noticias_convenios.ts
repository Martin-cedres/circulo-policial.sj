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
import { generateSlug } from '../src/lib/blog';

async function seedNoticiasConvenios() {
    console.log('🚀 Iniciando publicación de noticias para los convenios comerciales...');
    const sql = getSql();

    // Asegurar tabla posts
    await sql`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle TEXT,
            content TEXT NOT NULL,
            image_url TEXT,
            author VARCHAR(255) DEFAULT 'Admin',
            seo_description TEXT,
            seo_keywords TEXT,
            is_featured BOOLEAN DEFAULT FALSE,
            is_new BOOLEAN DEFAULT FALSE,
            category VARCHAR(50) DEFAULT 'Institucional',
            gallery_urls TEXT,
            slug VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const noticiasData = [
        {
            title: 'El Círculo Policial firma convenio con Carnicería Digui para brindar 10% de descuento a sus socios',
            subtitle: 'Los afiliados a la institución podrán acceder a un descuento especial en la compra de cortes cárnicos de calidad en San José de Mayo.',
            image_url: 'https://dyueozkxaosvrakm.public.blob.vercel-storage.com/Carniceria%20Digui-vaQean5UTuC1kyOW4X5ey8BS40sZ3j.jpg',
            author: 'Círculo Policial San José',
            category: 'Convenios',
            is_featured: true,
            is_new: true,
            seo_description: 'El Círculo Policial de San José anuncia un convenio con Carnicería Digui que otorga un 10% de descuento a sus socios en San José de Mayo.',
            seo_keywords: 'carniceria digui san jose, convenio carniceria circulo policial, descuento carne san jose, comercio san jose de mayo',
            content: `
                <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                    El Círculo Policial de San José anuncia la firma de un nuevo convenio comercial con <strong>Carnicería Digui</strong>, brindando a todos sus socios y sus familias un beneficio exclusivo del <strong>10% de descuento</strong> en sus compras.
                </p>

                <p>
                    Mediante este acuerdo institucional, nuestra comisión directiva continúa sumando alianzas estratégicas con comercios locales de destacada trayectoria en San José de Mayo, con el objetivo de respaldar la economía del hogar de nuestros afiliados.
                </p>

                <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">🥩 Detalles del Convenio y Beneficios</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                        <li><strong>Descuento exclusivo:</strong> 10% OFF al realizar compras en el comercio.</li>
                        <li><strong>Requisito:</strong> Presentar el carné de socio del Círculo Policial de San José junto a la Cédula de Identidad.</li>
                        <li><strong>Productos:</strong> Aplica a la amplia variedad de cortes cárnicos de primera calidad y atención personalizada.</li>
                    </ul>
                </div>

                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📍 Datos del Comercio y Contacto</h4>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Dirección:</strong> Av. Dr. Luis Alberto de Herrera 301 esquina Acuña de Figueroa, San José de Mayo.</p>
                    <p style="margin-bottom: 0; color: #1E293B;"><strong>Teléfono de contacto:</strong> <a href="tel:43423069" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">4342 3069</a></p>
                </div>

                <p style="font-style: italic; color: #64748B;">
                    Invitamos a todos los socios a acercarse al comercio y hacer uso de este importante beneficio presentando su credencial vigente.
                </p>
            `
        },
        {
            title: 'El Círculo Policial de San José concreta convenio con La Lentería con un 25% de descuento en óptica',
            subtitle: 'El acuerdo permite a los afiliados acceder a bonificaciones especiales en armazones de recetario, lentes de sol y contactología.',
            image_url: 'https://dyueozkxaosvrakm.public.blob.vercel-storage.com/la%20lenteria-ubBeVQY4uJBPWCGcyBs6PkrInXhPb0.jpg',
            author: 'Círculo Policial San José',
            category: 'Convenios',
            is_featured: true,
            is_new: true,
            seo_description: 'Conocé el convenio firmado entre el Círculo Policial de San José y La Lentería. Los socios acceden a un 25% de descuento en lentes y armazones en Asamblea 582.',
            seo_keywords: 'la lenteria san jose, optica san jose de mayo, convenio optica circulo policial, descuento lentes san jose',
            content: `
                <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                    El Círculo Policial de San José informa a su comunidad de afiliados la concreción de una nueva alianza con <strong>La Lentería</strong> (sucursal San José de Mayo), mediante la cual nuestros socios dispondrán de un <strong>25% de descuento</strong> en productos ópticos y salud visual.
                </p>

                <p>
                    La Lentería es un establecimiento de referencia en el rubro óptico que ofrece asesoramiento profesional, servicio de contactología y un extenso catálogo de armazones de diseño y lentes recetados de alta precisión.
                </p>

                <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">👓 Alcance del Beneficio para Socios</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                        <li><strong>25% OFF:</strong> En la compra de armazones y cristales recetados.</li>
                        <li><strong>Presentación:</strong> Exclusivo para socios acreditados con carné del Círculo Policial y C.I.</li>
                        <li><strong>Servicios:</strong> Atención personalizada y variedad de medios de pago.</li>
                    </ul>
                </div>

                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📍 Información de Atención y Canales Oficiales</h4>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Dirección:</strong> Asamblea 582, San José de Mayo.</p>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Horarios de atención:</strong> Lunes a Sábado de 08:00 a 20:00 hs | Domingos de 10:00 a 20:00 hs.</p>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Teléfono fijo:</strong> <a href="tel:43435635" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">4343 5635</a> | <strong>WhatsApp:</strong> <a href="https://wa.me/59891366626" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">091 366 626</a></p>
                    <p style="margin-bottom: 6px; color: #1E293B;">🌐 <strong>Sitio Web Oficial:</strong> <a href="https://www.lalenteria.com.uy/" target="_blank" rel="noopener noreferrer" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">www.lalenteria.com.uy</a></p>
                    <p style="margin-bottom: 0; color: #1E293B;">📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/la_lenteria" target="_blank" rel="noopener noreferrer" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">@la_lenteria</a></p>
                </div>
            `
        },
        {
            title: 'El Círculo Policial acuerda beneficio del 10% de descuento con Kamaluso Papelería Personalizada',
            subtitle: 'Los socios de la institución contarán con descuentos en agendas, cuadernos, recetarios y confección de papelería a medida.',
            image_url: 'https://dyueozkxaosvrakm.public.blob.vercel-storage.com/papeleria%20personalizada%20kamaluso-afxiMRzstJ44dE3jjtCSFVv3CNZ16g.jpg',
            author: 'Círculo Policial San José',
            category: 'Convenios',
            is_featured: true,
            is_new: true,
            seo_description: 'El Círculo Policial de San José suma un nuevo convenio con Kamaluso Papelería Personalizada. 10% de descuento en agendas, cuadernos y papelería a medida.',
            seo_keywords: 'kamaluso papeleria san jose, papeleria personalizada san jose, agendas personalizadas san jose, convenio circulo policial',
            content: `
                <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                    El Círculo Policial de San José se complace en presentar el acuerdo alcanzado con <strong>Kamaluso Papelería Personalizada</strong>, que otorga a todos nuestros socios un <strong>10% de descuento</strong> en sus productos artesanales y servicios de encuadernación.
                </p>

                <p>
                    Kamaluso es un taller especializado en San José de Mayo dedicado a la elaboración de agendas docentes y perpetuas, libretas, cuadernos de tapa dura, recetarios, diarios íntimos y papelería corporativa o académica a medida.
                </p>

                <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">📒 Beneficios para los Socios</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                        <li><strong>10% OFF:</strong> En agendas, cuadernos, libretas, recetarios y artículos de papelería personalizada de catálogo.</li>
                        <li><strong>Personalización:</strong> Diseños de tapa dura con espiral metálico para uso personal, profesional o institucional.</li>
                        <li><strong>Acreditación:</strong> Presentando el carné de socio vigente al momento de coordinar el pedido.</li>
                    </ul>
                </div>

                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📍 Ubicación del Taller y Contacto Directo</h4>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Dirección:</strong> Calle Ramón Massini N° 136, San José de Mayo.</p>
                    <p style="margin-bottom: 6px; color: #1E293B;">📱 <strong>WhatsApp de pedidos:</strong> <a href="https://wa.me/59898615074" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">098 615 074</a></p>
                    <p style="margin-bottom: 6px; color: #1E293B;">🌐 <strong>Catálogo Web:</strong> <a href="https://www.papeleriapersonalizada.uy/" target="_blank" rel="noopener noreferrer" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">www.papeleriapersonalizada.uy</a></p>
                    <p style="margin-bottom: 0; color: #1E293B;">📸 <strong>Instagram:</strong> <a href="https://instagram.com/kamaluso_sanjose/" target="_blank" rel="noopener noreferrer" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">@kamaluso_sanjose</a></p>
                </div>
            `
        },
        {
            title: 'El Círculo Policial firma convenio con Riogas San José ofreciendo descuentos en envíos y accesorios',
            subtitle: 'Los afiliados accederán a una bonificación del 25% en el costo del flete a domicilio y un 10% en repuestos y accesorios de gas.',
            image_url: 'https://dyueozkxaosvrakm.public.blob.vercel-storage.com/dale%20gas-6JgcdAbHi3Bktm7Fz1U4QnO6Hm8EGa.webp',
            author: 'Círculo Policial San José',
            category: 'Convenios',
            is_featured: true,
            is_new: true,
            seo_description: 'Nuevo convenio entre el Círculo Policial de San José y Riogas San José: 25% de descuento en el envío a domicilio de supergás y 10% en repuestos.',
            seo_keywords: 'riogas san jose de mayo, supergas a domicilio san jose, garrafa riogas san jose, convenio circulo policial riogas',
            content: `
                <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                    El Círculo Policial de San José comunica la suscripción de un acuerdo de beneficios con la firma distribuidora <strong>Riogas San José</strong> (Martin y Pablo S.R.L.), facilitando descuentos en la entrega de supergás a domicilio y accesorios para el hogar.
                </p>

                <p>
                    Este servicio esencial permite a nuestros socios contar con bonificaciones directas al momento de solicitar el envío de garrafas o adquirir repuestos de gas en la ciudad de San José de Mayo.
                </p>

                <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">🔥 Bonificaciones Incluidas en el Convenio</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                        <li><strong>25% OFF en flete / envío:</strong> Bonificación en el costo de traslado a domicilio dentro de San José de Mayo.</li>
                        <li><strong>10% OFF en repuestos y accesorios:</strong> Aplica a envases de 3kg, válvulas, reguladores, mangueras, quemadores y accesorios para cocinillas.</li>
                        <li><strong>Identificación:</strong> Exhibir el carné de socio del Círculo Policial junto a la Cédula de Identidad al momento de la entrega.</li>
                    </ul>
                </div>

                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📍 Distribuidor y Pedidos</h4>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Dirección:</strong> Atilio Pelossi N° 052 esquina M. Calleros, San José de Mayo.</p>
                    <p style="margin-bottom: 6px; color: #1E293B;">📞 <strong>Teléfono pedidos:</strong> <a href="tel:43421710" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">4342 1710</a></p>
                    <p style="margin-bottom: 0; color: #1E293B;">📱 <strong>WhatsApp / Celular:</strong> <a href="https://wa.me/59891331710" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">091 331 710</a></p>
                </div>
            `
        },
        {
            title: 'El Círculo Policial firma convenio de salud con Val Ortopedia ofreciendo 10% de descuento a sus socios',
            subtitle: 'El acuerdo incluye bonificaciones en la compra de insumos médicos, productos ortopédicos y alquiler de equipos de recuperación.',
            image_url: 'https://dyueozkxaosvrakm.public.blob.vercel-storage.com/val%20ortopedia-ghHIAO5PGmbxyBMBDwT40DGHHClrrD.jpeg',
            author: 'Círculo Policial San José',
            category: 'Convenios',
            is_featured: true,
            is_new: true,
            seo_description: 'Convenio entre el Círculo Policial de San José y Val Ortopedia: 10% de descuento en artículos ortopédicos, insumos médicos y alquiler de equipamiento.',
            seo_keywords: 'val ortopedia san jose, ortopedia san jose de mayo, insumos medicos san jose, alquiler equipos medicos san jose, convenio circulo policial',
            content: `
                <p class="lead" style="font-size: 1.15rem; color: #002B49; font-weight: 600; line-height: 1.6;">
                    El Círculo Policial de San José anuncia la firma de un convenio de salud con <strong>VAL ORTOPEDIA</strong>, brindando a todos sus afiliados y sus familias un <strong>10% de descuento</strong> en insumos médicos, artículos ortopédicos y alquiler de equipamiento de recuperación.
                </p>

                <p>
                    VAL ORTOPEDIA es un centro especializado en San José de Mayo dedicado a la atención en salud, rehabilitación y ortopedia técnica, brindando asesoramiento personalizado y seguimiento profesional para la correcta elección de cada dispositivo.
                </p>

                <div style="background-color: #F8FAFC; border-left: 4px solid #002B49; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #002B49; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 12px;">🏥 Beneficios Exclusivos para Socios</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.7;">
                        <li><strong>10% OFF en compra de productos:</strong> Venta al público de artículos ortopédicos e insumos médicos sobre precio de lista.</li>
                        <li><strong>10% OFF en alquiler de equipos:</strong> Bonificación en alquiler de equipamiento médico y artículos de rehabilitación.</li>
                        <li><strong>Asesoramiento personalizado:</strong> Acompañamiento profesional en la selección del producto más adecuado según la indicación médica.</li>
                        <li><strong>Identificación:</strong> Exhibir el carné de socio del Círculo Policial junto a la Cédula de Identidad al momento de la compra o alquiler.</li>
                    </ul>
                </div>

                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h4 style="color: #1E3A8A; font-size: 1rem; font-weight: 700; margin-top: 0; margin-bottom: 10px;">📍 Dirección, Atención y Contacto</h4>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Dirección:</strong> 25 de Mayo 704, San José de Mayo.</p>
                    <p style="margin-bottom: 6px; color: #1E293B;"><strong>Horarios de atención:</strong> Lunes a Viernes de 08:30 a 12:30 hs y de 14:00 a 19:00 hs | Sábados de 08:30 a 12:30 hs.</p>
                    <p style="margin-bottom: 6px; color: #1E293B;">📞 <strong>Teléfono de atención:</strong> <a href="tel:43437412" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">4343 7412</a> | 📱 <strong>WhatsApp:</strong> <a href="https://wa.me/59892041547" target="_blank" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">092 041 547</a></p>
                    <p style="margin-bottom: 0; color: #1E293B;">📸 <strong>Instagram:</strong> <a href="https://www.instagram.com/val.ortopedia" target="_blank" rel="noopener noreferrer" style="color: #1D4ED8; font-weight: 600; text-decoration: underline;">@val.ortopedia</a></p>
                </div>
            `
        }
    ];

    for (const item of noticiasData) {
        const slug = generateSlug(item.title);
        
        // Verificar si ya existe una noticia similar para no duplicar
        const existing = await sql`SELECT id FROM posts WHERE slug = ${slug} OR title = ${item.title}`;
        if (existing.length > 0) {
            console.log(`ℹ️ La noticia "${item.title.substring(0, 35)}..." ya existe (ID: ${existing[0].id}). Actualizando...`);
            await sql`
                UPDATE posts 
                SET subtitle = ${item.subtitle},
                    content = ${item.content},
                    image_url = ${item.image_url},
                    author = ${item.author},
                    category = ${item.category},
                    is_featured = ${item.is_featured},
                    is_new = ${item.is_new},
                    seo_description = ${item.seo_description},
                    seo_keywords = ${item.seo_keywords}
                WHERE id = ${existing[0].id}
            `;
        } else {
            console.log(`➕ Creando noticia: "${item.title.substring(0, 45)}..."`);
            await sql`
                INSERT INTO posts (
                    title, subtitle, content, image_url, author, category, is_featured, is_new, seo_description, seo_keywords, slug
                ) VALUES (
                    ${item.title}, ${item.subtitle}, ${item.content}, ${item.image_url}, ${item.author}, ${item.category}, ${item.is_featured}, ${item.is_new}, ${item.seo_description}, ${item.seo_keywords}, ${slug}
                )
            `;
        }
    }

    console.log('✅ ¡Todas las 4 noticias se han publicado correctamente en la base de datos!');
}

seedNoticiasConvenios().catch(err => {
    console.error('❌ Error al insertar noticias:', err);
    process.exit(1);
});
