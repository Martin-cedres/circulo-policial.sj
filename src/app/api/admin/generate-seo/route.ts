import { NextResponse } from 'next/server';
import { generateSEOData } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();

        if (!content || content.length < 50) {
            return NextResponse.json(
                { error: 'El contenido es demasiado corto para analizar.' },
                { status: 400 }
            );
        }

        const seoData = await generateSEOData(content);
        return NextResponse.json(seoData);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
