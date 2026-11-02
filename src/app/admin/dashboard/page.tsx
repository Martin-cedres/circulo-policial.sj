'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Row, Col, Card, CardBody, Button, Alert, Modal, ModalHeader, ModalBody, Table, Badge, Collapse } from 'reactstrap';
import AdminHeader from '@/components/admin/AdminHeader';
import { artiguistaColors } from '@/styles/colors';

interface DiscrepanciaSocio {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalSocios: 220,
        sociosHaberes: 103,
        sociosExternos: 89,
        escuelaCount: 28,
        tanda1Count: 16,
        tanda2Count: 12,
        bajasCount: 4,
        haberesLiquidadosCount: 103,
        recaudacionHaberes: 14420,
        recaudacionExternosHipotetica: 12460,
        recaudacionTotalEstimada: 26880,
        sociosHaberesSinPresupuestoCount: 0,
        sociosHaberesSinPresupuestoList: [] as DiscrepanciaSocio[]
    });

    const [visitStats, setVisitStats] = useState({
        hoy: 0,
        mes: 0,
        anio: 0,
        totalHistorico: 0,
        historial: [] as { fecha: string; visitas: number }[]
    });

    const [pendientesPagos, setPendientesPagos] = useState<number>(0);
    const [pendientesSolicitudes, setPendientesSolicitudes] = useState<number>(0);
    const [recaudacionBrouReal, setRecaudacionBrouReal] = useState<number>(0);
    const [mostrarHistoricoPadron, setMostrarHistoricoPadron] = useState<boolean>(false);
    const [mostrarHistorialVisitas, setMostrarHistorialVisitas] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalDiscrepancias, setModalDiscrepancias] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }

        // Cargar estadísticas consolidadas en paralelo
        Promise.all([
            fetch('/api/admin/descuentos/estadisticas').then(r => r.json()).catch(() => null),
            fetch('/api/admin/visitas/estadisticas').then(r => r.json()).catch(() => null),
            fetch('/api/admin/pagos').then(r => r.json()).catch(() => null),
            fetch('/api/admin/socios/solicitudes?filtro=pendientes').then(r => r.json()).catch(() => null),
        ])
            .then(([descuentosData, visitasData, pagosData, solsData]) => {
                if (descuentosData?.success) {
                    setStats(prev => ({ ...prev, ...descuentosData.estadisticas }));
                }
                if (visitasData?.success) {
                    setVisitStats(visitasData.estadisticas);
                }
                if (pagosData?.success && pagosData.resumen) {
                    setPendientesPagos(pagosData.resumen.pendientesConfirmar || 0);
                    setRecaudacionBrouReal(pagosData.resumen.recaudacionTotalConfirmada || 0);
                }
                if (solsData?.success && Array.isArray(solsData.solicitudes)) {
                    setPendientesSolicitudes(solsData.solicitudes.length);
                }
            })
            .catch(err => console.error('Error cargando estadísticas del dashboard:', err))
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Header y Barra de Navegación Unificada */}
            <AdminHeader 
                titulo="Panel de Gestión y Control"
                subtitulo="Círculo Policial San José • Acceso Rápido y Métricas Institucionales"
                acciones={
                    <div className="d-flex gap-2">
                        <Button
                            color="success"
                            size="sm"
                            className="fw-bold shadow-sm"
                            onClick={() => router.push('/admin/pagos')}
                        >
                            + Registrar Pago BROU
                        </Button>
                        <Button
                            color="primary"
                            size="sm"
                            className="fw-bold shadow-sm text-white"
                            style={{ backgroundColor: '#002B49', borderColor: '#002B49' }}
                            onClick={() => router.push('/admin/socios')}
                        >
                            + Nuevo Socio
                        </Button>
                    </div>
                }
            />

            <Container fluid="xl" className="py-4 px-3 px-md-4">
                {/* 1. BANDEJA DE ATENCIÓN Y ALERTAS PRIORITARIAS */}
                {(pendientesPagos > 0 || pendientesSolicitudes > 0 || stats.sociosHaberesSinPresupuestoCount > 0) && (
                    <div className="mb-4 d-flex flex-column gap-2">
                        {pendientesPagos > 0 && (
                            <Alert
                                color="warning"
                                className="border-0 shadow-sm mb-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
                                style={{ borderRadius: '0.75rem', backgroundColor: '#FEF3C7', color: '#92400E' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-5">🏦</span>
                                    <div>
                                        <strong>Transferencias BROU Pendientes:</strong> Hay{' '}
                                        <Badge color="danger" pill className="px-2 py-1">
                                            {pendientesPagos} comprobantes
                                        </Badge>{' '}
                                        esperando verificación y confirmación contable.
                                    </div>
                                </div>
                                <Button
                                    color="dark"
                                    size="sm"
                                    className="fw-bold px-3 py-1"
                                    onClick={() => router.push('/admin/pagos')}
                                >
                                    Revisar y Confirmar →
                                </Button>
                            </Alert>
                        )}

                        {pendientesSolicitudes > 0 && (
                            <Alert
                                color="info"
                                className="border-0 shadow-sm mb-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
                                style={{ borderRadius: '0.75rem', backgroundColor: '#E0F2FE', color: '#075985' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-5">📝</span>
                                    <div>
                                        <strong>Nuevas Solicitudes Web:</strong> Hay{' '}
                                        <Badge color="primary" pill className="px-2 py-1">
                                            {pendientesSolicitudes} postulaciones
                                        </Badge>{' '}
                                        de afiliación web pendientes de aprobación para dar de alta.
                                    </div>
                                </div>
                                <Button
                                    color="primary"
                                    size="sm"
                                    className="fw-bold px-3 py-1"
                                    onClick={() => router.push('/admin/socios?tab=solicitudes')}
                                >
                                    Ver Solicitudes →
                                </Button>
                            </Alert>
                        )}

                        {!loading && stats.sociosHaberesSinPresupuestoCount > 0 && (
                            <Alert
                                color="danger"
                                className="border-0 shadow-sm mb-0 d-flex justify-content-between align-items-center flex-wrap gap-2"
                                style={{ borderRadius: '0.75rem', backgroundColor: '#FEE2E2', color: '#991B1B' }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fs-5">⚠️</span>
                                    <div>
                                        <strong>Discrepancia en Presupuesto Jefatura:</strong> Hay{' '}
                                        <strong>{stats.sociosHaberesSinPresupuestoCount} socios activos</strong> que no están en el último presupuesto.
                                    </div>
                                </div>
                                <Button
                                    color="danger"
                                    size="sm"
                                    className="fw-bold px-3 py-1"
                                    onClick={() => setModalDiscrepancias(true)}
                                >
                                    Auditar Discrepancias →
                                </Button>
                            </Alert>
                        )}
                    </div>
                )}

                {/* 2. TARJETAS DE MÉTRICAS CLAVE (Consolidadas y limpias) */}
                <Row className="g-3 mb-4">
                    {/* Socios Activos */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '0.85rem', borderLeft: '5px solid #002B49' }}>
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>
                                        Padrón Activo
                                    </span>
                                    <span className="fs-4">👥</span>
                                </div>
                                <div className="h3 fw-bold mb-1 text-dark">
                                    {loading ? '...' : stats.totalSocios} <small className="fs-6 text-muted fw-normal">socios</small>
                                </div>
                                <div className="small text-muted" style={{ fontSize: '12px' }}>
                                    <strong>{stats.sociosHaberes}</strong> haberes &bull; <strong>{stats.sociosExternos}</strong> externos/EDP
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Jefatura Haberes */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '0.85rem', borderLeft: '5px solid #16A34A' }}>
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="small fw-bold text-success text-uppercase" style={{ fontSize: '11px' }}>
                                        Jefatura (Código 514)
                                    </span>
                                    <span className="fs-4">🏛️</span>
                                </div>
                                <div className="h3 fw-bold mb-1 text-success">
                                    ${loading ? '...' : stats.recaudacionHaberes.toLocaleString('es-UY')}
                                </div>
                                <div className="small text-muted" style={{ fontSize: '12px' }}>
                                    {stats.haberesLiquidadosCount} socios en liquidación mensual
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Transferencias BROU */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '0.85rem', borderLeft: '5px solid #2563EB' }}>
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="small fw-bold text-primary text-uppercase" style={{ fontSize: '11px' }}>
                                        Transferencias BROU
                                    </span>
                                    <span className="fs-4">🏦</span>
                                </div>
                                <div className="h3 fw-bold mb-1 text-primary">
                                    ${loading ? '...' : recaudacionBrouReal.toLocaleString('es-UY')}
                                </div>
                                <div className="small text-muted" style={{ fontSize: '12px' }}>
                                    Recaudado y acreditado en cuenta
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Visitas Sitio Web */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '0.85rem', borderLeft: '5px solid #D97706' }}>
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="small fw-bold text-warning-emphasis text-uppercase" style={{ fontSize: '11px' }}>
                                        Visitas Web (Mes)
                                    </span>
                                    <span className="fs-4">🌐</span>
                                </div>
                                <div className="h3 fw-bold mb-1 text-dark">
                                    {loading ? '...' : visitStats.mes.toLocaleString('es-UY')}
                                </div>
                                <div className="small text-muted" style={{ fontSize: '12px' }}>
                                    {visitStats.totalHistorico.toLocaleString('es-UY')} visitas históricas
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* 3. MÓDULOS DE GESTIÓN PRINCIPALES (Grid limpia, visual y accesible) */}
                <div className="mb-4">
                    <h2 className="h6 fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
                        Módulos de Gestión del Círculo Policial
                    </h2>

                    <Row className="g-3">
                        {/* Padrón de Socios */}
                        <Col xs={12} sm={6} lg={4}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate transition-all"
                                style={{ borderRadius: '0.85rem', cursor: 'pointer' }}
                                onClick={() => router.push('/admin/socios')}
                            >
                                <CardBody className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="p-2 rounded-3" style={{ backgroundColor: '#EFF6FF', fontSize: '1.8rem' }}>
                                                👥
                                            </div>
                                            {pendientesSolicitudes > 0 && (
                                                <Badge color="warning" pill className="text-dark fw-bold">
                                                    {pendientesSolicitudes} nuevas solicitudes
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="h6 fw-bold text-dark mb-1">Padrón General de Socios</h3>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px' }}>
                                            Altas, bajas, modificación de datos, carné institucional y aprobación de solicitudes web.
                                        </p>
                                    </div>
                                    <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-primary">Gestionar Socios →</span>
                                        <span className="badge bg-light text-muted border">{stats.totalSocios} activos</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Pagos Transferencia BROU */}
                        <Col xs={12} sm={6} lg={4}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate transition-all"
                                style={{ borderRadius: '0.85rem', cursor: 'pointer', borderTop: '3px solid #2563EB' }}
                                onClick={() => router.push('/admin/pagos')}
                            >
                                <CardBody className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="p-2 rounded-3" style={{ backgroundColor: '#DBEAFE', fontSize: '1.8rem' }}>
                                                🏦
                                            </div>
                                            <div className="d-flex gap-1">
                                                {pendientesPagos > 0 ? (
                                                    <Badge color="danger" pill className="animate-pulse">
                                                        {pendientesPagos} por confirmar
                                                    </Badge>
                                                ) : (
                                                    <Badge color="success" pill>Al día</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="h6 fw-bold text-dark mb-1">Pagos Transferencia BROU</h3>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px' }}>
                                            Comprobantes recibidos, acreditación de cuotas multi-mes, matriz anual y recordatorios.
                                        </p>
                                    </div>
                                    <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-primary">Control de Pagos →</span>
                                        <span className="badge bg-primary bg-opacity-10 text-primary border-0">Excel / PDF</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Descuentos Jefatura (514) */}
                        <Col xs={12} sm={6} lg={4}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate transition-all"
                                style={{ borderRadius: '0.85rem', cursor: 'pointer' }}
                                onClick={() => router.push('/admin/descuentos')}
                            >
                                <CardBody className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="p-2 rounded-3" style={{ backgroundColor: '#DCFCE7', fontSize: '1.8rem' }}>
                                                🏛️
                                            </div>
                                            <Badge pill style={{ backgroundColor: '#16A34A' }}>Código 514</Badge>
                                        </div>
                                        <h3 className="h6 fw-bold text-dark mb-1">Descuentos por Haberes (Jefatura)</h3>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px' }}>
                                            Generar presupuestos mensuales, archivo TXT oficial para la Jefatura y pase de alumnos EDP.
                                        </p>
                                    </div>
                                    <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-success">Presupuestos y TXT →</span>
                                        <span className="badge bg-light text-muted border">{stats.sociosHaberes} haberes</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Convenios y Comercios */}
                        <Col xs={12} sm={6} lg={4}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate transition-all"
                                style={{ borderRadius: '0.85rem', cursor: 'pointer' }}
                                onClick={() => router.push('/admin/convenios')}
                            >
                                <CardBody className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="p-2 rounded-3" style={{ backgroundColor: '#FEF3C7', fontSize: '1.8rem' }}>
                                                🤝
                                            </div>
                                            <Badge color="warning" pill className="text-dark">Beneficios</Badge>
                                        </div>
                                        <h3 className="h6 fw-bold text-dark mb-1">Convenios y Comercios</h3>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px' }}>
                                            Administrar comercios adheridos, descuentos para socios y propuestas recibidas por la web.
                                        </p>
                                    </div>
                                    <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-warning-emphasis">Ver Convenios →</span>
                                        <Link 
                                            href="/admin/imprimir-beneficios" 
                                            onClick={(e) => e.stopPropagation()} 
                                            className="small text-muted text-decoration-none"
                                        >
                                            🖨️ Folleto A4
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Gestión de Noticias */}
                        <Col xs={12} sm={6} lg={4}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate transition-all"
                                style={{ borderRadius: '0.85rem', cursor: 'pointer' }}
                                onClick={() => router.push('/admin/noticias')}
                            >
                                <CardBody className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="p-2 rounded-3" style={{ backgroundColor: '#F1F5F9', fontSize: '1.8rem' }}>
                                                📝
                                            </div>
                                            <Badge color="secondary" pill>Página Web</Badge>
                                        </div>
                                        <h3 className="h6 fw-bold text-dark mb-1">Noticias y Comunicados</h3>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px' }}>
                                            Publicar novedades institucionales, fotos de obras, convenios nuevos y eventos en la sede.
                                        </p>
                                    </div>
                                    <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-dark">Redactar Noticias →</span>
                                        <span className="badge bg-light text-muted border">Web Pública</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Archivo de Bajas */}
                        <Col xs={12} sm={6} lg={4}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate transition-all"
                                style={{ borderRadius: '0.85rem', cursor: 'pointer', borderTop: '3px solid #E11D48' }}
                                onClick={() => router.push('/admin/socios?tab=bajas')}
                            >
                                <CardBody className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="p-2 rounded-3" style={{ backgroundColor: '#FFE4E6', fontSize: '1.8rem' }}>
                                                🗄️
                                            </div>
                                            <Badge color="danger" pill>{stats.bajasCount} bajas</Badge>
                                        </div>
                                        <h3 className="h6 fw-bold text-dark mb-1">Archivo de Bajas</h3>
                                        <p className="small text-muted mb-0" style={{ fontSize: '13px' }}>
                                            Consultar historial de motivos de egreso de socios, con opción de reactivación directa al padrón.
                                        </p>
                                    </div>
                                    <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold text-danger">Revisar Bajas →</span>
                                        <span className="small text-muted">Auditoría</span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* 4. SECCIÓN PLEGABLE DE AUDITORÍA Y HISTÓRICO (Para no saturar la vista diaria) */}
                <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small text-muted fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                            Auditoría Histórica y Tráfico Web
                        </span>
                        <div className="d-flex gap-2">
                            <Button
                                color="light"
                                size="sm"
                                className="border small fw-semibold"
                                onClick={() => setMostrarHistoricoPadron(!mostrarHistoricoPadron)}
                            >
                                {mostrarHistoricoPadron ? 'Ocultar Evolución Padrón' : '📈 Ver Evolución del Padrón'}
                            </Button>
                            <Button
                                color="light"
                                size="sm"
                                className="border small fw-semibold"
                                onClick={() => setMostrarHistorialVisitas(!mostrarHistorialVisitas)}
                            >
                                {mostrarHistorialVisitas ? 'Ocultar Visitas' : '🌐 Ver Visitas 30 Días'}
                            </Button>
                        </div>
                    </div>

                    {/* Evolución Histórica Plegable */}
                    <Collapse isOpen={mostrarHistoricoPadron}>
                        <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '0.85rem' }}>
                            <CardBody className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="h6 fw-bold text-dark mb-0">
                                        📈 Evolución del Padrón (Desde el Inicio Web al Presente)
                                    </h4>
                                    <Badge color="success" pill className="px-3 py-1">
                                        +18.3% Crecimiento Neto (+34 socios)
                                    </Badge>
                                </div>
                                <div className="p-3 bg-light rounded-3 mb-2">
                                    <div className="d-flex justify-content-between small text-muted mb-1">
                                        <span>Padrón Inicial (02/07/2026): 186 activos</span>
                                        <strong className="text-dark">Padrón Actual: {stats.totalSocios} activos</strong>
                                    </div>
                                    <div className="progress" style={{ height: '12px', borderRadius: '6px' }}>
                                        <div 
                                            className="progress-bar" 
                                            style={{ width: '100%', backgroundColor: '#002B49' }}
                                        />
                                    </div>
                                </div>
                                <small className="text-muted">
                                    Distribución actual: {stats.sociosHaberes} por descuento Jefatura, {stats.sociosExternos} externos/particulares y {stats.escuelaCount} alumnos de la Escuela de Policía.
                                </small>
                            </CardBody>
                        </Card>
                    </Collapse>

                    {/* Historial de Visitas Plegable */}
                    <Collapse isOpen={mostrarHistorialVisitas}>
                        <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '0.85rem' }}>
                            <CardBody className="p-4">
                                <h4 className="h6 fw-bold text-dark mb-3">
                                    🌐 Registro de Visitas al Sitio Web (Últimos 30 Días)
                                </h4>
                                {visitStats.historial.length === 0 ? (
                                    <p className="text-muted small mb-0">No hay registros de visitas disponibles.</p>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <Table hover size="sm" className="align-middle mb-0">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th className="text-end">Visitas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visitStats.historial.map((h, i) => (
                                                    <tr key={i}>
                                                        <td className="fw-semibold">{h.fecha}</td>
                                                        <td className="text-end">
                                                            <Badge color="primary" pill>
                                                                {h.visitas.toLocaleString('es-UY')}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Collapse>
                </div>
            </Container>

            {/* Modal de Discrepancias */}
            <Modal 
                isOpen={modalDiscrepancias} 
                toggle={() => setModalDiscrepancias(!modalDiscrepancias)} 
                size="lg" 
                centered
            >
                <ModalHeader 
                    toggle={() => setModalDiscrepancias(!modalDiscrepancias)}
                    className="border-0 pb-0"
                >
                    <span className="h5 fw-bold text-danger">⚠️ Discrepancias de Cobranza Detectadas</span>
                </ModalHeader>
                <ModalBody className="p-4">
                    <p className="text-muted small mb-4">
                        Los siguientes socios están registrados como <strong>activos</strong> en el Círculo Policial con descuento por recibo de sueldo (<strong>haberes</strong>), pero <strong>no figuran</strong> en el último presupuesto mensual enviado/liquidado por la Jefatura.
                    </p>

                    <div className="table-responsive rounded-3 border" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table hover striped className="align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="fw-semibold text-muted py-3">Cédula</th>
                                    <th className="fw-semibold text-muted py-3">Nombre y Apellido</th>
                                    <th className="fw-semibold text-muted py-3">Tipo de Discrepancia</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.sociosHaberesSinPresupuestoList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-muted">
                                            No se detectaron inconsistencias activas en el presupuesto.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.sociosHaberesSinPresupuestoList.map((socio) => (
                                        <tr key={socio.id}>
                                            <td className="fw-bold font-monospace">
                                                {parseInt(socio.cedula).toLocaleString('es-UY')}-{socio.digito_verificador}
                                            </td>
                                            <td className="fw-bold text-dark">{socio.nombre}</td>
                                            <td>
                                                <Badge color="warning" pill className="text-dark fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                    Sin Liquidar en Presupuesto
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Badge color="success" pill style={{ fontSize: '0.75rem' }}>
                                                    Activo en Padrón
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button color="light" onClick={() => setModalDiscrepancias(false)}>
                            Cerrar
                        </Button>
                        <Button color="primary" onClick={() => { setModalDiscrepancias(false); router.push('/admin/descuentos'); }}>
                            Ir al Módulo de Presupuestos (514) →
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}
