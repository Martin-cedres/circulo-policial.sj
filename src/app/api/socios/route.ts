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
            direccion, localidad, metodo_pago, autoriza_descuento,
            situacion, pertenencia_presupuestal, jerarquia, unidad, mensaje
        } = result.data;

        if (!direccion || direccion.trim() === '') {
            return NextResponse.json(
                { error: 'La dirección de domicilio es obligatoria.' },
                { status: 400 }
            );
        }

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
                localidad VARCHAR(100),
                metodo_pago VARCHAR(50) DEFAULT 'haberes',
                autoriza_descuento BOOLEAN DEFAULT FALSE,
                situacion VARCHAR(50) NOT NULL,
                pertenencia_presupuestal VARCHAR(255),
                jerarquia VARCHAR(100),
                unidad VARCHAR(255),
                mensaje TEXT,
                aprobado BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Asegurar columnas nuevas por compatibilidad
        try {
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS localidad VARCHAR(100)`;
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'haberes'`;
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS autoriza_descuento BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS pertenencia_presupuestal VARCHAR(255)`;
        } catch (e) {
            console.log('Error agregando columnas opcionales a membership_requests:', e);
        }

        // Guardar en base de datos (solicitudes web pendientes de revisión)
        await sql`
            INSERT INTO membership_requests 
            (nombre, apellido, cedula, email, telefono, direccion, localidad, metodo_pago, autoriza_descuento, situacion, pertenencia_presupuestal, jerarquia, unidad, mensaje)
            VALUES 
            (${nombre}, ${apellido}, ${cedula}, ${email}, ${telefono}, ${direccion || null}, ${localidad || 'San José de Mayo'}, ${metodo_pago || 'haberes'}, ${Boolean(autoriza_descuento)}, ${situacion}, ${pertenencia_presupuestal || null}, ${jerarquia || null}, ${unidad || null}, ${mensaje || null})
        `;

        const getSituacionLabel = (val: string | undefined) => {
            if (!val) return '';
            if (val === 'policia_actividad' || val === 'activo') return 'Policía en Actividad';
            if (val === 'policia_retirado' || val === 'retiro') return 'Policía Retirado';
            if (val === 'civil') return 'Civil';
            return val;
        };

        const getMetodoPagoLabel = (val: string | undefined) => {
            switch (val) {
                case 'haberes': return 'Descuento por sueldo (Jefatura San José)';
                case 'transferencia': return 'Transferencia bancaria mensual (BROU $140)';
                case 'cobrador': return 'Cobro a domicilio (Visita del cobrador)';
                case 'alumno': return 'Alumno Escuela de Policía (Provisorio)';
                default: return val || 'Descuento por sueldo';
            }
        };

        const getPertenenciaLabel = (val: string | undefined) => {
            if (!val) return 'N/A';
            if (val === 'jefatura_san_jose') return 'Jefatura de Policía de San José (UE 19)';
            if (val === 'otra_dependencia') return 'Otra Jefatura / Dependencia Presupuestal';
            return val;
        };

        // 1. Enviar email de notificación al admin
        await sendEmail({
            to: process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com',
            subject: `Nueva solicitud de socio: ${nombre} ${apellido} (${getSituacionLabel(situacion)})`,
            text: `Se ha recibido una nueva solicitud de asociación.\n\nNombre: ${nombre} ${apellido}\nCédula: ${cedula}\nEmail: ${email}\nTeléfono: ${telefono}\nMétodo de pago: ${getMetodoPagoLabel(metodo_pago)}\nLocalidad: ${localidad || 'San José de Mayo'}\nDirección: ${direccion || 'No provista'}\nSituación: ${getSituacionLabel(situacion)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #003366; border-bottom: 2px solid #003366; padding-bottom: 10px;">Nueva solicitud de asociación</h2>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;"><strong>Nombre:</strong> ${nombre} ${apellido}</li>
                        <li style="margin-bottom: 8px;"><strong>Cédula:</strong> ${cedula}</li>
                        <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</li>
                        <li style="margin-bottom: 8px;"><strong>Teléfono:</strong> ${telefono}</li>
                        <li style="margin-bottom: 8px;"><strong>Forma de pago:</strong> <span style="background: #eef2ff; color: #1e40af; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${getMetodoPagoLabel(metodo_pago)}</span></li>
                        <li style="margin-bottom: 8px;"><strong>Localidad:</strong> ${localidad || 'San José de Mayo'}</li>
                        <li style="margin-bottom: 8px;"><strong>Dirección:</strong> ${direccion}</li>
                        <li style="margin-bottom: 8px;"><strong>Situación:</strong> ${getSituacionLabel(situacion)}</li>
                        ${situacion !== 'civil' ? `<li style="margin-bottom: 8px;"><strong>Pertenencia:</strong> ${getPertenenciaLabel(pertenencia_presupuestal)}</li>` : ''}
                        ${situacion !== 'civil' ? `<li style="margin-bottom: 8px;"><strong>Jerarquía:</strong> ${jerarquia || 'N/A'}</li>` : ''}
                        ${situacion !== 'civil' ? `<li style="margin-bottom: 8px;"><strong>Unidad:</strong> ${unidad || 'N/A'}</li>` : ''}
                        ${autoriza_descuento ? `<li style="margin-bottom: 8px; color: #15803d;"><strong>Autorización:</strong> Autorizó formalmente descuento por haberes</li>` : ''}
                    </ul>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #003366; margin-top: 20px;">
                        <p><strong>Mensaje:</strong></p>
                        <p>${mensaje || 'Sin mensaje adicional'}</p>
                    </div>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                        Podés aprobar esta solicitud con 1 clic ingresando a <strong>/admin/socios</strong> pestaña "Solicitudes Web".
                    </p>
                </div>
            `,
        });

        // 2. Enviar email de confirmación al solicitante
        await sendEmail({
            to: email,
            subject: `Recibimos tu solicitud de asociación - Círculo Policial San José`,
            text: `Hola ${nombre},\n\nGracias por tu interés en asociarte al Círculo Policial "Gral. José Artigas" de San José. Hemos recibido tu solicitud correctamente y nos pondremos en contacto contigo a la brevedad para finalizar el proceso de alta.\n\nSaludos,\nCírculo Policial San José`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #003366; margin: 0;">Círculo Policial San José</h1>
                        <p style="color: #B8860B; font-weight: bold; margin: 5px 0;">"Gral. José Artigas"</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <h2 style="color: #003366;">¡Hola ${nombre}!</h2>
                    <p>Gracias por tu interés en asociarte a nuestra institución.</p>
                    <p>Hemos recibido tu solicitud correctamente con método de pago: <strong>${getMetodoPagoLabel(metodo_pago)}</strong>.</p>
                    <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 0.9em; line-height: 1.6;">
                            <strong>¿Qué sigue?</strong><br>
                            La Comisión Directiva revisará tu solicitud para dar el alta formal. Te notificaremos por este medio cuando tu ficha quede activa y tu carnet físico institucional esté listo.
                        </p>
                    </div>
                    <p style="margin-top: 30px;">Si tienes alguna consulta, puedes comunicarte con la sede o responder a este correo.</p>
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
