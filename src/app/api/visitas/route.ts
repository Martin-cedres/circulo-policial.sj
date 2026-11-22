import { NextResponse } from 'next/server';

// Contador de visitas deshabilitado para evitar despertar el compute de Neon en cada sesión.
export async function POST() {
    return NextResponse.json({ success: true, disabled: true });
}
