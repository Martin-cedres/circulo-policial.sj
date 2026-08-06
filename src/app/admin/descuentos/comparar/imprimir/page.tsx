'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ResultadoComparacion {
    fechaAnterior: string;
    fechaActual: string;
    financiero: {
        cuotaAnterior: number;
        cuotaActual: number;
        cuotaVar: number;
        cuotaVarPct: number;
        recaudadoAnterior: number;
        recaudadoActual: number;
        recaudadoVar: number;
        recaudadoVarPct: number;
        impagoAnterior: number;
        impagoActual: number;
        impagoVar: number;
        sociosImpagosAnterior: number;
        sociosImpagosActual: number;
        sociosImpagosVar: number;
    };
    movimientos: {
        bajas: Array<{ ci: string; nombre: string; nota?: string }>;
        recuperados: Array<{ ci: string; nombre: string; descActual: number }>;
        impagosPersistentes: Array<{ ci: string; nombre: string; noDescActual: number }>;
    };
}

export default function ImprimirComparativoPage() {
    const [data, setData] = useState<ResultadoComparacion | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('cp_retenciones_comparacion');
        if (stored) {
            try {
                setData(JSON.parse(stored));
            } catch (e) {
                console.error('Error parsing stored comparison:', e);
            }
        }
    }, []);

    if (!data) {
        return (
            <div className="p-5 text-center">
                <h3>Cargando informe para impresión...</h3>
                <p className="text-muted">Si no se despliega automáticamente, vuelva al panel de control e inicie la comparación.</p>
            </div>
        );
    }

    const { financiero, movimientos, fechaAnterior, fechaActual } = data;

    const fmtMoney = (val: number) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(val);
    };

    return (
        <div className="bg-white min-vh-100 p-4 p-md-5 text-dark" style={{ maxWidth: '850px', margin: '0 auto', fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <style jsx global>{`
                @media print {
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    @page { margin: 1cm; size: A4; }
                }
            `}</style>

            {/* Acciones flotantes en pantalla */}
            <div className="no-print d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded border">
                <span className="fw-bold text-primary">Vista Previa de Informe Imprimible (PDF)</span>
                <div>
                    <button className="btn btn-secondary btn-sm me-2" onClick={() => window.close()}>
                        Cerrar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                        🖨️ Imprimir / Guardar en PDF
                    </button>
                </div>
            </div>

            {/* Encabezado con Nombre y Escudo del Círculo Policial */}
            <div className="d-flex align-items-center border-bottom border-2 border-warning pb-3 mb-4">
                <div className="me-3 position-relative" style={{ width: '65px', height: '65px' }}>
                    <Image
                        src="/logo-circulo-policial.png"
                        alt="Escudo Círculo Policial San José"
                        fill
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <div>
                    <h2 className="m-0 fw-bold" style={{ color: '#002B49', fontSize: '1.6rem' }}>CÍRCULO POLICIAL SAN JOSÉ</h2>
                    <h4 className="m-0 fw-bold" style={{ color: '#D4AF37', fontSize: '1.2rem' }}>Informe Recaudación Junio - Julio</h4>
                    <p className="m-0 text-muted small">Convenio 514 | Jefatura de Policía de San José | Períodos: {fechaAnterior} vs. {fechaActual}</p>
                </div>
            </div>

            {/* Sección 1: Cuadro Comparativo Financiero */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3" style={{ color: '#002B49' }}>1. Cuadro Comparativo Financiero</h5>
                <table className="table table-bordered align-middle text-center small">
                    <thead style={{ backgroundColor: '#002B49', color: 'white' }}>
                        <tr>
                            <th className="text-start">Concepto / Indicador</th>
                            <th>Junio 2026</th>
                            <th>Julio 2026</th>
                            <th>Variación Absoluta</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-start fw-bold" style={{ color: '#002B49' }}>Cuota Social Unitaria Base</td>
                            <td>{fmtMoney(financiero.cuotaAnterior)}</td>
                            <td>{fmtMoney(financiero.cuotaActual)}</td>
                            <td className="fw-bold text-success">+{fmtMoney(financiero.cuotaVar)} (+{financiero.cuotaVarPct.toFixed(2)}%)</td>
                        </tr>
                        <tr className="table-light">
                            <td className="text-start fw-bold" style={{ color: '#002B49' }}>Total Recaudado (Efectivo Descontado)</td>
                            <td>{fmtMoney(financiero.recaudadoAnterior)}</td>
                            <td>{fmtMoney(financiero.recaudadoActual)}</td>
                            <td className="fw-bold text-success">+{fmtMoney(financiero.recaudadoVar)} (+{financiero.recaudadoVarPct.toFixed(2)}%)</td>
                        </tr>
                        <tr>
                            <td className="text-start fw-bold" style={{ color: '#002B49' }}>Total No Descontado (Impago / Sin Saldo)</td>
                            <td>{fmtMoney(financiero.impagoAnterior)}</td>
                            <td>{fmtMoney(financiero.impagoActual)}</td>
                            <td className="fw-bold text-success">{fmtMoney(financiero.impagoVar)}</td>
                        </tr>
                        <tr className="table-light">
                            <td className="text-start fw-bold" style={{ color: '#002B49' }}>Cantidad de Socios Impagos / Faltante</td>
                            <td>{financiero.sociosImpagosAnterior} socios</td>
                            <td>{financiero.sociosImpagosActual} socios</td>
                            <td className="fw-bold text-success">{financiero.sociosImpagosVar} socios</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Sección 2: Movimiento de Socios y Estado de Cobrabilidad */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3" style={{ color: '#002B49' }}>2. Movimiento de Socios y Estado de Cobrabilidad</h5>

                {/* Bajas */}
                <div className="mb-3">
                    <h6 className="fw-bold text-danger mb-2">A. Baja Notificada en el Reporte ({movimientos.bajas.length}):</h6>
                    {movimientos.bajas.length === 0 ? (
                        <p className="small text-muted mb-1">Sin bajas registradas en el período.</p>
                    ) : (
                        <ul className="small mb-1 ps-3">
                            {movimientos.bajas.map((b, idx) => (
                                <li key={idx} className="mb-1">
                                    <strong>{b.nombre}</strong> (C.I. {b.ci})
                                    {b.nota && <span className="text-muted ms-1">— Observación: <em>"{b.nota}"</em></span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recuperados */}
                <div className="mb-3">
                    <h6 className="fw-bold text-success mb-2">B. Socios Recuperados ({movimientos.recuperados.length}):</h6>
                    {movimientos.recuperados.length === 0 ? (
                        <p className="small text-muted mb-1">Sin socios recuperados en el período.</p>
                    ) : (
                        <ul className="small mb-1 ps-3">
                            {movimientos.recuperados.map((r, idx) => (
                                <li key={idx} className="mb-1">
                                    <strong>{r.nombre}</strong> (C.I. {r.ci}) — Cobrado en Julio: <strong>{fmtMoney(r.descActual)}</strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Impagos Persistentes */}
                <div className="mb-3">
                    <h6 className="fw-bold text-primary mb-2">C. Socios Mantenidos en Situación de Impago por Falta de Saldo ({movimientos.impagosPersistentes.length}):</h6>
                    {movimientos.impagosPersistentes.length === 0 ? (
                        <p className="small text-muted mb-1">Sin socios impagos persistentes.</p>
                    ) : (
                        <ol className="small mb-1 ps-3">
                            {movimientos.impagosPersistentes.map((imp, idx) => (
                                <li key={idx} className="mb-1">
                                    {imp.nombre} (C.I. {imp.ci}) – Faltante: {fmtMoney(imp.noDescActual)}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>

            {/* Pie de página oficial */}
            <div className="border-top pt-3 mt-5 d-flex justify-content-between text-muted small">
                <span>Círculo Policial San José — Sistema de Descuentos Convenio 514</span>
                <span>Página 1 de 1</span>
            </div>
        </div>
    );
}
