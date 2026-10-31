import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const formData = await request.formData();
        const cedulaRaw = formData.get('cedula')?.toString() || '';
        const observaciones = formData.get('observaciones')?.toString() || '';
        const file = formData.get('comprobante') as File | null;

        const cleanCedula = cedulaRaw.replace(/\D/g, '');
        if (!cleanCedula || cleanCedula.length < 6) {
            return NextResponse.json(
                { error: 'Por favor, ingresá una cédula de identidad válida.' },
                { status: 400 }
            );
        }

        if (!file || file.size === 0) {
            return NextResponse.json(
                { error: 'Por favor, adjuntá la captura de pantalla o comprobante de la transferencia.' },
                { status: 400 }
            );
        }

        // Limite de 6MB para evitar problemas con Gmail SMTP
        if (file.size > 6 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'El archivo adjunto supera los 6MB. Por favor, subí una captura más liviana.' },
                { status: 400 }
            );
        }

        // Crear tabla de registro de comprobantes si no existe
        await sql`
            CREATE TABLE IF NOT EXISTS pagos_transferencia (
                id SERIAL PRIMARY KEY,
                cedula VARCHAR(50) NOT NULL,
                socio_id INTEGER,
                nombre VARCHAR(255),
                monto NUMERIC(10, 2) DEFAULT 140.00,
                archivo_nombre VARCHAR(255),
                archivo_tamano INTEGER,
                observaciones TEXT,
                estado VARCHAR(50) DEFAULT 'recibido',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Buscar si existe en el padrón de socios
        const sociosEncontrados = await sql`
            SELECT id, nombre, email, telefono FROM socios 
            WHERE cedula = ${cleanCedula} OR cedula = ${cleanCedula.slice(0, -1)}
            LIMIT 1
        `;

        const socio = sociosEncontrados.length > 0 ? sociosEncontrados[0] : null;
        const nombreSocio = socio?.nombre || 'Socio No Registrado en Padrón';
        const socioId = socio?.id || null;

        // Registrar en base de datos (solo metadatos ligeros, 0 bytes de blob storage)
        await sql`
            INSERT INTO pagos_transferencia 
            (cedula, socio_id, nombre, monto, archivo_nombre, archivo_tamano, observaciones)
            VALUES 
            (
                ${cleanCedula}, 
                ${socioId}, 
                ${nombreSocio}, 
                140.00, 
                ${file.name || 'comprobante.jpg'}, 
                ${file.size}, 
                ${observaciones.trim() || null}
            )
        `;

        // Convertir archivo a Buffer para adjuntar en el correo
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const emailDestino = process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com';
        const fechaActual = new Date().toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Enviar correo a la administración con el archivo adjunto
        await sendEmail({
            to: emailDestino,
            subject: `Comprobante de Pago BROU ($140) - C.I. ${cleanCedula} - ${nombreSocio}`,
            text: `Se ha recibido un nuevo comprobante de pago por transferencia bancaria.\n\nSocio: ${nombreSocio}\nCédula: ${cleanCedula}\nFecha: ${fechaActual}\nObservaciones: ${observaciones || 'Ninguna'}\nArchivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n\nEl comprobante va adjunto a este correo.`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; color: #1e293b;">
                    <div style="border-bottom: 2px solid #002B49; padding-bottom: 12px; margin-bottom: 15px;">
                        <h2 style="color: #002B49; margin: 0;">Comprobante de Pago Recibido ($140)</h2>
                        <span style="color: #64748b; font-size: 13px;">Fecha de envío: ${fechaActual}</span>
                    </div>

                    <p>Un socio ha reportado el pago de su cuota social por transferencia bancaria al BROU:</p>

                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                            <li><strong>Cédula de Identidad:</strong> ${cleanCedula}</li>
                            <li><strong>Nombre en padrón:</strong> ${nombreSocio}</li>
                            <li><strong>Monto reportado:</strong> $ 140 UYU</li>
                            ${socio?.telefono ? `<li><strong>Teléfono:</strong> ${socio.telefono}</li>` : ''}
                            ${socio?.email ? `<li><strong>Email:</strong> ${socio.email}</li>` : ''}
                            <li><strong>Archivo adjunto:</strong> ${file.name} (${(file.size / 1024).toFixed(1)} KB)</li>
                        </ul>
                    </div>

                    ${observaciones.trim() ? `
                        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0;">
                            <strong>Comentario del socio:</strong>
                            <p style="margin: 5px 0 0 0; color: #78350f;">${observaciones.trim()}</p>
                        </div>
                    ` : ''}

                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                        📎 El comprobante original se encuentra adjunto a este correo electrónico para su verificación contable.
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: file.name || `transferencia-${cleanCedula}.jpg`,
                    content: buffer,
                    contentType: file.type || 'image/jpeg',
                },
            ],
        });

        // Si el socio tiene email registrado, enviar acuse de recibo
        if (socio?.email) {
            try {
                await sendEmail({
                    to: socio.email,
                    subject: 'Comprobante recibido - Círculo Policial San José',
                    text: `Hola ${socio.nombre},\n\nHemos recibido correctamente tu comprobante de transferencia bancaria de la cuota social de $ 140.\n\nMuchas gracias por mantenerte al día con tu cuota social.\n\nCírculo Policial San José`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 550px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; color: #1e293b;">
                            <h2 style="color: #002B49; margin-top: 0;">¡Comprobante Recibido!</h2>
                            <p>Hola <strong>${socio.nombre}</strong>,</p>
                            <p>Te confirmamos que hemos recibido correctamente tu comprobante de pago de la cuota social ($ 140) por transferencia BROU.</p>
                            <p>La administración lo procesará y acreditará en tu estado de cuenta.</p>
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin: 20px 0;">
                                <p style="margin: 0; color: #15803d; font-size: 14px;">
                                    ✓ <strong>Muchas gracias</strong> por colaborar activamente y mantener tu cuota al día.
                                </p>
                            </div>
                            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                                Círculo Policial San José — Sede Social 25 de Mayo 436
                            </p>
                        </div>
                    `,
                });
            } catch (ackError) {
                console.error('Error enviando acuse de recibo al socio:', ackError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Comprobante enviado y recibido correctamente',
            socioEncontrado: !!socio,
            nombreSocio,
        });

    } catch (error: any) {
        console.error('Error al reportar pago por transferencia:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno al procesar el comprobante' },
            { status: 500 }
        );
    }
}
