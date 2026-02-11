
import { sql } from '@vercel/postgres';

export async function createPostsTable() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        author VARCHAR(255) DEFAULT 'Admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Tabla "posts" creada o verificada correctamente.');
    } catch (error) {
        console.error('Error al crear tabla:', error);
        throw error;
    }
}
