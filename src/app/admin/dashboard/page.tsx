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

            <Container className="pt-4">
                <Row>
                    <Col md={12} lg={6} className="mb-3 mx-auto">
                        <Card
                            className="border-0 shadow-sm h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => router.push('/admin/noticias')}
                        >
                            <CardBody className="text-center p-5">
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📝</div>
                                <h3 className="h4 fw-bold">Gestión de Noticias</h3>
                                <p className="text-muted mb-0">Crear, editar y eliminar publicaciones del sitio.</p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </div>
    );
}
