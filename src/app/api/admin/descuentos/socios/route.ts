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
        const tanda = searchParams.get('tanda') || ''; // 'tanda_1', 'tanda_2' o vacío
        const subcategoria = searchParams.get('subcategoria') || ''; // 'escuela_policia', 'general', etc.

        let query = sql`
            SELECT 
                id,
                cedula,
                digito_verificador,
                nombre,
                metodo_pago,
                estado,
                carnet_entregado,
                telefono,
                direccion,
                localidad,
                email,
                subcategoria,
                tanda,
                motivo_baja,
                fecha_baja,
                created_at
            FROM socios 
            WHERE 1=1
        `;

        if (search) {
            const cleanSearch = `%${search.trim().toUpperCase()}%`;
            query = sql`
                SELECT 
                    id,
                    cedula,
                    digito_verificador,
                    nombre,
                    metodo_pago,
                    estado,
                    carnet_entregado,
                    telefono,
                    direccion,
                    localidad,
                    email,
                    subcategoria,
                    tanda,
                    motivo_baja,
                    fecha_baja,
                    created_at
                FROM socios 
                WHERE (UPPER(nombre) LIKE ${cleanSearch} OR cedula LIKE ${cleanSearch})
            `;
        }

        let rows = await query;

        // Filtrado adicional en memoria
        if (metodo) {
            if (metodo === 'transferencia') {
                rows = rows.filter(r => r.subcategoria === 'particular_transferencia' || r.subcategoria === 'transferencia');
            } else if (metodo === 'cobrador') {
                rows = rows.filter(r => r.subcategoria === 'particular_domicilio' || r.subcategoria === 'cobrador');
            } else if (metodo === 'alumno') {
                rows = rows.filter(r => r.subcategoria === 'escuela_policia' || !!r.tanda);
            } else if (metodo === 'externo') {
                rows = rows.filter(r => r.metodo_pago === 'externo');
            } else if (metodo === 'haberes') {
                rows = rows.filter(r => r.metodo_pago === 'haberes');
            } else {
                rows = rows.filter(r => r.metodo_pago === metodo);
            }
        }
        if (estado && estado !== 'todos') {
            rows = rows.filter(r => r.estado === estado);
        }
        if (carnetFilter === 'pendiente') {
            rows = rows.filter(r => !r.carnet_entregado);
        } else if (carnetFilter === 'entregado') {
            rows = rows.filter(r => !!r.carnet_entregado);
        }
        if (tanda) {
            if (tanda === 'general' || tanda === 'sin_tanda') {
                rows = rows.filter(r => !r.tanda || r.subcategoria === 'general');
            } else {
                rows = rows.filter(r => r.tanda === tanda);
            }
        }
        if (subcategoria) {
            if (subcategoria === 'general') {
                rows = rows.filter(r => !r.subcategoria || r.subcategoria === 'general');
            } else {
                rows = rows.filter(r => r.subcategoria === subcategoria);
            }
        }

        // Ordenar numéricamente por cédula
        rows.sort((a, b) => parseInt(a.cedula) - parseInt(b.cedula));

        // Obtener totales globales sin filtrar para mantener sincronizados los contadores
        const [activosRes, bajasRes, totalRes] = await Promise.all([
            sql`SELECT count(*) FROM socios WHERE estado = 'activo'`,
            sql`SELECT count(*) FROM socios WHERE estado = 'baja'`,
            sql`SELECT count(*) FROM socios`
        ]);

        return NextResponse.json({ 
            success: true, 
            socios: rows,
            totalActivos: Number(activosRes[0]?.count || 0),
            totalBajas: Number(bajasRes[0]?.count || 0),
            totalGlobal: Number(totalRes[0]?.count || 0)
        }, { status: 200 });
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
        const { 
            cedula, digito_verificador, nombre, metodo_pago, presupuestoId, importe,
            telefono, direccion, localidad, email, subcategoria, tanda 
        } = body;

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
                SET 
                    nombre = ${cleanNombre}, 
                    digito_verificador = ${cleanDV}, 
                    metodo_pago = ${finalMetodo}, 
                    estado = 'activo', 
                    carnet_entregado = FALSE,
                    motivo_baja = NULL,
                    fecha_baja = NULL,
                    telefono = COALESCE(${telefono !== undefined ? (telefono ? String(telefono).trim() : null) : null}, telefono),
                    direccion = COALESCE(${direccion !== undefined ? (direccion ? String(direccion).trim() : null) : null}, direccion),
                    localidad = COALESCE(${localidad !== undefined ? (localidad ? String(localidad).trim() : null) : null}, localidad),
                    email = COALESCE(${email !== undefined ? (email ? String(email).trim() : null) : null}, email),
                    subcategoria = COALESCE(${subcategoria !== undefined ? (subcategoria ? String(subcategoria).trim() : null) : null}, subcategoria),
                    tanda = COALESCE(${tanda !== undefined ? (tanda ? String(tanda).trim() : null) : null}, tanda)
                WHERE id = ${socioId}
            `;
        } else {
            const result = await sql`
                INSERT INTO socios (
                    cedula, digito_verificador, nombre, metodo_pago, estado, carnet_entregado,
                    telefono, direccion, localidad, email, subcategoria, tanda
                )
                VALUES (
                    ${cleanCedula}, ${cleanDV}, ${cleanNombre}, ${finalMetodo}, 'activo', FALSE,
                    ${telefono ? String(telefono).trim() : null},
                    ${direccion ? String(direccion).trim() : null},
                    ${localidad ? String(localidad).trim() : null},
                    ${email ? String(email).trim() : null},
                    ${subcategoria ? String(subcategoria).trim() : 'general'},
                    ${tanda ? String(tanda).trim() : null}
                )
                RETURNING id
            `;
            socioId = result[0].id;
        }

        // 2. Vincular al presupuesto si se proporciona o al presupuesto activo más reciente si es por haberes
        if (presupuestoId) {
            const finalImporte = Number(importe) || 140.00;
            await sql`
                INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                VALUES (${presupuestoId}, ${socioId}, ${finalImporte})
                ON CONFLICT (presupuesto_id, socio_id)
                DO UPDATE SET importe = ${finalImporte}
            `;
        } else if (finalMetodo === 'haberes') {
            const latestPres = await sql`
                SELECT id FROM descuento_presupuestos ORDER BY anio DESC, mes DESC LIMIT 1
            `;
            if (latestPres.length > 0) {
                await sql`
                    INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                    VALUES (${latestPres[0].id}, ${socioId}, 140.00)
                    ON CONFLICT (presupuesto_id, socio_id) DO NOTHING
                `;
            }
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
        const { 
            socioId, nombre, digito_verificador, metodo_pago, estado, carnet_entregado, 
            presupuestoId, importe, telefono, direccion, localidad, email, subcategoria, tanda,
            motivo_baja, fecha_baja
        } = body;

        if (!socioId) {
            return NextResponse.json({ error: 'Socio ID es requerido' }, { status: 400 });
        }

        // 1. Actualizar datos maestros del socio (manejando transiciones de estado, carné y campos opcionales)
        if (estado === 'activo') {
            await sql`
                UPDATE socios
                SET 
                    nombre = COALESCE(${nombre ? String(nombre).trim().toUpperCase() : null}, nombre),
                    digito_verificador = COALESCE(${digito_verificador ? String(digito_verificador).trim() : null}, digito_verificador),
                    metodo_pago = COALESCE(${metodo_pago}, metodo_pago),
                    estado = 'activo',
                    motivo_baja = NULL,
                    fecha_baja = NULL,
                    carnet_entregado = COALESCE(${carnet_entregado !== undefined ? Boolean(carnet_entregado) : null}, carnet_entregado),
                    telefono = COALESCE(${telefono !== undefined ? (telefono ? String(telefono).trim() : null) : null}, telefono),
                    direccion = COALESCE(${direccion !== undefined ? (direccion ? String(direccion).trim() : null) : null}, direccion),
                    localidad = COALESCE(${localidad !== undefined ? (localidad ? String(localidad).trim() : null) : null}, localidad),
                    email = COALESCE(${email !== undefined ? (email ? String(email).trim() : null) : null}, email),
                    subcategoria = COALESCE(${subcategoria !== undefined ? (subcategoria ? String(subcategoria).trim() : null) : null}, subcategoria),
                    tanda = COALESCE(${tanda !== undefined ? (tanda ? String(tanda).trim() : null) : null}, tanda)
                WHERE id = ${socioId}
            `;
        } else if (estado === 'baja') {
            const cleanMotivo = motivo_baja ? String(motivo_baja).trim() : null;
            await sql`
                UPDATE socios
                SET 
                    nombre = COALESCE(${nombre ? String(nombre).trim().toUpperCase() : null}, nombre),
                    digito_verificador = COALESCE(${digito_verificador ? String(digito_verificador).trim() : null}, digito_verificador),
                    metodo_pago = COALESCE(${metodo_pago}, metodo_pago),
                    estado = 'baja',
                    motivo_baja = COALESCE(${cleanMotivo}, motivo_baja, 'Baja solicitada'),
                    fecha_baja = COALESCE(fecha_baja, CURRENT_TIMESTAMP),
                    carnet_entregado = COALESCE(${carnet_entregado !== undefined ? Boolean(carnet_entregado) : null}, carnet_entregado),
                    telefono = COALESCE(${telefono !== undefined ? (telefono ? String(telefono).trim() : null) : null}, telefono),
                    direccion = COALESCE(${direccion !== undefined ? (direccion ? String(direccion).trim() : null) : null}, direccion),
                    localidad = COALESCE(${localidad !== undefined ? (localidad ? String(localidad).trim() : null) : null}, localidad),
                    email = COALESCE(${email !== undefined ? (email ? String(email).trim() : null) : null}, email),
                    subcategoria = COALESCE(${subcategoria !== undefined ? (subcategoria ? String(subcategoria).trim() : null) : null}, subcategoria),
                    tanda = COALESCE(${tanda !== undefined ? (tanda ? String(tanda).trim() : null) : null}, tanda)
                WHERE id = ${socioId}
            `;
        } else {
            const cleanMotivo = motivo_baja !== undefined ? (motivo_baja ? String(motivo_baja).trim() : null) : null;
            await sql`
                UPDATE socios
                SET 
                    nombre = COALESCE(${nombre ? String(nombre).trim().toUpperCase() : null}, nombre),
                    digito_verificador = COALESCE(${digito_verificador ? String(digito_verificador).trim() : null}, digito_verificador),
                    metodo_pago = COALESCE(${metodo_pago}, metodo_pago),
                    estado = COALESCE(${estado}, estado),
                    motivo_baja = COALESCE(${cleanMotivo}, motivo_baja),
                    carnet_entregado = COALESCE(${carnet_entregado !== undefined ? Boolean(carnet_entregado) : null}, carnet_entregado),
                    telefono = COALESCE(${telefono !== undefined ? (telefono ? String(telefono).trim() : null) : null}, telefono),
                    direccion = COALESCE(${direccion !== undefined ? (direccion ? String(direccion).trim() : null) : null}, direccion),
                    localidad = COALESCE(${localidad !== undefined ? (localidad ? String(localidad).trim() : null) : null}, localidad),
                    email = COALESCE(${email !== undefined ? (email ? String(email).trim() : null) : null}, email),
                    subcategoria = COALESCE(${subcategoria !== undefined ? (subcategoria ? String(subcategoria).trim() : null) : null}, subcategoria),
                    tanda = COALESCE(${tanda !== undefined ? (tanda ? String(tanda).trim() : null) : null}, tanda)
                WHERE id = ${socioId}
            `;
        }

        // 2. Si se proporciona presupuestoId e importe, actualizar importe en el detalle
        if (presupuestoId && importe !== undefined) {
            const finalImporte = Number(importe);
            await sql`
                UPDATE descuento_presupuestos_detalle
                SET importe = ${finalImporte}
                WHERE presupuesto_id = ${presupuestoId} AND socio_id = ${socioId}
            `;
        }

        // 3. Si el socio pasó a externo o baja, retirarlo de presupuestos de Jefatura. Si pasó a haberes activo, vincularlo.
        if (metodo_pago === 'externo' || estado === 'baja') {
            await sql`
                DELETE FROM descuento_presupuestos_detalle WHERE socio_id = ${socioId}
            `;
        } else if (metodo_pago === 'haberes' || estado === 'activo') {
            const activePres = await sql`
                SELECT id FROM descuento_presupuestos ORDER BY anio DESC, mes DESC LIMIT 1
            `;
            if (activePres.length > 0) {
                await sql`
                    INSERT INTO descuento_presupuestos_detalle (presupuesto_id, socio_id, importe)
                    VALUES (${activePres[0].id}, ${socioId}, 140.00)
                    ON CONFLICT (presupuesto_id, socio_id) DO NOTHING
                `;
            }
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
        let socioId = searchParams.get('socioId');
        let presupuestoId = searchParams.get('presupuestoId'); // Opcional, para sacarlo del mes actual
        let motivoBaja = searchParams.get('motivo_baja') || searchParams.get('motivo') || '';

        // Si se envió un payload JSON en DELETE
        try {
            const contentType = request.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const body = await request.json();
                if (body) {
                    if (body.socioId) socioId = String(body.socioId);
                    if (body.presupuestoId) presupuestoId = String(body.presupuestoId);
                    if (body.motivo_baja || body.motivo) {
                        motivoBaja = body.motivo_baja || body.motivo;
                    }
                }
            }
        } catch (_) {
            // Ignorar error si el body está vacío o no es JSON válido
        }

        if (!socioId) {
            return NextResponse.json({ error: 'Socio ID es requerido' }, { status: 400 });
        }

        const idSocio = parseInt(socioId);
        const finalMotivo = motivoBaja ? String(motivoBaja).trim() : 'Baja solicitada';

        // 1. Si hay presupuestoId, eliminarlo del detalle de ese presupuesto inmediatamente
        if (presupuestoId) {
            const idPresupuesto = parseInt(presupuestoId);
            await sql`
                DELETE FROM descuento_presupuestos_detalle
                WHERE presupuesto_id = ${idPresupuesto} AND socio_id = ${idSocio}
            `;
            console.log(`Socio ID ${idSocio} eliminado del presupuesto ID ${idPresupuesto}`);
        }

        // 2. Marcar al socio como de 'baja' en el maestro de socios estableciendo motivo_baja y fecha_baja
        await sql`
            UPDATE socios
            SET 
                estado = 'baja',
                motivo_baja = ${finalMotivo},
                fecha_baja = CURRENT_TIMESTAMP
            WHERE id = ${idSocio}
        `;

        return NextResponse.json({ 
            success: true, 
            message: 'Socio dado de baja y excluido correctamente',
            socioId: idSocio,
            motivo_baja: finalMotivo
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al dar de baja socio:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
    }
}
