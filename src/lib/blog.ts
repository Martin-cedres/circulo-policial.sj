
import { neon } from '@neondatabase/serverless';
import { put } from "@vercel/blob";


export interface Post {
    id: number;
    title: string;
    subtitle?: string;
    content: string;
    imageUrl?: string;
    image_url?: string; // Para compatibilidad con SQL snake_case
    author: string;
    createdAt?: string; // Para compatibilidad con Date
    created_at?: string;  // SQL snake_case devuelve string ISO en JSON
}

// Inicializar conexión a Neon
const getSql = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined in .env.local');
    }
    return neon(process.env.DATABASE_URL);
}

// --- Create ---
export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'created_at'>, imageFile?: File) {
    const sql = getSql();
    let finalImageUrl = '';

    if (imageFile) {
        // Subir imagen a Vercel Blob
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN, // Aseguramos que usa el token
        });
        finalImageUrl = blob.url;
    }

    try {
        // Crear tabla si no existe (útil para primera ejecución)
        await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author VARCHAR(255) DEFAULT 'Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        const result = await sql`INSERT INTO posts (title, subtitle, content, image_url, author) VALUES (${post.title}, ${post.subtitle || null}, ${post.content}, ${finalImageUrl || null}, ${post.author}) RETURNING id`;



        return result[0].id;
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
    }
}

// --- Read All ---
export async function getPosts(limit = 20) {
    const sql = getSql();
    try {
        // Aseguramos que la tabla exista
        await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author VARCHAR(255) DEFAULT 'Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT ${limit}`;

        // Mapear snake_case a camelCase para el frontend
        return rows.map(row => ({
            ...row,
            imageUrl: row.image_url,
            createdAt: row.created_at,
        })) as Post[];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

// --- Read One ---
export async function getPostById(id: string | number) {
    const sql = getSql();
    try {
        const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            ...row,
            imageUrl: row.image_url,
            createdAt: row.created_at,
        } as Post;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

// --- Delete ---
export async function deletePost(id: number) {
    const sql = getSql();
    try {
        await sql`DELETE FROM posts WHERE id = ${id}`;

    } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Failed to delete post');
    }
}
