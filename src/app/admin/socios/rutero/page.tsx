'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { artiguistaColors } from '@/styles/colors';

interface Socio {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: 'haberes' | 'externo';
    estado: 'activo' | 'baja';
    carnet_entregado?: boolean;
    telefono?: string | null;
    direccion?: string | null;
    localidad?: string | null;
    email?: string | null;
    subcategoria?: string | null;
    tanda?: 'tanda_1' | 'tanda_2' | null;
}

function RuteroCobranzaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Filtro por tanda ('todas', 'tanda_1', 'tanda_2', 'con_domicilio')
    const tandaParam = searchParams.get('tanda') || 'todas';
    const [tandaFilter, setTandaFilter] = useState<'todas' | 'tanda_1' | 'tanda_2' | 'con_domicilio'>(
        (tandaParam === 'tanda_1' || tandaParam === 'tanda_2' || tandaParam === 'con_domicilio') 
            ? tandaParam 
            : 'todas'
    );

    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaEmision, setFechaEmision] = useState('');
    
    // Estado interactivo local para cobrador móvil (persiste en la sesión de cobranza)
    const [cobrosLocales, setCobrosLocales] = useState<Record<number, { pagado: boolean; recibo: string }>>({});

    useEffect(() => {
        if (tandaParam === 'tanda_1' || tandaParam === 'tanda_2' || tandaParam === 'con_domicilio' || tandaParam === 'todas') {
            setTandaFilter(tandaParam);
        }
    }, [tandaParam]);

    useEffect(() => {
        setFechaEmision(new Date().toLocaleString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));
        fetchSocios();

        // Recuperar progreso de cobro si existe en almacenamiento local
        try {
            const saved = localStorage.getItem('rutero_cobranza_progreso');
            if (saved) {
                setCobrosLocales(JSON.parse(saved));
            }
        } catch {
            // Ignorar en caso de error en storage
        }
    }, []);

    const fetchSocios = async () => {
        setLoading(true);
        try {
            // Traemos los socios activos
            const res = await fetch('/api/admin/descuentos/socios?estado=activo');
            const data = await res.json();
            if (data.success) {
                setSocios(data.socios);
            }
        } catch (e) {
            console.error('Error al cargar socios para rutero:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarFiltro = (nuevoFiltro: 'todas' | 'tanda_1' | 'tanda_2' | 'con_domicilio') => {
        setTandaFilter(nuevoFiltro);
        router.replace(`/admin/socios/rutero?tanda=${nuevoFiltro}`);
    };

    const togglePagoLocal = (socioId: number) => {
        setCobrosLocales(prev => {
            const current = prev[socioId] || { pagado: false, recibo: '' };
            const updated = {
                ...prev,
                [socioId]: { ...current, pagado: !current.pagado }
            };
            try {
                localStorage.setItem('rutero_cobranza_progreso', JSON.stringify(updated));
            } catch {
                // Ignore storage error
            }
            return updated;
        });
    };

    const handleReciboChange = (socioId: number, recibo: string) => {
        setCobrosLocales(prev => {
            const current = prev[socioId] || { pagado: false, recibo: '' };
            const updated = {
                ...prev,
                [socioId]: { ...current, recibo }
            };
            try {
                localStorage.setItem('rutero_cobranza_progreso', JSON.stringify(updated));
            } catch {
                // Ignore storage error
            }
            return updated;
        });
    };

    const formatCedula = (ci: string, dv: string) => {
        const num = parseInt(ci);
        if (isNaN(num)) return `${ci}-${dv}`;
        return `${num.toLocaleString('es-UY')}-${dv}`;
    };

    // Filtrado enfocado prioritariamente en la Escuela de Policía y aspirantes con domicilio
    // Evita listar los 196 socios históricos generales que no tienen domicilio ni teléfono
    const sociosFiltrados = useMemo(() => {
        return socios.filter(s => {
            if (tandaFilter === 'tanda_1') {
                return s.tanda === 'tanda_1';
            }
            if (tandaFilter === 'tanda_2') {
                return s.tanda === 'tanda_2';
            }
            if (tandaFilter === 'con_domicilio') {
                return Boolean(s.direccion && s.direccion.trim().length > 0);
            }
            // 'todas': Alumnos de Escuela de Policía (Tanda 1 o 2) o cualquier socio con dirección registrada
            return (
                s.tanda === 'tanda_1' || 
                s.tanda === 'tanda_2' || 
                s.subcategoria === 'escuela_policia' ||
                Boolean(s.direccion && s.direccion.trim().length > 0)
            );
        });
    }, [socios, tandaFilter]);

    // Ordenar geográficamente para facilitar el recorrido del cobrador
    const sociosOrdenados = useMemo(() => {
        return [...sociosFiltrados].sort((a, b) => {
            // Agrupar por tanda
            const tA = a.tanda || 'tanda_9';
            const tB = b.tanda || 'tanda_9';
            if (tA !== tB) return tA.localeCompare(tB);

            // Luego por localidad
            const locA = (a.localidad || 'San José').toUpperCase();
            const locB = (b.localidad || 'San José').toUpperCase();
            if (locA !== locB) return locA.localeCompare(locB);

            // Luego por dirección o nombre
            const dirA = (a.direccion || a.nombre).toUpperCase();
            const dirB = (b.direccion || b.nombre).toUpperCase();
            return dirA.localeCompare(dirB);
        });
    }, [sociosFiltrados]);

    // Métricas
    const countTotal = sociosOrdenados.length;
    const countT1 = sociosOrdenados.filter(s => s.tanda === 'tanda_1').length;
    const countT2 = sociosOrdenados.filter(s => s.tanda === 'tanda_2').length;
    const countCobrados = sociosOrdenados.filter(s => cobrosLocales[s.id]?.pagado).length;

    return (
        <div className="bg-white min-vh-100 p-3 p-md-4 text-dark" style={{ maxWidth: '1050px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .mobile-route-card {
                        display: none !important;
                    }
                    .desktop-table-container {
                        display: block !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0.8cm;
                    }
                    .page-container {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 8pt !important;
                    }
                    th {
                        background-color: #002B49 !important;
                        color: white !important;
                        padding: 5px 6px !important;
                        font-size: 7.5pt !important;
                        text-transform: uppercase !important;
                        border: 1px solid #1e293b !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    td {
                        padding: 5px 6px !important;
                        border: 1px solid #cbd5e1 !important;
                        vertical-align: middle !important;
                        font-size: 8pt !important;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                    .badge-t1 {
                        background-color: #e0f2fe !important;
                        color: #0369a1 !important;
                        border: 1px solid #bae6fd !important;
                    }
                    .badge-t2 {
                        background-color: #f3e8ff !important;
                        color: #6b21a8 !important;
                        border: 1px solid #ddd6fe !important;
                    }
                    .badge-gen {
                        background-color: #f1f5f9 !important;
                        color: #475569 !important;
                        border: 1px solid #cbd5e1 !important;
                    }
                    .control-box {
                        border: 1px dashed #64748b !important;
                        padding: 4px !important;
                        min-height: 44px !important;
                        background-color: #fafafa !important;
                    }
                }

                .badge-custom {
                    display: inline-block;
                    padding: 2px 7px;
                    border-radius: 9999px;
                    font-size: 7.5pt;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .badge-t1 {
                    background-color: #e0f2fe;
                    color: #0369a1;
                    border: 1px solid #bae6fd;
                }
                .badge-t2 {
                    background-color: #f3e8ff;
                    color: #6b21a8;
                    border: 1px solid #ddd6fe;
                }
                .badge-gen {
                    background-color: #f1f5f9;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                }
                .control-box {
                    border: 1px dashed #94a3b8;
                    border-radius: 4px;
                    padding: 4px 6px;
                    font-size: 7.5pt;
                    background-color: #f8fafc;
                }
            `}</style>

            {/* BARRA SUPERIOR DE ACCIONES (NO IMPRIMIBLE) */}
            <div className="no-print mb-4 p-3 bg-light rounded-3 border shadow-sm">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/admin/socios" className="btn btn-outline-secondary btn-sm fw-semibold">
                            ← Volver a Socios
                        </Link>
                        <span className="badge bg-primary text-white d-none d-sm-inline-block">
                            Hoja de Ruta A4 / Móvil
                        </span>
                    </div>

                    {/* Selector de Tanda */}
                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${tandaFilter === 'todas' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarFiltro('todas')}
                        >
                            📋 Escuela Completa ({socios.filter(s => s.tanda === 'tanda_1' || s.tanda === 'tanda_2').length})
                        </button>
                        <button
                            type="button"
                            className={`btn ${tandaFilter === 'tanda_1' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarFiltro('tanda_1')}
                        >
                            🔹 Tanda 1 ({socios.filter(s => s.tanda === 'tanda_1').length})
                        </button>
                        <button
                            type="button"
                            className={`btn ${tandaFilter === 'tanda_2' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarFiltro('tanda_2')}
                        >
                            🟣 Tanda 2 ({socios.filter(s => s.tanda === 'tanda_2').length})
                        </button>
                        <button
                            type="button"
                            className={`btn ${tandaFilter === 'con_domicilio' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarFiltro('con_domicilio')}
                            title="Filtrar cualquier socio con dirección registrada"
                        >
                            📍 Con Dirección
                        </button>
                    </div>

                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-success btn-sm fw-bold shadow-sm d-flex align-items-center gap-1" 
                            onClick={() => window.print()}
                        >
                            🖨️ Imprimir Hoja A4
                        </button>
                    </div>
                </div>

                {/* Banner de progreso móvil */}
                <div className="mt-3 pt-2 border-top d-flex flex-wrap justify-content-between align-items-center text-muted small">
                    <div>
                        📱 <strong>Modo Cobrador Móvil:</strong> Podés tildar los aspirantes visitados directamente desde el celular.
                    </div>
                    <div>
                        Progreso actual: <strong>{countCobrados} de {countTotal}</strong> visitados ({countTotal > 0 ? Math.round((countCobrados / countTotal) * 100) : 0}%)
                    </div>
                </div>
            </div>

            {/* ENCABEZADO INSTITUCIONAL OFICIAL */}
            <div className="d-flex align-items-center border-bottom border-3 border-warning pb-3 mb-3">
                <div className="me-3 position-relative" style={{ width: '75px', height: '75px', flexShrink: 0 }}>
                    <Image
                        src="/logo-circulo-policial.png"
                        alt="Escudo Oficial Círculo Policial San José"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h1 className="m-0 fw-bold" style={{ color: artiguistaColors.azul, fontSize: '1.35rem', letterSpacing: '0.4px' }}>
                                CÍRCULO POLICIAL GENERAL JOSÉ ARTIGAS
                            </h1>
                            <h2 className="m-0 fw-bold mt-1" style={{ color: artiguistaColors.rojo, fontSize: '1.15rem' }}>
                                HOJA DE RUTA - COBRANZA A DOMICILIO
                            </h2>
                            <p className="m-0 text-muted small mt-1">
                                Listado de aspirantes de la Escuela de Policía para cobro domiciliario previo a presupuestación
                            </p>
                        </div>
                        <div className="text-end d-none d-sm-block">
                            <span className="badge bg-light text-dark border fw-semibold">
                                Formato Oficial A4
                            </span>
                            <div className="small text-muted mt-1">
                                <strong>Emisión:</strong> {fechaEmision}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TARJETAS RESUMEN DE COBRANZA */}
            <div className="row g-2 mb-3 p-2 p-md-3 rounded border text-center" style={{ backgroundColor: '#f8fafc' }}>
                <div className="col-3">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem' }}>Total Domicilios</span>
                    <span className="fs-5 fw-bold" style={{ color: artiguistaColors.azul }}>{countTotal}</span>
                </div>
                <div className="col-3">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem' }}>Escuela Tanda 1</span>
                    <span className="fs-5 fw-bold text-primary">{countT1}</span>
                </div>
                <div className="col-3">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem' }}>Escuela Tanda 2</span>
                    <span className="fs-5 fw-bold" style={{ color: '#7c3aed' }}>{countT2}</span>
                </div>
                <div className="col-3">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem' }}>Cuota Social</span>
                    <span className="fs-5 fw-bold text-success">$140 c/u</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando rutero de cobranza...</span>
                    </div>
                </div>
            ) : countTotal === 0 ? (
                <div className="text-center p-5 text-muted border rounded bg-light">
                    No se encontraron aspirantes con los filtros seleccionados.
                </div>
            ) : (
                <>
                    {/* VISTA MÓVIL EN PANTALLA (TARJETAS DINÁMICAS PARA EL COBRADOR) */}
                    <div className="d-md-none no-print mb-4">
                        <div className="alert alert-info py-2 px-3 small mb-3">
                            💡 <strong>Modo Cobrador Móvil:</strong> Tocá los teléfonos para llamar o las direcciones para abrir el mapa.
                        </div>
                        <div className="d-flex flex-column gap-3">
                            {sociosOrdenados.map((socio, idx) => {
                                const localStatus = cobrosLocales[socio.id] || { pagado: false, recibo: '' };
                                return (
                                    <div 
                                        key={socio.id} 
                                        className={`card shadow-sm border ${localStatus.pagado ? 'border-success bg-light' : ''}`}
                                        style={{ borderRadius: '0.75rem' }}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <span className="badge bg-secondary me-2">#{idx + 1}</span>
                                                    <strong className="text-dark">{socio.nombre}</strong>
                                                </div>
                                                {socio.tanda === 'tanda_1' ? (
                                                    <span className="badge-custom badge-t1">Tanda 1</span>
                                                ) : socio.tanda === 'tanda_2' ? (
                                                    <span className="badge-custom badge-t2">Tanda 2</span>
                                                ) : (
                                                    <span className="badge-custom badge-gen">General</span>
                                                )}
                                            </div>

                                            <div className="small text-muted mb-2">
                                                <strong>C.I.:</strong> {formatCedula(socio.cedula, socio.digito_verificador)}
                                            </div>

                                            <div className="mb-2 p-2 rounded bg-white border">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="small">
                                                        <strong>📍 Domicilio:</strong><br />
                                                        {socio.direccion?.trim() ? (
                                                            <span className="fw-semibold text-dark">
                                                                {socio.direccion} ({socio.localidad?.trim() || 'San José'})
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted fst-italic">(Sin dirección registrada)</span>
                                                        )}
                                                    </div>
                                                    {socio.direccion?.trim() && (
                                                        <a 
                                                            href={`https://maps.google.com/?q=${encodeURIComponent(socio.direccion + ', ' + (socio.localidad || 'San José') + ', Uruguay')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline-primary btn-sm ms-2"
                                                            title="Ver en Google Maps"
                                                        >
                                                            🗺️ Mapa
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-3 p-2 rounded bg-white border">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="small">
                                                        <strong>📞 Teléfono:</strong><br />
                                                        {socio.telefono?.trim() ? (
                                                            <span className="fw-semibold text-dark">{socio.telefono}</span>
                                                        ) : (
                                                            <span className="text-muted fst-italic">(Sin teléfono)</span>
                                                        )}
                                                    </div>
                                                    {socio.telefono?.trim() && (
                                                        <a 
                                                            href={`tel:${socio.telefono.replace(/\s+/g, '')}`}
                                                            className="btn btn-outline-success btn-sm ms-2"
                                                            title="Llamar al aspirante"
                                                        >
                                                            📞 Llamar
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Control de cobro interactivo móvil */}
                                            <div className="p-2 rounded bg-light border d-flex flex-wrap align-items-center justify-content-between gap-2">
                                                <div className="form-check m-0">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="checkbox" 
                                                        id={`cobro-${socio.id}`}
                                                        checked={localStatus.pagado}
                                                        onChange={() => togglePagoLocal(socio.id)}
                                                    />
                                                    <label className="form-check-label fw-bold small text-dark" htmlFor={`cobro-${socio.id}`}>
                                                        {localStatus.pagado ? '✅ Cobrado ($140)' : 'Pendiente de cobro ($140)'}
                                                    </label>
                                                </div>
                                                <div className="d-flex align-items-center gap-1">
                                                    <span className="small text-muted">Recibo N°:</span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm" 
                                                        style={{ width: '100px' }}
                                                        placeholder="N° talón"
                                                        value={localStatus.recibo}
                                                        onChange={(e) => handleReciboChange(socio.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* TABLA PRINCIPAL PARA ESCRITORIO E IMPRESIÓN OFICIAL A4 */}
                    <div className="desktop-table-container">
                        <table className="table table-sm table-bordered align-middle mb-4" style={{ fontSize: '0.82rem' }}>
                            <thead style={{ backgroundColor: '#002B49', color: 'white' }}>
                                <tr>
                                    <th className="text-center" style={{ width: '30px' }}>N°</th>
                                    <th style={{ width: '190px' }}>Nombre y Apellido</th>
                                    <th style={{ width: '95px' }}>Cédula</th>
                                    <th style={{ width: '110px' }}>Teléfono</th>
                                    <th style={{ width: '220px' }}>Domicilio</th>
                                    <th style={{ width: '95px' }}>Localidad</th>
                                    <th className="text-center" style={{ width: '65px' }}>Tanda</th>
                                    <th className="text-center" style={{ width: '135px' }}>Casilla de Control / Recibo / Firma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sociosOrdenados.map((socio, index) => {
                                    const tieneDireccion = Boolean(socio.direccion && socio.direccion.trim().length > 0);
                                    const tieneTelefono = Boolean(socio.telefono && socio.telefono.trim().length > 0);

                                    return (
                                        <tr key={socio.id}>
                                            <td className="text-center fw-bold text-muted" style={{ fontSize: '0.78rem' }}>
                                                {index + 1}
                                            </td>
                                            <td className="fw-semibold text-uppercase" style={{ fontSize: '0.82rem', lineHeight: '1.2' }}>
                                                {socio.nombre}
                                            </td>
                                            <td className="fw-bold" style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                                {formatCedula(socio.cedula, socio.digito_verificador)}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {tieneTelefono ? (
                                                    <span>{socio.telefono}</span>
                                                ) : (
                                                    <span className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>
                                                        (Sin teléfono)
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                                                {tieneDireccion ? (
                                                    <span className="fw-medium">{socio.direccion}</span>
                                                ) : (
                                                    <span className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>
                                                        (Sin dirección registrada)
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                {socio.localidad?.trim() ? (
                                                    <span>{socio.localidad}</span>
                                                ) : (
                                                    <span className="text-muted">San José</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {socio.tanda === 'tanda_1' ? (
                                                    <span className="badge-custom badge-t1">Tanda 1</span>
                                                ) : socio.tanda === 'tanda_2' ? (
                                                    <span className="badge-custom badge-t2">Tanda 2</span>
                                                ) : (
                                                    <span className="badge-custom badge-gen">General</span>
                                                )}
                                            </td>
                                            <td className="p-1">
                                                <div className="control-box">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span style={{ fontSize: '7pt' }}>[ &nbsp; ] Cobrado ($140)</span>
                                                    </div>
                                                    <div style={{ fontSize: '6.5pt', color: '#475569', lineHeight: '1.2' }}>
                                                        Recibo N°: ________________<br />
                                                        Firma: ___________________
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* PIE DE PÁGINA INSTITUCIONAL / SELLO DE RENDICIÓN */}
            <div className="mt-4 pt-3 border-top" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                <div className="row g-3 align-items-end">
                    <div className="col-sm-7">
                        <strong style={{ color: artiguistaColors.azul }}>CÍRCULO POLICIAL GENERAL JOSÉ ARTIGAS</strong> &bull; San José de Mayo, Uruguay<br />
                        <span className="small">
                            Hoja de ruta para cobranza domiciliaria previa a incorporación en retención de haberes de Jefatura (Convenio 514).<br />
                            <strong>Instrucciones:</strong> Entregar recibo oficial por el importe de la cuota social ($140) y registrar firma del aspirante.
                        </span>
                    </div>
                    <div className="col-sm-5 d-flex justify-content-between gap-3 text-center">
                        <div className="border-top border-secondary pt-1 flex-grow-1" style={{ fontSize: '0.75rem' }}>
                            Firma del Cobrador<br />
                            Rendición de Cobranza
                        </div>
                        <div className="border-top border-secondary pt-1 flex-grow-1" style={{ fontSize: '0.75rem' }}>
                            Firma / Sello Tesorería<br />
                            Círculo Policial San José
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RuteroCobranzaPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center text-muted">Cargando hoja de ruta para cobro a domicilio...</div>}>
            <RuteroCobranzaContent />
        </Suspense>
    );
}
