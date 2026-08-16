'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Socio {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: 'haberes' | 'externo';
    estado: 'activo' | 'baja';
    carnet_entregado?: boolean;
}

function ImprimirSociosContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const tipoParam = searchParams.get('tipo') || 'total'; // 'total', 'jefatura', 'externo'
    const [tipo, setTipo] = useState<'total' | 'jefatura' | 'externo'>(
        (tipoParam === 'jefatura' || tipoParam === 'externo') ? tipoParam : 'total'
    );

    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaEmision, setFechaEmision] = useState('');

    useEffect(() => {
        if (tipoParam === 'jefatura' || tipoParam === 'externo' || tipoParam === 'total') {
            setTipo(tipoParam);
        }
    }, [tipoParam]);

    useEffect(() => {
        setFechaEmision(new Date().toLocaleString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));
        fetchSocios();
    }, []);

    const fetchSocios = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/descuentos/socios?estado=activo');
            const data = await res.json();
            if (data.success) {
                setSocios(data.socios);
            }
        } catch (e) {
            console.error('Error al cargar socios:', e);
        } finally {
            setLoading(false);
        }
    };

    const formatCedula = (ci: string, dv: string) => {
        const num = parseInt(ci);
        if (isNaN(num)) return `${ci}-${dv}`;
        return `${num.toLocaleString('es-UY')}-${dv}`;
    };

    // Filtrar lista según tipo
    const sociosFiltrados = socios.filter(s => {
        if (tipo === 'jefatura') return s.metodo_pago === 'haberes';
        if (tipo === 'externo') return s.metodo_pago === 'externo';
        return true; // 'total'
    });

    const entregadosCount = sociosFiltrados.filter(s => s.carnet_entregado).length;
    const pendientesCount = sociosFiltrados.filter(s => !s.carnet_entregado).length;

    // Configuración según el tipo seleccionado
    const getHeaderConfig = () => {
        switch (tipo) {
            case 'jefatura':
                return {
                    titulo: 'PADRÓN DE SOCIOS CON DESCUENTO POR JEFATURA DE POLICÍA',
                    subtitulo: 'Socios con retención de cuota social por haberes (Jefatura UE 19)',
                    badgeLabel: 'Descuento Jefatura',
                    badgeClass: 'badge-jefatura'
                };
            case 'externo':
                return {
                    titulo: 'PADRÓN DE SOCIOS CON PAGO POR FUERA (PARTICULAR / CAJA)',
                    subtitulo: 'Socios con cobro particular en sede o cobrador externo (Fuera de Jefatura)',
                    badgeLabel: 'Pago por Fuera',
                    badgeClass: 'badge-externo'
                };
            case 'total':
            default:
                return {
                    titulo: 'PADRÓN GENERAL DE SOCIOS - TOTAL DE SOCIOS',
                    subtitulo: 'Listado oficial consolidado de socios activos del Círculo Policial San José',
                    badgeLabel: 'Padrón Total',
                    badgeClass: 'badge-total'
                };
        }
    };

    const config = getHeaderConfig();

    const handleCambiarTipo = (nuevoTipo: 'total' | 'jefatura' | 'externo') => {
        setTipo(nuevoTipo);
        router.replace(`/admin/socios/imprimir?tipo=${nuevoTipo}`);
    };

    return (
        <div className="bg-white min-vh-100 p-4 p-md-5 text-dark" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <style jsx global>{`
                @media print {
                    body { 
                        background: white !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .no-print { display: none !important; }
                    @page { 
                        size: A4 portrait; 
                        margin: 1.2cm; 
                    }
                    .page-container {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    th {
                        background-color: #002B49 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .badge-jefatura {
                        background-color: #e0f2fe !important;
                        color: #0369a1 !important;
                        border: 1px solid #bae6fd !important;
                    }
                    .badge-externo {
                        background-color: #fef3c7 !important;
                        color: #92400e !important;
                        border: 1px solid #fde68a !important;
                    }
                    .badge-entregado {
                        background-color: #dcfce7 !important;
                        color: #15803d !important;
                        border: 1px solid #bbf7d0 !important;
                    }
                    .badge-pendiente {
                        background-color: #fff7ed !important;
                        color: #c2410c !important;
                        border: 1px solid #ffedd5 !important;
                    }
                }

                .badge-custom {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 8pt;
                    font-weight: bold;
                }
                .badge-jefatura {
                    background-color: #e0f2fe;
                    color: #0369a1;
                    border: 1px solid #bae6fd;
                }
                .badge-externo {
                    background-color: #fef3c7;
                    color: #92400e;
                    border: 1px solid #fde68a;
                }
                .badge-entregado {
                    background-color: #dcfce7;
                    color: #15803d;
                    border: 1px solid #bbf7d0;
                }
                .badge-pendiente {
                    background-color: #fff7ed;
                    color: #c2410c;
                    border: 1px solid #ffedd5;
                }
            `}</style>

            {/* Barra de Navegación y Acciones para Pantalla (no imprimible) */}
            <div className="no-print mb-4 p-3 bg-light rounded border shadow-sm">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                        <Link href="/admin/socios" className="btn btn-outline-secondary btn-sm me-2">
                            ← Volver a Socios
                        </Link>
                        <span className="fw-bold text-dark">Vista Previa de Impresión A4</span>
                    </div>

                    {/* Selector de Tipo de Documento */}
                    <div className="btn-group btn-group-sm" role="group">
                        <button
                            type="button"
                            className={`btn ${tipo === 'total' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarTipo('total')}
                        >
                            📋 Total Socios ({socios.length})
                        </button>
                        <button
                            type="button"
                            className={`btn ${tipo === 'jefatura' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarTipo('jefatura')}
                        >
                            🏛️ Descuento Jefatura ({socios.filter(s => s.metodo_pago === 'haberes').length})
                        </button>
                        <button
                            type="button"
                            className={`btn ${tipo === 'externo' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleCambiarTipo('externo')}
                        >
                            💵 Pago por Fuera ({socios.filter(s => s.metodo_pago === 'externo').length})
                        </button>
                    </div>

                    <button className="btn btn-success btn-sm fw-bold" onClick={() => window.print()}>
                        🖨️ Imprimir / Guardar en PDF
                    </button>
                </div>
            </div>

            {/* ENCABEZADO INSTITUCIONAL CON LOGO */}
            <div className="d-flex align-items-center border-bottom border-3 border-warning pb-3 mb-4">
                <div className="me-3 position-relative" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                    <Image
                        src="/logo-circulo-policial.png"
                        alt="Escudo Círculo Policial San José"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </div>
                <div className="flex-grow-1">
                    <h1 className="m-0 fw-bold" style={{ color: '#002B49', fontSize: '1.5rem', letterSpacing: '0.5px' }}>
                        CÍRCULO POLICIAL GENERAL JOSÉ ARTIGAS
                    </h1>
                    <h2 className="m-0 fw-bold mt-1" style={{ color: '#8B0000', fontSize: '1.15rem' }}>
                        {config.titulo}
                    </h2>
                    <p className="m-0 text-muted small mt-1">
                        {config.subtitulo} &bull; <strong>Emisión:</strong> {fechaEmision}
                    </p>
                </div>
            </div>

            {/* RESUMEN MÉTRICO / CONTADORES */}
            <div className="row g-2 mb-4 p-3 rounded border" style={{ backgroundColor: '#f8fafc' }}>
                <div className="col-3 text-center">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Total en Lista</span>
                    <span className="fs-4 fw-bold" style={{ color: '#002B49' }}>{sociosFiltrados.length}</span>
                </div>
                <div className="col-3 text-center">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Carné Entregado</span>
                    <span className="fs-4 fw-bold text-success">{entregadosCount}</span>
                </div>
                <div className="col-3 text-center">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Carné Pendiente</span>
                    <span className="fs-4 fw-bold text-warning">{pendientesCount}</span>
                </div>
                <div className="col-3 text-center">
                    <span className="d-block text-uppercase fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Formato</span>
                    <span className="fs-4 fw-bold text-info">A4 HOJA</span>
                </div>
            </div>

            {/* TABLA DE SOCIOS */}
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando datos para impresión...</span>
                    </div>
                </div>
            ) : sociosFiltrados.length === 0 ? (
                <div className="text-center p-5 text-muted border rounded">
                    No hay socios registrados para la categoría seleccionada.
                </div>
            ) : (
                <table className="table table-sm table-bordered align-middle mb-4" style={{ fontSize: '0.85rem' }}>
                    <thead style={{ backgroundColor: '#002B49', color: 'white' }}>
                        <tr>
                            <th className="text-center" style={{ width: '40px' }}>#</th>
                            <th style={{ width: '130px' }}>Cédula</th>
                            <th>Nombre y Apellido</th>
                            <th className="text-center" style={{ width: '160px' }}>Método de Cobro</th>
                            <th className="text-center" style={{ width: '140px' }}>Estado Carné Físico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sociosFiltrados.map((socio, index) => (
                            <tr key={socio.id}>
                                <td className="text-center fw-bold text-muted" style={{ fontSize: '0.8rem' }}>
                                    {index + 1}
                                </td>
                                <td className="fw-bold" style={{ whiteSpace: 'nowrap' }}>
                                    {formatCedula(socio.cedula, socio.digito_verificador)}
                                </td>
                                <td className="text-uppercase fw-semibold">
                                    {socio.nombre}
                                </td>
                                <td className="text-center">
                                    {socio.metodo_pago === 'haberes' ? (
                                        <span className="badge-custom badge-jefatura">
                                            Descuento Jefatura
                                        </span>
                                    ) : (
                                        <span className="badge-custom badge-externo">
                                            Pago por Fuera
                                        </span>
                                    )}
                                </td>
                                <td className="text-center">
                                    {socio.carnet_entregado ? (
                                        <span className="badge-custom badge-entregado">
                                            🟩 Entregado
                                        </span>
                                    ) : (
                                        <span className="badge-custom badge-pendiente">
                                            🟨 Pendiente
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* PIE DE PÁGINA INSTITUCIONAL / SELLO DE CONTROL */}
            <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-end" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <div>
                    <strong style={{ color: '#002B49' }}>Círculo Policial San José</strong> &bull; San José de Mayo, Uruguay<br />
                    Documento institucional para fiscalización, cobro y control de padrón de asociados.
                </div>
                <div className="text-center border-top border-secondary pt-1 mt-4" style={{ width: '210px', fontSize: '0.78rem' }}>
                    Firma / Sello Responsable<br />
                    Comisión Directiva Círculo Policial
                </div>
            </div>
        </div>
    );
}

export default function ImprimirSociosPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center">Cargando visor de impresión A4...</div>}>
            <ImprimirSociosContent />
        </Suspense>
    );
}
