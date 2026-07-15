'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Button, Alert } from 'reactstrap';
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
        sociosHaberesSinPresupuestoCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar autenticación
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }

        // Cargar estadísticas reales desde API
        fetch('/api/admin/descuentos/estadisticas')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats(data.estadisticas);
                }
            })
            .catch(err => console.error('Error fetching stats:', err))
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
                {/* Alertas de inconsistencia */}
                {!loading && stats.sociosHaberesSinPresupuestoCount > 0 && (
                    <Alert color="warning" className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                        <h4 className="alert-heading h5 fw-bold">⚠️ Atención: Inconsistencia en Presupuesto</h4>
                        <p className="mb-0 small">
                            Hay <strong>{stats.sociosHaberesSinPresupuestoCount} socios activos</strong> configurados con descuento por sueldo (haberes) que no han sido incluidos en la liquidación del último presupuesto de la Jefatura. Gestiona el presupuesto activo para agregarlos.
                        </p>
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
                </Row>

                {/* Accesos Directos */}
                <h2 className="h5 fw-bold mb-3 text-muted">Menú de Gestión</h2>
                <Row className="g-4">
                    {/* Noticias */}
                    <Col md={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/noticias')}
                        >
                            <CardBody className="text-center p-5">
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📝</div>
                                <h3 className="h5 fw-bold" style={{ color: artiguistaColors.azul }}>Gestión de Noticias</h3>
                                <p className="small text-muted mb-0">Crear, editar y eliminar publicaciones del sitio web.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Gestión de Socios */}
                    <Col md={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/socios')}
                        >
                            <CardBody className="text-center p-5">
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👥</div>
                                <h3 className="h5 fw-bold" style={{ color: artiguistaColors.azul }}>Gestión de Socios</h3>
                                <p className="small text-muted mb-0">Listado general de socios, control de pagos y categorización.</p>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Descuentos (Convenio 514) */}
                    <Col md={6} lg={4}>
                        <Card
                            className="border-0 shadow-sm h-100 hover-elevate"
                            style={{ cursor: 'pointer', borderRadius: '1rem' }}
                            onClick={() => router.push('/admin/descuentos')}
                        >
                            <CardBody className="text-center p-5">
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💵</div>
                                <h3 className="h5 fw-bold" style={{ color: artiguistaColors.azul }}>Descuentos (514)</h3>
                                <p className="small text-muted mb-0">Generar presupuestos, altas/bajas de haberes y exportación a Jefatura.</p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
