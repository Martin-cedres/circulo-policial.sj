import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

// Obtener socios generales
export async function GET(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const metodo = searchParams.get('metodo') || ''; // 'haberes', 'externo' o vacío (todos)
        const estado = searchParams.get('estado') || 'activo'; // 'activo', 'baja' o 'todos'
        const carnetFilter = searchParams.get('carnet') || ''; // 'pendiente', 'entregado' o vacío (todos)

        let query = sql`
            SELECT * FROM socios 
            WHERE 1=1
        `;

        if (search) {
            const cleanSearch = `%${search.trim().toUpperCase()}%`;
            query = sql`
                SELECT * FROM socios 
                WHERE (UPPER(nombre) LIKE ${cleanSearch} OR cedula LIKE ${cleanSearch})
            `;
        }

        let rows = await query;

        // Filtrado adicional en memoria
        if (metodo) {
            rows = rows.filter(r => r.metodo_pago === metodo);
        }
        if (estado && estado !== 'todos') {
            rows = rows.filter(r => r.estado === estado);
        }
        if (carnetFilter === 'pendiente') {
            rows = rows.filter(r => !r.carnet_entregado);
        } else if (carnetFilter === 'entregado') {
            rows = rows.filter(r => !!r.carnet_entregado);
        }

        // Ordenar numéricamente por cédula
        rows.sort((a, b) => parseInt(a.cedula) - parseInt(b.cedula));

        return NextResponse.json({ success: true, socios: rows }, { status: 200 });
    } catch (error: any) {
        console.error('Error al obtener socios:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}

// Crear nuevo socio y opcionalmente vincularlo a un presupuesto
export async function POST(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { cedula, digito_verificador, nombre, metodo_pago, presupuestoId, importe } = body;

        if (!cedula || !digito_verificador || !nombre) {
            return NextResponse.json({ error: 'Cédula, dígito verificador y nombre son requeridos' }, { status: 400 });
        }

        const cleanCedula = String(cedula).replace(/\D/g, '');
        const cleanNombre = String(nombre).trim().toUpperCase();
        const cleanDV = String(digito_verificador).trim();
        const finalMetodo = metodo_pago || 'haberes';

        // 1. Insertar o Reactivar en la tabla socios (siempre nace con carnet_entregado = false)
        const existing = await sql`
            SELECT id, estado FROM socios WHERE cedula = ${cleanCedula} LIMIT 1
        `;

        let socioId: number;

        if (existing.length > 0) {
            socioId = existing[0].id;
            await sql`
                UPDATE socios 
                SET nombre = ${cleanNombre}, digito_verificador = ${cleanDV}, metodo_pago = ${finalMetodo}, estado = 'activo', carnet_entregado = FALSE
                WHERE id = ${socioId}
            `;
        } else {
            const result = await sql`
                INSERT INTO socios (cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado)
                VALUES (${cleanCedula}, ${cleanDV}, ${cleanNombre}, ${finalMetodo}, 'activo', FALSE)
                RETURNING id
            `;
            socioId = result[0].id;
        }

        // 2. Vincular al presupuesto si se proporciona (mantiene flujo de haberes/jefatura)
        if (presupuestoId) {
            const finalImporte = Number(importe) || 140.00;
            await sql`
                INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                VALUES (${presupuestoId}, ${socioId}, ${finalImporte})
                ON CONFLICT (presupuesto_id, socio_id)
                DO UPDATE SET importe = ${finalImporte}
            `;
        }

        return NextResponse.json({ 
            success: true, 
            socioId, 
            message: 'Socio registrado con éxito',
            carnetRecordatorio: 'Recordá que este socio fue registrado con el Carné Físico PENDIENTE de entrega.'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error al registrar socio:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}

// Modificar socio o actualizar su importe / estado de carnet
export async function PUT(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const { socioId, nombre, digito_verificador, metodo_pago, estado, carnet_entregado, presupuestoId, importe } = body;

        if (!socioId) {
            return NextResponse.json({ error: 'Socio ID es requerido' }, { status: 400 });
        }

        // 1. Actualizar datos maestros del socio (incluyendo carnet_entregado si viene)
        await sql`
            UPDATE socios
            SET 
                nombre = COALESCE(${nombre ? String(nombre).trim().toUpperCase() : null}, nombre),
                digito_verificador = COALESCE(${digito_verificador ? String(digito_verificador).trim() : null}, digito_verificador),
                metodo_pago = COALESCE(${metodo_pago}, metodo_pago),
                estado = COALESCE(${estado}, estado),
                carnet_entregado = COALESCE(${carnet_entregado !== undefined ? Boolean(carnet_entregado) : null}, carnet_entregado)
            WHERE id = ${socioId}
        `;

        // 2. Si se proporciona presupuestoId e importe, actualizar importe en el detalle
        if (presupuestoId && importe !== undefined) {
            const finalImporte = Number(importe);
            await sql`
                UPDATE descuento_presupuestos_detalle
                SET importe = ${finalImporte}
                WHERE presupuesto_id = ${presupuestoId} AND socio_id = ${socioId}
            `;
        }

        return NextResponse.json({ success: true, message: 'Datos actualizados correctamente' }, { status: 200 });

    } catch (error: any) {
        console.error('Error al actualizar socio:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}

// Dar de baja a un socio
export async function DELETE(request: NextRequest) {
    const sql = getSql();
    try {
        const { searchParams } = new URL(request.url);
        const socioId = searchParams.get('socioId');
        const presupuestoId = searchParams.get('presupuestoId'); // Opcional, para sacarlo del mes actual

        if (!socioId) {
            return NextResponse.json({ error: 'Socio ID es requerido' }, { status: 400 });
        }

        const idSocio = parseInt(socioId);

        // 1. Si hay presupuestoId, eliminarlo del detalle de ese presupuesto inmediatamente
        if (presupuestoId) {
            const idPresupuesto = parseInt(presupuestoId);
            await sql`
                DELETE FROM descuento_presupuestos_detalle
                WHERE presupuesto_id = ${idPresupuesto} AND socio_id = ${idSocio}
            `;
            console.log(`Socio ID ${idSocio} eliminado del presupuesto ID ${idPresupuesto}`);
        }

        // 2. Marcar al socio como de 'baja' en el maestro de socios para que no se clone el mes siguiente
        await sql`
            UPDATE socios
            SET estado = 'baja'
            WHERE id = ${idSocio}
        `;

        return NextResponse.json({ success: true, message: 'Socio dado de baja y excluido correctamente' }, { status: 200 });

    } catch (error: any) {
        console.error('Error al dar de baja socio:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
