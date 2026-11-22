import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            token: process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async () => {
                const adminToken = request.headers.get('x-admin-token');
                const validUsername = process.env.ADMIN_USERNAME || 'admin';
                const decoded = adminToken ? Buffer.from(adminToken, 'base64').toString('utf8') : '';

                if (!adminToken || !decoded.startsWith(`${validUsername}:`)) {
                    throw new Error('No autorizado');
                }

                return {
                    allowedContentTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/gif',
                        'image/avif',
                    ],
                    addRandomSuffix: true,
                    maximumSizeInBytes: 25 * 1024 * 1024, // 25 MB
                };
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error: any) {
        const status = error?.message === 'No autorizado' ? 401 : 400;
        return NextResponse.json(
            { error: error?.message || 'Error al generar token de subida' },
            { status }
        );
    }
}
