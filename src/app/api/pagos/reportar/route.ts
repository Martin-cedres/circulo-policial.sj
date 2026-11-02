import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { calcularCoberturaPago } from '@/lib/periodos';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const formData = await request.formData();
        const cedulaRaw = formData.get('cedula')?.toString() || '';
        const cantidadMesesRaw = formData.get('cantidad_meses')?.toString() || '1';
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

        // Límite de 6MB para evitar problemas con Gmail SMTP
        if (file.size > 6 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'El archivo adjunto supera los 6MB. Por favor, subí una captura más liviana.' },
                { status: 400 }
            );
        }

        const cantidadMeses = Math.max(1, Math.min(24, parseInt(cantidadMesesRaw, 10) || 1));
        const montoTotal = cantidadMeses * 140;

        // Asegurar columna pagado_hasta en socios y columnas de períodos en pagos_transferencia
        await sql`
            ALTER TABLE socios ADD COLUMN IF NOT EXISTS pagado_hasta VARCHAR(7)
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS pagos_transferencia (
                id SERIAL PRIMARY KEY,
                cedula VARCHAR(50) NOT NULL,
                socio_id INTEGER,
                nombre VARCHAR(255),
                monto NUMERIC(10, 2) DEFAULT 140.00,
                cantidad_meses INTEGER DEFAULT 1,
                periodo_desde VARCHAR(7),
                periodo_hasta VARCHAR(7),
                periodos_detalle TEXT,
                archivo_nombre VARCHAR(255),
                archivo_tamano INTEGER,
                observaciones TEXT,
                estado VARCHAR(50) DEFAULT 'pendiente',
                confirmado_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS cantidad_meses INTEGER DEFAULT 1`;
        await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS periodo_desde VARCHAR(7)`;
        await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS periodo_hasta VARCHAR(7)`;
        await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS periodos_detalle TEXT`;
        await sql`ALTER TABLE pagos_transferencia ADD COLUMN IF NOT EXISTS confirmado_at TIMESTAMP WITH TIME ZONE`;

        // Buscar si existe en el padrón de socios
        const sociosEncontrados = await sql`
            SELECT id, nombre, email, telefono, pagado_hasta FROM socios 
            WHERE cedula = ${cleanCedula} 
               OR CONCAT(cedula, COALESCE(digito_verificador, '')) = ${cleanCedula}
               OR cedula = ${cleanCedula.slice(0, -1)}
            LIMIT 1
        `;

        const socio = sociosEncontrados.length > 0 ? sociosEncontrados[0] : null;
        const nombreSocio = socio?.nombre || 'Socio No Registrado en Padrón';
        const socioId = socio?.id || null;

        // Calcular períodos sugeridos a cubrir a partir de su último mes pagado
        const cobertura = calcularCoberturaPago(socio?.pagado_hasta, cantidadMeses);

        // Registrar en base de datos en estado 'pendiente' (esperando confirmación del Admin)
        await sql`
            INSERT INTO pagos_transferencia 
            (
                cedula, socio_id, nombre, monto, cantidad_meses,
                periodo_desde, periodo_hasta, periodos_detalle,
                archivo_nombre, archivo_tamano, observaciones, estado
            )
            VALUES 
            (
                ${cleanCedula}, 
                ${socioId}, 
                ${nombreSocio}, 
                ${montoTotal}, 
                ${cantidadMeses},
                ${cobertura.periodoDesde},
                ${cobertura.periodoHasta},
                ${cobertura.periodosDetalle},
                ${file.name || 'comprobante.jpg'}, 
                ${file.size}, 
                ${observaciones.trim() || null},
                'pendiente'
            )
        `;

        // Convertir archivo a Buffer para adjuntar en el correo
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const emailDestino = process.env.CONTACT_EMAIL || 'sanjosecirculopolicial@gmail.com';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://circulopolicialsj.com';
        const fechaActual = new Date().toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-email.png');
        const hasLogo = fs.existsSync(logoPath);
        const logoBuffer = hasLogo ? fs.readFileSync(logoPath) : null;

        const adminAttachments: any[] = [
            {
                filename: file.name || `transferencia-${cleanCedula}.jpg`,
                content: buffer,
                contentType: file.type || 'image/jpeg',
            },
        ];
        if (logoBuffer) {
            adminAttachments.push({
                filename: 'logo-circulo.png',
                content: logoBuffer,
                contentType: 'image/png',
                cid: 'logo-circulo',
            });
        }

        const etiquetaMeses = cantidadMeses === 1 ? '1 mes ($ 140)' : `${cantidadMeses} meses ($ ${montoTotal})`;

        // Enviar correo a la administración con el archivo adjunto
        await sendEmail({
            to: emailDestino,
            subject: `Comprobante BROU Pendiente (${etiquetaMeses}) - C.I. ${cleanCedula} - ${nombreSocio}`,
            text: `Se ha recibido un nuevo comprobante de pago por transferencia bancaria.\n\nSocio: ${nombreSocio}\nCédula: ${cleanCedula}\nCuotas declaradas: ${etiquetaMeses}\nPeríodos a cubrir: ${cobertura.periodosDetalle}\nFecha: ${fechaActual}\nObservaciones: ${observaciones || 'Ninguna'}\nArchivo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n\nPodés confirmar este pago en 1 clic ingresando a: ${siteUrl}/admin/pagos`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; color: #1e293b;">
                    <div style="border-bottom: 2px solid #002B49; padding-bottom: 12px; margin-bottom: 15px; text-align: center;">
                        ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="85" height="85" style="display: block; margin: 0 auto 10px auto; max-width: 85px; height: auto;" />` : ''}
                        <h2 style="color: #002B49; margin: 0;">Comprobante BROU Recibido (${etiquetaMeses})</h2>
                        <span style="color: #64748b; font-size: 13px;">Fecha de envío: ${fechaActual} • Estado: <strong>Pendiente de Confirmar</strong></span>
                    </div>

                    <p>Un socio ha reportado el pago de su cuota social por transferencia bancaria al BROU:</p>

                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 15px 0;">
                        <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                            <li><strong>Cédula de Identidad:</strong> ${cleanCedula}</li>
                            <li><strong>Nombre en padrón:</strong> ${nombreSocio}</li>
                            <li><strong>Cantidad de cuotas:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${cantidadMeses} ${cantidadMeses === 1 ? 'mes' : 'meses'}</span></li>
                            <li><strong>Períodos a cubrir:</strong> <strong>${cobertura.periodosDetalle}</strong></li>
                            <li><strong>Monto total reportado:</strong> <strong style="color: #15803d;">$ ${montoTotal} UYU</strong></li>
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

                    <div style="text-align: center; margin: 22px 0;">
                        <a href="${siteUrl}/admin/pagos" style="display: inline-block; background-color: #002B49; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
                            ✓ Ir al Panel de Pagos BROU para Confirmar
                        </a>
                    </div>

                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                        📎 El comprobante original se encuentra adjunto a este correo electrónico para su verificación contable.
                    </p>
                </div>
            `,
            attachments: adminAttachments,
        });

        // Si el socio tiene email registrado, enviar acuse de recibo
        if (socio?.email) {
            try {
                const ackAttachments: any[] = [];
                if (logoBuffer) {
                    ackAttachments.push({
                        filename: 'logo-circulo.png',
                        content: logoBuffer,
                        contentType: 'image/png',
                        cid: 'logo-circulo',
                    });
                }
                await sendEmail({
                    to: socio.email,
                    subject: 'Comprobante recibido - Círculo Policial San José',
                    text: `Hola ${socio.nombre},\n\nHemos recibido correctamente tu comprobante de transferencia bancaria por ${etiquetaMeses} (períodos: ${cobertura.periodosDetalle}).\n\nLa administración verificará y confirmará la acreditación en tu ficha de socio.\n\n📰 Te invitamos a visitar nuestra sección de Noticias (${siteUrl}/noticias) para mantenerte al día con las actividades y beneficios de la institución.\n\nMuchas gracias por mantenerte al día con tu cuota social.\n\nCírculo Policial San José\nSede Social: Calle Ituzaingó N° 441, San José de Mayo\n\n---\nEste es un mensaje generado automáticamente por el Sistema del Círculo Policial San José.`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 550px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 10px; color: #1e293b;">
                            <div style="text-align: center; margin-bottom: 18px;">
                                ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="85" height="85" style="display: block; margin: 0 auto 10px auto; max-width: 85px; height: auto;" />` : ''}
                                <h2 style="color: #002B49; margin: 0;">¡Comprobante Recibido!</h2>
                                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Círculo Policial San José</p>
                            </div>
                            <p>Hola <strong>${socio.nombre}</strong>,</p>
                            <p>Te confirmamos que hemos recibido tu comprobante de transferencia bancaria BROU con el siguiente detalle:</p>
                            <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 15px; border-radius: 8px; margin: 15px 0; font-size: 14px;">
                                <div><strong>Cuotas declaradas:</strong> ${cantidadMeses} ${cantidadMeses === 1 ? 'mes' : 'meses'} ($ ${montoTotal})</div>
                                <div style="margin-top: 4px;"><strong>Período asignado:</strong> ${cobertura.periodosDetalle}</div>
                                <div style="margin-top: 4px;"><strong>Estado:</strong> <span style="color: #b45309; font-weight: bold;">Pendiente de verificación administrativa</span></div>
                            </div>
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin: 20px 0;">
                                <p style="margin: 0; color: #15803d; font-size: 14px;">
                                    ✓ <strong>Muchas gracias</strong> por colaborar activamente y mantener tu cuota al día.
                                </p>
                            </div>

                            <!-- Invitación a Noticias -->
                            <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 14px; margin: 20px 0; text-align: center;">
                                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #002B49;">
                                    📰 Te invitamos a visitar nuestra sección de Noticias
                                </p>
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569; line-height: 1.4;">
                                    Enterate de los nuevos convenios, actividades sociales, obras y beneficios para socios.
                                </p>
                                <a href="${siteUrl}/noticias" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #002B49; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 6px;">
                                    Ver Noticias del Círculo →
                                </a>
                            </div>

                            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
                                <p style="font-size: 13px; color: #475569; margin: 0 0 8px 0;">
                                    <strong>Círculo Policial San José</strong><br>
                                    Sede Social: Calle Ituzaingó N° 441, San José de Mayo
                                </p>
                                <p style="font-size: 11px; color: #94a3b8; margin: 0; border-top: 1px dashed #e2e8f0; padding-top: 8px; line-height: 1.4;">
                                    🤖 Mensaje generado de forma automática por el Sistema de Gestión del Círculo Policial San José.
                                </p>
                            </div>
                        </div>
                    `,
                    attachments: ackAttachments,
                });
            } catch (ackError) {
                console.error('Error enviando acuse de recibo al socio:', ackError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Comprobante enviado y registrado como pendiente de confirmación',
            socioEncontrado: !!socio,
            nombreSocio,
            cantidadMeses,
            montoTotal,
            periodosDetalle: cobertura.periodosDetalle,
        });

    } catch (error: any) {
        console.error('Error al reportar pago por transferencia:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno al procesar el comprobante' },
            { status: 500 }
        );
    }
}
