import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sociosSchema } from '@/lib/validations';
import fs from 'fs';
import path from 'path';

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

        // Cargar logo para adjuntar en correos
        const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-email.png');
        const hasLogo = fs.existsSync(logoPath);
        const logoBuffer = hasLogo ? fs.readFileSync(logoPath) : null;
        const attachments: any[] = [];
        if (logoBuffer) {
            attachments.push({
                filename: 'logo-circulo.png',
                content: logoBuffer,
                contentType: 'image/png',
                cid: 'logo-circulo',
            });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://circulopolicialsj.com';

        // 2. Enviar email de confirmación al solicitante
        await sendEmail({
            to: email,
            subject: `Recibimos tu solicitud de asociación - Círculo Policial San José`,
            text: `Hola ${nombre},\n\nGracias por tu interés en asociarte al Círculo Policial "Gral. José Artigas" de San José. Hemos recibido tu solicitud correctamente con la modalidad: ${getMetodoPagoLabel(metodo_pago)}.\n\nLa Comisión Directiva revisará tu solicitud para dar el alta formal. Te notificaremos por este medio cuando tu ficha quede activa y tu carnet físico institucional esté listo.\n\n📰 Te invitamos a visitar nuestra sección de Noticias (${siteUrl}/noticias) para conocer más sobre nuestra institución, convenios y beneficios sociales.\n\nPor la Comisión Directiva del Círculo Policial Gral. José Artigas de San José saluda atentamente,\nSargento Martín CEDRÉS\nPro Secretario\n\nSede Social: Calle Ituzaingó N° 441, San José de Mayo\n\n---\n🤖 Mensaje emitido de forma automática por el Sistema de Gestión del Círculo Policial San José.`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; color: #1e293b; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="95" height="95" style="display: block; margin: 0 auto 10px auto; max-width: 95px; height: auto;" />` : ''}
                        <h1 style="color: #002B49; margin: 0; font-size: 24px;">Círculo Policial San José</h1>
                        <p style="color: #B8860B; font-weight: bold; margin: 5px 0 0 0; font-size: 14px;">"Gral. José Artigas" — Fundado en 1944</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <h2 style="color: #002B49; font-size: 20px; margin-top: 0;">¡Hola ${nombre}!</h2>
                    <p style="font-size: 15px; line-height: 1.6;">Gracias por tu interés en asociarte a nuestra institución.</p>
                    <p style="font-size: 15px; line-height: 1.6;">Hemos recibido tu solicitud correctamente con método de pago seleccionado: <strong>${getMetodoPagoLabel(metodo_pago)}</strong>.</p>
                    
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">
                            <strong style="color: #002B49;">¿Cómo continúa el trámite?</strong><br>
                            La Comisión Directiva revisará tu solicitud para dar el alta formal. Te notificaremos por este medio cuando tu ficha de socio quede activa y tu carnet físico institucional esté listo.
                        </p>
                    </div>

                    <!-- Invitación a Noticias -->
                    <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 14px; margin: 24px 0 20px 0; text-align: center;">
                        <p style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: bold; color: #002B49;">
                            📰 Te invitamos a visitar nuestra sección de Noticias
                        </p>
                        <p style="margin: 0 0 10px 0; font-size: 12.5px; color: #475569; line-height: 1.4;">
                            Mantenete informado sobre nuevos convenios, actividades, obras y beneficios para socios ingresando a nuestro sitio web oficial.
                        </p>
                        <a href="${siteUrl}/noticias" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #002B49; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: bold; padding: 7px 16px; border-radius: 6px;">
                            Ver Noticias del Círculo →
                        </a>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 25px;">
                        <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;">
                            Por la Comisión Directiva del Círculo Policial Gral. José Artigas de San José saluda atentamente,
                        </p>
                        <p style="margin: 0; font-size: 15px; font-weight: bold; color: #002B49;">
                            Sargento Martín CEDRÉS
                        </p>
                        <p style="margin: 2px 0 12px 0; font-size: 13px; color: #64748B; font-weight: 600;">
                            Pro Secretario
                        </p>
                        <p style="margin: 0 0 14px 0; font-size: 12px; color: #94A3B8;">
                            Sede Social: Calle Ituzaingó N° 441, San José de Mayo
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #94A3B8; border-top: 1px dashed #e2e8f0; padding-top: 10px; line-height: 1.4; text-align: center;">
                            🤖 Mensaje emitido de forma automática por el Sistema de Gestión del Círculo Policial San José.
                        </p>
                    </div>
                </div>
            `,
            attachments,
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
