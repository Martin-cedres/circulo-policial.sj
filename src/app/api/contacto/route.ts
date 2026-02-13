import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { nombre, email, mensaje } = body;

        if (!nombre || !email || !mensaje) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // Crear tabla si no existe
        await sql`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50),
                asunto VARCHAR(255),
                mensaje TEXT NOT NULL,
                leido BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Guardar en base de datos
        await sql`
            INSERT INTO contact_messages (nombre, email, telefono, asunto, mensaje)
            VALUES (${nombre}, ${email}, ${body.telefono || null}, ${body.asunto || null}, ${mensaje})
        `;

        // Enviar email de notificación
        await sendEmail({
            to: process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com',
            subject: `Nuevo mensaje de contacto: ${body.asunto || 'Sin asunto'}`,
            text: `Has recibido un nuevo mensaje de contacto.\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${body.telefono || 'N/A'}\nAsunto: ${body.asunto || 'N/A'}\nMensaje: ${mensaje}`,
            html: `
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${body.telefono || 'N/A'}</p>
                <p><strong>Asunto:</strong> ${body.asunto || 'N/A'}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje.replace(/\n/g, '<br>')}</p>
            `,
        });

        return NextResponse.json(
            { message: 'Mensaje recibido correctamente' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error al procesar contacto:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

