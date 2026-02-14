'use client';

import { useState } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

export default function AsociarseForm() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
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
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al enviar formulario');
            }
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Ocurrió un error. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div
            className="p-5"
            style={{
                backgroundColor: artiguistaColors.blanco,
                borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
        >
            {status === 'success' && (
                <Alert color="success" className="mb-4">
                    <h4 className="alert-heading">¡Solicitud enviada con éxito!</h4>
                    <p className="mb-0">
                        Hemos recibido tu solicitud. Nos pondremos en contacto contigo a la brevedad.
                    </p>
                </Alert>
            )}

            {status === 'error' && (
                <Alert color="danger" className="mb-4">
                    <h4 className="alert-heading">Error al enviar</h4>
                    <p className="mb-0">{errorMessage}</p>
                </Alert>
            )}

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
                        type="text"
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
    );
}
