
'use server';

import { createPost, deletePost, getPosts, updatePost } from '@/lib/blog';
import { revalidatePath } from 'next/cache';

export async function createPostAction(formData: FormData) {
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const seoKeywords = formData.get('seoKeywords') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !content) {
        throw new Error('Título y contenido son obligatorios');
    }

    try {
        await createPost({
            title,
            subtitle: subtitle || '',
            content,
            author: author || 'Admin',
            seoDescription,
            seoKeywords
        }, imageFile || undefined);
    } catch (error: any) {
        console.error('Action Error:', error);
        throw new Error(error.message || 'Error al crear la noticia');
    }

    revalidatePath('/noticias');
    revalidatePath('/admin/noticias');
    revalidatePath('/');
}

export async function updatePostAction(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const seoKeywords = formData.get('seoKeywords') as string;
    const imageFile = formData.get('image') as File | null;
    const currentImageUrl = formData.get('currentImageUrl') as string;

    await updatePost(id, {
        title,
        subtitle,
        content,
        author,
        imageUrl: currentImageUrl,
        seoDescription,
        seoKeywords
    }, (imageFile && imageFile.size > 0) ? imageFile : undefined);

    revalidatePath('/noticias');
    revalidatePath(`/noticias/${id}`);
    revalidatePath('/admin/noticias');
    revalidatePath('/');
}

export async function deletePostAction(id: number) {
    await deletePost(id);
    revalidatePath('/noticias');
    revalidatePath('/admin/noticias');
    revalidatePath('/');
}

export async function getPostsAction(limit?: number) {
    return await getPosts(limit);
}
