'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    compararPorPrimerApellido,
    formatearCedulaUY,
    formatearNombreApellidoPrimero,
} from '@/lib/cedula';

interface Socio {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: 'haberes' | 'externo';
    estado: 'activo' | 'baja';
    telefono?: string | null;
    direccion?: string | null;
    localidad?: string | null;
    email?: string | null;
    subcategoria?: string | null;
    tanda?: 'tanda_1' | 'tanda_2' | null;
    motivo_baja?: string | null;
    fecha_baja?: string | Date | null;
}

type TipoLista = 'generales' | 'tanda_1' | 'tanda_2';

function esBajaDelAnio(fechaBaja: string | Date | null | undefined, anio: number): boolean {
    if (!fechaBaja) return true; // Bajas iniciales sin fecha explícita cargadas en el año en curso
    const d = new Date(fechaBaja);
    if (isNaN(d.getTime())) return true;
    return d.getFullYear() === anio;
}

function CanastasSociosContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const listaParam = searchParams.get('lista') || 'generales';
    const [lista, setLista] = useState<TipoLista>(
        listaParam === 'tanda_1' || listaParam === 'tanda_2' ? listaParam : 'generales'
    );
    const [alturaRenglon, setAlturaRenglon] = useState<'normal' | 'extra'>('normal');
    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaEmision, setFechaEmision] = useState('');
    const anioActual = new Date().getFullYear();

    useEffect(() => {
        if (listaParam === 'generales' || listaParam === 'tanda_1' || listaParam === 'tanda_2') {
            setLista(listaParam);
        }
    }, [listaParam]);

    useEffect(() => {
        setFechaEmision(
            new Date().toLocaleString('es-UY', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        );
        const fetchSocios = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/descuentos/socios?estado=todos');
                const data = await res.json();
                if (data.success && Array.isArray(data.socios)) {
                    setSocios(data.socios);
                }
            } catch (e) {
                console.error('Error al cargar socios para canastas:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSocios();
    }, []);

    // Socios elegibles: todos los activos + bajas del año en curso (excluyendo duplicados)
    const sociosElegibles = useMemo(() => {
        return socios.filter(
            (s) =>
                s.estado === 'activo' ||
                (s.estado === 'baja' &&
                    esBajaDelAnio(s.fecha_baja, anioActual) &&
                    !(s.motivo_baja || '').toLowerCase().includes('duplicado'))
        );
    }, [socios, anioActual]);

    const conteos = useMemo(() => {
        return {
            generales: sociosElegibles.filter((s) => !s.tanda).length,
            tanda_1: sociosElegibles.filter((s) => s.tanda === 'tanda_1').length,
            tanda_2: sociosElegibles.filter((s) => s.tanda === 'tanda_2').length,
        };
    }, [sociosElegibles]);

    const sociosListaActual = useMemo(() => {
        const filtrados = sociosElegibles.filter((s) => {
            if (lista === 'tanda_1') return s.tanda === 'tanda_1';
            if (lista === 'tanda_2') return s.tanda === 'tanda_2';
            return !s.tanda;
        });
        return [...filtrados].sort((a, b) => compararPorPrimerApellido(a.nombre, b.nombre));
    }, [sociosElegibles, lista]);

    const totalBajasEnLista = useMemo(
        () => sociosListaActual.filter((s) => s.estado === 'baja').length,
        [sociosListaActual]
    );

    const faltanDatosCount = useMemo(
        () =>
            sociosListaActual.filter(
                (s) => !s.telefono?.trim() || !s.email?.trim() || !s.direccion?.trim()
            ).length,
        [sociosListaActual]
    );

    const handleCambiarLista = (nuevaLista: TipoLista) => {
        setLista(nuevaLista);
        router.replace(`/admin/socios/canastas?lista=${nuevaLista}`);
    };

    const getHeaderConfig = () => {
        switch (lista) {
            case 'tanda_1':
                return {
                    titulo: `ENTREGA DE CANASTAS ${anioActual} — ESCUELA POLICIAL (TANDA 1)`,
                    subtitulo: 'Planilla de entrega de canastas y actualización presencial de datos · Tanda 1',
                };
            case 'tanda_2':
                return {
                    titulo: `ENTREGA DE CANASTAS ${anioActual} — ESCUELA POLICIAL (TANDA 2)`,
                    subtitulo: 'Planilla de entrega de canastas y actualización presencial de datos · Tanda 2',
                };
            case 'generales':
            default:
                return {
                    titulo: `ENTREGA DE CANASTAS ${anioActual} — SOCIOS GENERALES`,
                    subtitulo: 'Descuento por Jefatura, Transferencia BROU, Cobrador a Domicilio y Particulares (incluye bajas del año)',
                };
        }
    };

    const config = getHeaderConfig();
    const rowMinHeight = alturaRenglon === 'extra' ? '74px' : '58px';

    return (
        <div
            className="bg-white min-vh-100 p-3 p-md-4 text-dark canastas-page"
            style={{ maxWidth: '1320px', margin: '0 auto', fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
            <style jsx global>{`
                @page {
                    size: A4 landscape;
                    margin: 0.7cm;
                }

                @media print {
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .canastas-page {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    thead {
                        display: table-header-group !important;
                    }
                    tr {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    th {
                        background-color: #002B49 !important;
                        color: white !important;
                    }
                    .celda-faltante {
                        background-color: #fffbeb !important;
                    }
                }

                .tabla-canastas {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }

                .tabla-canastas th {
                    background-color: #002B49;
                    color: #ffffff;
                    font-size: 0.78rem;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    padding: 8px 6px;
                    border: 1px solid #002B49;
                    vertical-align: middle;
                }

                .tabla-canastas td {
                    border: 1px solid #475569;
                    padding: 5px 7px;
                    vertical-align: top;
                    font-size: 0.8rem;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .celda-contenido {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                }

                .celda-faltante {
                    background-color: #fffbeb;
                }

                .dato-actual {
                    font-weight: 600;
                    color: #0f172a;
                    line-height: 1.2;
                }

                .dato-faltante-hint {
                    font-size: 0.68rem;
                    color: #b45309;
                    font-style: italic;
                }

                .linea-escritura {
                    border-bottom: 1px dotted #94a3b8;
                    margin-top: auto;
                    padding-top: 14px;
                    width: 100%;
                }

                .badge-baja-anio {
                    display: inline-block;
                    margin-top: 2px;
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    background-color: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
            `}</style>

            {/* Barra de herramientas (no imprimible) */}
            <div className="no-print mb-3 p-3 bg-light rounded border shadow-sm">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <Link href="/admin/socios" className="btn btn-outline-secondary btn-sm">
                            ← Volver a Socios
                        </Link>
                        <span className="fw-bold text-dark">
                            🎁 Listas de Canastas {anioActual} (A4 Apaisado)
                        </span>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Altura de renglón">
                            <button
                                type="button"
                                className={`btn ${alturaRenglon === 'normal' ? 'btn-dark' : 'btn-outline-dark'}`}
                                onClick={() => setAlturaRenglon('normal')}
                                title="Renglón grande (~1.5 cm)"
                            >
                                Renglón Grande
                            </button>
                            <button
                                type="button"
                                className={`btn ${alturaRenglon === 'extra' ? 'btn-dark' : 'btn-outline-dark'}`}
                                onClick={() => setAlturaRenglon('extra')}
                                title="Renglón extra grande (~2 cm)"
                            >
                                Extra Grande
                            </button>
                        </div>

                        <a
                            href={`/api/admin/socios/canastas/excel?anio=${anioActual}`}
                            className="btn btn-outline-success btn-sm fw-bold"
                        >
                            📊 Descargar Excel (3 Listas)
                        </a>

                        <button
                            type="button"
                            className="btn btn-success btn-sm fw-bold"
                            onClick={() => window.print()}
                        >
                            🖨️ Imprimir / Guardar PDF
                        </button>
                    </div>
                </div>

                {/* Selector de las 3 listas */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${lista === 'generales' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarLista('generales')}
                        >
                            🏛️ 1. Socios Generales ({conteos.generales})
                        </button>
                        <button
                            type="button"
                            className={`btn ${lista === 'tanda_1' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarLista('tanda_1')}
                        >
                            👮 2. Tanda 1 ({conteos.tanda_1})
                        </button>
                        <button
                            type="button"
                            className={`btn ${lista === 'tanda_2' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarLista('tanda_2')}
                        >
                            👮 3. Tanda 2 ({conteos.tanda_2})
                        </button>
                    </div>

                    <small className="text-muted">
                        Orden alfabético por apellido · Incluye bajas {anioActual} · Celdas sombreadas = dato faltante
                    </small>
                </div>
            </div>

            {/* Encabezado institucional compacto para aprovechar el alto A4 apaisado */}
            <div className="d-flex align-items-center justify-content-between border-bottom border-2 border-warning pb-2 mb-3">
                <div className="d-flex align-items-center">
                    <div className="me-3 position-relative" style={{ width: '54px', height: '54px', flexShrink: 0 }}>
                        <Image
                            src="/logo-circulo-policial.png"
                            alt="Escudo Círculo Policial San José"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="m-0 fw-bold" style={{ color: '#002B49', fontSize: '1.15rem' }}>
                            CÍRCULO POLICIAL GENERAL JOSÉ ARTIGAS — SAN JOSÉ
                        </h1>
                        <h2 className="m-0 fw-bold" style={{ color: '#8B0000', fontSize: '0.98rem' }}>
                            {config.titulo}
                        </h2>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {config.subtitulo}
                        </div>
                    </div>
                </div>

                <div className="text-end" style={{ fontSize: '0.75rem', lineHeight: 1.35 }}>
                    <div>
                        <strong>Total en lista:</strong> {sociosListaActual.length}
                        {totalBajasEnLista > 0 && ` (incluye ${totalBajasEnLista} baja${totalBajasEnLista === 1 ? '' : 's'} ${anioActual})`}
                    </div>
                    <div>
                        <strong>Con datos a completar:</strong>{' '}
                        <span className="fw-bold" style={{ color: '#b45309' }}>
                            {faltanDatosCount}
                        </span>
                    </div>
                    <div className="text-muted">Emisión: {fechaEmision}</div>
                </div>
            </div>

            {/* Tabla principal A4 Apaisado */}
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando planilla...</span>
                    </div>
                </div>
            ) : sociosListaActual.length === 0 ? (
                <div className="text-center p-5 text-muted border rounded">
                    No hay socios registrados en esta lista.
                </div>
            ) : (
                <table className="tabla-canastas">
                    <thead>
                        <tr>
                            <th className="text-center" style={{ width: '3.5%' }}>#</th>
                            <th style={{ width: '19.5%' }}>Nombre y Apellido</th>
                            <th className="text-center" style={{ width: '11%' }}>Cédula</th>
                            <th style={{ width: '13%' }}>Teléfono / Celular</th>
                            <th style={{ width: '18.5%' }}>Correo Electrónico</th>
                            <th style={{ width: '20.5%' }}>Dirección y Localidad</th>
                            <th className="text-center" style={{ width: '14%' }}>Firma Retiro Canasta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sociosListaActual.map((socio, index) => {
                            const tel = socio.telefono?.trim() || '';
                            const mail = socio.email?.trim() || '';
                            const dir = [socio.direccion?.trim(), socio.localidad?.trim()]
                                .filter(Boolean)
                                .join(' - ');

                            return (
                                <tr key={socio.id}>
                                    <td
                                        className="text-center fw-bold text-muted"
                                        style={{ height: rowMinHeight, verticalAlign: 'middle' }}
                                    >
                                        {index + 1}
                                    </td>
                                    <td style={{ height: rowMinHeight }}>
                                        <div className="celda-contenido">
                                            <div>
                                                <div className="dato-actual text-uppercase">
                                                    {formatearNombreApellidoPrimero(socio.nombre)}
                                                </div>
                                                {socio.estado === 'baja' && (
                                                    <span className="badge-baja-anio">BAJA {anioActual}</span>
                                                )}
                                            </div>
                                            <div className="linea-escritura" />
                                        </div>
                                    </td>
                                    <td className="text-center" style={{ height: rowMinHeight }}>
                                        <div className="celda-contenido">
                                            <div className="dato-actual" style={{ whiteSpace: 'nowrap' }}>
                                                {formatearCedulaUY(socio.cedula, socio.digito_verificador)}
                                            </div>
                                            <div className="linea-escritura" />
                                        </div>
                                    </td>
                                    <td
                                        className={!tel ? 'celda-faltante' : ''}
                                        style={{ height: rowMinHeight }}
                                    >
                                        <div className="celda-contenido">
                                            {tel ? (
                                                <div className="dato-actual">{tel}</div>
                                            ) : (
                                                <div className="dato-faltante-hint">Completar tel.:</div>
                                            )}
                                            <div className="linea-escritura" />
                                        </div>
                                    </td>
                                    <td
                                        className={!mail ? 'celda-faltante' : ''}
                                        style={{ height: rowMinHeight }}
                                    >
                                        <div className="celda-contenido">
                                            {mail ? (
                                                <div className="dato-actual" style={{ fontSize: '0.75rem' }}>
                                                    {mail}
                                                </div>
                                            ) : (
                                                <div className="dato-faltante-hint">Completar correo:</div>
                                            )}
                                            <div className="linea-escritura" />
                                        </div>
                                    </td>
                                    <td
                                        className={!dir ? 'celda-faltante' : ''}
                                        style={{ height: rowMinHeight }}
                                    >
                                        <div className="celda-contenido">
                                            {dir ? (
                                                <div className="dato-actual" style={{ fontSize: '0.76rem' }}>
                                                    {dir}
                                                </div>
                                            ) : (
                                                <div className="dato-faltante-hint">Completar dirección:</div>
                                            )}
                                            <div className="linea-escritura" />
                                        </div>
                                    </td>
                                    <td style={{ height: rowMinHeight }}>
                                        <div className="celda-contenido">
                                            <div className="linea-escritura" />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default function CanastasSociosPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center">Cargando planilla de canastas A4 apaisado...</div>}>
            <CanastasSociosContent />
        </Suspense>
    );
}
