'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Button, Alert, Modal, ModalHeader, ModalBody, Table, Badge } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalSocios: 0,
        sociosHaberes: 0,
        sociosExternos: 0,
        haberesLiquidadosCount: 0,
        recaudacionHaberes: 0,
        recaudacionExternosHipotetica: 0,
        recaudacionTotalEstimada: 0,
        sociosHaberesSinPresupuestoCount: 0,
        sociosHaberesSinPresupuestoList: []
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
                    setStats(descuentosData.estadisticas);
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

                {/* Tarjetas Estadísticas */}
                <h2 className="h5 fw-bold mb-3 text-muted">Métricas de Cobranza del Mes</h2>
                <Row className="g-3 mb-5">
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
                                        79 socios activos externos
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

                {/* Accesos Directos */}
                <h2 className="h5 fw-bold mb-3 text-muted">Menú de Gestión</h2>
                <Row className="g-4">
                    {/* Noticias */}
                    <Col md={6} lg={3}>
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

                    {/* Gestión de Socios */}
                    <Col md={6} lg={3}>
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
                    <Col md={6} lg={3}>
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

                    {/* Convenios y Alianzas */}
                    <Col md={6} lg={3}>
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
                    <Col md={6} lg={3}>
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
                                    stats.sociosHaberesSinPresupuestoList.map((s: any) => (
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
