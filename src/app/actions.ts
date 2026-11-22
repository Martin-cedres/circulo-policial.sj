
'use server';

import { createPost, deletePost, getPosts, updatePost } from '@/lib/blog';
import { revalidatePath } from 'next/cache';

export async function createPostAction(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const content = formData.get('content') as string;
        const author = formData.get('author') as string;
        const seoDescription = formData.get('seoDescription') as string;
        const seoKeywords = formData.get('seoKeywords') as string;
        const imageFile = formData.get('image') as File | null;
        const imageUrl = (formData.get('imageUrl') as string | null) || '';
        const isFeatured = formData.get('isFeatured') === 'true';
        const isNew = formData.get('isNew') === 'true';
        const category = formData.get('category') as string || 'Institucional';

        // URLs pre-subidas directamente a Blob desde el cliente (evita límite 413 de Vercel)
        const galleryUrlsJson = formData.get('galleryUrls') as string | null;
        const parsedGalleryUrls: string[] = galleryUrlsJson ? JSON.parse(galleryUrlsJson) : [];

        // Obtener todos los archivos de la galería (fallback para archivos pequeños)
        const galleryFiles = formData.getAll('gallery') as File[];
        // Filtrar archivos vacíos (a veces sucede con inputs vacíos)
        const validGalleryFiles = galleryFiles.filter(file => file instanceof File && file.size > 0);

        if (!title || !content) {
            throw new Error('Título y contenido son obligatorios');
        }

        await createPost({
            title,
            subtitle: subtitle || '',
            content,
            author: author || 'Admin',
            imageUrl,
            galleryUrls: Array.isArray(parsedGalleryUrls) ? parsedGalleryUrls : [],
            seoDescription,
            seoKeywords,
            isFeatured,
            isNew,
            category
        }, (imageFile && imageFile instanceof File && imageFile.size > 0) ? imageFile : undefined, validGalleryFiles);

        revalidatePath('/noticias', 'layout');
        revalidatePath('/admin/noticias');
        revalidatePath('/sitemap.xml');
        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        console.error('createPostAction Error:', error);
        return { success: false, error: error.message || 'Error desconocido al crear' };
    }
}

export async function updatePostAction(id: number, formData: FormData) {
    try {
        console.log(`Iniciando actualización de noticia ID: ${id}`);
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const content = formData.get('content') as string;
        const author = formData.get('author') as string;
        const seoDescription = formData.get('seoDescription') as string;
        const seoKeywords = formData.get('seoKeywords') as string;
        const imageFile = formData.get('image') as File | null;
        const newImageUrl = formData.get('imageUrl') as string | null;
        const currentImageUrl = formData.get('currentImageUrl') as string;
        const isFeatured = formData.get('isFeatured') === 'true';
        const isNew = formData.get('isNew') === 'true';
        const category = formData.get('category') as string || 'Institucional';

        console.log(`Recibida imagen principal: ${imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : (newImageUrl || 'Ninguna')}`);

        // Galería existente (la que el usuario decidió mantener) + nuevas URLs subidas en cliente
        const existingGalleryJson = formData.get('existingGallery') as string;
        const existingGallery: string[] = existingGalleryJson ? JSON.parse(existingGalleryJson) : [];
        const newGalleryUrlsJson = formData.get('newGalleryUrls') as string | null;
        const newGalleryUrls: string[] = newGalleryUrlsJson ? JSON.parse(newGalleryUrlsJson) : [];

        // Nuevos archivos para agregar a la galería (fallback)
        const newGalleryFiles = formData.getAll('newGallery').filter(item => item instanceof File) as File[];
        const validNewGalleryFiles = newGalleryFiles.filter(file => file.size > 0);

        console.log(`Nuevos archivos en galería: ${validNewGalleryFiles.length}, nuevas URLs: ${newGalleryUrls.length}`);

        await updatePost(id, {
            title,
            subtitle,
            content,
            author,
            imageUrl: newImageUrl || currentImageUrl,
            seoDescription,
            seoKeywords,
            isFeatured,
            isNew,
            category,
            galleryUrls: [
                ...(Array.isArray(existingGallery) ? existingGallery : []),
                ...(Array.isArray(newGalleryUrls) ? newGalleryUrls : []),
            ]
        }, (imageFile && imageFile instanceof File && imageFile.size > 0) ? imageFile : undefined, validNewGalleryFiles);


        revalidatePath('/noticias', 'layout');
        revalidatePath('/admin/noticias');
        revalidatePath('/sitemap.xml');
        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        console.error('updatePostAction Error:', error);
        return { success: false, error: error.message || 'Error desconocido al actualizar' };
    }
}

export async function deletePostAction(id: number) {
    await deletePost(id);
    revalidatePath('/noticias', 'layout');
    revalidatePath('/admin/noticias');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');
}

export async function getPostsAction(limit?: number) {
    return await getPosts(limit);
}
