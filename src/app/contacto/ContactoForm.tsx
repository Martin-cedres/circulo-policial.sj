'use client';

import { useState } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

export default function ContactoForm() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
    });

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
                setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    asunto: '',
                    mensaje: '',
                });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                throw new Error('Error al enviar');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div
            className="p-4"
            style={{
                backgroundColor: artiguistaColors.gris[50],
                borderRadius: '1rem',
            }}
        >
            {status === 'success' && (
                <Alert color="success" className="mb-4">
                    <h4 className="alert-heading">¡Mensaje enviado!</h4>
                    <p className="mb-0">Gracias por contactarnos. Te responderemos a la brevedad.</p>
                </Alert>
            )}

            {status === 'error' && (
                <Alert color="danger" className="mb-4">
                    Error al enviar el mensaje. Por favor, intenta de nuevo.
                </Alert>
            )}

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
                                type="text"
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
                    <Label for="asunto">Asunto</Label>
                    <Input
                        type="text"
                        name="asunto"
                        id="asunto"
                        placeholder="¿Sobre qué querés consultarnos?"
                        value={formData.asunto}
                        onChange={handleChange}
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
    );
}
