'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

export default function AdminLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('admin-token', token);
                router.push('/admin/dashboard');
            } else {
                setError('Credenciales incorrectas');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${artiguistaColors.azul} 0%, ${artiguistaColors.azulOscuro} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={4}>
                        <Card className="shadow-lg">
                            <CardBody className="p-5">
                                <div className="text-center mb-4">
                                    <h1 className="h3 fw-bold" style={{ color: artiguistaColors.azul }}>
                                        Panel Administrativo
                                    </h1>
                                    <p className="text-muted">Círculo Policial San José</p>
                                </div>

                                {error && <Alert color="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label for="username">Usuario</Label>
                                        <Input
                                            type="text"
                                            id="username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="password">Contraseña</Label>
                                        <Input
                                            type="password"
                                            id="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </FormGroup>

                                    <div className="d-grid">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            style={{
                                                backgroundColor: artiguistaColors.azul,
                                                borderColor: artiguistaColors.azul,
                                            }}
                                        >
                                            {loading ? 'Ingresando...' : 'Ingresar'}
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center mt-4">
                                    <a href="/" style={{ color: artiguistaColors.azul, fontSize: '0.9rem' }}>
                                        ← Volver al sitio
                                    </a>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
