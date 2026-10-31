'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { CheckCircle2, Upload, AlertCircle, Copy, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function ReportarPagoForm() {
    const searchParams = useSearchParams();
    const ciParam = searchParams.get('ci') || '';

    const [cedula, setCedula] = useState(ciParam);
    const [observaciones, setObservaciones] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<{ message: string; nombreSocio?: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copiedAccount, setCopiedAccount] = useState(false);

    useEffect(() => {
        if (ciParam && !cedula) {
            setCedula(ciParam);
        }
    }, [ciParam, cedula]);

    const handleCopyAccount = () => {
        navigator.clipboard.writeText('00157972800001');
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2500);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) {
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        if (selected.size > 6 * 1024 * 1024) {
            setErrorMessage('El archivo no debe superar los 6 MB.');
            setFile(null);
            setPreviewUrl(null);
            return;
        }

        setErrorMessage(null);
        setFile(selected);

        if (selected.type.startsWith('image/')) {
            const url = URL.createObjectURL(selected);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        const cleanCedula = cedula.replace(/\D/g, '');
        if (!cleanCedula || cleanCedula.length < 6) {
            setErrorMessage('Por favor ingresá tu cédula de identidad completa.');
            return;
        }

        if (!file) {
            setErrorMessage('Por favor adjuntá la foto o PDF del comprobante de transferencia.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('cedula', cleanCedula);
            formData.append('observaciones', observaciones);
            formData.append('comprobante', file);

            const res = await fetch('/api/pagos/reportar', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Ocurrió un error al enviar el comprobante.');
            }

            setSuccessData({
                message: data.message,
                nombreSocio: data.nombreSocio,
            });
        } catch (err: any) {
            setErrorMessage(err.message || 'Error de conexión. Por favor reintentá.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '90vh', padding: '2.5rem 0 4rem 0' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={9} lg={7} xl={6}>
                        {/* Botón Volver */}
                        <div className="mb-3">
                            <Link href="/" className="text-decoration-none text-muted d-inline-flex align-items-center gap-1 small fw-bold">
                                <ArrowLeft size={16} /> Volver al Inicio
                            </Link>
                        </div>

                        {/* Encabezado */}
                        <div className="text-center mb-4">
                            <div 
                                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                                style={{ width: '60px', height: '60px', backgroundColor: '#002B49', color: '#fff' }}
                            >
                                <ShieldCheck size={32} />
                            </div>
                            <h1 className="h3 fw-bold text-dark mb-1">Reportar Pago de Cuota Social</h1>
                            <p className="text-muted small mb-0">
                                Círculo Policial San José — Envío directo de comprobante BROU
                            </p>
                        </div>

                        {/* Tarjeta de Datos Bancarios BROU */}
                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem', backgroundColor: '#EFF6FF', borderLeft: '5px solid #2563EB' }}>
                            <CardBody className="p-3 p-md-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="badge bg-primary px-2.5 py-1.5" style={{ fontSize: '0.8rem' }}>
                                        🏛️ Datos BROU Oficiales
                                    </span>
                                    <span className="fw-bold text-primary" style={{ fontSize: '1.05rem' }}>
                                        Cuota: $ 140
                                    </span>
                                </div>

                                <div className="bg-white p-3 rounded-3 border mb-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="text-muted small">Caja de Ahorros en Pesos ($):</div>
                                            <div className="fw-bold font-monospace" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                                001579728-00001
                                            </div>
                                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                                (Formato sin guion: 0015579728)
                                            </div>
                                        </div>
                                        <Button
                                            color="light"
                                            size="sm"
                                            className="d-flex align-items-center gap-1 border shadow-sm text-nowrap"
                                            onClick={handleCopyAccount}
                                            title="Copiar número de cuenta"
                                        >
                                            {copiedAccount ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                            <span style={{ fontSize: '0.75rem' }}>{copiedAccount ? '¡Copiado!' : 'Copiar'}</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="small text-secondary">
                                    <strong>Titular:</strong> CIRCULO POLICIAL GENERAL JOSE ARTIGAS
                                </div>
                            </CardBody>
                        </Card>

                        {/* Estado: Éxito */}
                        {successData ? (
                            <Card className="border-0 shadow-sm text-center p-4" style={{ borderRadius: '1rem' }}>
                                <CardBody>
                                    <CheckCircle2 size={64} className="text-success mb-3" />
                                    <h2 className="h4 fw-bold text-dark mb-2">¡Comprobante Recibido con Éxito!</h2>
                                    {successData.nombreSocio && successData.nombreSocio !== 'Socio No Registrado en Padrón' && (
                                        <div className="alert alert-light border d-inline-block px-3 py-2 my-2 text-primary fw-bold">
                                            Socio: {successData.nombreSocio}
                                        </div>
                                    )}
                                    <p className="text-muted mb-4">
                                        Muchas gracias. El comprobante de la cuota ($ 140) fue enviado directamente a la administración del Círculo Policial para su acreditación.
                                    </p>
                                    <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                                        <Button color="primary" onClick={() => { setSuccessData(null); setFile(null); setPreviewUrl(null); setObservaciones(''); }}>
                                            Reportar Otro Pago
                                        </Button>
                                        <Link href="/" className="btn btn-outline-secondary">
                                            Volver al Inicio
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>
                        ) : (
                            /* Formulario */
                            <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                                <CardBody className="p-4">
                                    {errorMessage && (
                                        <Alert color="danger" className="d-flex align-items-center gap-2">
                                            <AlertCircle size={20} className="flex-shrink-0" />
                                            <div>{errorMessage}</div>
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        {/* Cédula */}
                                        <FormGroup className="mb-3">
                                            <Label for="cedulaInput" className="fw-bold text-dark">
                                                Cédula de Identidad del Socio *
                                            </Label>
                                            <Input
                                                id="cedulaInput"
                                                type="text"
                                                placeholder="Ej: 1.234.567-8"
                                                value={cedula}
                                                onChange={(e) => setCedula(e.target.value)}
                                                required
                                                disabled={loading}
                                                className="form-control-lg"
                                                style={{ fontSize: '1.05rem' }}
                                            />
                                            <small className="text-muted">
                                                Ingresá tu cédula con o sin puntos y guion.
                                            </small>
                                        </FormGroup>

                                        {/* Archivo Comprobante */}
                                        <FormGroup className="mb-3">
                                            <Label for="fileInput" className="fw-bold text-dark">
                                                Captura o Comprobante de Transferencia *
                                            </Label>
                                            <div 
                                                className="border rounded-3 p-3 text-center" 
                                                style={{ backgroundColor: '#F8FAFC', borderStyle: 'dashed' }}
                                            >
                                                <Upload size={32} className="text-muted mb-2" />
                                                <p className="small text-muted mb-2">
                                                    Subí la foto o captura de pantalla desde tu celular, o el archivo PDF generado por la app del banco.
                                                </p>
                                                <Input
                                                    id="fileInput"
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileChange}
                                                    disabled={loading}
                                                    className="d-none"
                                                />
                                                <Button
                                                    type="button"
                                                    color="primary"
                                                    outline
                                                    size="sm"
                                                    onClick={() => document.getElementById('fileInput')?.click()}
                                                    disabled={loading}
                                                    className="px-3"
                                                >
                                                    {file ? 'Cambiar archivo seleccionado' : 'Seleccionar Foto / Archivo'}
                                                </Button>

                                                {file && (
                                                    <div className="mt-3 p-2 bg-white rounded border text-start d-flex align-items-center justify-content-between">
                                                        <span className="small text-truncate" style={{ maxWidth: '240px' }}>
                                                            📎 <strong>{file.name}</strong> ({(file.size / 1024).toFixed(0)} KB)
                                                        </span>
                                                        <span className="badge bg-success">Listo</span>
                                                    </div>
                                                )}

                                                {previewUrl && (
                                                    <div className="mt-3 text-center">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={previewUrl}
                                                            alt="Vista previa del comprobante"
                                                            className="img-fluid rounded border shadow-sm"
                                                            style={{ maxHeight: '200px' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </FormGroup>

                                        {/* Comentarios u Observaciones opcionales */}
                                        <FormGroup className="mb-4">
                                            <Label for="obsInput" className="text-muted small fw-bold">
                                                Observaciones o mes abonado (Opcional)
                                            </Label>
                                            <Input
                                                id="obsInput"
                                                type="textarea"
                                                rows={2}
                                                placeholder="Ej: Cuota correspondiente a este mes..."
                                                value={observaciones}
                                                onChange={(e) => setObservaciones(e.target.value)}
                                                disabled={loading}
                                            />
                                        </FormGroup>

                                        {/* Botón de Enviar */}
                                        <Button
                                            type="submit"
                                            color="primary"
                                            size="lg"
                                            block
                                            disabled={loading || !file}
                                            className="fw-bold py-2.5 shadow-sm"
                                            style={{ backgroundColor: '#002B49', borderColor: '#002B49' }}
                                        >
                                            {loading ? (
                                                <span className="d-flex align-items-center justify-content-center gap-2">
                                                    <Spinner size="sm" /> Enviando comprobante...
                                                </span>
                                            ) : (
                                                'Enviar Comprobante ($ 140)'
                                            )}
                                        </Button>

                                        <p className="text-muted text-center small mt-3 mb-0" style={{ fontSize: '0.8rem' }}>
                                            🔒 El comprobante se remite encriptado y seguro a la casilla oficial del Círculo Policial San José.
                                        </p>
                                    </Form>
                                </CardBody>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default function ReportarPagoPage() {
    return (
        <Suspense fallback={
            <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-2 text-muted">Cargando formulario de pago...</p>
            </div>
        }>
            <ReportarPagoForm />
        </Suspense>
    );
}
