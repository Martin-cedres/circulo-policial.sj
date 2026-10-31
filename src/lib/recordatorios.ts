import { sendEmail } from '@/lib/email';
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

    const text = `Estimado/a ${socio.nombre},\n\nLe recordamos el abono de la cuota social mensual ($ 140) correspondiente a ${mesCapitalizado}.\n\nDatos para transferencia bancaria BROU:\n- Banco: Banco República (BROU)\n- Cuenta: Caja de Ahorro en Pesos 001579728-00001 (0015579728)\n- Titular: CIRCULO POLICIAL GENERAL JOSE ARTIGAS\n- Monto: $ 140\n\nPuede adjuntar el comprobante de su transferencia directamente desde su celular en el siguiente enlace:\n${linkReporte}\n\nMuchas gracias por su permanente apoyo a nuestra institución.\n\nComisión Directiva\nCírculo Policial San José`;

    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo-email.png');
    const hasLogo = fs.existsSync(logoPath);
    const logoBuffer = hasLogo ? fs.readFileSync(logoPath) : null;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
            <div style="background-color: #002B49; padding: 25px 20px; text-align: center; color: #ffffff;">
                ${hasLogo ? `<img src="cid:logo-circulo" alt="Círculo Policial San José" width="85" height="85" style="display: block; margin: 0 auto 12px auto; border-radius: 50%; border: 3px solid #D4AF37; background-color: #ffffff;" />` : ''}
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

                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-top: 25px; font-size: 13px; color: #64748B;">
                    <strong>Ficha de Socio:</strong> Cédula ${socio.cedula}${dv} • Si ya realizaste la transferencia de este mes, podés omitir este recordatorio o adjuntarnos el comprobante para su registro contable.
                </div>

                <div style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 13px; color: #64748B;">
                    <p style="margin: 0 0 5px 0;"><strong>Círculo Policial San José</strong></p>
                    <p style="margin: 0 0 5px 0;">Sede Social: Ituzaingó N° 441, San José de Mayo</p>
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
