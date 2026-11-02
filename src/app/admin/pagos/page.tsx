'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Container, Row, Col, Card, CardBody, Table, Button,
    Input, Badge, Modal, ModalHeader, ModalBody,
    ModalFooter, Form, FormGroup, Label, Alert, Spinner
} from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import {
    getPeriodoActual,
    formatearPeriodoLargo,
    formatearPeriodoCorto,
    calcularCoberturaPago,
    obtenerProximoMesCobro,
} from '@/lib/periodos';

interface PagoTransferencia {
    id: number;
    cedula: string;
    socio_id: number | null;
    nombre: string;
    socio_cedula?: string | null;
    socio_dv?: string | null;
    socio_email?: string | null;
    socio_telefono?: string | null;
    socio_pagado_hasta?: string | null;
    monto: string | number;
    cantidad_meses: number;
    periodo_desde: string | null;
    periodo_hasta: string | null;
    periodos_detalle: string | null;
    archivo_nombre: string | null;
    archivo_tamano: number | null;
    observaciones: string | null;
    estado: 'pendiente' | 'confirmado' | 'rechazado';
    confirmado_at: string | null;
    created_at: string;
}

interface SocioBrou {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    subcategoria: string | null;
    pagado_hasta: string | null;
    pagos_confirmados_count: number;
    pagos_pendientes_count: number;
    total_abonado: string | number;
    meses_cubiertos: string[];
}

interface ResumenPagos {
    periodoActual: string;
    pendientesConfirmar: number;
    totalSociosBrou: number;
    sociosAlDia: number;
    sociosAdelantados: number;
    sociosCubiertosTotal: number;
    sociosAdeudanMes: number;
    recaudacionTotalConfirmada: number;
    totalCuotasConfirmadas: number;
}

const MESES_CORTOS_HEADER = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function AdminPagosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTab = searchParams.get('tab') === 'cobertura' ? 'cobertura' : 'comprobantes';
    const [activeTab, setActiveTab] = useState<'comprobantes' | 'cobertura'>(initialTab);

    const [pagos, setPagos] = useState<PagoTransferencia[]>([]);
    const [sociosBrou, setSociosBrou] = useState<SocioBrou[]>([]);
    const [periodoActual, setPeriodoActual] = useState<string>(getPeriodoActual());
    const [resumen, setResumen] = useState<ResumenPagos>({
        periodoActual: getPeriodoActual(),
        pendientesConfirmar: 0,
        totalSociosBrou: 0,
        sociosAlDia: 0,
        sociosAdelantados: 0,
        sociosCubiertosTotal: 0,
        sociosAdeudanMes: 0,
        recaudacionTotalConfirmada: 0,
        totalCuotasConfirmadas: 0,
    });

    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info'; message: string } | null>(null);

    // Filtros Pestaña Comprobantes
    const [filtroEstadoPago, setFiltroEstadoPago] = useState<'todos' | 'pendiente' | 'confirmado' | 'rechazado'>('todos');
    const [filtroPeriodoPago, setFiltroPeriodoPago] = useState<string>('');
    const [busquedaPago, setBusquedaPago] = useState<string>('');

    // Filtros Pestaña Cobertura
    const [filtroCobertura, setFiltroCobertura] = useState<'todos' | 'pendientes' | 'cubiertos' | 'adelantados'>('todos');
    const [anioMatriz, setAnioMatriz] = useState<number>(new Date().getFullYear());
    const [busquedaSocio, setBusquedaSocio] = useState<string>('');

    // Estado de procesamiento
    const [procesandoId, setProcesandoId] = useState<number | null>(null);
    const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);

    // Modal de Registrar / Editar Pago
    const [modalPago, setModalPago] = useState(false);
    const [modoEdicionPago, setModoEdicionPago] = useState<PagoTransferencia | null>(null);
    const [formSocioId, setFormSocioId] = useState<string>('');
    const [formCantidadMeses, setFormCantidadMeses] = useState<number>(1);
    const [formPeriodoDesde, setFormPeriodoDesde] = useState<string>(getPeriodoActual());
    const [formMonto, setFormMonto] = useState<string>('140');
    const [formObservaciones, setFormObservaciones] = useState<string>('');
    const [formEstado, setFormEstado] = useState<'confirmado' | 'pendiente'>('confirmado');
    const [guardandoPago, setGuardandoPago] = useState(false);

    const showMsg = (type: 'success' | 'danger' | 'warning' | 'info', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 7000);
    };

    const fetchDatosPagos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/pagos');
            const data = await res.json();
            if (data.success) {
                setPagos(data.pagos || []);
                setSociosBrou(data.sociosBrou || []);
                setPeriodoActual(data.periodoActual || getPeriodoActual());
                if (data.resumen) setResumen(data.resumen);
            } else {
                showMsg('danger', data.error || 'Error al cargar los pagos');
            }
        } catch {
            showMsg('danger', 'Error de red al consultar pagos por transferencia');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchDatosPagos();
    }, [router, fetchDatosPagos]);

    // Confirmar pago en 1 clic
    const handleConfirmarRapido = async (pago: PagoTransferencia) => {
        if (!pago.socio_id) {
            // Si no tiene socio vinculado, abrir modal para elegir a qué socio corresponde
            abrirModalEditarPago(pago);
            return;
        }

        setProcesandoId(pago.id);
        try {
            const res = await fetch('/api/admin/pagos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: pago.id,
                    accion: 'confirmar',
                }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', data.message);
                fetchDatosPagos();
            } else {
                showMsg('danger', data.error || 'Error al confirmar el pago');
            }
        } catch {
            showMsg('danger', 'Error de conexión al confirmar el pago');
        } finally {
            setProcesandoId(null);
        }
    };

    // Rechazar pago
    const handleRechazarPago = async (pago: PagoTransferencia) => {
        const ok = window.confirm(
            `¿Marcar como rechazado el comprobante de ${pago.nombre} por $${pago.monto}?`
        );
        if (!ok) return;

        setProcesandoId(pago.id);
        try {
            const res = await fetch('/api/admin/pagos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: pago.id,
                    accion: 'rechazar',
                }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg('warning', data.message);
                fetchDatosPagos();
            } else {
                showMsg('danger', data.error || 'Error al rechazar');
            }
        } catch {
            showMsg('danger', 'Error de red al rechazar');
        } finally {
            setProcesandoId(null);
        }
    };

    // Eliminar registro de pago
    const handleEliminarPago = async (pago: PagoTransferencia) => {
        const ok = window.confirm(
            `¿Eliminar definitivamente este registro de pago de ${pago.nombre} ($${pago.monto})? Se recalculará su cobertura.`
        );
        if (!ok) return;

        setProcesandoId(pago.id);
        try {
            const res = await fetch(`/api/admin/pagos?id=${pago.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                showMsg('info', data.message);
                fetchDatosPagos();
            } else {
                showMsg('danger', data.error || 'Error al eliminar');
            }
        } catch {
            showMsg('danger', 'Error de red al eliminar');
        } finally {
            setProcesandoId(null);
        }
    };

    // Abrir modal para nuevo pago manual
    const abrirModalNuevoPago = (socioPreseleccionado?: SocioBrou) => {
        setModoEdicionPago(null);
        const targetSocio = socioPreseleccionado || sociosBrou[0] || null;
        setFormSocioId(targetSocio ? String(targetSocio.id) : '');
        setFormCantidadMeses(1);

        const cob = calcularCoberturaPago(targetSocio?.pagado_hasta, 1);
        setFormPeriodoDesde(cob.periodoDesde);
        setFormMonto('140');
        setFormObservaciones('');
        setFormEstado('confirmado');
        setModalPago(true);
    };

    // Abrir modal para editar / confirmar un pago existente
    const abrirModalEditarPago = (pago: PagoTransferencia) => {
        setModoEdicionPago(pago);
        setFormSocioId(pago.socio_id ? String(pago.socio_id) : '');
        const cant = Number(pago.cantidad_meses) || 1;
        setFormCantidadMeses(cant);
        setFormPeriodoDesde(pago.periodo_desde || periodoActual);
        setFormMonto(String(Number(pago.monto) || cant * 140));
        setFormObservaciones(pago.observaciones || '');
        setFormEstado('confirmado');
        setModalPago(true);
    };

    // Cuando cambia el socio en el modal de nuevo pago, sugerir su próximo mes a cubrir
    const handleSelectSocioModal = (nuevoSocioIdStr: string) => {
        setFormSocioId(nuevoSocioIdStr);
        const found = sociosBrou.find(s => String(s.id) === nuevoSocioIdStr);
        if (found && !modoEdicionPago) {
            const cob = calcularCoberturaPago(found.pagado_hasta, formCantidadMeses);
            setFormPeriodoDesde(cob.periodoDesde);
        }
    };

    // Cuando cambia la cantidad de meses en el modal, actualizar el monto automáticamente
    const handleChangeCantidadMesesModal = (nuevaCant: number) => {
        const cant = Math.max(1, Math.min(36, nuevaCant));
        setFormCantidadMeses(cant);
        setFormMonto(String(cant * 140));
    };

    // Guardar pago (Nuevo o Edición/Confirmación)
    const handleGuardarPagoModal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formSocioId) {
            showMsg('warning', 'Por favor seleccioná el socio al que corresponde el pago.');
            return;
        }

        setGuardandoPago(true);
        try {
            if (modoEdicionPago) {
                const res = await fetch('/api/admin/pagos', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: modoEdicionPago.id,
                        accion: formEstado === 'confirmado' ? 'confirmar' : 'editar',
                        socioId: Number(formSocioId),
                        cantidadMeses: formCantidadMeses,
                        periodoDesde: formPeriodoDesde,
                        monto: Number(formMonto),
                        observaciones: formObservaciones,
                        estado: formEstado,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    showMsg('success', data.message);
                    setModalPago(false);
                    fetchDatosPagos();
                } else {
                    showMsg('danger', data.error || 'Error al actualizar el pago');
                }
            } else {
                const res = await fetch('/api/admin/pagos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        socioId: Number(formSocioId),
                        cantidadMeses: formCantidadMeses,
                        periodoDesde: formPeriodoDesde,
                        monto: Number(formMonto),
                        observaciones: formObservaciones,
                        estado: formEstado,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    showMsg('success', data.message);
                    setModalPago(false);
                    fetchDatosPagos();
                } else {
                    showMsg('danger', data.error || 'Error al registrar el pago');
                }
            }
        } catch {
            showMsg('danger', 'Error de red al guardar el pago');
        } finally {
            setGuardandoPago(false);
        }
    };

    // Enviar recordatorios inteligentes (solo a quienes adeudan el mes actual)
    const handleEnviarRecordatoriosPendientes = async () => {
        const confirmar = window.confirm(
            `¿Enviar recordatorio de cuota ($140) por email a los socios de transferencia que aún NO tienen cubierto ${formatearPeriodoLargo(periodoActual)}?\n\n` +
            `ℹ️ Los socios que ya pagaron este mes o tienen meses adelantados (${resumen.sociosCubiertosTotal} socios) serán omitidos automáticamente.`
        );
        if (!confirmar) return;

        setEnviandoRecordatorios(true);
        try {
            const res = await fetch('/api/admin/socios/recordatorio-cuotas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.success) {
                showMsg(data.count > 0 ? 'success' : 'info', data.message);
            } else {
                showMsg('danger', data.error || 'Error al enviar recordatorios');
            }
        } catch {
            showMsg('danger', 'Error de red al enviar recordatorios');
        } finally {
            setEnviandoRecordatorios(false);
        }
    };

    // Enviar recordatorio individual
    const handleEnviarRecordatorioIndividual = async (socio: SocioBrou) => {
        if (!socio.email) {
            showMsg('warning', `El socio ${socio.nombre} no tiene correo electrónico registrado.`);
            return;
        }
        const ok = window.confirm(
            `¿Enviar recordatorio de cuota ($140) por email a ${socio.nombre} (${socio.email})?`
        );
        if (!ok) return;

        setEnviandoRecordatorios(true);
        try {
            const res = await fetch('/api/admin/socios/recordatorio-cuotas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socioId: socio.id }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', data.message);
            } else {
                showMsg('danger', data.error || 'Error al enviar recordatorio');
            }
        } catch {
            showMsg('danger', 'Error de red');
        } finally {
            setEnviandoRecordatorios(false);
        }
    };

    // Filtrado de pagos
    const pagosFiltrados = pagos.filter((p) => {
        if (filtroEstadoPago !== 'todos' && p.estado !== filtroEstadoPago) return false;
        if (filtroPeriodoPago) {
            const desde = p.periodo_desde || '';
            const hasta = p.periodo_hasta || '';
            const creacion = p.created_at ? p.created_at.slice(0, 7) : '';
            if (!(desde <= filtroPeriodoPago && hasta >= filtroPeriodoPago) && creacion !== filtroPeriodoPago) {
                return false;
            }
        }
        if (busquedaPago.trim()) {
            const q = busquedaPago.toLowerCase();
            const matchNombre = (p.nombre || '').toLowerCase().includes(q);
            const matchCi = (p.cedula || '').toLowerCase().includes(q) || (p.socio_cedula || '').toLowerCase().includes(q);
            if (!matchNombre && !matchCi) return false;
        }
        return true;
    });

    // Filtrado de socios en la matriz de cobertura
    const sociosFiltrados = sociosBrou.filter((s) => {
        if (filtroCobertura === 'pendientes' && s.pagado_hasta && s.pagado_hasta >= periodoActual) return false;
        if (filtroCobertura === 'cubiertos' && (!s.pagado_hasta || s.pagado_hasta < periodoActual)) return false;
        if (filtroCobertura === 'adelantados' && (!s.pagado_hasta || s.pagado_hasta <= periodoActual)) return false;

        if (busquedaSocio.trim()) {
            const q = busquedaSocio.toLowerCase();
            const matchNombre = (s.nombre || '').toLowerCase().includes(q);
            const matchCi = (s.cedula || '').toLowerCase().includes(q);
            if (!matchNombre && !matchCi) return false;
        }
        return true;
    });

    // Vista previa del rango en el modal
    const previewCoberturaModal = calcularCoberturaPago(null, formCantidadMeses, formPeriodoDesde);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <AdminHeader
                titulo="Gestión de Pagos por Transferencia BROU"
                subtitulo="Acreditación de cuotas, matriz de cobertura anual y rendiciones oficiales para la Directiva"
                acciones={
                    <>
                        <Button
                            color="success"
                            size="sm"
                            className="fw-bold shadow-sm"
                            onClick={() => abrirModalNuevoPago()}
                        >
                            + Registrar Pago BROU
                        </Button>

                        <Button
                            color="primary"
                            size="sm"
                            className="fw-bold text-white shadow-sm"
                            style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                            onClick={handleEnviarRecordatoriosPendientes}
                            disabled={enviandoRecordatorios}
                            title="Envía recordatorio solo a quienes NO tienen cubierto el mes actual"
                        >
                            {enviandoRecordatorios ? 'Enviando...' : '✉️ Enviar Recordatorio a Pendientes'}
                        </Button>

                        <Button
                            color="warning"
                            size="sm"
                            className="fw-bold text-dark shadow-sm"
                            onClick={() => {
                                const params = new URLSearchParams();
                                params.set('estado', filtroEstadoPago === 'todos' ? 'confirmado' : filtroEstadoPago);
                                if (filtroPeriodoPago) params.set('periodo', filtroPeriodoPago);
                                window.open(`/api/admin/pagos/exportar?${params.toString()}`, '_blank');
                            }}
                            title="Descargar planilla Excel detallada para presentar a la Comisión Directiva"
                        >
                            📊 Exportar Excel
                        </Button>

                        <Button
                            color="danger"
                            size="sm"
                            className="fw-bold text-white shadow-sm"
                            style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (filtroPeriodoPago) params.set('periodo', filtroPeriodoPago);
                                params.set('auto', '1');
                                window.open(`/admin/pagos/imprimir?${params.toString()}`, '_blank');
                            }}
                            title="Exportar informe formal en PDF para la Comisión Directiva"
                        >
                            📄 Exportar PDF
                        </Button>
                    </>
                }
            />

            <Container fluid="xl" className="py-4 px-3 px-md-4">
                {alert && (
                    <Alert color={alert.type} className="mb-4 shadow-sm fw-semibold" style={{ borderRadius: '0.8rem' }}>
                        {alert.message}
                    </Alert>
                )}

                {/* Tarjetas de Resumen Contable y de Cobertura */}
                <Row className="g-3 mb-4">
                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{
                                borderRadius: '1rem',
                                borderLeft: `5px solid ${resumen.pendientesConfirmar > 0 ? '#F59E0B' : '#10B981'}`,
                                backgroundColor: resumen.pendientesConfirmar > 0 ? '#FFFBEB' : '#FFFFFF',
                                cursor: 'pointer',
                            }}
                            onClick={() => {
                                setActiveTab('comprobantes');
                                setFiltroEstadoPago(resumen.pendientesConfirmar > 0 ? 'pendiente' : 'todos');
                            }}
                        >
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-muted text-uppercase">Por Confirmar</span>
                                    <Badge color={resumen.pendientesConfirmar > 0 ? 'warning' : 'success'} pill className="text-dark">
                                        {resumen.pendientesConfirmar > 0 ? 'Requiere Acción' : 'Al día'}
                                    </Badge>
                                </div>
                                <div className="h3 fw-bold mb-1" style={{ color: resumen.pendientesConfirmar > 0 ? '#B45309' : '#0F172A' }}>
                                    {loading ? '...' : resumen.pendientesConfirmar}
                                </div>
                                <div className="small text-muted">
                                    Comprobantes web esperando tu OK
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ borderRadius: '1rem', borderLeft: '5px solid #10B981', cursor: 'pointer' }}
                            onClick={() => {
                                setActiveTab('cobertura');
                                setFiltroCobertura('cubiertos');
                            }}
                        >
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-muted text-uppercase">Cubiertos ({formatearPeriodoCorto(periodoActual)})</span>
                                    <Badge color="success" pill>Exentos de Aviso</Badge>
                                </div>
                                <div className="h3 fw-bold text-success mb-1">
                                    {loading ? '...' : `${resumen.sociosCubiertosTotal} / ${resumen.totalSociosBrou}`}
                                </div>
                                <div className="small text-muted">
                                    {resumen.sociosAlDia} mes actual • <strong>{resumen.sociosAdelantados} adelantados (2+ meses)</strong>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ borderRadius: '1rem', borderLeft: '5px solid #EF4444', cursor: 'pointer' }}
                            onClick={() => {
                                setActiveTab('cobertura');
                                setFiltroCobertura('pendientes');
                            }}
                        >
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-muted text-uppercase">Pendientes del Mes</span>
                                    <Badge color="danger" pill>Reciben Email</Badge>
                                </div>
                                <div className="h3 fw-bold text-danger mb-1">
                                    {loading ? '...' : resumen.sociosAdeudanMes}
                                </div>
                                <div className="small text-muted">
                                    Socios que aún no cubrieron {formatearPeriodoCorto(periodoActual)}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xs={12} sm={6} lg={3}>
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.azul}` }}
                        >
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-muted text-uppercase">Recaudación BROU</span>
                                    <Badge color="primary" pill>{resumen.totalCuotasConfirmadas} cuotas</Badge>
                                </div>
                                <div className="h3 fw-bold mb-1" style={{ color: artiguistaColors.azul }}>
                                    ${loading ? '...' : resumen.recaudacionTotalConfirmada.toLocaleString('es-UY')}
                                </div>
                                <div className="small text-muted">
                                    Total confirmado en transferencias
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Selector de Pestañas */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div className="btn-group shadow-sm p-1 bg-white rounded-pill border" role="group">
                        <button
                            type="button"
                            className={`btn rounded-pill px-3 px-md-4 py-2 fw-bold ${
                                activeTab === 'comprobantes' ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'
                            }`}
                            onClick={() => setActiveTab('comprobantes')}
                        >
                            📥 Comprobantes y Pagos Recibidos ({pagos.length})
                            {resumen.pendientesConfirmar > 0 && (
                                <Badge color="warning" pill className="ms-2 text-dark">
                                    {resumen.pendientesConfirmar} pendientes
                                </Badge>
                            )}
                        </button>
                        <button
                            type="button"
                            className={`btn rounded-pill px-3 px-md-4 py-2 fw-bold ${
                                activeTab === 'cobertura' ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'
                            }`}
                            onClick={() => setActiveTab('cobertura')}
                        >
                            🗓️ Tabla de Cobertura y Vencimientos ({sociosBrou.length} socios BROU)
                        </button>
                    </div>

                    <div className="small text-muted">
                        Período en curso: <strong className="text-dark">{formatearPeriodoLargo(periodoActual)}</strong>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* PESTAÑA 1: BANDEJA DE COMPROBANTES E HISTORIAL DE PAGOS                   */}
                {/* ========================================================================= */}
                {activeTab === 'comprobantes' && (
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                        <CardBody className="p-4">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <span className="small fw-bold text-muted me-1">Estado:</span>
                                    <Button
                                        size="sm"
                                        color={filtroEstadoPago === 'todos' ? 'dark' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroEstadoPago('todos')}
                                    >
                                        Todos ({pagos.length})
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={filtroEstadoPago === 'pendiente' ? 'warning' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroEstadoPago('pendiente')}
                                    >
                                        ⏳ Pendientes de Confirmar ({pagos.filter(p => p.estado === 'pendiente').length})
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={filtroEstadoPago === 'confirmado' ? 'success' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroEstadoPago('confirmado')}
                                    >
                                        ✅ Confirmados ({pagos.filter(p => p.estado === 'confirmado').length})
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={filtroEstadoPago === 'rechazado' ? 'danger' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroEstadoPago('rechazado')}
                                    >
                                        ❌ Rechazados ({pagos.filter(p => p.estado === 'rechazado').length})
                                    </Button>
                                </div>

                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <Input
                                        type="month"
                                        bsSize="sm"
                                        value={filtroPeriodoPago}
                                        onChange={(e) => setFiltroPeriodoPago(e.target.value)}
                                        style={{ width: '160px' }}
                                        title="Filtrar por mes cubierto o mes de pago"
                                    />
                                    {filtroPeriodoPago && (
                                        <Button size="sm" color="link" className="p-0 text-decoration-none" onClick={() => setFiltroPeriodoPago('')}>
                                            Limpiar mes
                                        </Button>
                                    )}
                                    <Input
                                        type="search"
                                        bsSize="sm"
                                        placeholder="Buscar por socio o cédula..."
                                        value={busquedaPago}
                                        onChange={(e) => setBusquedaPago(e.target.value)}
                                        style={{ width: '220px' }}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner color="primary" />
                                    <p className="text-muted mt-2 mb-0">Cargando comprobantes y transferencias...</p>
                                </div>
                            ) : pagosFiltrados.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-3 border">
                                    <p className="text-muted mb-2">
                                        No hay registros de pagos por transferencia que coincidan con el filtro seleccionado.
                                    </p>
                                    <Button color="primary" size="sm" onClick={() => abrirModalNuevoPago()}>
                                        + Registrar un Pago Manualmente
                                    </Button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Socio / Cédula</th>
                                                <th className="text-center">Cuotas</th>
                                                <th>Períodos Cubiertos</th>
                                                <th className="text-end">Importe</th>
                                                <th>Detalle / Comprobante</th>
                                                <th className="text-center">Estado</th>
                                                <th className="text-end">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagosFiltrados.map((p) => {
                                                const fechaStr = p.created_at
                                                    ? new Date(p.created_at).toLocaleDateString('es-UY', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '—';
                                                const ciMostrar = p.socio_cedula
                                                    ? `${p.socio_cedula}-${p.socio_dv || ''}`
                                                    : p.cedula;
                                                const cant = Number(p.cantidad_meses) || 1;

                                                return (
                                                    <tr
                                                        key={p.id}
                                                        style={{
                                                            backgroundColor: p.estado === 'pendiente' ? '#FFFBEB' : undefined,
                                                        }}
                                                    >
                                                        <td className="small text-muted text-nowrap">{fechaStr}</td>
                                                        <td>
                                                            <div className="fw-bold text-dark">{p.nombre}</div>
                                                            <div className="small text-muted font-monospace">C.I. {ciMostrar}</div>
                                                            {!p.socio_id && (
                                                                <Badge color="danger" className="mt-1">
                                                                    Sin vincular a padrón
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge
                                                                color={cant > 1 ? 'primary' : 'secondary'}
                                                                pill
                                                                className="px-2 py-1"
                                                            >
                                                                {cant} {cant === 1 ? 'mes' : 'meses'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="fw-semibold text-dark small">
                                                                {p.periodos_detalle || formatearPeriodoCorto(p.periodo_desde)}
                                                            </div>
                                                            {p.periodo_hasta && (
                                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                    Cubre hasta: <strong>{formatearPeriodoLargo(p.periodo_hasta)}</strong>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-end fw-bold text-success text-nowrap">
                                                            $ {Number(p.monto).toLocaleString('es-UY')}
                                                        </td>
                                                        <td style={{ maxWidth: '220px' }}>
                                                            {p.archivo_nombre && (
                                                                <div className="small text-muted text-truncate" title={p.archivo_nombre}>
                                                                    📎 {p.archivo_nombre}
                                                                </div>
                                                            )}
                                                            {p.observaciones && (
                                                                <div className="small text-dark fst-italic text-truncate" title={p.observaciones}>
                                                                    &ldquo;{p.observaciones}&rdquo;
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {p.estado === 'pendiente' && (
                                                                <Badge color="warning" className="text-dark px-2 py-1">
                                                                    ⏳ Pendiente de Confirmar
                                                                </Badge>
                                                            )}
                                                            {p.estado === 'confirmado' && (
                                                                <Badge color="success" className="px-2 py-1">
                                                                    ✅ Confirmado
                                                                </Badge>
                                                            )}
                                                            {p.estado === 'rechazado' && (
                                                                <Badge color="danger" className="px-2 py-1">
                                                                    ❌ Rechazado
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="text-end text-nowrap">
                                                            <div className="d-inline-flex gap-1">
                                                                {p.estado === 'pendiente' && (
                                                                    <Button
                                                                        color="success"
                                                                        size="sm"
                                                                        className="fw-bold shadow-sm"
                                                                        disabled={procesandoId === p.id}
                                                                        onClick={() => handleConfirmarRapido(p)}
                                                                        title="Confirmar pago y acreditar meses en la ficha del socio"
                                                                    >
                                                                        ✓ Confirmar
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    color="outline-primary"
                                                                    size="sm"
                                                                    disabled={procesandoId === p.id}
                                                                    onClick={() => abrirModalEditarPago(p)}
                                                                    title="Editar cantidad de meses, período o monto"
                                                                >
                                                                    ✏️ Editar
                                                                </Button>
                                                                {p.estado === 'pendiente' ? (
                                                                    <Button
                                                                        color="outline-danger"
                                                                        size="sm"
                                                                        disabled={procesandoId === p.id}
                                                                        onClick={() => handleRechazarPago(p)}
                                                                        title="Rechazar comprobante"
                                                                    >
                                                                        ✕
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        color="outline-danger"
                                                                        size="sm"
                                                                        disabled={procesandoId === p.id}
                                                                        onClick={() => handleEliminarPago(p)}
                                                                        title="Eliminar registro"
                                                                    >
                                                                        🗑️
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* ========================================================================= */}
                {/* PESTAÑA 2: MATRIZ DE COBERTURA Y VENCIMIENTOS DE SOCIOS BROU              */}
                {/* ========================================================================= */}
                {activeTab === 'cobertura' && (
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                        <CardBody className="p-4">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <span className="small fw-bold text-muted me-1">Filtrar cobertura:</span>
                                    <Button
                                        size="sm"
                                        color={filtroCobertura === 'todos' ? 'dark' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroCobertura('todos')}
                                    >
                                        Todos ({sociosBrou.length})
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={filtroCobertura === 'pendientes' ? 'danger' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroCobertura('pendientes')}
                                    >
                                        🔴 Adeudan {formatearPeriodoCorto(periodoActual)} ({resumen.sociosAdeudanMes})
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={filtroCobertura === 'cubiertos' ? 'success' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroCobertura('cubiertos')}
                                    >
                                        🟢 Cubiertos ({resumen.sociosCubiertosTotal})
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={filtroCobertura === 'adelantados' ? 'primary' : 'light'}
                                        className="rounded-pill px-3 fw-semibold border"
                                        onClick={() => setFiltroCobertura('adelantados')}
                                    >
                                        🔵 Con Meses Adelantados ({resumen.sociosAdelantados})
                                    </Button>
                                </div>

                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <div className="d-flex align-items-center gap-1 bg-light border rounded px-2 py-1">
                                        <span className="small text-muted fw-bold">Año Grilla:</span>
                                        <Button
                                            size="sm"
                                            color={anioMatriz === 2026 ? 'primary' : 'light'}
                                            className="py-0 px-2"
                                            onClick={() => setAnioMatriz(2026)}
                                        >
                                            2026
                                        </Button>
                                        <Button
                                            size="sm"
                                            color={anioMatriz === 2027 ? 'primary' : 'light'}
                                            className="py-0 px-2"
                                            onClick={() => setAnioMatriz(2027)}
                                        >
                                            2027
                                        </Button>
                                    </div>

                                    <Input
                                        type="search"
                                        bsSize="sm"
                                        placeholder="Buscar socio o cédula..."
                                        value={busquedaSocio}
                                        onChange={(e) => setBusquedaSocio(e.target.value)}
                                        style={{ width: '210px' }}
                                    />
                                </div>
                            </div>

                            <div className="alert alert-info py-2 px-3 small mb-3 border-0" style={{ backgroundColor: '#EFF6FF', color: '#1E3A8A' }}>
                                💡 <strong>Control inteligente de recordatorios:</strong> Si un socio paga 2 o 3 meses juntos, sus casillas quedan marcadas en verde y el sistema <strong>no le enviará correos automáticos</strong> hasta que llegue el mes que figura en la columna <em>&ldquo;Próximo Aviso&rdquo;</em>.
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner color="primary" />
                                </div>
                            ) : sociosFiltrados.length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-3 border">
                                    <p className="text-muted mb-0">No se encontraron socios con ese filtro.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table bordered hover size="sm" className="align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Socio / Cédula</th>
                                                {MESES_CORTOS_HEADER.map((m, idx) => {
                                                    const perCol = `${anioMatriz}-${String(idx + 1).padStart(2, '0')}`;
                                                    const esMesActual = perCol === periodoActual;
                                                    return (
                                                        <th
                                                            key={m}
                                                            className="text-center"
                                                            style={{
                                                                width: '44px',
                                                                backgroundColor: esMesActual ? '#DBEAFE' : undefined,
                                                                color: esMesActual ? '#1E40AF' : undefined,
                                                                fontSize: '0.78rem',
                                                            }}
                                                            title={`${m} ${anioMatriz}${esMesActual ? ' (Mes Actual)' : ''}`}
                                                        >
                                                            {m}
                                                        </th>
                                                    );
                                                })}
                                                <th className="text-center">Cubierto Hasta</th>
                                                <th className="text-center">Próximo Aviso Email</th>
                                                <th className="text-end">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sociosFiltrados.map((s) => {
                                                const pagadoHasta = s.pagado_hasta || null;
                                                const esAdelantado = pagadoHasta && pagadoHasta > periodoActual;
                                                const esAlDia = pagadoHasta === periodoActual;
                                                const proximoCobro = obtenerProximoMesCobro(pagadoHasta);

                                                return (
                                                    <tr key={s.id}>
                                                        <td>
                                                            <div className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                                                                {s.nombre}
                                                            </div>
                                                            <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                                                                {s.cedula}-{s.digito_verificador}
                                                                {s.email ? ` • ${s.email}` : ''}
                                                            </div>
                                                        </td>

                                                        {MESES_CORTOS_HEADER.map((m, idx) => {
                                                            const perCol = `${anioMatriz}-${String(idx + 1).padStart(2, '0')}`;
                                                            const cubierto =
                                                                (s.meses_cubiertos && s.meses_cubiertos.includes(perCol)) ||
                                                                (pagadoHasta && perCol <= pagadoHasta && perCol >= '2026-10');
                                                            const esMesActual = perCol === periodoActual;

                                                            return (
                                                                <td
                                                                    key={perCol}
                                                                    className="text-center"
                                                                    style={{
                                                                        backgroundColor: cubierto
                                                                            ? '#DCFCE7'
                                                                            : esMesActual
                                                                            ? '#FEF2F2'
                                                                            : undefined,
                                                                        fontWeight: 'bold',
                                                                    }}
                                                                    title={
                                                                        cubierto
                                                                            ? `${m} ${anioMatriz}: PAGADO`
                                                                            : `${m} ${anioMatriz}: Sin pago registrado`
                                                                    }
                                                                >
                                                                    {cubierto ? (
                                                                        <span style={{ color: '#15803D', fontSize: '0.95rem' }}>✓</span>
                                                                    ) : (
                                                                        <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>•</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}

                                                        <td className="text-center">
                                                            {esAdelantado && (
                                                                <Badge color="primary" pill className="px-2 py-1">
                                                                    🔵 {formatearPeriodoCorto(pagadoHasta)}
                                                                </Badge>
                                                            )}
                                                            {esAlDia && (
                                                                <Badge color="success" pill className="px-2 py-1">
                                                                    🟢 {formatearPeriodoCorto(pagadoHasta)}
                                                                </Badge>
                                                            )}
                                                            {!esAdelantado && !esAlDia && (
                                                                <Badge color="danger" pill className="px-2 py-1">
                                                                    🔴 {pagadoHasta ? formatearPeriodoCorto(pagadoHasta) : 'Pendiente'}
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        <td className="text-center small">
                                                            <span
                                                                className={
                                                                    proximoCobro > periodoActual
                                                                        ? 'text-primary fw-bold'
                                                                        : 'text-danger fw-semibold'
                                                                }
                                                            >
                                                                {formatearPeriodoLargo(proximoCobro)}
                                                            </span>
                                                        </td>

                                                        <td className="text-end text-nowrap">
                                                            <div className="d-inline-flex gap-1">
                                                                <Button
                                                                    color="success"
                                                                    size="sm"
                                                                    className="py-0 px-2 fw-bold"
                                                                    onClick={() => abrirModalNuevoPago(s)}
                                                                    title="Acreditar 1, 2 o más meses de pago a este socio"
                                                                >
                                                                    + Acreditar
                                                                </Button>
                                                                {s.email && (
                                                                    <Button
                                                                        color="outline-primary"
                                                                        size="sm"
                                                                        className="py-0 px-2"
                                                                        onClick={() => handleEnviarRecordatorioIndividual(s)}
                                                                        disabled={enviandoRecordatorios}
                                                                        title={`Enviar recordatorio individual a ${s.email}`}
                                                                    >
                                                                        📧
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}
            </Container>

            {/* ========================================================================= */}
            {/* MODAL: REGISTRAR / CONFIRMAR / EDITAR PAGO POR TRANSFERENCIA              */}
            {/* ========================================================================= */}
            <Modal isOpen={modalPago} toggle={() => setModalPago(!modalPago)} centered>
                <Form onSubmit={handleGuardarPagoModal}>
                    <ModalHeader toggle={() => setModalPago(!modalPago)}>
                        {modoEdicionPago
                            ? `Confirmar / Editar Pago #${modoEdicionPago.id}`
                            : 'Registrar Pago por Transferencia BROU'}
                    </ModalHeader>
                    <ModalBody>
                        <FormGroup className="mb-3">
                            <Label className="fw-bold small">Socio *</Label>
                            <Input
                                type="select"
                                value={formSocioId}
                                onChange={(e) => handleSelectSocioModal(e.target.value)}
                                required
                            >
                                <option value="">— Seleccionar socio —</option>
                                {sociosBrou.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre} (C.I. {s.cedula}-{s.digito_verificador})
                                        {s.pagado_hasta ? ` — Cubierto hasta ${formatearPeriodoCorto(s.pagado_hasta)}` : ''}
                                    </option>
                                ))}
                            </Input>
                        </FormGroup>

                        <Row className="g-3 mb-3">
                            <Col xs={6}>
                                <FormGroup className="mb-0">
                                    <Label className="fw-bold small">Cantidad de Meses *</Label>
                                    <Input
                                        type="select"
                                        value={formCantidadMeses}
                                        onChange={(e) => handleChangeCantidadMesesModal(Number(e.target.value))}
                                    >
                                        <option value={1}>1 mes ($ 140)</option>
                                        <option value={2}>2 meses ($ 280)</option>
                                        <option value={3}>3 meses ($ 420)</option>
                                        <option value={4}>4 meses ($ 560)</option>
                                        <option value={5}>5 meses ($ 700)</option>
                                        <option value={6}>6 meses ($ 840)</option>
                                        <option value={12}>12 meses ($ 1.680)</option>
                                    </Input>
                                </FormGroup>
                            </Col>

                            <Col xs={6}>
                                <FormGroup className="mb-0">
                                    <Label className="fw-bold small">Mes de Inicio *</Label>
                                    <Input
                                        type="month"
                                        value={formPeriodoDesde}
                                        onChange={(e) => setFormPeriodoDesde(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Resumen automático de cobertura */}
                        <div className="p-3 rounded-3 mb-3 border" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
                            <div className="small text-success fw-bold mb-1">
                                📅 Períodos que quedarán cubiertos:
                            </div>
                            <div className="fw-bold text-dark">
                                {previewCoberturaModal.periodosDetalle}
                            </div>
                            <div className="small text-muted mt-1">
                                El socio no recibirá correos de recordatorio hasta:{' '}
                                <strong>{formatearPeriodoLargo(obtenerProximoMesCobro(previewCoberturaModal.periodoHasta))}</strong>
                            </div>
                        </div>

                        <Row className="g-3 mb-3">
                            <Col xs={6}>
                                <FormGroup className="mb-0">
                                    <Label className="fw-bold small">Monto Total ($ UYU) *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formMonto}
                                        onChange={(e) => setFormMonto(e.target.value)}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={6}>
                                <FormGroup className="mb-0">
                                    <Label className="fw-bold small">Estado del Pago</Label>
                                    <Input
                                        type="select"
                                        value={formEstado}
                                        onChange={(e) => setFormEstado(e.target.value as 'confirmado' | 'pendiente')}
                                    >
                                        <option value="confirmado">✅ Confirmado (Acreditar)</option>
                                        <option value="pendiente">⏳ Pendiente de Confirmar</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>

                        <FormGroup className="mb-0">
                            <Label className="fw-bold small">Observaciones / N° Comprobante</Label>
                            <Input
                                type="textarea"
                                rows={2}
                                placeholder="Ej: Transferencia BROU verificada..."
                                value={formObservaciones}
                                onChange={(e) => setFormObservaciones(e.target.value)}
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" outline onClick={() => setModalPago(false)} disabled={guardandoPago}>
                            Cancelar
                        </Button>
                        <Button color="success" type="submit" className="fw-bold px-4" disabled={guardandoPago}>
                            {guardandoPago
                                ? 'Guardando...'
                                : formEstado === 'confirmado'
                                ? '✓ Confirmar y Acreditar Meses'
                                : 'Guardar como Pendiente'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
}

export default function AdminPagosPage() {
    return (
        <Suspense fallback={<div className="p-5 text-center">Cargando panel de pagos BROU...</div>}>
            <AdminPagosContent />
        </Suspense>
    );
}
