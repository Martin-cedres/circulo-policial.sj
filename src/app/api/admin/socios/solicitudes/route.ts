import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { sendEmail } from '@/lib/email';

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

        return NextResponse.json({ success: true, solicitudes: rows });
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

        if (action === 'rechazar') {
            await sql`
                DELETE FROM membership_requests WHERE id = ${id}
            `;
            return NextResponse.json({ success: true, message: 'Solicitud rechazada y eliminada del listado' });
        }

        if (action === 'aprobar') {
            const { cedula, digito_verificador } = parseCedula(req.cedula);
            const nombreCompleto = `${req.nombre} ${req.apellido}`.trim().toUpperCase();

            // Mapeo de método de pago y subcategoría
            const esHaberes = req.metodo_pago === 'haberes';
            const finalMetodoPago = esHaberes ? 'haberes' : 'externo';

            let finalSubcategoria = 'general';
            if (req.metodo_pago === 'transferencia') {
                finalSubcategoria = 'particular_transferencia';
            } else if (req.metodo_pago === 'cobrador') {
                finalSubcategoria = 'particular_domicilio';
            } else if (req.metodo_pago === 'alumno') {
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
                        telefono = COALESCE(${req.telefono || null}, telefono),
                        direccion = COALESCE(${req.direccion || null}, direccion),
                        localidad = COALESCE(${req.localidad || null}, localidad),
                        email = COALESCE(${req.email || null}, email),
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
                        ${req.telefono || null}, ${req.direccion || null}, ${req.localidad || 'San José de Mayo'}, ${req.email || null}, ${finalSubcategoria}
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

            // Marcar solicitud como aprobada
            await sql`
                UPDATE membership_requests 
                SET aprobado = TRUE 
                WHERE id = ${id}
            `;

            // Enviar email de bienvenida al socio recién aprobado
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://circulopolicialsj.com';
            const ciFormateada = `${parseInt(cedula, 10).toLocaleString('es-UY')}-${digito_verificador}`;

            let pagoInfoHtml = '';
            if (req.metodo_pago === 'transferencia') {
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
            } else if (req.metodo_pago === 'cobrador') {
                pagoInfoHtml = `
                    <div style="background: #f0fdf4; border-left: 4px solid #15803d; padding: 15px; margin: 20px 0; border-radius: 6px;">
                        <h4 style="margin: 0 0 10px 0; color: #15803d;">🛵 Cobro a Domicilio ($ 140)</h4>
                        <p style="margin: 0; color: #334155; line-height: 1.6;">
                            Has seleccionado la modalidad de cobro a domicilio. El cobrador institucional visitará mensualmente tu dirección registrada (<strong>${req.direccion || 'Domicilio provisto'}</strong>).
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
                await sendEmail({
                    to: req.email,
                    subject: '¡Bienvenido al Círculo Policial San José! - Solicitud de Socio Aprobada',
                    text: `¡Hola ${req.nombre}!\n\nTu solicitud de ingreso al Círculo Policial San José ha sido APROBADA formalmente. Tu carnet de socio (C.I. ${ciFormateada}) ya está en proceso de impresión física.\n\nComisión Directiva\nCírculo Policial San José`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; color: #1e293b; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 25px;">
                                <h1 style="color: #002B49; margin: 0; font-size: 24px;">Círculo Policial San José</h1>
                                <p style="color: #B8860B; font-weight: bold; margin: 5px 0 0 0; font-size: 14px;">"Gral. José Artigas" — Fundado en 1944</p>
                            </div>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                            
                            <h2 style="color: #002B49; font-size: 20px; margin-top: 0;">¡Hola ${req.nombre}!</h2>
                            <p style="font-size: 15px; line-height: 1.6;">
                                Nos complace informarte que la Comisión Directiva ha <strong>APROBADO</strong> tu solicitud de afiliación a nuestra institución. A partir de este momento eres socio formal del Círculo Policial San José.
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

                            <p style="font-size: 14px; line-height: 1.6;">
                                Ya podés disfrutar de todos los convenios comerciales, beneficios sociales y servicios de nuestra sede. Ante cualquier duda podés responder a este correo o visitarnos en nuestra sede social.
                            </p>

                            <br>
                            <p style="margin: 0; font-size: 14px;">Saludos cordiales,</p>
                            <p style="font-weight: bold; color: #002B49; margin: 4px 0 0 0; font-size: 15px;">
                                Comisión Directiva<br>Círculo Policial San José
                            </p>
                        </div>
                    `,
                });
            } catch (mailError) {
                console.error('Error enviando email de bienvenida:', mailError);
            }

            return NextResponse.json({
                success: true,
                socioId,
                message: `¡Socio ${nombreCompleto} aprobado con éxito! Se dio de alta en el padrón activo y su carnet quedó disponible para descargar e imprimir.`,
            });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error: any) {
        console.error('Error al procesar solicitud de socio:', error);
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}
