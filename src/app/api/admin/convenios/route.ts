import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { put } from '@vercel/blob';
import { convenioSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const rows = await sql`
            SELECT * FROM convenios ORDER BY nombre ASC
        `;
        return NextResponse.json({ success: true, convenios: rows }, { status: 200 });
    } catch (error: any) {
        console.error('Error al obtener convenios en admin:', error);
        return NextResponse.json(
            { error: 'Error al obtener convenios', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const data = await request.formData();
        
        const nombre = data.get('nombre') as string;
        const categoria = data.get('categoria') as string;
        const beneficio = data.get('beneficio') as string;
        const descripcion = data.get('descripcion') as string || '';
        const sitio_web = data.get('sitio_web') as string || '';
        const whatsapp = data.get('whatsapp') as string || '';
        const instagram = data.get('instagram') as string || '';
        const telefono = data.get('telefono') as string || '';
        const direccion = data.get('direccion') as string || '';
        const destacado = data.get('destacado') === 'true';
        const visible = data.get('visible') === 'true';
        const logoFile = data.get('logo') as File | null;

        // Validar campos (coercionamos booleanos porque vienen como strings en formData)
        const parseResult = convenioSchema.safeParse({
            nombre,
            categoria,
            beneficio,
            descripcion,
            sitio_web,
            whatsapp,
            instagram,
            telefono,
            direccion,
            destacado,
            visible,
        });

        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', issues: parseResult.error.format() },
                { status: 400 }
            );
        }

        let logo_url = '';
        if (logoFile && logoFile.size > 0) {
            const blob = await put(logoFile.name, logoFile, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: true,
            });
            logo_url = blob.url;
        }

        const result = await sql`
            INSERT INTO convenios (
                nombre, categoria, beneficio, descripcion, logo_url, 
                sitio_web, whatsapp, instagram, telefono, direccion, 
                destacado, visible
            )
            VALUES (
                ${nombre}, ${categoria}, ${beneficio}, ${descripcion || null}, ${logo_url || null}, 
                ${sitio_web || null}, ${whatsapp || null}, ${instagram || null}, ${telefono || null}, ${direccion || null}, 
                ${destacado}, ${visible}
            )
            RETURNING id
        `;

        return NextResponse.json(
            { success: true, convenioId: result[0].id, message: 'Convenio creado con éxito' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error al crear convenio:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}
