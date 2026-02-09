import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validación básica
        const { nombre, apellido, cedula, email, telefono, situacion } = body;

        if (!nombre || !apellido || !cedula || !email || !telefono) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // TODO: Aquí deberías:
        // 1. Guardar en base de datos (ej: Supabase, MongoDB)
        // 2. Enviar email de notificación al admin
        // 3. Enviar email de confirmación al solicitante

        console.log('Nueva solicitud de socio:', body);

        // Por ahora, solo simulamos el éxito
        // En producción, implementa el guardado real

        return NextResponse.json(
            { message: 'Solicitud recibida correctamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
