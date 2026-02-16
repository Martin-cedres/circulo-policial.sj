
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
    const isFeatured = formData.get('isFeatured') === 'true';
    const isNew = formData.get('isNew') === 'true';
    const category = formData.get('category') as string || 'Institucional';

    // Obtener todos los archivos de la galería
    const galleryFiles = formData.getAll('gallery') as File[];
    // Filtrar archivos vacíos (a veces sucede con inputs vacíos)
    const validGalleryFiles = galleryFiles.filter(file => file.size > 0);

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
            seoKeywords,
            isFeatured,
            isNew,
            category
        }, imageFile || undefined, validGalleryFiles);
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
    const isFeatured = formData.get('isFeatured') === 'true';
    const isNew = formData.get('isNew') === 'true';
    const category = formData.get('category') as string || 'Institucional';

    // Galería existente (la que el usuario decidió mantener)
    const existingGalleryJson = formData.get('existingGallery') as string;
    const existingGallery = existingGalleryJson ? JSON.parse(existingGalleryJson) : [];

    // Nuevos archivos para agregar a la galería
    const newGalleryFiles = formData.getAll('newGallery') as File[];
    const validNewGalleryFiles = newGalleryFiles.filter(file => file.size > 0);

    await updatePost(id, {
        title,
        subtitle,
        content,
        author,
        imageUrl: currentImageUrl,
        seoDescription,
        seoKeywords,
        isFeatured,
        isNew,
        category,
        galleryUrls: existingGallery
    }, (imageFile && imageFile.size > 0) ? imageFile : undefined, validNewGalleryFiles);

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
