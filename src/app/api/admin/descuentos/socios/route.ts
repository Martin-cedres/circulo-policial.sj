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

        const allRows = await sql`
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
        `;

        // Calcular totales globales en memoria a partir de la única consulta SQL
        let totalActivosCount = 0;
        let totalBajasCount = 0;
        let totalHaberes = 0;
        let totalTransferencia = 0;
        let totalDomicilio = 0;
        let totalAlumnosEdp = 0;
        let totalExternos = 0;

        for (const r of allRows) {
            if (r.estado === 'activo') {
                totalActivosCount++;
                if (r.metodo_pago === 'haberes') {
                    totalHaberes++;
                } else if (r.metodo_pago === 'externo') {
                    totalExternos++;
                    if (r.subcategoria === 'particular_transferencia' || r.subcategoria === 'transferencia') {
                        totalTransferencia++;
                    } else if (r.subcategoria === 'particular_domicilio' || r.subcategoria === 'cobrador') {
                        totalDomicilio++;
                    }
                }
                if (r.subcategoria === 'escuela_policia' || !!r.tanda) {
                    totalAlumnosEdp++;
                }
            } else if (r.estado === 'baja') {
                totalBajasCount++;
            }
        }

        const totalSinClasificar = Math.max(0, totalExternos - totalTransferencia - totalDomicilio - totalAlumnosEdp);

        let rows = allRows;
        if (search) {
            const cleanSearch = search.trim().toUpperCase();
            rows = rows.filter(r =>
                String(r.nombre || '').toUpperCase().includes(cleanSearch) ||
                String(r.cedula || '').includes(cleanSearch)
            );
        }

        // Filtrado adicional en memoria
        if (metodo) {
            if (metodo === 'transferencia') {
                rows = rows.filter(r => r.subcategoria === 'particular_transferencia' || r.subcategoria === 'transferencia');
            } else if (metodo === 'cobrador' || metodo === 'domicilio') {
                rows = rows.filter(r => r.subcategoria === 'particular_domicilio' || r.subcategoria === 'cobrador');
            } else if (metodo === 'alumno' || metodo === 'alumnos_edp') {
                rows = rows.filter(r => r.subcategoria === 'escuela_policia' || !!r.tanda);
            } else if (metodo === 'sin_clasificar') {
                rows = rows.filter(r => 
                    r.metodo_pago === 'externo' && 
                    r.subcategoria !== 'particular_transferencia' && 
                    r.subcategoria !== 'transferencia' && 
                    r.subcategoria !== 'particular_domicilio' && 
                    r.subcategoria !== 'cobrador' && 
                    r.subcategoria !== 'escuela_policia' && 
                    !r.tanda
                );
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

        return NextResponse.json({ 
            success: true, 
            socios: rows,
            totalActivos: totalActivosCount,
            totalBajas: totalBajasCount,
            totalGlobal: allRows.length,
            desglose: {
                haberes: totalHaberes,
                transferencia: totalTransferencia,
                domicilio: totalDomicilio,
                alumnosEdp: totalAlumnosEdp,
                sinClasificar: totalSinClasificar,
                externosTotal: totalExternos,
            }
        }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error al obtener socios:', error);
        const details = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: 'Error interno del servidor', details }, { status: 500 });
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

    } catch (error: unknown) {
        console.error('Error al registrar socio:', error);
        const details = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: 'Error interno del servidor', details }, { status: 500 });
    }
}

// Modificar socio o actualizar su importe / estado de carnet
export async function PUT(request: NextRequest) {
    const sql = getSql();
    try {
        const body = await request.json();
        const {
            socioId, cedula, nombre, digito_verificador, metodo_pago, estado, carnet_entregado,
            presupuestoId, importe, telefono, direccion, localidad, email, subcategoria, tanda,
            motivo_baja
        } = body;

        if (!socioId) {
            return NextResponse.json({ error: 'Socio ID es requerido' }, { status: 400 });
        }

        // 0. Leer registro actual para preservar solo campos no enviados y validar cambios
        const existingRows = await sql`
            SELECT
                id, cedula, digito_verificador, nombre, metodo_pago, estado,
                carnet_entregado, telefono, direccion, localidad, email,
                subcategoria, tanda, motivo_baja, fecha_baja
            FROM socios
            WHERE id = ${socioId}
            LIMIT 1
        `;

        if (existingRows.length === 0) {
            return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 });
        }

        const current = existingRows[0];

        // Validar y limpiar cédula si se envió
        let nextCedula: string = current.cedula;
        if (cedula !== undefined) {
            const cleanCedula = String(cedula).replace(/\D/g, '');
            if (!cleanCedula) {
                return NextResponse.json({ error: 'La cédula de identidad no puede quedar vacía' }, { status: 400 });
            }
            if (cleanCedula !== current.cedula) {
                const duplicate = await sql`
                    SELECT id, nombre FROM socios WHERE cedula = ${cleanCedula} AND id != ${socioId} LIMIT 1
                `;
                if (duplicate.length > 0) {
                    return NextResponse.json(
                        { error: `Ya existe otro socio con la cédula ${cleanCedula} (${duplicate[0].nombre}).` },
                        { status: 409 }
                    );
                }
            }
            nextCedula = cleanCedula;
        }

        const nextNombre = nombre !== undefined
            ? String(nombre).trim().toUpperCase()
            : current.nombre;

        if (!nextNombre) {
            return NextResponse.json({ error: 'El nombre completo no puede quedar vacío' }, { status: 400 });
        }

        const nextDV = digito_verificador !== undefined
            ? String(digito_verificador).trim()
            : current.digito_verificador;

        if (!nextDV) {
            return NextResponse.json({ error: 'El dígito verificador no puede quedar vacío' }, { status: 400 });
        }

        const nextMetodo = metodo_pago !== undefined ? metodo_pago : current.metodo_pago;
        const nextEstado = estado !== undefined ? estado : current.estado;
        const nextCarnet = carnet_entregado !== undefined ? Boolean(carnet_entregado) : current.carnet_entregado;

        // Campos opcionales: si vienen en el body, se permite tanto actualizar como vaciar (null)
        const nextTelefono = 'telefono' in body ? (telefono ? String(telefono).trim() : null) : current.telefono;
        const nextDireccion = 'direccion' in body ? (direccion ? String(direccion).trim() : null) : current.direccion;
        const nextLocalidad = 'localidad' in body ? (localidad ? String(localidad).trim() : null) : current.localidad;
        const nextEmail = 'email' in body ? (email ? String(email).trim() : null) : current.email;
        const nextSubcategoria = 'subcategoria' in body ? (subcategoria ? String(subcategoria).trim() : null) : current.subcategoria;
        const nextTanda = 'tanda' in body ? (tanda ? String(tanda).trim() : null) : current.tanda;

        // Manejo de motivo y fecha de baja según transición de estado
        let nextMotivoBaja = current.motivo_baja;
        let nextFechaBaja = current.fecha_baja;

        if (nextEstado === 'activo') {
            nextMotivoBaja = null;
            nextFechaBaja = null;
        } else if (nextEstado === 'baja') {
            if ('motivo_baja' in body) {
                nextMotivoBaja = motivo_baja ? String(motivo_baja).trim() : 'Baja solicitada';
            } else if (!nextMotivoBaja) {
                nextMotivoBaja = 'Baja solicitada';
            }
            if (!nextFechaBaja) {
                nextFechaBaja = new Date().toISOString();
            }
        } else if ('motivo_baja' in body) {
            nextMotivoBaja = motivo_baja ? String(motivo_baja).trim() : null;
        }

        // 1. Actualizar datos maestros del socio
        await sql`
            UPDATE socios
            SET
                cedula = ${nextCedula},
                digito_verificador = ${nextDV},
                nombre = ${nextNombre},
                metodo_pago = ${nextMetodo},
                estado = ${nextEstado},
                motivo_baja = ${nextMotivoBaja},
                fecha_baja = ${nextFechaBaja},
                carnet_entregado = ${nextCarnet},
                telefono = ${nextTelefono},
                direccion = ${nextDireccion},
                localidad = ${nextLocalidad},
                email = ${nextEmail},
                subcategoria = ${nextSubcategoria},
                tanda = ${nextTanda}
            WHERE id = ${socioId}
        `;

        // 1b. Si cambió la cédula, sincronizar historial de pagos por transferencia vinculados a este socio
        if (nextCedula !== current.cedula) {
            try {
                await sql`
                    UPDATE pagos_transferencia
                    SET cedula = ${nextCedula}
                    WHERE socio_id = ${socioId}
                `;
            } catch {
                // Ignorar si la tabla pagos_transferencia no existe aún
            }
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

        // 3. Sincronizar presupuestos de Jefatura según el estado/método resultante
        if (nextMetodo === 'externo' || nextEstado === 'baja') {
            await sql`
                DELETE FROM descuento_presupuestos_detalle WHERE socio_id = ${socioId}
            `;
        } else if (nextMetodo === 'haberes' && nextEstado === 'activo') {
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

    } catch (error: unknown) {
        console.error('Error al actualizar socio:', error);
        const details = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: 'Error interno del servidor', details }, { status: 500 });
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

        // 1. Eliminar al socio inmediatamente del detalle de presupuestos para que no se le descuente jamás
        await sql`
            DELETE FROM descuento_presupuestos_detalle
            WHERE socio_id = ${idSocio}
        `;

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

    } catch (error: unknown) {
        console.error('Error al dar de baja socio:', error);
        const details = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: 'Error interno del servidor', details }, { status: 500 });
    }
}
