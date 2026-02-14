import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sociosSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();

        // Validación con Zod
        const result = sociosSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', issues: result.error.format() },
                { status: 400 }
            );
        }

        const {
            nombre, apellido, cedula, email, telefono,
            direccion, situacion, jerarquia, unidad, mensaje
        } = result.data;

        // Asegurar que la tabla existe
        await sql`
            CREATE TABLE IF NOT EXISTS membership_requests (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                apellido VARCHAR(255) NOT NULL,
                cedula VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NOT NULL,
                direccion TEXT,
                situacion VARCHAR(50) NOT NULL,
                jerarquia VARCHAR(100),
                unidad VARCHAR(255),
                mensaje TEXT,
                aprobado BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Guardar en base de datos
        await sql`
            INSERT INTO membership_requests 
            (nombre, apellido, cedula, email, telefono, direccion, situacion, jerarquia, unidad, mensaje)
            VALUES 
            (${nombre}, ${apellido}, ${cedula}, ${email}, ${telefono}, ${direccion || null}, ${situacion}, ${jerarquia || null}, ${unidad || null}, ${mensaje || null})
        `;

        // 1. Enviar email de notificación al admin
        await sendEmail({
            to: process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com',
            subject: `Nueva solicitud de socio: ${nombre} ${apellido}`,
            text: `Se ha recibido una nueva solicitud de asociación.\n\nNombre: ${nombre} ${apellido}\nCédula: ${cedula}\nEmail: ${email}\nTeléfono: ${telefono}\nSituación: ${situacion}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Nueva solicitud de asociación</h2>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;"><strong>Nombre:</strong> ${nombre} ${apellido}</li>
                        <li style="margin-bottom: 8px;"><strong>Cédula:</strong> ${cedula}</li>
                        <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</li>
                        <li style="margin-bottom: 8px;"><strong>Teléfono:</strong> ${telefono}</li>
                        <li style="margin-bottom: 8px;"><strong>Situación:</strong> ${situacion === 'activo' ? 'En actividad' : 'Retiro'}</li>
                        <li style="margin-bottom: 8px;"><strong>Jerarquía:</strong> ${jerarquia || 'N/A'}</li>
                        <li style="margin-bottom: 8px;"><strong>Unidad:</strong> ${unidad || 'N/A'}</li>
                    </ul>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #003366; margin-top: 20px;">
                        <p><strong>Mensaje:</strong></p>
                        <p>${mensaje || 'Sin mensaje adicional'}</p>
                    </div>
                </div>
            `,
        });

        // 2. Enviar email de confirmación al solicitante
        await sendEmail({
            to: email,
            subject: `Recibimos tu solicitud de asociación - Círculo Policial San José`,
            text: `Hola ${nombre},\n\nGracias por tu interés en asociarte al Círculo Policial "Gral. José Artigas" de San José. Hemos recibido tu solicitud correctamente y nos pondremos en contacto contigo a la brevedad para finalizar el proceso.\n\nSaludos,\nCírculo Policial San José`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #003366; margin: 0;">Círculo Policial San José</h1>
                        <p style="color: #B8860B; font-weight: bold; margin: 5px 0;">"Gral. José Artigas"</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <h2 style="color: #003366;">¡Hola ${nombre}!</h2>
                    <p>Gracias por tu interés en asociarte a nuestra institución.</p>
                    <p>Hemos recibido tu solicitud correctamente. Nuestro equipo revisará la información y se pondrá en contacto contigo a la brevedad para informarte sobre los siguientes pasos del proceso de alta.</p>
                    <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 0.9em; line-height: 1.6;">
                            <strong>¿Qué sigue?</strong><br>
                            Evaluaremos tus datos según los estatutos vigentes y te llamaremos al número brindado (${telefono}) para coordinar la firma física o los detalles administrativos restantes.
                        </p>
                    </div>
                    <p style="margin-top: 30px;">Si tienes alguna consulta urgente, puedes responder a este correo.</p>
                    <br>
                    <p style="margin-bottom: 0;">Saludos cordiales,</p>
                    <p style="font-weight: bold; color: #003366; margin-top: 5px;">Comisión Directiva<br>Círculo Policial San José</p>
                </div>
            `,
        });

        return NextResponse.json(
            { message: 'Solicitud recibida correctamente' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error al procesar solicitud:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

