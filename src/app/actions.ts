
'use server';

import { createPost, deletePost } from '@/lib/blog';
import { revalidatePath } from 'next/cache';

export async function createPostAction(formData: FormData) {
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !content) {
        throw new Error('Missing required fields');
    }

    await createPost({
        title,
        subtitle,
        content,
        author
    }, imageFile || undefined);

    revalidatePath('/noticias');
    revalidatePath('/admin/noticias');
}

export async function deletePostAction(id: number) {
    await deletePost(id);
    revalidatePath('/admin/noticias');
}
