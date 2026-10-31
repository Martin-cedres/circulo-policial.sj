'use client';

import { useState } from 'react';
import { Row, Col, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { ShieldCheck, CreditCard, Building2, UserCheck } from 'lucide-react';

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
        localidad: 'San José de Mayo',
        metodo_pago: 'haberes', // 'haberes', 'transferencia', 'cobrador', 'alumno'
        autoriza_descuento: true,
        situacion: 'policia_actividad', // 'policia_actividad', 'policia_retirado', 'civil'
        pertenencia_presupuestal: 'jefatura_san_jose', // 'jefatura_san_jose', 'otra_dependencia'
        jerarquia: '',
        unidad: '',
        mensaje: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        if (!formData.direccion || formData.direccion.trim() === '') {
            setStatus('error');
            setErrorMessage('La dirección de domicilio es obligatoria.');
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
                    localidad: 'San José de Mayo',
                    metodo_pago: 'haberes',
                    autoriza_descuento: true,
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
                        Hemos recibido tu solicitud de inscripción. La Comisión Directiva revisará tus datos para dar el alta y te notificaremos cuando tu carnet físico institucional esté listo.
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

            {/* Selector de Tipo de Socio */}
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
                            onClick={() => {
                                const newSituacion = t.id;
                                setFormData(prev => ({
                                    ...prev,
                                    situacion: newSituacion,
                                    metodo_pago: newSituacion === 'policia_actividad' ? 'haberes' : (prev.metodo_pago === 'haberes' ? 'transferencia' : prev.metodo_pago)
                                }));
                            }}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                    {/* Nombre y Apellido */}
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

                    {/* Cédula y Teléfono */}
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
                            <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                Utilizado para notificaciones oficiales y recordatorios.
                            </small>
                        </FormGroup>
                    </Col>

                    {/* FORMA DE PAGO PREFERIDA */}
                    <Col xs={12}>
                        <div className="p-3 my-2 rounded-3" style={{ backgroundColor: '#F8FAFC', border: `1px solid ${artiguistaColors.gris[200]}` }}>
                            <Label className="fw-bold text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                                <CreditCard size={18} color={artiguistaColors.azul} />
                                Modalidad de Pago de Cuota Social ($140/mes) *
                            </Label>
                            
                            <Input
                                type="select"
                                name="metodo_pago"
                                id="metodo_pago"
                                value={formData.metodo_pago}
                                onChange={handleChange}
                                className="fw-semibold mb-2"
                                required
                            >
                                {formData.situacion === 'policia_actividad' && (
                                    <option value="haberes">👮 Descuento por recibo de sueldo (Jefatura de San José - UE 19)</option>
                                )}
                                <option value="transferencia">🏛️ Transferencia bancaria mensual (BROU - $140)</option>
                                <option value="cobrador">🏠 Cobro a domicilio (Visita del cobrador en San José)</option>
                                <option value="alumno">🎓 Alumno Escuela Departamental de Policía (Provisorio)</option>
                            </Input>

                            {/* Checkbox de autorización de descuento si es por haberes */}
                            {formData.metodo_pago === 'haberes' && (
                                <div className="form-check mt-3 pt-2 border-top">
                                    <Input
                                        type="checkbox"
                                        name="autoriza_descuento"
                                        id="autoriza_descuento"
                                        checked={formData.autoriza_descuento}
                                        onChange={handleChange}
                                        className="form-check-input"
                                        required
                                    />
                                    <Label for="autoriza_descuento" className="form-check-label small fw-semibold text-dark">
                                        <ShieldCheck size={16} className="text-success me-1 inline" />
                                        Autorizo formalmente al Círculo Policial de San José a gestionar la retención mensual de $140 de mis haberes a través de la Jefatura de Policía de San José.
                                    </Label>
                                </div>
                            )}

                            {formData.metodo_pago === 'transferencia' && (
                                <p className="small text-muted mb-0 mt-2">
                                    ℹ️ Se te enviará el día 1° de cada mes el recordatorio con los datos de la cuenta BROU y un botón para reportar la transferencia.
                                </p>
                            )}
                        </div>
                    </Col>

                    {/* Localidad y Dirección */}
                    <Col md={5}>
                        <FormGroup className="mb-2">
                            <Label for="localidad" className="small fw-semibold text-muted">Localidad / Ciudad *</Label>
                            <Input
                                type="select"
                                name="localidad"
                                id="localidad"
                                value={formData.localidad}
                                onChange={handleChange}
                                required
                            >
                                <option value="San José de Mayo">San José de Mayo</option>
                                <option value="Ciudad del Plata">Ciudad del Plata</option>
                                <option value="Libertad">Libertad</option>
                                <option value="Rodríguez">Rodríguez</option>
                                <option value="Ecilda Paullier">Ecilda Paullier</option>
                                <option value="Rafael Perazza">Rafael Perazza</option>
                                <option value="Puntas de Valdez">Puntas de Valdez</option>
                                <option value="Otra localidad">Otra localidad</option>
                            </Input>
                        </FormGroup>
                    </Col>

                    <Col md={7}>
                        <FormGroup className="mb-2">
                            <Label for="direccion" className="small fw-semibold text-muted">Dirección Domicilio *</Label>
                            <Input
                                type="text"
                                name="direccion"
                                id="direccion"
                                placeholder="Calle, número de puerta"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                    </Col>

                    {/* Campos para Policías */}
                    {formData.situacion !== 'civil' && (
                        <>
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

                            <Col md={6}>
                                <FormGroup className="mb-2">
                                    <Label for="unidad" className="small fw-semibold text-muted">Dependencia / Destino</Label>
                                    <Input
                                        type="text"
                                        name="unidad"
                                        id="unidad"
                                        placeholder="Ej: Seccional 1ª, PADO, etc."
                                        value={formData.unidad}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </>
                    )}

                    {/* Mensaje adicional */}
                    <Col xs={12}>
                        <FormGroup className="mb-3">
                            <Label for="mensaje" className="small fw-semibold text-muted">Comentarios / Observaciones (Opcional)</Label>
                            <Input
                                type="textarea"
                                name="mensaje"
                                id="mensaje"
                                rows={2}
                                placeholder="¿Alguna aclaración o consulta?"
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
                                {status === 'sending' ? 'Enviando solicitud...' : 'Enviar Solicitud de Inscripción'}
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
