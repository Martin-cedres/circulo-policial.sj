import { NextRequest, NextResponse } from 'next/server';

// NOTA: Esta es una autenticación BÁSICA solo para desarrollo
// En producción, usa NextAuth.js, JWT con secret en variables de entorno, etc.

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Credenciales hardcodeadas (CAMBIAR EN PRODUCCIÓN)
        // Usar variables de entorno: process.env.ADMIN_USERNAME
        const validUsername = process.env.ADMIN_USERNAME || 'admin';
        const validPassword = process.env.ADMIN_PASSWORD || 'circulopolicial2026';

        if (username === validUsername && password === validPassword) {
            // En producción, generar un JWT real
            const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

            return NextResponse.json({ token, success: true });
        } else {
            return NextResponse.json(
                { error: 'Credenciales incorrectas' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Error del servidor' },
            { status: 500 }
        );
    }
}
