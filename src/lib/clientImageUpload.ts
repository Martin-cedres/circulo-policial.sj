'use client';

import { upload } from '@vercel/blob/client';

const COMPRESSIBLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * Redimensiona y comprime imágenes pesadas en el navegador antes de subirlas a Blob,
 * evitando payloads gigantes y acelerando la carga pública de las noticias.
 */
async function compressImageIfNeeded(
    file: File,
    maxDimension = 1920,
    quality = 0.85
): Promise<File> {
    if (!COMPRESSIBLE_TYPES.has(file.type)) {
        return file;
    }

    // Si ya pesa menos de 350 KB, evitamos recomprimir innecesariamente
    if (file.size <= 350 * 1024) {
        return file;
    }

    try {
        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;

        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            imageBitmap.close();
            return file;
        }

        ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
        imageBitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/webp', quality)
        );

        if (!blob || blob.size >= file.size) {
            return file;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '');
        return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
    } catch {
        return file;
    }
}

/**
 * Sube una imagen directamente desde el navegador a Vercel Blob sin pasar
 * los bytes por la Serverless Function (evita el límite HTTP 413 de Vercel).
 */
export async function uploadImageToBlob(file: File): Promise<string> {
    const processedFile = await compressImageIfNeeded(file);
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin-token') || '' : '';

    const sanitizedName = processedFile.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-');

    const result = await upload(sanitizedName || 'imagen.webp', processedFile, {
        access: 'public',
        handleUploadUrl: '/api/admin/blob/upload',
        headers: {
            'x-admin-token': adminToken,
        },
    });

    return result.url;
}
