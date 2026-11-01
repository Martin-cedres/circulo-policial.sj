'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Button, Alert, Modal, ModalHeader, ModalBody, Table, Badge } from 'reactstrap';
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
    const [mostrarHistorialVisitas, setMostrarHistorialVisitas] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalDiscrepancias, setModalDiscrepancias] = useState(false);

    useEffect(() => {
        // Verificar autenticación
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }

        // Cargar estadísticas reales desde API
        Promise.all([
            fetch('/api/admin/descuentos/estadisticas').then(res => res.json()),
            fetch('/api/admin/visitas/estadisticas').then(res => res.json())
        ])
            .then(([descuentosData, visitasData]) => {
                if (descuentosData.success) {
                    setStats(prev => ({
                        ...prev,
                        ...descuentosData.estadisticas
                    }));
                }
                if (visitasData.success) {
                    setVisitStats(visitasData.estadisticas);
                }
            })
            .catch(err => console.error('Error fetching dashboard stats:', err))
            .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        router.push('/admin');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: artiguistaColors.gris[50] }}>
            {/* Header Admin */}
            <div
                style={{
                    backgroundColor: artiguistaColors.azul,
                    color: artiguistaColors.blanco,
                    padding: '1.5rem 0',
                    marginBottom: '2rem',
                }}
            >
                <Container>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h4 mb-0">Panel Administrativo</h1>
                            <small>Círculo Policial San José</small>
                        </div>
                        <Button color="light" outline size="sm" onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    </div>
                </Container>
            </div>

            <Container className="pb-5">
                {!loading && stats.sociosHaberesSinPresupuestoCount > 0 && (
                    <Alert 
                        color="warning" 
                        className="border-0 shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3" 
                        style={{ borderRadius: '1rem' }}
                    >
                        <div className="flex-grow-1">
                            <h4 className="alert-heading h5 fw-bold mb-1">⚠️ Atención: Inconsistencias en Presupuesto</h4>
                            <p className="mb-0 small text-dark">
                                Hay <strong>{stats.sociosHaberesSinPresupuestoCount} socios activos</strong> de haberes que no han sido incluidos en la liquidación del último presupuesto.
                            </p>
                        </div>
                        <Button
                            color="warning"
                            size="sm"
                            className="fw-bold rounded-pill px-4 py-2 border-0 shadow-sm text-dark hover-scale"
                            onClick={() => setModalDiscrepancias(true)}
                            style={{ backgroundColor: '#ffc107', transition: 'all 0.2s ease' }}
                        >
                            Ver Discrepancias
                        </Button>
                    </Alert>
                )}

                {/* Tarjetas Estadísticas Principales */}
                <h2 className="h5 fw-bold mb-3 text-muted">Métricas de Cobranza del Mes</h2>
                <Row className="g-3 mb-4">
                    {/* Total Socios */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.azul}` }}>
                            <CardBody className="p-4 d-flex align-items-center">
                                <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>👥</div>
                                <div>
                                    <small className="text-muted d-block uppercase text-xs">Socios Activos</small>
                                    <span className="h4 fw-bold">{loading ? '...' : stats.totalSocios}</span>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        {stats.sociosHaberes} haberes | {stats.sociosExternos} externos
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Recaudación Haberes */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid #28A745` }}>
                            <CardBody className="p-4 d-flex align-items-center">
                                <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>🏢</div>
                                <div>
                                    <small className="text-muted d-block uppercase text-xs">Jefatura (Haberes)</small>
                                    <span className="h4 fw-bold text-success">${loading ? '...' : stats.recaudacionHaberes.toLocaleString('es-UY')}</span>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        {stats.haberesLiquidadosCount} socios liquidados
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Recaudación Externa */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid #FFC107` }}>
                            <CardBody className="p-4 d-flex align-items-center">
                                <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>✉️</div>
                                <div>
                                    <small className="text-muted d-block uppercase text-xs">Cobro Externo (Est.)</small>
                                    <span className="h4 fw-bold text-warning" style={{ color: '#E0A800' }}>${loading ? '...' : stats.recaudacionExternosHipotetica.toLocaleString('es-UY')}</span>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        {stats.sociosExternos} socios activos externos
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Recaudación Total */}
                    <Col xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.dorado}` }}>
                            <CardBody className="p-4 d-flex align-items-center">
                                <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>💰</div>
                                <div>
                                    <small className="text-muted d-block uppercase text-xs">Total Consolidado</small>
                                    <span className="h4 fw-bold text-primary">${loading ? '...' : stats.recaudacionTotalEstimada.toLocaleString('es-UY')}</span>
                                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                        Estimado de recaudación
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Discrepancias de Cobro */}
                    {!loading && stats.sociosHaberesSinPresupuestoCount > 0 && (
                        <Col xs={12} sm={6} lg={3}>
                            <Card 
                                className="border-0 shadow-sm h-100 hover-elevate" 
                                style={{ 
                                    cursor: 'pointer', 
                                    borderRadius: '1rem', 
                                    borderLeft: `5px solid #dc3545`,
                                    backgroundColor: '#fff5f5'
                                }}
                                onClick={() => setModalDiscrepancias(true)}
                            >
                                <CardBody className="p-4 d-flex align-items-center">
                                    <div style={{ fontSize: '2.5rem', marginRight: '1rem' }}>⚠️</div>
                                    <div>
                                        <small className="text-danger d-block uppercase text-xs fw-bold">Discrepancias</small>
                                        <span className="h4 fw-bold text-danger">{stats.sociosHaberesSinPresupuestoCount}</span>
                                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                            Auditar diferencias de cobro
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    )}
                </Row>

                {/* SECCIÓN DESTACADA: EVOLUCIÓN DEL PADRÓN DE SOCIOS (INICIO WEB VS ACTUAL) */}
                <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <CardBody className="p-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                            <div>
                                <h2 className="h5 fw-bold mb-1" style={{ color: artiguistaColors.azul }}>
                                    📈 Evolución del Padrón de Socios (Inicio de la Web vs. Actual)
                                </h2>
                                <p className="text-muted small mb-0">
                                    Comparativa histórica consolidada desde el inicio del sistema (02/07/2026 al presente)
                                </p>
                            </div>
                            <div>
                                <Badge color="success" pill className="px-3 py-2 fs-6 fw-bold shadow-sm">
                                    🚀 +18.3% Crecimiento Neto (+34 socios)
                                </Badge>
                            </div>
                        </div>

                        {/* Comparativa visual con barras de progreso */}
                        <div className="p-3 mb-4 rounded-3 border" style={{ backgroundColor: '#F8FAFC' }}>
                            {/* Padrón Inicial */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-muted">
                                        🏛️ Padrón Inicial (02/07/2026 - Inicio Web):
                                    </span>
                                    <span className="small fw-bold text-dark">
                                        186 activos vigentes <span className="text-muted fw-normal">(187 fichas: 186 activos + 1 baja inicial por duplicado)</span>
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '14px', borderRadius: '10px', backgroundColor: '#E2E8F0' }}>
                                    <div 
                                        className="progress-bar" 
                                        role="progressbar" 
                                        style={{ 
                                            width: '83%', 
                                            backgroundColor: '#64748B', 
                                            borderRadius: '10px' 
                                        }}
                                        aria-valuenow={186}
                                        aria-valuemin={0}
                                        aria-valuemax={224}
                                    >
                                        186 socios
                                    </div>
                                </div>
                            </div>

                            {/* Padrón Actual */}
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-primary">
                                        🚀 Padrón Actual (Octubre 2026):
                                    </span>
                                    <span className="small fw-bold text-success">
                                        220 activos vigentes <span className="text-muted fw-normal">(224 fichas: 220 activos + 4 bajas)</span> &bull; <strong>+18.3% neto</strong>
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '18px', borderRadius: '10px', backgroundColor: '#E2E8F0' }}>
                                    <div 
                                        className="progress-bar progress-bar-striped progress-bar-animated" 
                                        role="progressbar" 
                                        style={{ 
                                            width: '98%', 
                                            backgroundColor: artiguistaColors.azul, 
                                            borderRadius: '10px' 
                                        }}
                                        aria-valuenow={220}
                                        aria-valuemin={0}
                                        aria-valuemax={224}
                                    >
                                        220 activos (+34 socios netos)
                                    </div>
                                </div>
                                <small className="text-muted d-block mt-2" style={{ fontSize: '0.75rem' }}>
                                    ℹ️ <em>Al inicio había 1 sola baja por duplicado (Jorge Gutierrez). Posteriormente se tramitaron 2 bajas por solicitud (Mirtha González y Melani Ferreira) y 1 baja histórica.</em>
                                </small>
                            </div>
                        </div>

                        {/* Desglose por sectores en tarjetas institucionales */}
                        <Row className="g-3 mb-3">
                            {/* Jefatura */}
                            <Col xs={12} sm={6} lg={3}>
                                <div className="p-3 rounded-3 border h-100 shadow-sm" style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #0284C7' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold text-dark">Jefatura (Haberes)</span>
                                        <Badge pill style={{ backgroundColor: '#0284C7' }}>UE 19</Badge>
                                    </div>
                                    <div className="h4 fw-bold text-dark mb-0">103 <small className="fs-6 text-muted fw-normal">socios</small></div>
                                    <div className="small text-muted mt-1">46.8% del padrón activo</div>
                                </div>
                            </Col>

                            {/* Cobro Externo */}
                            <Col xs={12} sm={6} lg={3}>
                                <div className="p-3 rounded-3 border h-100 shadow-sm" style={{ backgroundColor: '#FEFCE8', borderLeft: '4px solid #EAB308' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold text-dark">Cobro Externo / Particular</span>
                                        <Badge pill style={{ backgroundColor: '#CA8A04' }}>Caja / Cobrador</Badge>
                                    </div>
                                    <div className="h4 fw-bold text-dark mb-0">89 <small className="fs-6 text-muted fw-normal">socios</small></div>
                                    <div className="small text-muted mt-1">40.5% del padrón activo</div>
                                </div>
                            </Col>

                            {/* Alumnos Escuela */}
                            <Col xs={12} sm={6} lg={3}>
                                <div className="p-3 rounded-3 border h-100 shadow-sm" style={{ backgroundColor: '#FAF5FF', borderLeft: '4px solid #9333EA' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold text-dark">Escuela de Policía</span>
                                        <Badge pill style={{ backgroundColor: '#9333EA' }}>Aspirantes</Badge>
                                    </div>
                                    <div className="h4 fw-bold text-dark mb-0">28 <small className="fs-6 text-muted fw-normal">alumnos</small></div>
                                    <div className="small text-muted mt-1">16 Tanda 1 &bull; 12 Tanda 2</div>
                                </div>
                            </Col>

                            {/* Histórico de Bajas */}
                            <Col xs={12} sm={6} lg={3}>
                                <div 
                                    className="p-3 rounded-3 border h-100 shadow-sm cursor-pointer hover-elevate" 
                                    style={{ backgroundColor: '#FFF1F2', borderLeft: '4px solid #E11D48', cursor: 'pointer' }}
                                    onClick={() => router.push('/admin/socios?tab=bajas')}
                                    title="Ir al Archivo Histórico de Bajas"
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="small fw-bold text-dark">Histórico de Bajas</span>
                                        <Badge color="danger" pill>Archivo</Badge>
                                    </div>
                                    <div className="h4 fw-bold text-danger mb-0">4 <small className="fs-6 text-muted fw-normal">socios</small></div>
                                    <div className="small text-muted mt-1">Ver motivos de egreso →</div>
                                </div>
                            </Col>
                        </Row>

                        {/* Proyección de recaudación en Jefatura */}
                        <div className="p-3 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm" style={{ backgroundColor: '#ECFDF5', borderLeft: '5px solid #10B981' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ fontSize: '2.2rem' }}>📈</div>
                                <div>
                                    <h3 className="h6 fw-bold mb-1 text-success">
                                        Proyección de Recaudación por Haberes (Convenio 514)
                                    </h3>
                                    <p className="mb-0 small text-dark">
                                        Tras el egreso y pase de las 2 tandas de la Escuela a Jefatura (+28 socios), los haberes presupuestados crecerán de <strong>$14.420</strong> a <strong>$18.340 / mes</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="text-md-end">
                                <span className="badge bg-success px-3 py-2 fw-bold fs-6 shadow-sm">
                                    +$3.920 (+27.2% Proyectado)
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Sección de Visitas al Sitio Web */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 fw-bold mb-0 text-muted">Tráfico y Visitas al Sitio Web</h2>
                    <Button 
                        color="link" 
                        size="sm" 
                        className="p-0 text-decoration-none fw-semibold"
                        onClick={() => setMostrarHistorialVisitas(!mostrarHistorialVisitas)}
                        style={{ color: artiguistaColors.azul }}
                    >
                        {mostrarHistorialVisitas ? 'Ocultar Desglose' : 'Ver Desglose 30 Días'}
                    </Button>
                </div>

                <Row className="g-3 mb-4">
                    {/* Visitas Hoy */}
                    <Col xs={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.azul}` }}>
                            <CardBody className="p-3 p-md-4 d-flex align-items-center">
                                <div style={{ fontSize: '2rem', marginRight: '0.75rem' }}>📊</div>
                                <div>
                                    <small className="text-muted d-block text-xs uppercase">Hoy</small>
                                    <span className="h4 fw-bold mb-0">{loading ? '...' : visitStats.hoy.toLocaleString('es-UY')}</span>
                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>visitas registradas</small>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Visitas Este Mes */}
                    <Col xs={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid #17a2b8` }}>
                            <CardBody className="p-3 p-md-4 d-flex align-items-center">
                                <div style={{ fontSize: '2rem', marginRight: '0.75rem' }}>📅</div>
                                <div>
                                    <small className="text-muted d-block text-xs uppercase">Este Mes</small>
                                    <span className="h4 fw-bold mb-0 text-info">{loading ? '...' : visitStats.mes.toLocaleString('es-UY')}</span>
                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>acumulado mensual</small>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Visitas Este Año */}
                    <Col xs={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid #6f42c1` }}>
                            <CardBody className="p-3 p-md-4 d-flex align-items-center">
                                <div style={{ fontSize: '2rem', marginRight: '0.75rem' }}>🗓️</div>
                                <div>
                                    <small className="text-muted d-block text-xs uppercase">Este Año</small>
                                    <span className="h4 fw-bold mb-0" style={{ color: '#6f42c1' }}>{loading ? '...' : visitStats.anio.toLocaleString('es-UY')}</span>
                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>acumulado anual</small>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Total Histórico */}
                    <Col xs={6} md={3}>
                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid #fd7e14` }}>
                            <CardBody className="p-3 p-md-4 d-flex align-items-center">
                                <div style={{ fontSize: '2rem', marginRight: '0.75rem' }}>🌐</div>
                                <div>
                                    <small className="text-muted d-block text-xs uppercase">Total Histórico</small>
                                    <span className="h4 fw-bold mb-0" style={{ color: '#fd7e14' }}>{loading ? '...' : visitStats.totalHistorico.toLocaleString('es-UY')}</span>
                                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>visitas totales</small>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Tabla de Desglose de Visitas de los Últimos 30 Días */}
                {mostrarHistorialVisitas && (
                    <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '1rem' }}>
                        <CardBody className="p-4">
                            <h3 className="h6 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                📈 Desglose de Visitas (Últimos 30 Días)
                            </h3>
                            {visitStats.historial.length === 0 ? (
                                <p className="text-muted small mb-0">Aún no hay historial de visitas registrado.</p>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <Table hover size="sm" className="align-middle mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th>Fecha</th>
                                                <th className="text-end">Visitas Registradas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visitStats.historial.map((h, i) => (
                                                <tr key={i}>
                                                    <td className="fw-semibold">{h.fecha}</td>
                                                    <td className="text-end">
                                                        <Badge color="primary" pill className="px-3">
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
                )}

                {/* Accesos Directos (Menú de Gestión) */}
                <h2 className="h5 fw-bold mb-3 text-muted">Menú de Gestión</h2>
                <Row className="g-4">
                    {/* Gestión de Socios */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/socios')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                                <h3 className="h6 fw-bold" style={{ color: artiguistaColors.azul }}>Gestión de Socios</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Listado general de socios, control de pagos y categorización.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Descuentos (Convenio 514) */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/descuentos')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💵</div>
                                <h3 className="h6 fw-bold" style={{ color: artiguistaColors.azul }}>Descuentos (514)</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Generar presupuestos, haberes y exportación a Jefatura.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Pagos Transferencia BROU */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem', borderTop: '3px solid #2563EB' }}
                            onClick={() => router.push('/admin/pagos')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <h3 className="h6 fw-bold mb-0" style={{ color: '#1E40AF' }}>Pagos Transferencia BROU</h3>
                                    <Badge color="primary" pill>$140</Badge>
                                </div>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Confirmar comprobantes, cobertura multi-mes y exportar informe a Directiva.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Histórico de Bajas */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem', borderTop: '3px solid #E11D48' }}
                            onClick={() => router.push('/admin/socios?tab=bajas')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗄️</div>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <h3 className="h6 fw-bold mb-0" style={{ color: artiguistaColors.rojo }}>Histórico de Bajas</h3>
                                    <Badge color="danger" pill>4 bajas</Badge>
                                </div>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Archivo y motivos de egreso de socios, con opción de reactivación.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Noticias */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/noticias')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                <h3 className="h6 fw-bold" style={{ color: artiguistaColors.azul }}>Gestión de Noticias</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Crear, editar y eliminar publicaciones del sitio web.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Convenios y Alianzas */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/convenios')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                                <h3 className="h6 fw-bold" style={{ color: artiguistaColors.azul }}>Convenios y Alianzas</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Gestionar comercios adheridos y ver solicitudes de unión.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Folleto Imprimible */}
                    <Col xs={12} sm={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/imprimir-beneficios')}
                        >
                            <CardBody className="text-center p-4">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖨️</div>
                                <h3 className="h6 fw-bold" style={{ color: artiguistaColors.azul }}>Folleto Imprimible</h3>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.85rem' }}>Generar folletos de beneficios en A4/A5 listos para imprimir.</p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
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
                        Los siguientes socios están registrados como <strong>activos</strong> en el Círculo Policial y configurados para pagar mediante descuento por recibo de sueldo (<strong>haberes</strong>). Sin embargo, <strong>no figuran</strong> en el último presupuesto mensual enviado/liquidado por la Jefatura.
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
                                {stats.sociosHaberesSinPresupuestoList && stats.sociosHaberesSinPresupuestoList.length > 0 ? (
                                    stats.sociosHaberesSinPresupuestoList.map((s) => (
                                        <tr key={s.id}>
                                            <td className="font-monospace fw-semibold py-3">
                                                {s.cedula}-{s.digito_verificador}
                                            </td>
                                            <td className="fw-semibold py-3 text-dark">{s.nombre}</td>
                                            <td className="text-danger py-3">
                                                Omitido en planilla de Jefatura (Haberes)
                                            </td>
                                            <td className="text-center py-3">
                                                <Badge color="success" className="px-2 py-1 rounded-pill">
                                                    Activo
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-muted">
                                            No hay discrepancias registradas en este período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <div className="mt-4 text-end">
                        <Button 
                            color="secondary" 
                            className="rounded-pill px-4" 
                            onClick={() => setModalDiscrepancias(false)}
                        >
                            Cerrar
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}
