import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function parseCedula(input: string): { cedula: string; digito_verificador: string } {
    const raw = String(input || '').trim();
    if (raw.includes('-')) {
        const parts = raw.split('-');
        const ci = parts[0].replace(/\D/g, '');
        const dv = parts[1].replace(/\D/g, '').slice(0, 1);
        if (ci && dv) {
            return { cedula: ci, digito_verificador: dv };
        }
    }
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 8) {
        return {
            cedula: digits.slice(0, digits.length - 1),
            digito_verificador: digits.slice(-1),
        };
    }
    if (digits.length === 7) {
        const weights = [2, 9, 8, 7, 6, 3, 4];
        let sum = 0;
        for (let i = 0; i < 7; i++) {
            sum += parseInt(digits[i], 10) * weights[i];
        }
        const dv = ((10 - (sum % 10)) % 10).toString();
        return { cedula: digits, digito_verificador: dv };
    }
    return {
        cedula: digits || '0',
        digito_verificador: '0',
    };
}

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const filtro = searchParams.get('filtro') || 'pendientes'; // 'pendientes', 'aprobados', 'todos'

        // Asegurar que la tabla y columnas existen
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
                metodo_pago VARCHAR(50) DEFAULT 'transferencia',
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

        try {
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS localidad VARCHAR(100)`;
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'transferencia'`;
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS autoriza_descuento BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS pertenencia_presupuestal VARCHAR(255)`;
        } catch (e) {
            console.log('Columnas opcionales ya existentes:', e);
        }

        let rows;
        if (filtro === 'pendientes') {
            rows = await sql`
                SELECT * FROM membership_requests 
                WHERE aprobado = FALSE 
                ORDER BY created_at DESC
            `;
        } else if (filtro === 'aprobados') {
            rows = await sql`
                SELECT * FROM membership_requests 
                WHERE aprobado = TRUE 
                ORDER BY created_at DESC
            `;
        } else {
            rows = await sql`
                SELECT * FROM membership_requests 
                ORDER BY created_at DESC
            `;
        }

        // Cruzar con el padrón de socios para detectar si ya existen
        const cleanCedulas = rows.map(r => parseCedula(r.cedula).cedula).filter(Boolean);
        let existingMap = new Map();
        if (cleanCedulas.length > 0) {
            const existingSocios = await sql`
                SELECT id, cedula, digito_verificador, nombre, estado, metodo_pago, subcategoria 
                FROM socios 
                WHERE cedula = ANY(${cleanCedulas})
            `;
            for (const s of existingSocios) {
                existingMap.set(s.cedula, s);
            }
        }

        // Enriquecer cada solicitud
        const solicitudesEnriquecidas = rows.map(sol => {
            const parsed = parseCedula(sol.cedula);
            const socioExistente = existingMap.get(parsed.cedula) || null;

            // Inferencia inteligente de forma de pago si venía nulo o mal categorizado
            let metodoPagoFinal = sol.metodo_pago;
            if (!metodoPagoFinal || (metodoPagoFinal === 'haberes' && (sol.situacion === 'civil' || sol.situacion === 'retiro' || sol.situacion === 'policia_retirado'))) {
                if (sol.situacion === 'civil' || sol.situacion === 'retiro' || sol.situacion === 'policia_retirado') {
                    metodoPagoFinal = 'transferencia';
                } else {
                    metodoPagoFinal = 'haberes';
                }
            }

            return {
                ...sol,
                metodo_pago: metodoPagoFinal,
                socio_existente: socioExistente ? {
                    id: socioExistente.id,
                    nombre: socioExistente.nombre,
                    estado: socioExistente.estado,
                    metodo_pago: socioExistente.metodo_pago,
                    subcategoria: socioExistente.subcategoria,
                } : null,
            };
        });

        return NextResponse.json({ success: true, solicitudes: solicitudesEnriquecidas });
    } catch (error: any) {
        console.error('Error al obtener solicitudes de socios:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { id, action } = body;

        if (!id || !action) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos (id, action)' }, { status: 400 });
        }

        const requests = await sql`
            SELECT * FROM membership_requests WHERE id = ${id} LIMIT 1
        `;

        if (requests.length === 0) {
            return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
        }

        const req = requests[0];

        // 1. DESCARTAR / RECHAZAR SOLICITUD
        if (action === 'rechazar') {
            await sql`
                DELETE FROM membership_requests WHERE id = ${id}
            `;
            return NextResponse.json({ success: true, message: 'Solicitud descartada y eliminada del listado' });
        }

        // 2. ARCHIVAR SOLICITUD (para cuando ya estaba en el padrón y solo queremos sacarla de pendientes)
        if (action === 'archivar') {
            await sql`
                UPDATE membership_requests 
                SET aprobado = TRUE 
                WHERE id = ${id}
            `;
            return NextResponse.json({ 
                success: true, 
                message: `Solicitud de ${req.nombre} ${req.apellido} archivada como ya procesada sin alterar el padrón.` 
            });
        }

        // 3. APROBAR / CONFIGURAR Y APROBAR
        if (action === 'aprobar' || action === 'configurar_aprobar') {
            // Permitir que el admin envíe campos modificados desde el modal
            const nombreFinal = (body.nombre || req.nombre || '').trim();
            const apellidoFinal = (body.apellido || req.apellido || '').trim();
            const telefonoFinal = (body.telefono !== undefined ? body.telefono : req.telefono)?.toString().trim() || null;
            const emailFinal = (body.email !== undefined ? body.email : req.email)?.toString().trim() || null;
            const direccionFinal = (body.direccion !== undefined ? body.direccion : req.direccion)?.toString().trim() || null;
            const localidadFinal = (body.localidad !== undefined ? body.localidad : req.localidad)?.toString().trim() || 'San José de Mayo';
            const metodoPagoElegido = body.metodo_pago || req.metodo_pago || 'transferencia';
            const enviarEmail = body.enviarEmail !== false;

            const { cedula, digito_verificador } = parseCedula(body.cedula || req.cedula);
            const nombreCompleto = `${nombreFinal} ${apellidoFinal}`.trim().toUpperCase();

            // Mapeo preciso de método de pago y subcategoría
            const esHaberes = metodoPagoElegido === 'haberes';
            const finalMetodoPago = esHaberes ? 'haberes' : 'externo';

            let finalSubcategoria = 'general';
            if (metodoPagoElegido === 'transferencia') {
                finalSubcategoria = 'particular_transferencia';
            } else if (metodoPagoElegido === 'cobrador') {
                finalSubcategoria = 'particular_domicilio';
            } else if (metodoPagoElegido === 'alumno') {
                finalSubcategoria = 'escuela_policia';
            } else if (esHaberes) {
                finalSubcategoria = 'policia_activo';
            }

            // Insertar o actualizar en socios (siempre carnet_entregado = false)
            const existingSocio = await sql`
                SELECT id FROM socios WHERE cedula = ${cedula} LIMIT 1
            `;

            let socioId: number;

            if (existingSocio.length > 0) {
                socioId = existingSocio[0].id;
                await sql`
                    UPDATE socios 
                    SET 
                        nombre = ${nombreCompleto},
                        digito_verificador = ${digito_verificador},
                        metodo_pago = ${finalMetodoPago},
                        estado = 'activo',
                        carnet_entregado = FALSE,
                        motivo_baja = NULL,
                        fecha_baja = NULL,
                        telefono = COALESCE(${telefonoFinal}, telefono),
                        direccion = COALESCE(${direccionFinal}, direccion),
                        localidad = COALESCE(${localidadFinal}, localidad),
                        email = COALESCE(${emailFinal}, email),
                        subcategoria = ${finalSubcategoria}
                    WHERE id = ${socioId}
                `;
            } else {
                const insertResult = await sql`
                    INSERT INTO socios (
                        cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado,
                        telefono, direccion, localidad, email, subcategoria
                    )
                    VALUES (
                        ${cedula}, ${digito_verificador}, ${nombreCompleto}, ${finalMetodoPago}, 'activo', FALSE,
                        ${telefonoFinal}, ${direccionFinal}, ${localidadFinal}, ${emailFinal}, ${finalSubcategoria}
                    )
                    RETURNING id
                `;
                socioId = insertResult[0].id;
            }

            // Si es descuento por sueldo, enlazar con el último presupuesto mensual
            if (esHaberes) {
                const latestPres = await sql`
                    SELECT id FROM descuento_presupuestos ORDER BY anio DESC, mes DESC LIMIT 1
                `;
                if (latestPres.length > 0) {
                    await sql`
                        INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                        VALUES (${latestPres[0].id}, ${socioId}, 140.00)
                        ON CONFLICT (presupuesto_id, socio_id) DO NOTHING
                    `;
                }
            }

            // Actualizar datos de la solicitud en membership_requests y marcar como aprobada
            await sql`
                UPDATE membership_requests 
                SET 
                    nombre = ${nombreFinal},
                    apellido = ${apellidoFinal},
                    telefono = ${telefonoFinal || ''},
                    email = ${emailFinal || ''},
                    direccion = ${direccionFinal || ''},
                    localidad = ${localidadFinal},
                    metodo_pago = ${metodoPagoElegido},
                    aprobado = TRUE 
                WHERE id = ${id}
            `;

            // Enviar email de bienvenida al socio si enviarEmail === true y tiene email
            if (enviarEmail && emailFinal) {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://circulopolicialsj.com';
                const ciFormateada = `${parseInt(cedula, 10).toLocaleString('es-UY')}-${digito_verificador}`;

                let pagoInfoHtml = '';
                if (metodoPagoElegido === 'transferencia') {
                    pagoInfoHtml = `
                        <div style="background: #eef2ff; border-left: 4px solid #1e40af; padding: 15px; margin: 20px 0; border-radius: 6px;">
                            <h4 style="margin: 0 0 10px 0; color: #1e40af;">💳 Datos para Transferencia de Cuota Mensual ($ 140)</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6;">
                                <li><strong>Banco:</strong> Banco República (BROU)</li>
                                <li><strong>Tipo de cuenta:</strong> Caja de Ahorros en Pesos ($)</li>
                                <li><strong>Número de cuenta:</strong> 001579728-00001 (ó 0015579728)</li>
                                <li><strong>Titular:</strong> CIRCULO POLICIAL GENERAL JOSE ARTIGAS</li>
                                <li><strong>Importe de cuota:</strong> $ 140 mensuales</li>
                            </ul>
                            <p style="margin: 12px 0 0 0; font-size: 0.9em; color: #1e3a8a;">
                                Podés reportar tus transferencias de forma rápida desde tu celular en:<br>
                                <a href="${siteUrl}/reportar-pago?ci=${cedula}" style="color: #1d4ed8; font-weight: bold; text-decoration: underline;">
                                    ${siteUrl}/reportar-pago?ci=${cedula}
                                </a>
                            </p>
                        </div>
                    `;
                } else if (metodoPagoElegido === 'cobrador') {
                    pagoInfoHtml = `
                        <div style="background: #f0fdf4; border-left: 4px solid #15803d; padding: 15px; margin: 20px 0; border-radius: 6px;">
                            <h4 style="margin: 0 0 10px 0; color: #15803d;">🛵 Cobro a Domicilio ($ 140)</h4>
                            <p style="margin: 0; color: #334155; line-height: 1.6;">
                                Has seleccionado la modalidad de cobro a domicilio. El cobrador institucional visitará mensualmente tu dirección registrada (<strong>${direccionFinal || 'Domicilio provisto'}</strong>).
                            </p>
                        </div>
                    `;
                } else if (esHaberes) {
                    pagoInfoHtml = `
                        <div style="background: #f0fdf4; border-left: 4px solid #15803d; padding: 15px; margin: 20px 0; border-radius: 6px;">
                            <h4 style="margin: 0 0 10px 0; color: #15803d;">🏛️ Descuento por Sueldo ($ 140)</h4>
                            <p style="margin: 0; color: #334155; line-height: 1.6;">
                                La cuota social mensual de $ 140 se descontará automáticamente en tu liquidación mensual de haberes a través de la Jefatura de Policía de San José.
                            </p>
                        </div>
                    `;
                }

                try {
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

                    await sendEmail({
                        to: emailFinal,
                        subject: '¡Bienvenido al Círculo Policial San José! - Solicitud de Socio Aprobada',
                        text: `¡Hola ${nombreFinal}!\n\nNos complace informarte que la Comisión Directiva ha APROBADO tu solicitud de afiliación. A partir de este momento sos socio formal del Círculo Policial San José. Tu carnet de socio (C.I. ${ciFormateada}) ya está en preparación.\n\n📰 Te invitamos a visitar nuestra sección de Noticias (${siteUrl}/noticias) para conocer los convenios y beneficios vigentes.\n\nPor la Comisión Directiva del Círculo Policial Gral. José Artigas de San José saluda atentamente,\nSargento Martín CEDRÉS\nPro Secretario\n\nSede Social: Calle Ituzaingó N° 441, San José de Mayo\n\n---\n🤖 Mensaje emitido de forma automática por el Sistema de Gestión del Círculo Policial San José.`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; color: #1e293b; background-color: #ffffff;">
                                <div style="text-align: center; margin-bottom: 25px;">
                                    ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="95" height="95" style="display: block; margin: 0 auto 10px auto; max-width: 95px; height: auto;" />` : ''}
                                    <h1 style="color: #002B49; margin: 0; font-size: 24px;">Círculo Policial San José</h1>
                                    <p style="color: #B8860B; font-weight: bold; margin: 5px 0 0 0; font-size: 14px;">"Gral. José Artigas" — Fundado en 1944</p>
                                </div>
                                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                
                                <h2 style="color: #002B49; font-size: 20px; margin-top: 0;">¡Hola ${nombreFinal}!</h2>
                                <p style="font-size: 15px; line-height: 1.6;">
                                    Nos complace informarte que la Comisión Directiva ha <strong>APROBADO</strong> tu solicitud de afiliación. A partir de este momento sos socio formal del Círculo Policial San José.
                                </p>

                                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                    <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Socio:</strong> ${nombreCompleto}</p>
                                    <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Cédula de Identidad:</strong> ${ciFormateada}</p>
                                    <p style="margin: 0; font-size: 14px;"><strong>Estado:</strong> <span style="background: #dcfce7; color: #15803d; font-weight: bold; padding: 2px 8px; border-radius: 4px;">Activo</span></p>
                                </div>

                                ${pagoInfoHtml}

                                <div style="background: #fefce8; border: 1px solid #fef08a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; font-size: 14px; color: #854d0e; line-height: 1.5;">
                                        🪪 <strong>Carnet Institucional Físico:</strong><br>
                                        Tu credencial física se encuentra en proceso de impresión. Te avisaremos cuando esté disponible para entrega.
                                    </p>
                                </div>

                                <!-- Invitación a Noticias -->
                                <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 14px; margin: 24px 0 20px 0; text-align: center;">
                                    <p style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: bold; color: #002B49;">
                                        📰 Te invitamos a visitar nuestra sección de Noticias
                                    </p>
                                    <p style="margin: 0 0 10px 0; font-size: 12.5px; color: #475569; line-height: 1.4;">
                                        Mantenete informado sobre nuevos convenios, actividades, obras y beneficios para socios en nuestro sitio web oficial.
                                    </p>
                                    <a href="${siteUrl}/noticias" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #002B49; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: bold; padding: 7px 16px; border-radius: 6px;">
                                        Ver Noticias del Círculo →
                                    </a>
                                </div>

                                <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
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
                                    <p style="margin: 0; font-size: 11px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 10px; line-height: 1.4; text-align: center;">
                                        🤖 Mensaje emitido de forma automática por el Sistema de Gestión del Círculo Policial San José.
                                    </p>
                                </div>
                            </div>
                        `,
                        attachments,
                    });
                } catch (mailError) {
                    console.error('Error enviando email de bienvenida:', mailError);
                }
            }

            return NextResponse.json({
                success: true,
                socioId,
                message: `¡Socio ${nombreCompleto} aprobado y guardado en padrón activo! Modalidad: ${metodoPagoElegido}.`,
            });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error: any) {
        console.error('Error al procesar solicitud de socio:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
