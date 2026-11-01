'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Spinner } from 'reactstrap';
import {
    getPeriodoActual,
    formatearPeriodoLargo,
    obtenerProximoMesCobro,
} from '@/lib/periodos';

function ImprimirRendicionPagosContent() {
    const searchParams = useSearchParams();
    const periodoParam = searchParams.get('periodo') || '';

    const [pagos, setPagos] = useState<any[]>([]);
    const [sociosBrou, setSociosBrou] = useState<any[]>([]);
    const [resumen, setResumen] = useState<any>(null);
    const [periodoFiltro, setPeriodoFiltro] = useState<string>(periodoParam);
    const [incluirPadronCobertura, setIncluirPadronCobertura] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/pagos')
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setPagos(data.pagos || []);
                    setSociosBrou(data.sociosBrou || []);
                    setResumen(data.resumen || null);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const periodoActual = resumen?.periodoActual || getPeriodoActual();

    const pagosConfirmados = pagos.filter((p) => {
        if (p.estado !== 'confirmado') return false;
        if (periodoFiltro) {
            const desde = p.periodo_desde || '';
            const hasta = p.periodo_hasta || '';
            const creacion = p.created_at ? p.created_at.slice(0, 7) : '';
            if (!(desde <= periodoFiltro && hasta >= periodoFiltro) && creacion !== periodoFiltro) {
                return false;
            }
        }
        return true;
    });

    const totalMontoPeriodo = pagosConfirmados.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
    const totalCuotasPeriodo = pagosConfirmados.reduce((acc, p) => acc + (Number(p.cantidad_meses) || 1), 0);

    const fechaEmision = new Date().toLocaleDateString('es-UY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    if (loading) {
        return (
            <div className="p-5 text-center">
                <Spinner color="primary" />
                <p className="mt-2 text-muted">Generando informe para la Comisión Directiva...</p>
            </div>
        );
    }

    return (
        <div className="print-wrapper">
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 12mm;
                }
                body {
                    background: #f1f5f9;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #0f172a;
                }
                .toolbar-no-print {
                    background: #002B49;
                    color: #fff;
                    padding: 12px 24px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .sheet-a4 {
                    background: #ffffff;
                    max-width: 210mm;
                    margin: 20px auto;
                    padding: 15mm;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    border-radius: 6px;
                }
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                    margin-bottom: 18px;
                }
                .report-table th {
                    background: #002B49;
                    color: #ffffff;
                    padding: 6px 8px;
                    text-align: left;
                    border: 1px solid #002B49;
                }
                .report-table td {
                    padding: 5px 8px;
                    border: 1px solid #cbd5e1;
                }
                .report-table tr:nth-child(even) {
                    background: #f8fafc;
                }
                @media print {
                    body {
                        background: #ffffff;
                    }
                    .toolbar-no-print {
                        display: none !important;
                    }
                    .sheet-a4 {
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        max-width: 100%;
                    }
                }
            `}</style>

            {/* Barra de herramientas superior (oculta al imprimir) */}
            <div className="toolbar-no-print">
                <div className="d-flex align-items-center gap-3">
                    <strong>🖨️ Informe de Pagos BROU para Comisión Directiva</strong>
                    <input
                        type="month"
                        value={periodoFiltro}
                        onChange={(e) => setPeriodoFiltro(e.target.value)}
                        className="form-control form-control-sm"
                        style={{ width: '160px' }}
                    />
                    {periodoFiltro && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-light"
                            onClick={() => setPeriodoFiltro('')}
                        >
                            Ver Todos
                        </button>
                    )}
                    <label className="d-flex align-items-center gap-1 small mb-0" style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={incluirPadronCobertura}
                            onChange={(e) => setIncluirPadronCobertura(e.target.checked)}
                        />
                        Incluir tabla de cobertura por socio
                    </label>
                </div>

                <div className="d-flex gap-2">
                    <Button color="warning" size="sm" className="fw-bold text-dark" onClick={() => window.print()}>
                        🖨️ Imprimir / Guardar PDF
                    </Button>
                    <Button color="light" outline size="sm" onClick={() => window.close()}>
                        Cerrar
                    </Button>
                </div>
            </div>

            {/* Hoja A4 */}
            <div className="sheet-a4">
                {/* Encabezado Institucional */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '3px solid #002B49',
                        paddingBottom: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/logo-circulo-policial.png"
                            alt="Escudo Círculo Policial"
                            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                        />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#002B49' }}>
                                CÍRCULO POLICIAL &ldquo;GRAL. JOSÉ ARTIGAS&rdquo; DE SAN JOSÉ
                            </h1>
                            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                                Fundado el 15 de abril de 1944 • Personería Jurídica 1948 • Sede Social: Ituzaingó N° 441, San José de Mayo
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1E40AF', marginTop: '4px' }}>
                                RENDICIÓN DE INGRESOS POR TRANSFERENCIA BANCARIA BROU (CA 001579728-00001)
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#334155' }}>
                        <div><strong>Fecha de Emisión:</strong></div>
                        <div>{fechaEmision}</div>
                        <div style={{ marginTop: '4px' }}>
                            <strong>Período:</strong> {periodoFiltro ? formatearPeriodoLargo(periodoFiltro) : 'Histórico Consolidado'}
                        </div>
                    </div>
                </div>

                {/* Resumen Ejecutivo para la Directiva */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '10px',
                        marginBottom: '18px',
                    }}
                >
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Transferencias Acreditadas
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#002B49' }}>
                            {pagosConfirmados.length} pagos ({totalCuotasPeriodo} cuotas)
                        </div>
                    </div>

                    <div style={{ border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 10px', background: '#f0fdf4' }}>
                        <div style={{ fontSize: '10px', color: '#166534', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Total Recaudado BROU
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#15803d' }}>
                            $ {totalMontoPeriodo.toLocaleString('es-UY')} UYU
                        </div>
                    </div>

                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Socios BROU Al Día / Adelantados
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                            {resumen?.sociosCubiertosTotal || 0} de {resumen?.totalSociosBrou || 0} socios
                        </div>
                    </div>

                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Pendientes del Mes Actual
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>
                            {resumen?.sociosAdeudanMes || 0} socios
                        </div>
                    </div>
                </div>

                {/* Tabla 1: Detalle de Pagos Confirmados */}
                <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#002B49', marginBottom: '8px' }}>
                    1. Detalle de Pagos Recibidos y Confirmados por Transferencia Bancaria
                </h2>

                {pagosConfirmados.length === 0 ? (
                    <div style={{ padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
                        No se registran pagos confirmados para el filtro seleccionado.
                    </div>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th style={{ width: '32px', textAlign: 'center' }}>N°</th>
                                <th style={{ width: '75px' }}>Fecha</th>
                                <th style={{ width: '85px' }}>Cédula</th>
                                <th>Apellido y Nombre del Socio</th>
                                <th style={{ width: '65px', textAlign: 'center' }}>Cuotas</th>
                                <th>Períodos Cubiertos</th>
                                <th style={{ width: '85px', textAlign: 'right' }}>Importe ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagosConfirmados.map((p, idx) => {
                                const fechaStr = p.created_at
                                    ? new Date(p.created_at).toLocaleDateString('es-UY', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                      })
                                    : '—';
                                const ci = p.socio_cedula ? `${p.socio_cedula}-${p.socio_dv || ''}` : p.cedula;
                                const cant = Number(p.cantidad_meses) || 1;

                                return (
                                    <tr key={p.id}>
                                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                        <td>{fechaStr}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{ci}</td>
                                        <td style={{ fontWeight: 'bold' }}>{p.nombre}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {cant} {cant === 1 ? 'mes' : 'meses'}
                                        </td>
                                        <td>{p.periodos_detalle || p.periodo_desde}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            $ {Number(p.monto).toLocaleString('es-UY')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#dcfce7', fontWeight: 'bold' }}>
                                <td colSpan={4} style={{ textAlign: 'right' }}>
                                    TOTAL RECAUDADO EN TRANSFERENCIAS BROU:
                                </td>
                                <td style={{ textAlign: 'center' }}>{totalCuotasPeriodo} cuotas</td>
                                <td></td>
                                <td style={{ textAlign: 'right', fontSize: '12px', color: '#15803d' }}>
                                    $ {totalMontoPeriodo.toLocaleString('es-UY')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                )}

                {/* Tabla 2: Estado de Cobertura del Padrón BROU */}
                {incluirPadronCobertura && (
                    <>
                        <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#002B49', marginBottom: '8px', marginTop: '14px' }}>
                            2. Estado de Cobertura de Socios con Modalidad Transferencia BROU ({formatearPeriodoLargo(periodoActual)})
                        </h2>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '32px', textAlign: 'center' }}>N°</th>
                                    <th style={{ width: '85px' }}>Cédula</th>
                                    <th>Apellido y Nombre</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Cubierto Hasta</th>
                                    <th style={{ width: '115px', textAlign: 'center' }}>Situación Actual</th>
                                    <th style={{ width: '130px', textAlign: 'center' }}>Próximo Aviso Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sociosBrou.map((s, i) => {
                                    const pagadoHasta = s.pagado_hasta || null;
                                    const adelantado = pagadoHasta && pagadoHasta > periodoActual;
                                    const alDia = pagadoHasta === periodoActual;
                                    const proximo = formatearPeriodoLargo(obtenerProximoMesCobro(pagadoHasta));

                                    return (
                                        <tr key={s.id}>
                                            <td style={{ textAlign: 'center' }}>{i + 1}</td>
                                            <td style={{ fontFamily: 'monospace' }}>
                                                {s.cedula}-{s.digito_verificador}
                                            </td>
                                            <td style={{ fontWeight: 'bold' }}>{s.nombre}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {pagadoHasta ? formatearPeriodoLargo(pagadoHasta) : 'Sin registro'}
                                            </td>
                                            <td
                                                style={{
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: adelantado ? '#1d4ed8' : alDia ? '#15803d' : '#dc2626',
                                                }}
                                            >
                                                {adelantado ? 'ADELANTADO' : alDia ? 'AL DÍA' : 'PENDIENTE'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{proximo}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Pie de Firmas para Comisión Directiva */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '28px',
                        marginTop: '42px',
                        paddingTop: '20px',
                        textAlign: 'center',
                        fontSize: '11px',
                    }}
                >
                    <div>
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '6px', fontWeight: 'bold' }}>
                            TESORERÍA
                        </div>
                        <div style={{ color: '#64748b' }}>Círculo Policial San José</div>
                    </div>
                    <div>
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '6px', fontWeight: 'bold' }}>
                            Crio. Mayor (R) Jorge Carrato
                        </div>
                        <div style={{ color: '#64748b' }}>SECRETARIO</div>
                    </div>
                    <div>
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '6px', fontWeight: 'bold' }}>
                            Crio. Mayor (R) Darcy González
                        </div>
                        <div style={{ color: '#64748b' }}>PRESIDENTE</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ImprimirRendicionPagosPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center">Cargando vista de impresión...</div>}>
            <ImprimirRendicionPagosContent />
        </Suspense>
    );
}
