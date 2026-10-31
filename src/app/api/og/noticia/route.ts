import { NextRequest } from 'next/server';
import { getPostByIdOrSlug } from '@/lib/blog';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const revalidate = 604800; // 7 days

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('slug');

    const defaultImagePath = path.join(process.cwd(), 'public', 'images', 'og-circulo-policial.jpg');

    if (!id) {
        if (fs.existsSync(defaultImagePath)) {
            const defaultBuf = fs.readFileSync(defaultImagePath);
            return new Response(new Uint8Array(defaultBuf), {
                status: 200,
                headers: {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': defaultBuf.length.toString(),
                    'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
                },
            });
        }
        return new Response('Image not found', { status: 404 });
    }

    try {
        const post = await getPostByIdOrSlug(id);

        if (!post || (!post.imageUrl && !post.image_url)) {
            // Sin imagen específica -> Servir imagen institucional por defecto
            if (fs.existsSync(defaultImagePath)) {
                const defaultBuf = fs.readFileSync(defaultImagePath);
                return new Response(new Uint8Array(defaultBuf), {
                    status: 200,
                    headers: {
                        'Content-Type': 'image/jpeg',
                        'Content-Length': defaultBuf.length.toString(),
                        'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
                    },
                });
            }
            return new Response('Post image not found', { status: 404 });
        }

        const rawImageUrl = post.imageUrl || post.image_url || '';
        let inputBuffer: Buffer;

        if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
            // Descargar desde Vercel Blob o URL externa
            const res = await fetch(rawImageUrl);
            if (!res.ok) {
                throw new Error(`Failed to fetch image: ${res.statusText}`);
            }
            inputBuffer = Buffer.from(await res.arrayBuffer());
        } else {
            // Imagen local en public/
            const cleanPath = rawImageUrl.startsWith('/') ? rawImageUrl.slice(1) : rawImageUrl;
            const localFile = path.join(process.cwd(), 'public', cleanPath);
            if (!fs.existsSync(localFile)) {
                throw new Error(`Local file not found: ${localFile}`);
            }
            inputBuffer = fs.readFileSync(localFile);
        }

        // Procesar con sharp:
        // 1. Escalar la imagen manteniendo proporción dentro de 1200x630
        // 2. Fondo institucional azul marino (#002B49) para evitar distorsiones o recortes bruscos
        // 3. Comprimir en JPEG progresivo (< 160 KB) para máxima compatibilidad con WhatsApp y Facebook
        const optimizedBuffer = await sharp(inputBuffer)
            .resize(1200, 630, {
                fit: 'contain',
                background: { r: 0, g: 43, b: 73, alpha: 1 }, // #002B49
            })
            .jpeg({
                quality: 84,
                mozjpeg: true,
                progressive: true,
            })
            .toBuffer();

        return new Response(new Uint8Array(optimizedBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': optimizedBuffer.length.toString(),
                'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error generating optimized OG image:', error);

        // Fallback seguro a la imagen institucional en caso de error
        if (fs.existsSync(defaultImagePath)) {
            const defaultBuf = fs.readFileSync(defaultImagePath);
            return new Response(new Uint8Array(defaultBuf), {
                status: 200,
                headers: {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': defaultBuf.length.toString(),
                    'Cache-Control': 'public, max-age=86400',
                },
            });
        }

        return new Response('Error generating image', { status: 500 });
    }
}
