import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { solicitudConvenioSchema } from '@/lib/validations';

// Función auxiliar para inicializar tablas de convenios
async function initTables(sql: any) {
    await sql`
        CREATE TABLE IF NOT EXISTS convenios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            beneficio TEXT NOT NULL,
            descripcion TEXT,
            logo_url VARCHAR(500),
            sitio_web VARCHAR(255),
            whatsapp VARCHAR(100),
            instagram VARCHAR(100),
            telefono VARCHAR(100),
            direccion VARCHAR(255),
            destacado BOOLEAN DEFAULT FALSE,
            visible BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS convenio_solicitudes (
            id SERIAL PRIMARY KEY,
            comercio_nombre VARCHAR(255) NOT NULL,
            contacto_nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            telefono VARCHAR(50) NOT NULL,
            whatsapp VARCHAR(50),
            instagram VARCHAR(100),
            propuesta TEXT NOT NULL,
            leido BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Siembra automática si está vacía
    const countResult = await sql`
        SELECT COUNT(*)::int as total FROM convenios
    `;
    if (countResult[0].total === 0) {
        await sql`
            INSERT INTO convenios (nombre, categoria, beneficio, descripcion, destacado, visible, direccion, telefono)
            VALUES 
                ('Óptica San José', 'Salud', '20% de Descuento', 'Beneficio exclusivo en cristales y armazones para socios y su núcleo familiar directo.', true, true, 'Artigas 567, San José de Mayo', '4342 8899'),
                ('Tienda Deportiva El Campeón', 'Comercio', '15% OFF los miércoles', 'Descuento especial en calzado y vestimenta deportiva abonando en efectivo o débito.', true, true, 'Asamblea 412, San José de Mayo', '4343 1122'),
                ('Instituto de Idiomas Oxford', 'Educación', 'Matrícula gratis + 10% mensual', 'Cursos de inglés presenciales y virtuales para todas las edades y niveles.', true, true, 'Ituzaingó 789, San José de Mayo', '099 345 678'),
                ('Gimnasio Atenas', 'Servicios', '25% de Descuento en pase libre', 'Acceso completo a sala de musculación, fitness y clases dirigidas de lunes a sábado.', true, true, 'Becerro de Bengoa 345, San José de Mayo', '4342 9900')
        `;
    }
}

// GET pública: listar convenios activos
export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        await initTables(sql);

        const { searchParams } = new URL(request.url);
        const destacado = searchParams.get('destacado');

        let query;
        if (destacado === 'true') {
            query = await sql`
                SELECT * FROM convenios 
                WHERE visible = true AND destacado = true 
                ORDER BY nombre ASC
            `;
        } else {
            query = await sql`
                SELECT * FROM convenios 
                WHERE visible = true 
                ORDER BY nombre ASC
            `;
        }

        return NextResponse.json({ success: true, convenios: query }, { status: 200 });
    } catch (error: any) {
        console.error('Error al obtener convenios:', error);
        return NextResponse.json(
            { error: 'Error al obtener convenios', details: error.message },
            { status: 500 }
        );
    }
}

// POST pública: enviar solicitud para sumarse
export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        await initTables(sql);
        const body = await request.json();

        // Validar datos
        const result = solicitudConvenioSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', issues: result.error.format() },
                { status: 400 }
            );
        }

        const { comercio_nombre, contacto_nombre, email, telefono, whatsapp, instagram, propuesta } = result.data;

        // Insertar en BD
        await sql`
            INSERT INTO convenio_solicitudes (comercio_nombre, contacto_nombre, email, telefono, whatsapp, instagram, propuesta)
            VALUES (${comercio_nombre}, ${contacto_nombre}, ${email}, ${telefono}, ${whatsapp || null}, ${instagram || null}, ${propuesta})
        `;

        // Enviar email de notificación al Círculo Policial
        try {
            await sendEmail({
                to: process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com',
                subject: `Nueva propuesta de convenio: ${comercio_nombre}`,
                text: `Se ha recibido una nueva propuesta de convenio.\n\nComercio: ${comercio_nombre}\nContacto: ${contacto_nombre}\nEmail: ${email}\nTeléfono: ${telefono}\nWhatsApp: ${whatsapp || 'N/A'}\nInstagram: ${instagram || 'N/A'}\nPropuesta:\n${propuesta}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Nueva Propuesta de Convenio</h2>
                        <p><strong>Comercio/Institución:</strong> ${comercio_nombre}</p>
                        <p><strong>Nombre de Contacto:</strong> ${contacto_nombre}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teléfono:</strong> ${telefono}</p>
                        <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
                        <p><strong>Instagram:</strong> ${instagram || 'N/A'}</p>
                        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #003366; margin-top: 20px;">
                            <p><strong>Propuesta de Beneficio:</strong></p>
                            <p>${propuesta.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error('Error al enviar email de notificación de convenio:', emailErr);
            // No bloqueamos el flujo principal si el envío de email falla.
        }

        return NextResponse.json({ success: true, message: 'Solicitud recibida correctamente' }, { status: 200 });
    } catch (error: any) {
        console.error('Error al registrar solicitud de convenio:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}
