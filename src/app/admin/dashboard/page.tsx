'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Button } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        sociosNuevos: 0,
        mensajesContacto: 0,
        visitasMes: 0,
    });

    useEffect(() => {
        // Verificar autenticación
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }

        // TODO: Cargar estadísticas reales desde API
        setStats({
            sociosNuevos: 8,
            mensajesContacto: 15,
            visitasMes: 342,
        });
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

            <Container>
                {/* Estadísticas */}
                <Row className="mb-4">
                    <Col md={4}>
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div style={{ fontSize: '3rem', color: artiguistaColors.azul }}>
                                    {stats.sociosNuevos}
                                </div>
                                <h3 className="h6 text-muted mb-0">Solicitudes de Socios (30 días)</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div style={{ fontSize: '3rem', color: artiguistaColors.rojo }}>
                                    {stats.mensajesContacto}
                                </div>
                                <h3 className="h6 text-muted mb-0">Mensajes sin Leer</h3>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="border-0 shadow-sm">
                            <CardBody className="text-center">
                                <div style={{ fontSize: '3rem', color: artiguistaColors.verde }}>
                                    {stats.visitasMes}
                                </div>
                                <h3 className="h6 text-muted mb-0">Visitas este Mes</h3>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Acciones Rápidas */}
                <h2 className="h5 fw-bold mb-3">Acciones Rápidas</h2>
                <Row>
                    <Col md={6} lg={3} className="mb-3">
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => router.push('/admin/publicaciones')}
                        >
                            <CardBody className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                                <h3 className="h6 fw-bold">Publicaciones</h3>
                                <p className="small text-muted mb-0">Gestionar noticias y contenido</p>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={6} lg={3} className="mb-3">
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => router.push('/admin/socios')}
                        >
                            <CardBody className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                                <h3 className="h6 fw-bold">Solicitudes de Socios</h3>
                                <p className="small text-muted mb-0">Revisar nuevas solicitudes</p>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={6} lg={3} className="mb-3">
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => router.push('/admin/contacto')}
                        >
                            <CardBody className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
                                <h3 className="h6 fw-bold">Mensajes</h3>
                                <p className="small text-muted mb-0">Ver mensajes de contacto</p>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col md={6} lg={3} className="mb-3">
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => router.push('/admin/imagenes')}
                        >
                            <CardBody className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
                                <h3 className="h6 fw-bold">Galería</h3>
                                <p className="small text-muted mb-0">Gestionar imágenes del sitio</p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Nota de implementación */}
                <Card className="border-0 shadow-sm mt-4" style={{ backgroundColor: '#FFF3CD' }}>
                    <CardBody>
                        <h3 className="h6 fw-bold mb-2">📋 Nota de Implementación</h3>
                        <p className="small mb-0">
                            Este es el dashboard básico del panel administrativo. Para completar la funcionalidad,
                            necesitarás implementar:
                        </p>
                        <ul className="small mb-0 mt-2">
                            <li>Base de datos (Supabase, MongoDB, PostgreSQL)</li>
                            <li>Sistema de autenticación robusto (NextAuth.js)</li>
                            <li>Endpoints API completos para CRUD de publicaciones</li>
                            <li>Sistema de notificaciones por email</li>
                            <li>Upload de imágenes (Cloudinary, S3, etc.)</li>
                        </ul>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
}
