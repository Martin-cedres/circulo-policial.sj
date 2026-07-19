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
        situacion: 'policia_actividad', // 'policia_actividad', 'policia_retirado', 'civil'
        pertenencia_presupuestal: 'jefatura_san_jose', // 'jefatura_san_jose', 'otra_dependencia'
        jerarquia: '',
        unidad: '',
        mensaje: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Determinar si la dirección física es obligatoria para el cobrador
    const esDireccionObligatoria = 
        formData.situacion === 'civil' || 
        formData.situacion === 'policia_retirado' ||
        (formData.situacion === 'policia_actividad' && formData.pertenencia_presupuestal === 'otra_dependencia');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        // Validación extra en cliente de la regla de dirección
        if (esDireccionObligatoria && (!formData.direccion || formData.direccion.trim() === '')) {
            setStatus('error');
            setErrorMessage('La dirección es obligatoria para poder coordinar el cobro a domicilio.');
            return;
        }

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
                    situacion: 'policia_actividad',
                    pertenencia_presupuestal: 'jefatura_san_jose',
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
            className="p-4 p-md-5"
            style={{
                backgroundColor: artiguistaColors.blanco,
                borderRadius: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
        >
            {status === 'success' && (
                <Alert color="success" className="mb-4 border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
                    <h4 className="alert-heading fw-bold">¡Solicitud enviada con éxito!</h4>
                    <p className="mb-0 small">
                        Hemos recibido tu solicitud de inscripción. Nos pondremos en contacto contigo a la brevedad para coordinar la firma física o los detalles restantes.
                    </p>
                </Alert>
            )}

            {status === 'error' && (
                <Alert color="danger" className="mb-4 border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
                    <h4 className="alert-heading fw-bold">Error al enviar</h4>
                    <p className="mb-0 small">{errorMessage}</p>
                </Alert>
            )}

            <h2 className="h4 fw-bold mb-4 text-center text-md-start" style={{ color: artiguistaColors.azul }}>
                Formulario de Inscripción
            </h2>

            {/* Selector de Tipo de Socio Interactivo */}
            <div className="mb-4 text-center text-md-start">
                <Label className="fw-semibold text-muted mb-2 d-block" style={{ fontSize: '0.9rem' }}>Tipo de Socio *</Label>
                <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                    {[
                        { id: 'policia_actividad', label: '👮 Policía en Actividad' },
                        { id: 'policia_retirado', label: '👴 Policía Retirado' },
                        { id: 'civil', label: '👥 Civil' }
                    ].map(t => (
                        <Button
                            key={t.id}
                            type="button"
                            size="sm"
                            className="px-3 py-2 fw-bold rounded-pill shadow-sm transition-all"
                            style={{
                                backgroundColor: formData.situacion === t.id ? artiguistaColors.azul : '#f8f9fa',
                                borderColor: formData.situacion === t.id ? artiguistaColors.azul : '#e9ecef',
                                color: formData.situacion === t.id ? artiguistaColors.blanco : '#495057',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setFormData(prev => ({ ...prev, situacion: t.id }))}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                    {/* Nombre y Apellido en una fila */}
                    <Col md={6}>
                        <FormGroup className="mb-2">
                            <Label for="nombre" className="small fw-semibold text-muted">Nombre *</Label>
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
                        <FormGroup className="mb-2">
                            <Label for="apellido" className="small fw-semibold text-muted">Apellido *</Label>
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

                    {/* Cédula y Teléfono en una fila */}
                    <Col md={6}>
                        <FormGroup className="mb-2">
                            <Label for="cedula" className="small fw-semibold text-muted">Cédula de Identidad *</Label>
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
                        <FormGroup className="mb-2">
                            <Label for="telefono" className="small fw-semibold text-muted">Teléfono Celular *</Label>
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

                    {/* Email */}
                    <Col xs={12}>
                        <FormGroup className="mb-2">
                            <Label for="email" className="small fw-semibold text-muted">Correo Electrónico *</Label>
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
                    </Col>

                    {/* Campos Dinámicos para Policías (Activos y Retirados) */}
                    {formData.situacion !== 'civil' && (
                        <>
                            {/* Pertenencia Presupuestal / Unidad Ejecutora */}
                            <Col md={6}>
                                <FormGroup className="mb-2">
                                    <Label for="pertenencia_presupuestal" className="small fw-semibold text-muted">Pertenencia Presupuestal *</Label>
                                    <Input
                                        type="select"
                                        name="pertenencia_presupuestal"
                                        id="pertenencia_presupuestal"
                                        value={formData.pertenencia_presupuestal}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="jefatura_san_jose">Jefatura de Policía de San José (UE 19)</option>
                                        <option value="otra_dependencia">Otra Jefatura o Dirección Nacional</option>
                                    </Input>
                                </FormGroup>
                            </Col>

                            {/* Jerarquía / Rango */}
                            <Col md={6}>
                                <FormGroup className="mb-2">
                                    <Label for="jerarquia" className="small fw-semibold text-muted">Jerarquía / Rango</Label>
                                    <Input
                                        type="text"
                                        name="jerarquia"
                                        id="jerarquia"
                                        placeholder="Ej: Agente, Cabo, Oficial..."
                                        value={formData.jerarquia}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>

                            {/* Dependencia / Destino Físico */}
                            <Col xs={12}>
                                <FormGroup className="mb-2">
                                    <Label for="unidad" className="small fw-semibold text-muted">Dependencia / Unidad Física</Label>
                                    <Input
                                        type="text"
                                        name="unidad"
                                        id="unidad"
                                        placeholder="Ej: Seccional 1ra, Comisaría de la Mujer..."
                                        value={formData.unidad}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </>
                    )}

                    {/* Dirección Física (Condicionada) */}
                    <Col xs={12}>
                        <FormGroup className="mb-2">
                            <Label for="direccion" className="small fw-semibold text-muted">
                                Dirección Domicilio {esDireccionObligatoria ? '*' : '(Opcional)'}
                            </Label>
                            <Input
                                type="text"
                                name="direccion"
                                id="direccion"
                                placeholder="Calle, número, localidad"
                                value={formData.direccion}
                                onChange={handleChange}
                                required={esDireccionObligatoria}
                            />
                            {esDireccionObligatoria ? (
                                <small className="text-danger d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                    ⚠️ Requerido para poder enviar un cobrador de cuotas a tu domicilio.
                                </small>
                            ) : (
                                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                    Opcional. Cobro por descuento automático de haberes de sueldo.
                                </small>
                            )}
                        </FormGroup>
                    </Col>

                    {/* Mensaje adicional */}
                    <Col xs={12}>
                        <FormGroup className="mb-3">
                            <Label for="mensaje" className="small fw-semibold text-muted">Comentarios / Mensaje (Opcional)</Label>
                            <Input
                                type="textarea"
                                name="mensaje"
                                id="mensaje"
                                rows={3}
                                placeholder="¿Algún comentario o consulta adicional?"
                                value={formData.mensaje}
                                onChange={handleChange}
                            />
                        </FormGroup>
                    </Col>

                    {/* Botón enviar */}
                    <Col xs={12}>
                        <div className="d-grid mt-2">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={status === 'sending'}
                                style={{
                                    backgroundColor: artiguistaColors.rojo,
                                    borderColor: artiguistaColors.rojo,
                                    fontWeight: 'bold',
                                    borderRadius: '2rem'
                                }}
                            >
                                {status === 'sending' ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>

            <div className="mt-4 text-center text-muted">
                <small style={{ fontSize: '0.75rem' }}>
                    * Campos obligatorios. Tus datos serán tratados con absoluta reserva según nuestra{' '}
                    <a href="/privacidad" style={{ color: artiguistaColors.azul, textDecoration: 'none' }}>
                        Política de Privacidad
                    </a>.
                </small>
            </div>
        </div>
    );
}
