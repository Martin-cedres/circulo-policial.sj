'use client';

import { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import { MapPin, Mail, CheckCircle2 } from 'lucide-react';

export default function AsociarsePage() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        email: '',
        telefono: '',
        direccion: '',
        situacion: 'activo', // activo, retiro
        jerarquia: '',
        unidad: '',
        mensaje: '',
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        try {
            const response = await fetch('/api/socios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({
                    nombre: '',
                    apellido: '',
                    cedula: '',
                    email: '',
                    telefono: '',
                    direccion: '',
                    situacion: 'activo',
                    jerarquia: '',
                    unidad: '',
                    mensaje: '',
                });
            } else {
                throw new Error('Error al enviar formulario');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Ocurrió un error. Por favor, intenta nuevamente o contáctanos directamente.');
        }
    };

    return (
        <main>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.rojo} 0%, ${artiguistaColors.rojoOscuro} 100%)`,
                    color: artiguistaColors.blanco,
                    padding: '5rem 0',
                    textAlign: 'center',
                }}
            >
                <Container>
                    <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                        Formá parte de nuestra comunidad
                    </h1>
                    <p className="lead">
                        Sumate al Círculo Policial y accedé a beneficios exclusivos
                    </p>
                </Container>
            </section>

            {/* Formulario */}
            <section className="section-padding">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            {status === 'success' && (
                                <Alert color="success" className="mb-4">
                                    <h4 className="alert-heading">¡Solicitud enviada con éxito!</h4>
                                    <p className="mb-0">
                                        Hemos recibido tu solicitud de asociación. Nos pondremos en contacto contigo a la brevedad.
                                    </p>
                                </Alert>
                            )}

                            {status === 'error' && (
                                <Alert color="danger" className="mb-4">
                                    <h4 className="alert-heading">Error al enviar</h4>
                                    <p className="mb-0">{errorMessage}</p>
                                </Alert>
                            )}

                            <div
                                className="p-5"
                                style={{
                                    backgroundColor: artiguistaColors.blanco,
                                    borderRadius: '1rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }}
                            >
                                <h2 className="h3 fw-bold mb-4" style={{ color: artiguistaColors.azul }}>
                                    Formulario de Inscripción
                                </h2>

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="nombre">Nombre *</Label>
                                                <Input
                                                    type="text"
                                                    name="nombre"
                                                    id="nombre"
                                                    value={formData.nombre}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="apellido">Apellido *</Label>
                                                <Input
                                                    type="text"
                                                    name="apellido"
                                                    id="apellido"
                                                    value={formData.apellido}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="cedula">Cédula de Identidad *</Label>
                                                <Input
                                                    type="text"
                                                    name="cedula"
                                                    id="cedula"
                                                    placeholder="1.234.567-8"
                                                    value={formData.cedula}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="telefono">Teléfono *</Label>
                                                <Input
                                                    type="tel"
                                                    name="telefono"
                                                    id="telefono"
                                                    placeholder="099 123 456"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <FormGroup>
                                        <Label for="email">Correo Electrónico *</Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder="tu.email@ejemplo.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="direccion">Dirección</Label>
                                        <Input
                                            type="text"
                                            name="direccion"
                                            id="direccion"
                                            placeholder="Calle, número, San José"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>

                                    <Row>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="situacion">Situación *</Label>
                                                <Input
                                                    type="select"
                                                    name="situacion"
                                                    id="situacion"
                                                    value={formData.situacion}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="activo">En actividad</option>
                                                    <option value="retiro">Retiro</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Label for="jerarquia">Jerarquía</Label>
                                                <Input
                                                    type="text"
                                                    name="jerarquia"
                                                    id="jerarquia"
                                                    placeholder="Ej: Agente, Cabo, Sargento..."
                                                    value={formData.jerarquia}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <FormGroup>
                                        <Label for="unidad">Unidad / Dependencia</Label>
                                        <Input
                                            type="text"
                                            name="unidad"
                                            id="unidad"
                                            placeholder="Ej: Seccional 1ra, Comisaría..."
                                            value={formData.unidad}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="mensaje">Mensaje (Opcional)</Label>
                                        <Input
                                            type="textarea"
                                            name="mensaje"
                                            id="mensaje"
                                            rows={4}
                                            placeholder="¿Algún comentario o consulta adicional?"
                                            value={formData.mensaje}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>

                                    <div className="d-grid">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={status === 'sending'}
                                            style={{
                                                backgroundColor: artiguistaColors.rojo,
                                                borderColor: artiguistaColors.rojo,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {status === 'sending' ? 'Enviando...' : 'Enviar Solicitud'}
                                        </Button>
                                    </div>
                                </Form>

                                <div className="mt-4 text-center text-muted">
                                    <small>
                                        * Campos obligatorios. Tus datos serán tratados con confidencialidad según nuestra{' '}
                                        <a href="/privacidad" style={{ color: artiguistaColors.azul }}>
                                            Política de Privacidad
                                        </a>.
                                    </small>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Información adicional */}
            <section
                className="section-padding"
                style={{ backgroundColor: artiguistaColors.gris[50] }}
            >
                <Container>
                    <Row>
                        <Col md={6} className="mb-4">
                            <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                ¿Por qué asociarse?
                            </h3>
                            <ul className="list-unstyled" style={{ lineHeight: '1.8' }}>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Acceso a instalaciones recreativas</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Asesoramiento legal gratuito</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Beneficios en salud</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Convenios comerciales</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Red de apoyo y contención</li>
                            </ul>
                        </Col>
                        <Col md={6} className="mb-4">
                            <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                ¿Dudas?
                            </h3>
                            <p style={{ lineHeight: '1.8' }}>
                                Si tenés consultas sobre el proceso de asociación o los beneficios, no dudes en contactarnos:
                            </p>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-2">
                                    <MapPin size={20} className="text-muted mt-1" />
                                    <span>Calle Ituzaingó, San José</span>
                                </div>
                                <div className="d-flex align-items-start gap-2">
                                    <Mail size={20} className="text-muted mt-1" />
                                    <span>
                                        Completá el{' '}
                                        <a href="/contacto" style={{ color: artiguistaColors.azul }}>
                                            formulario de contacto
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </main>
    );
}
