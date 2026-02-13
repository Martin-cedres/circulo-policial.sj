import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();

        const {
            nombre, apellido, cedula, email, telefono,
            direccion, situacion, jerarquia, unidad, mensaje
        } = body;

        if (!nombre || !apellido || !cedula || !email || !telefono) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // Crear tabla si no existe
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
                <h2>Nueva solicitud de asociación</h2>
                <ul>
                    <li><strong>Nombre:</strong> ${nombre} ${apellido}</li>
                    <li><strong>Cédula:</strong> ${cedula}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Teléfono:</strong> ${telefono}</li>
                    <li><strong>Situación:</strong> ${situacion}</li>
                    <li><strong>Jerarquía:</strong> ${jerarquia || 'N/A'}</li>
                    <li><strong>Unidad:</strong> ${unidad || 'N/A'}</li>
                </ul>
                <p><strong>Mensaje:</strong> ${mensaje || 'Sin mensaje'}</p>
            `,
        });

        // 2. Enviar email de confirmación al solicitante
        await sendEmail({
            to: email,
            subject: `Recibimos tu solicitud de asociación - Círculo Policial San José`,
            text: `Hola ${nombre},\n\nGracias por tu interés en asociarte al Círculo Policial "Gral. José Artigas" de San José. Hemos recibido tu solicitud correctamente y nos pondremos en contacto contigo a la brevedad para finalizar el proceso.\n\nSaludos,\nCírculo Policial San José`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #003366;">¡Hola ${nombre}!</h2>
                    <p>Gracias por tu interés en asociarte al <strong>Círculo Policial "Gral. José Artigas" de San José</strong>.</p>
                    <p>Hemos recibido tu solicitud correctamente. Nuestro equipo la revisará y se pondrá en contacto contigo a la brevedad para informarte los siguientes pasos.</p>
                    <p>Si tienes alguna consulta, no dudes en escribirnos a este correo.</p>
                    <br>
                    <p>Saludos cordiales,</p>
                    <p><strong>Comisión Directiva</strong><br>Círculo Policial San José</p>
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

