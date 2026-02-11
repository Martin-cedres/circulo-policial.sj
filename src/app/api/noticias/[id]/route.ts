
import { getPostById } from '@/lib/blog';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const post = await getPostById(id);
        if (!post) {
            return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener noticia' }, { status: 500 });
    }
}
