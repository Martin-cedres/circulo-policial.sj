import { getSql } from './db';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

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

const getConveniosCached = unstable_cache(
    async (destacadosOnly: boolean): Promise<Convenio[]> => {
        try {
            const sql = getSql();
            if (destacadosOnly) {
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
    },
    ['convenios-list'],
    { revalidate: 86400, tags: ['convenios'] }
);

export const getConvenios = cache(async (options?: { destacadosOnly?: boolean }): Promise<Convenio[]> => {
    return getConveniosCached(Boolean(options?.destacadosOnly));
});
