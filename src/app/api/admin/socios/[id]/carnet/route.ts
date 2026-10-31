import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function formatCedula(ci: string, dv: string): string {
    const clean = ci.replace(/\D/g, '');
    const num = parseInt(clean, 10);
    if (isNaN(num)) return `${ci}-${dv}`;
    return `${num.toLocaleString('es-UY')}-${dv}`;
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const socioId = parseInt(id, 10);

    if (isNaN(socioId)) {
        return new NextResponse('ID de socio inválido', { status: 400 });
    }

    try {
        const sql = getSql();
        const rows = await sql`
            SELECT id, cedula, digito_verificador, nombre 
            FROM socios 
            WHERE id = ${socioId}
            LIMIT 1
        `;

        if (rows.length === 0) {
            return new NextResponse('Socio no encontrado', { status: 404 });
        }

        const socio = rows[0];
        const templatePath = path.join(process.cwd(), 'public', 'images', 'carnet-plantilla.jpg');

        if (!fs.existsSync(templatePath)) {
            return new NextResponse('Plantilla de carnet no encontrada', { status: 500 });
        }

        const nombre = escapeXml((socio.nombre || 'SOCIO').toUpperCase().trim());
        const cedulaFormateada = escapeXml(formatCedula(socio.cedula, socio.digito_verificador || ''));

        // Ajuste dinámico de tamaño de fuente para nombres largos
        const fontSizeNombre = nombre.length > 28 ? 24 : nombre.length > 22 ? 28 : 34;

        // Generar texto SVG superpuesto con tipografía idéntica a la original sin tapar firmas
        const textSvg = `
            <svg width="1024" height="657" xmlns="http://www.w3.org/2000/svg">
                <text x="72" y="314" font-family="Arial, Helvetica, sans-serif" font-size="${fontSizeNombre}" font-weight="900" fill="#000000" letter-spacing="0.5">
                    ${nombre}
                </text>
                <text x="72" y="425" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#000000" letter-spacing="0.5">
                    ${cedulaFormateada}
                </text>
            </svg>
        `;

        const carnetBuffer = await sharp(templatePath)
            .composite([
                { input: Buffer.from(textSvg), top: 0, left: 0 }
            ])
            .jpeg({ quality: 96, mozjpeg: true })
            .toBuffer();

        const cleanCedula = socio.cedula.replace(/\D/g, '');
        const filename = `carnet-${cleanCedula}.jpg`;

        return new Response(new Uint8Array(carnetBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': carnetBuffer.length.toString(),
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error: any) {
        console.error('Error generando carnet JPG:', error);
        return new NextResponse(`Error al generar carnet: ${error.message || 'Error desconocido'}`, { status: 500 });
    }
}
