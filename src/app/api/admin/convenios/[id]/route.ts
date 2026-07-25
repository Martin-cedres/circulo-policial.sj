import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { put } from '@vercel/blob';
import { convenioSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const sql = getSql();
    try {
        const { id } = await context.params;
        const convenioId = parseInt(id);

        if (isNaN(convenioId)) {
            return NextResponse.json({ error: 'ID de convenio inválido' }, { status: 400 });
        }

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
        const latitudRaw = data.get('latitud') as string || '';
        const longitudRaw = data.get('longitud') as string || '';
        const latitud = latitudRaw ? parseFloat(latitudRaw) : null;
        const longitud = longitudRaw ? parseFloat(longitudRaw) : null;
        
        // El logo puede ser un archivo nuevo (File) o un string de la URL anterior o vacío
        const logoFile = data.get('logo') as File | null;
        let logo_url = data.get('logo_url') as string || '';

        // Validar campos
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
            latitud,
            longitud,
        });

        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', issues: parseResult.error.format() },
                { status: 400 }
            );
        }

        // Si se subió un nuevo archivo, procesarlo con @vercel/blob
        if (logoFile && logoFile.size > 0) {
            const blob = await put(logoFile.name, logoFile, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: true,
            });
            logo_url = blob.url;
        }

        // Actualizar en BD
        const result = await sql`
            UPDATE convenios
            SET 
                nombre = ${nombre},
                categoria = ${categoria},
                beneficio = ${beneficio},
                descripcion = ${descripcion || null},
                logo_url = ${logo_url || null},
                sitio_web = ${sitio_web || null},
                whatsapp = ${whatsapp || null},
                instagram = ${instagram || null},
                telefono = ${telefono || null},
                direccion = ${direccion || null},
                destacado = ${destacado},
                visible = ${visible},
                latitud = ${latitud},
                longitud = ${longitud}
            WHERE id = ${convenioId}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Convenio no encontrado' }, { status: 404 });
        }

        revalidatePath('/convenios');
        revalidatePath('/');

        return NextResponse.json({ success: true, message: 'Convenio actualizado correctamente' }, { status: 200 });
    } catch (error: any) {
        console.error('Error al actualizar convenio:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const sql = getSql();
    try {
        const { id } = await context.params;
        const convenioId = parseInt(id);

        if (isNaN(convenioId)) {
            return NextResponse.json({ error: 'ID de convenio inválido' }, { status: 400 });
        }

        const result = await sql`
            DELETE FROM convenios
            WHERE id = ${convenioId}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Convenio no encontrado' }, { status: 404 });
        }

        revalidatePath('/convenios');
        revalidatePath('/');

        return NextResponse.json({ success: true, message: 'Convenio eliminado correctamente' }, { status: 200 });
    } catch (error: any) {
        console.error('Error al eliminar convenio:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}
