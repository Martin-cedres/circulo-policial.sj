import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { contactoSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();

        // Validación con Zod
        const result = contactoSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', issues: result.error.format() },
                { status: 400 }
            );
        }

        const { nombre, email, telefono, asunto, mensaje } = result.data;

        // Asegurar que la tabla existe
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
            VALUES (${nombre}, ${email}, ${telefono || null}, ${asunto}, ${mensaje})
        `;

        // Enviar email de notificación
        await sendEmail({
            to: process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com',
            subject: `Nuevo mensaje de contacto: ${asunto}`,
            text: `Has recibido un nuevo mensaje de contacto.\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono || 'N/A'}\nAsunto: ${asunto}\nMensaje: ${mensaje}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Nuevo mensaje de contacto</h2>
                    <p><strong>Nombre:</strong> ${nombre}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${telefono || 'N/A'}</p>
                    <p><strong>Asunto:</strong> ${asunto}</p>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #003366; margin-top: 20px;">
                        <p><strong>Mensaje:</strong></p>
                        <p>${mensaje.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
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

