import { getSql } from './db';

export interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
    sitio_web: string | null;
    whatsapp: string | null;
    instagram: string | null;
    telefono: string | null;
    direccion: string | null;
    destacado?: boolean;
    visible?: boolean;
    latitud?: number | null;
    longitud?: number | null;
    created_at?: string;
}

export async function getConvenios(options?: { destacadosOnly?: boolean }): Promise<Convenio[]> {
    try {
        const sql = getSql();
        if (options?.destacadosOnly) {
            const rows = await sql`
                SELECT * FROM convenios 
                WHERE visible = true AND destacado = true 
                ORDER BY nombre ASC
            `;
            return rows as Convenio[];
        }

        const rows = await sql`
            SELECT * FROM convenios 
            WHERE visible = true 
            ORDER BY nombre ASC
        `;
        return rows as Convenio[];
    } catch (error) {
        console.error('Error fetching convenios from database:', error);
        return [];
    }
}
