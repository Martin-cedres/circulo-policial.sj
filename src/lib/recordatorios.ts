import { sendEmail } from '@/lib/email';
import {
    formatearListaMesesTexto,
    formatearPeriodoLargo,
    obtenerDetalleProximoAviso,
} from '@/lib/periodos';
import fs from 'fs';
import path from 'path';

export interface SocioRecordatorio {
    id: number;
    nombre: string;
    email: string;
    cedula: string;
    digito_verificador?: string | null;
}

export async function enviarRecordatorioCuota(socio: SocioRecordatorio) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://circulopolicialsj.com';
    const cleanCedula = socio.cedula.replace(/\D/g, '');
    const dv = socio.digito_verificador ? `-${socio.digito_verificador}` : '';
    const linkReporte = `${siteUrl}/reportar-pago?ci=${cleanCedula}`;

    const mesActual = new Date().toLocaleDateString('es-UY', { month: 'long', year: 'numeric' });
    const mesCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1);

    const subject = `Recordatorio de Cuota Social (${mesCapitalizado}) - Círculo Policial San José`;

    const text = `Estimado/a ${socio.nombre},\n\nLe recordamos el abono de la cuota social mensual ($ 140) correspondiente a ${mesCapitalizado}.\n\nDatos para transferencia bancaria BROU:\n- Banco: Banco República (BROU)\n- Cuenta: Caja de Ahorro en Pesos 001579728-00001 (0015579728)\n- Titular: CIRCULO POLICIAL GENERAL JOSE ARTIGAS\n- Monto: $ 140\n\nPuede adjuntar el comprobante de su transferencia directamente desde su celular en el siguiente enlace:\n${linkReporte}\n\nTe invitamos a visitar nuestra sección de noticias en ${siteUrl}/noticias para mantenerte informado sobre las actividades sociales, eventos y nuevos convenios del Círculo.\n\n(Este es un mensaje generado de forma automática por el Sistema de Gestión del Círculo Policial. Si ya abonaste tu cuota social o transferiste en las últimas horas, por favor desestimá este recordatorio).\n\nComisión Directiva\nCírculo Policial San José\nSede Social: Calle Ituzaingó N° 441, San José de Mayo`;

    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-email.png');
    const hasLogo = fs.existsSync(logoPath);
    const logoBuffer = hasLogo ? fs.readFileSync(logoPath) : null;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #002B49; padding: 25px 20px; text-align: center; color: #ffffff;">
                ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="95" height="95" style="display: block; margin: 0 auto 10px auto; max-width: 95px; height: auto;" />` : ''}
                <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; color: #ffffff;">Círculo Policial San José</h1>
                <p style="margin: 5px 0 0 0; color: #E2E8F0; font-size: 13px;">"Gral. José Artigas" — Fundado en 1944</p>
            </div>

            <div style="padding: 30px 25px;">
                <h2 style="color: #002B49; font-size: 18px; margin-top: 0;">Estimado/a ${socio.nombre},</h2>
                <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                    Nos comunicamos desde la Comisión Directiva para recordarle el pago de la <strong>cuota social mensual ($ 140)</strong> correspondiente a <strong>${mesCapitalizado}</strong>.
                </p>

                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <div style="font-weight: bold; color: #1E40AF; font-size: 16px; margin-bottom: 12px;">
                        🏛️ Datos Oficiales para Transferencia BROU:
                    </div>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse; color: #1e293b;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748B; width: 140px;">Banco:</td>
                            <td style="padding: 4px 0; font-weight: bold;">Banco República (BROU)</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748B;">Tipo de Cuenta:</td>
                            <td style="padding: 4px 0; font-weight: bold;">Caja de Ahorro en Pesos ($)</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748B;">Nº de Cuenta:</td>
                            <td style="padding: 4px 0; font-weight: bold; font-family: monospace; font-size: 16px; color: #002B49;">
                                001579728-00001
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748B;">Formato sin guion:</td>
                            <td style="padding: 4px 0; font-family: monospace;">0015579728</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748B;">Titular:</td>
                            <td style="padding: 4px 0; font-weight: bold;">CIRCULO POLICIAL GENERAL JOSE ARTIGAS</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0 0 0; color: #64748B;">Importe mensual:</td>
                            <td style="padding: 6px 0 0 0; font-weight: bold; font-size: 16px; color: #15803D;">$ 140 UYU</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin: 30px 0 25px 0;">
                    <a href="${linkReporte}" style="background-color: #002B49; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        📎 Adjuntar Comprobante de Transferencia
                    </a>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748B;">
                        (No requiere contraseñas. Abrís el enlace desde el celular y subís la captura de pantalla en 10 segundos).
                    </p>
                </div>

                <div style="background-color: #FEFCE8; border: 1px solid #FEF08A; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #854D0E; line-height: 1.5;">
                    ℹ️ <em>Este es un correo generado de forma automática por el Sistema de Gestión del Círculo Policial San José. Si ya abonaste tu cuota social o realizaste la transferencia en las últimas horas, por favor desestimá este recordatorio o adjuntanos tu comprobante para registrarlo contablemente.</em>
                </div>

                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-top: 15px; font-size: 13px; color: #64748B;">
                    <strong>Ficha de Socio:</strong> Cédula ${socio.cedula}${dv} • Modalidad: Transferencia Bancaria BROU ($140).
                </div>

                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px 20px; margin: 25px 0; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: bold; color: #002B49;">
                        📰 Mantenete al día con la vida del Círculo
                    </p>
                    <p style="margin: 0 0 14px 0; font-size: 13px; color: #475569; line-height: 1.5;">
                        Te invitamos a visitar nuestra <strong>sección de noticias</strong> para conocer los nuevos convenios comerciales, beneficios, talleres gratuitos y actividades de nuestra sede social.
                    </p>
                    <a href="${siteUrl}/noticias" style="display: inline-block; background-color: #002B49; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 10px 20px; border-radius: 6px;">
                        Ver Novedades y Actividades →
                    </a>
                </div>

                <div style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 13px; color: #64748B;">
                    <p style="margin: 0 0 5px 0;"><strong>Círculo Policial San José</strong></p>
                    <p style="margin: 0 0 5px 0;">Sede Social: Calle Ituzaingó N° 441, San José de Mayo</p>
                    <p style="margin: 0;">Email: sanjosecirculopolicial@gmail.com</p>
                </div>
            </div>
        </div>
    `;

    const attachments: any[] = [];
    if (logoBuffer) {
        attachments.push({
            filename: 'logo-circulo.png',
            content: logoBuffer,
            contentType: 'image/png',
            cid: 'logo-circulo',
        });
    }

    return sendEmail({
        to: socio.email,
        subject,
        text,
        html,
        attachments,
    });
}

export interface ParametrosConfirmacionAcreditacion {
    socio: {
        id: number;
        nombre: string;
        email: string;
        cedula: string;
        digito_verificador?: string | null;
    };
    cantidadMeses: number;
    periodoHasta: string;
    periodosLista: string[];
    periodosDetalle?: string;
    monto: number;
}

export async function enviarConfirmacionAcreditacionPago({
    socio,
    cantidadMeses,
    periodoHasta,
    periodosLista,
    monto,
}: ParametrosConfirmacionAcreditacion) {
    if (!socio.email || !socio.email.includes('@')) {
        return { success: false, reason: 'El socio no tiene email registrado' };
    }

    const dv = socio.digito_verificador ? `-${socio.digito_verificador}` : '';
    const mesesTexto = formatearListaMesesTexto(periodosLista);
    const avisoDetalle = obtenerDetalleProximoAviso(periodoHasta);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://circulopolicialsj.com';

    const subject = `Confirmación de Cuota Acreditada (${mesesTexto}) - Círculo Policial San José`;

    const text = `Estimado/a ${socio.nombre},\n\nLe confirmamos que su pago de cuota social ($ ${monto.toLocaleString('es-UY')}) correspondiente a ${mesesTexto} ha sido acreditado y registrado exitosamente en el sistema de gestión de socios del Círculo Policial.\n\nSu estado de cuenta se encuentra al día cubierto hasta ${formatearPeriodoLargo(periodoHasta)}.\n\nLe informamos que se le enviará un correo electrónico automático como recordatorio ${avisoDetalle.textoCompleto}.\n\n📰 Te invitamos a visitar nuestra sección de Noticias (${siteUrl}/noticias) para mantenerte informado sobre nuevos convenios, actividades y novedades del Círculo.\n\nMuchas gracias por su permanente apoyo y compromiso con nuestra institución.\n\nPor la Comisión Directiva del Círculo Policial Gral. José Artigas de San José saluda atentamente,\nSargento Martín CEDRÉS\nPro Secretario\n\nSede Social: Calle Ituzaingó N° 441, San José de Mayo\n\n---\nMensaje emitido de forma automática por el Sistema de Gestión de Socios del Círculo Policial San José.`;

    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-email.png');
    const hasLogo = fs.existsSync(logoPath);
    const logoBuffer = hasLogo ? fs.readFileSync(logoPath) : null;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #002B49; padding: 25px 20px; text-align: center; color: #ffffff;">
                ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="95" height="95" style="display: block; margin: 0 auto 10px auto; max-width: 95px; height: auto;" />` : ''}
                <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; color: #ffffff;">Círculo Policial San José</h1>
                <p style="margin: 5px 0 0 0; color: #E2E8F0; font-size: 13px;">"Gral. José Artigas" — Fundado en 1944</p>
            </div>

            <div style="padding: 30px 25px;">
                <div style="display: inline-block; background-color: #DCFCE7; color: #15803D; font-weight: bold; padding: 5px 12px; border-radius: 6px; font-size: 13px; margin-bottom: 15px;">
                    ✓ Pago Registrado y Acreditado
                </div>

                <h2 style="color: #002B49; font-size: 19px; margin-top: 0;">Estimado/a ${socio.nombre},</h2>
                <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                    Nos comunicamos formalmente para informarle que su pago de cuota social correspondiente a <strong>${mesesTexto}</strong> ha sido <strong>registrado y acreditado exitosamente</strong> en el sistema de gestión de socios del Círculo Policial.
                </p>

                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin: 20px 0;">
                    <div style="font-weight: bold; color: #002B49; font-size: 15px; margin-bottom: 10px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
                        📋 Detalle de la Acreditación:
                    </div>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse; color: #1e293b;">
                        <tr>
                            <td style="padding: 5px 0; color: #64748B; width: 155px;">Socio:</td>
                            <td style="padding: 5px 0; font-weight: bold;">${socio.nombre}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748B;">Cédula de Identidad:</td>
                            <td style="padding: 5px 0; font-family: monospace;">${socio.cedula}${dv}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748B;">Cuotas acreditadas:</td>
                            <td style="padding: 5px 0; font-weight: bold;">${cantidadMeses} ${cantidadMeses === 1 ? 'mes' : 'meses'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748B;">Períodos cubiertos:</td>
                            <td style="padding: 5px 0; font-weight: bold; color: #1E40AF;">${mesesTexto}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748B;">Importe abonado:</td>
                            <td style="padding: 5px 0; font-weight: bold; color: #15803D; font-size: 15px;">$ ${monto.toLocaleString('es-UY')} UYU</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #64748B;">Estado en padrón:</td>
                            <td style="padding: 5px 0;">
                                <span style="background-color: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                                    Al Día (Cubierto hasta ${formatearPeriodoLargo(periodoHasta)})
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="background-color: #EFF6FF; border-left: 4px solid #2563EB; border-radius: 6px; padding: 14px 16px; margin: 22px 0;">
                    <div style="font-weight: bold; color: #1E40AF; font-size: 14px; margin-bottom: 4px;">
                        🗓️ Próximo Recordatorio Automático:
                    </div>
                    <p style="margin: 0; font-size: 13.5px; color: #1E3A8A; line-height: 1.5;">
                        Le informamos que se le enviará un correo electrónico automático como recordatorio <strong>${avisoDetalle.textoCompleto}</strong>.
                    </p>
                </div>

                <!-- Bloque de Invitación a Noticias -->
                <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; padding: 14px 16px; margin: 24px 0 20px 0; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: bold; color: #002B49;">
                        📰 Te invitamos a visitar nuestra sección de Noticias
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 12.5px; color: #475569; line-height: 1.4;">
                        Mantenete informado sobre nuevos convenios, actividades, obras y novedades institucionales ingresando a nuestro sitio web oficial.
                    </p>
                    <a href="${siteUrl}/noticias" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #002B49; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: bold; padding: 7px 16px; border-radius: 6px;">
                        Ver Noticias del Círculo →
                    </a>
                </div>

                <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 25px;">
                    Muchas gracias por su permanente apoyo y compromiso con nuestra institución.
                </p>

                <div style="border-top: 1px solid #E2E8F0; padding-top: 18px;">
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
                    <p style="margin: 0; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px dashed #E2E8F0; padding-top: 10px; line-height: 1.4;">
                        🤖 Mensaje emitido de forma automática por el Sistema de Gestión de Socios del Círculo Policial San José.
                    </p>
                </div>
            </div>
        </div>
            </div>
        </div>
    `;

    const attachments: any[] = [];
    if (logoBuffer) {
        attachments.push({
            filename: 'logo-circulo.png',
            content: logoBuffer,
            contentType: 'image/png',
            cid: 'logo-circulo',
        });
    }

    return sendEmail({
        to: socio.email,
        subject,
        text,
        html,
        attachments,
    });
}
