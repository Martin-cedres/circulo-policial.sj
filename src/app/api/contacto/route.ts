import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validación básica
        const { nombre, email, mensaje } = body;

        if (!nombre || !email || !mensaje) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // TODO: Implementar envío de email
        // Ejemplo con nodemailer o servicio de email

        console.log('Nuevo mensaje de contacto:', body);

        return NextResponse.json(
            { message: 'Mensaje recibido correctamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error al procesar contacto:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
