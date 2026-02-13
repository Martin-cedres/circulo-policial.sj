
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
    createdAt?: string;
    created_at?: string;
    seoDescription?: string;
    seo_description?: string;
    seoKeywords?: string;
    seo_keywords?: string;
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
        // Subir imagen a Vercel Blob con sufijo aleatorio para evitar colisiones
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
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
        seo_description TEXT,
        seo_keywords TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Migración: Asegurar que existan las columnas nuevas y tengan el tipo adecuado
        try {
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_description TEXT`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_keywords TEXT`;
            // Cambiar tipo si ya existía como VARCHAR(160)
            await sql`ALTER TABLE posts ALTER COLUMN seo_description TYPE TEXT`;
        } catch (migError) {
            console.log('Error de migración ignorado:', migError);
        }

        const result = await sql`INSERT INTO posts (title, subtitle, content, image_url, author, seo_description, seo_keywords) VALUES (${post.title}, ${post.subtitle || null}, ${post.content}, ${finalImageUrl || null}, ${post.author}, ${post.seoDescription || null}, ${post.seoKeywords || null}) RETURNING id`;



        return result[0].id;
    } catch (error: any) {
        console.error('Error creating post:', error);
        throw new Error(`Error en base de datos: ${error.message || 'Error desconocido'}`);
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
        seo_description VARCHAR(160),
        seo_keywords TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT ${limit}`;

        // Mapear snake_case a camelCase para el frontend
        return rows.map(row => ({
            ...row,
            imageUrl: row.image_url,
            createdAt: row.created_at,
            seoDescription: row.seo_description,
            seoKeywords: row.seo_keywords,
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
        // Aseguramos que la tabla exista
        await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author VARCHAR(255) DEFAULT 'Admin',
        seo_description VARCHAR(160),
        seo_keywords TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        console.log(`Buscando noticia con ID: ${id}`);
        const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;
        console.log(`Resultados encontrados: ${rows.length}`);

        if (rows.length === 0) {
            console.log("No se encontró ninguna noticia con ese ID.");
            return null;
        }

        const row = rows[0];
        return {
            ...row,
            imageUrl: row.image_url,
            createdAt: row.created_at,
            seoDescription: row.seo_description,
            seoKeywords: row.seo_keywords,
        } as Post;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

// --- Update ---
export async function updatePost(id: number, post: Partial<Omit<Post, 'id' | 'createdAt' | 'created_at'>>, imageFile?: File) {
    const sql = getSql();
    let finalImageUrl = post.imageUrl || post.image_url || '';

    if (imageFile) {
        // Subir nueva imagen a Vercel Blob con sufijo aleatorio
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        });
        finalImageUrl = blob.url;
    }

    try {
        await sql`
            UPDATE posts 
            SET 
                title = COALESCE(${post.title}, title), 
                subtitle = COALESCE(${post.subtitle}, subtitle), 
                content = COALESCE(${post.content}, content), 
                image_url = ${finalImageUrl || null}, 
                author = COALESCE(${post.author}, author),
                seo_description = COALESCE(${post.seoDescription}, seo_description),
                seo_keywords = COALESCE(${post.seoKeywords}, seo_keywords)
            WHERE id = ${id}
        `;
        return id;
    } catch (error) {
        console.error('Error updating post:', error);
        throw new Error('Failed to update post');
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
