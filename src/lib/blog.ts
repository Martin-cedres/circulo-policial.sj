
import { neon } from '@neondatabase/serverless';
import { put } from "@vercel/blob";


export interface Post {
    id: number;
    title: string;
    subtitle?: string;
    content: string;
    imageUrl?: string;
    image_url?: string;
    author: string;
    createdAt?: string;
    created_at?: string;
    seoDescription?: string;
    seo_description?: string;
    seoKeywords?: string;
    seo_keywords?: string;
    isFeatured?: boolean;
    is_featured?: boolean;
    isNew?: boolean;
    is_new?: boolean;
    category?: string;
    galleryUrls?: string[];
    gallery_urls?: string | string[]; // En DB es un JSON string o array
}

// Inicializar conexión a Neon
const getSql = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined in .env.local');
    }
    return neon(process.env.DATABASE_URL);
}

// --- Create ---
export async function createPost(
    post: Omit<Post, 'id' | 'createdAt' | 'created_at'>,
    imageFile?: File,
    galleryFiles?: File[]
) {
    const sql = getSql();
    let finalImageUrl = '';
    const uploadedGalleryUrls: string[] = [];

    // Subir imagen principal
    if (imageFile) {
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        });
        finalImageUrl = blob.url;
    }

    // Subir galería si existe
    if (galleryFiles && galleryFiles.length > 0) {
        for (const file of galleryFiles) {
            const blob = await put(file.name, file, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: true,
            });
            uploadedGalleryUrls.push(blob.url);
        }
    }

    try {
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
        is_featured BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'Institucional',
        gallery_urls TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Migraciones
        try {
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Institucional'`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS gallery_urls TEXT`;
        } catch (migError) {
            console.log('Error de migración ignorado:', migError);
        }

        const result = await sql`
            INSERT INTO posts (title, subtitle, content, image_url, author, seo_description, seo_keywords, is_featured, is_new, category, gallery_urls) 
            VALUES (
                ${post.title}, 
                ${post.subtitle || null}, 
                ${post.content}, 
                ${finalImageUrl || null}, 
                ${post.author}, 
                ${post.seoDescription || null}, 
                ${post.seoKeywords || null}, 
                ${post.isFeatured ? true : false}, 
                ${post.isNew ? true : false}, 
                ${post.category || 'Institucional'},
                ${JSON.stringify(uploadedGalleryUrls)}
            ) 
            RETURNING id`;

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
        is_featured BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'Institucional',
        gallery_urls TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        try {
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Institucional'`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS gallery_urls TEXT`;
        } catch (migError) {
            console.log('Error migración campos nuevos:', migError);
        }

        const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT ${limit}`;

        return rows.map(row => {
            let parsedGallery = [];
            try {
                parsedGallery = row.gallery_urls ? JSON.parse(row.gallery_urls) : [];
            } catch (e) {
                parsedGallery = [];
            }

            return {
                ...row,
                imageUrl: row.image_url,
                createdAt: row.created_at,
                seoDescription: row.seo_description,
                seoKeywords: row.seo_keywords,
                isFeatured: row.is_featured,
                isNew: row.is_new,
                category: row.category,
                galleryUrls: Array.isArray(parsedGallery) ? parsedGallery : [],
            };
        }) as Post[];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

// --- Read One ---
export async function getPostById(id: string | number) {
    const sql = getSql();
    try {
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
        is_featured BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'Institucional',
        gallery_urls TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        try {
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Institucional'`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS gallery_urls TEXT`;
        } catch (migError) {
            console.log('Error migración campos específicos:', migError);
        }

        const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;

        if (rows.length === 0) return null;

        const row = rows[0];

        let parsedGallery = [];
        try {
            parsedGallery = row.gallery_urls ? JSON.parse(row.gallery_urls) : [];
        } catch (e) {
            parsedGallery = [];
        }

        return {
            ...row,
            imageUrl: row.image_url,
            createdAt: row.created_at,
            seoDescription: row.seo_description,
            seoKeywords: row.seo_keywords,
            isFeatured: row.is_featured,
            isNew: row.is_new,
            category: row.category,
            galleryUrls: Array.isArray(parsedGallery) ? parsedGallery : [],
        } as Post;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

// --- Update ---
export async function updatePost(
    id: number,
    post: Partial<Omit<Post, 'id' | 'createdAt' | 'created_at'>>,
    imageFile?: File,
    newGalleryFiles?: File[]
) {
    const sql = getSql();
    let finalImageUrl = post.imageUrl || post.image_url || '';

    // Subir nueva imagen principal si se provee
    if (imageFile) {
        const blob = await put(imageFile.name, imageFile, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        });
        finalImageUrl = blob.url;
    }

    // Manejar galería
    let finalGalleryUrls = post.galleryUrls || [];

    // Subir nuevos archivos de galería si existen
    if (newGalleryFiles && newGalleryFiles.length > 0) {
        for (const file of newGalleryFiles) {
            const blob = await put(file.name, file, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: true,
            });
            finalGalleryUrls.push(blob.url);
        }
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
                seo_keywords = COALESCE(${post.seoKeywords}, seo_keywords),
                is_featured = COALESCE(${post.isFeatured !== undefined ? post.isFeatured : null}, is_featured),
                is_new = COALESCE(${post.isNew !== undefined ? post.isNew : null}, is_new),
                category = COALESCE(${post.category || null}, category),
                gallery_urls = ${JSON.stringify(finalGalleryUrls)}
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
