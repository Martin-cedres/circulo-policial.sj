'use client';

import { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import { MapPin, User, Clock, ArrowRight, Mail } from 'lucide-react';

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
            } else {
                throw new Error('Error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <main>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.dorado} 0%, #B8860B 100%)`,
                    color: artiguistaColors.negro,
                    padding: '5rem 0',
                    textAlign: 'center',
                }}
            >
                <Container>
                    <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                        Contacto
                    </h1>
                    <p className="lead">
                        Estamos para ayudarte. Dejanos tu consulta
                    </p>
                </Container>
            </section>

            <section className="section-padding">
                <Container>
                    <Row>
                        {/* Información de Contacto */}
                        <Col lg={4} className="mb-5 mb-lg-0">
                            <div
                                className="p-4"
                                style={{
                                    backgroundColor: artiguistaColors.azul,
                                    color: artiguistaColors.blanco,
                                    borderRadius: '1rem',
                                    height: '100%',
                                }}
                            >
                                <h2 className="h4 fw-bold mb-4">Información de Contacto</h2>

                                <div className="mb-4">
                                    <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                        <MapPin size={18} /> Dirección
                                    </h3>
                                    <p className="mb-0">
                                        Calle Ituzaingó y Ciganda<br />
                                        San José de Mayo, Uruguay
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                        <User size={18} /> Presidente
                                    </h3>
                                    <p className="mb-0">Comisario Mayor (R) Darcy Gonzalez</p>
                                </div>

                                <div className="mb-4">
                                    <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                        <Clock size={18} /> Horarios
                                    </h3>
                                    <p className="mb-0">
                                        Consultar disponibilidad mediante el formulario de contacto
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                        <Mail size={18} /> Correo Electrónico
                                    </h3>
                                    <p className="mb-0 overflow-hidden text-break">
                                        sanjosecirculopolicial@gmail.com
                                    </p>
                                </div>

                                <hr style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '2rem 0' }} />

                                <div>
                                    <h3 className="h6 fw-bold mb-3">Enlaces Rápidos</h3>
                                    <div className="d-flex flex-column gap-2">
                                        <a href="/nosotros" className="d-flex align-items-center gap-2" style={{ color: artiguistaColors.blanco }}>
                                            <ArrowRight size={16} /> Sobre Nosotros
                                        </a>
                                        <a href="/beneficios" className="d-flex align-items-center gap-2" style={{ color: artiguistaColors.blanco }}>
                                            <ArrowRight size={16} /> Beneficios
                                        </a>
                                        <a href="/asociarse" className="d-flex align-items-center gap-2" style={{ color: artiguistaColors.blanco }}>
                                            <ArrowRight size={16} /> Hacerse Socio
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Formulario */}
                        <Col lg={8}>
                            {status === 'success' && (
                                <Alert color="success" className="mb-4">
                                    <h4 className="alert-heading">¡Mensaje enviado!</h4>
                                    <p className="mb-0">Gracias por contactarnos. Te responderemos a la brevedad.</p>
                                </Alert>
                            )}

                            {status === 'error' && (
                                <Alert color="danger" className="mb-4">
                                    Error al enviar el mensaje. Por favor, intenta nuevamente.
                                </Alert>
                            )}

                            <div
                                className="p-4"
                                style={{
                                    backgroundColor: artiguistaColors.gris[50],
                                    borderRadius: '1rem',
                                }}
                            >
                                <h2 className="h4 fw-bold mb-4" style={{ color: artiguistaColors.azul }}>
                                    Envíanos tu Consulta
                                </h2>

                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label for="nombre">Nombre Completo *</Label>
                                        <Input
                                            type="text"
                                            name="nombre"
                                            id="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>

                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="email">Correo Electrónico *</Label>
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="telefono">Teléfono</Label>
                                                <Input
                                                    type="tel"
                                                    name="telefono"
                                                    id="telefono"
                                                    placeholder="099 123 456"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <FormGroup>
                                        <Label for="asunto">Asunto *</Label>
                                        <Input
                                            type="text"
                                            name="asunto"
                                            id="asunto"
                                            placeholder="¿Sobre qué querés consultarnos?"
                                            value={formData.asunto}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="mensaje">Mensaje *</Label>
                                        <Input
                                            type="textarea"
                                            name="mensaje"
                                            id="mensaje"
                                            rows={6}
                                            placeholder="Escribí tu consulta aquí..."
                                            value={formData.mensaje}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>

                                    <div className="d-grid">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={status === 'sending'}
                                            style={{
                                                backgroundColor: artiguistaColors.azul,
                                                borderColor: artiguistaColors.azul,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Mapa - Placeholder */}
            <section style={{ backgroundColor: artiguistaColors.gris[200], padding: '3rem 0' }}>
                <Container>
                    <div
                        style={{
                            backgroundColor: artiguistaColors.gris[300],
                            borderRadius: '1rem',
                            height: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div className="text-center">
                            <MapPin size={64} className="mb-3" style={{ color: artiguistaColors.azul }} />
                            <p className="h5" style={{ color: artiguistaColors.gris[700] }}>
                                Calle Ituzaingó y Ciganda - San José de Mayo, Uruguay
                            </p>
                            <p className="text-muted">
                                (Incorporar Google Maps aquí)
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}
