'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Badge, Spinner } from 'reactstrap';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Printer, ShieldCheck, Building2, UserCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { artiguistaColors } from '@/styles/colors';

interface ConvenioData {
    id?: number;
    nombre: string;
    razon_social?: string;
    rut_comercio?: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
    direccion: string | null;
    telefono: string | null;
    representante_comercio?: string;
    cargo_representante_comercio?: string;
}

function ImprimirConvenioContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const convenioId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    
    // Configuración de firmas del Círculo Policial
    const [tipoFirma, setTipoFirma] = useState<'unica' | 'conjunta' | 'triple'>('unica');
    const [rutCirculo, setRutCirculo] = useState('219900110018'); // Editable
    const [presidenteNombre, setPresidenteNombre] = useState('Crio. Mayor (R) Darcy González');
    const [presidenteCI, setPresidenteCI] = useState('1.831.097-1');
    const [secretarioNombre, setSecretarioNombre] = useState('Crio. Mayor (R) Jorge Carrato');
    const [secretarioCI, setSecretarioCI] = useState('');
    const [tesoreroNombre, setTesoreroNombre] = useState('Crio. P.A. Gabriel López');
    const [tesoreroCI, setTesoreroCI] = useState('');

    // Datos del Comercio / Institución Adherida
    const [comercioNombre, setComercioNombre] = useState('');
    const [razonSocial, setRazonSocial] = useState('');
    const [rutComercio, setRutComercio] = useState('');
    const [categoriaComercio, setCategoriaComercio] = useState('Comercio');
    const [beneficioComercio, setBeneficioComercio] = useState('');
    const [descripcionComercio, setDescripcionComercio] = useState('');
    const [logoUrlComercio, setLogoUrlComercio] = useState<string | null>(null);
    const [direccionComercio, setDireccionComercio] = useState('');
    const [telefonoComercio, setTelefonoComercio] = useState('');
    
    // Representante del Comercio / Institución
    const [repComercioNombre, setRepComercioNombre] = useState('');
    const [repComercioCargo, setRepComercioCargo] = useState('Representante Legal');
    const [repComercioCI, setRepComercioCI] = useState('');

    // Denominación legal de la contraparte en el contrato
    const [denominacionContraparte, setDenominacionContraparte] = useState('LA ENTIDAD ADHERIDA');

    // Ajustes Legales
    const [incluirExclusividad, setIncluirExclusividad] = useState(false);
    const [textoExclusividad, setTextoExclusividad] = useState(
        'El Círculo Policial se compromete a priorizar la difusión del presente beneficio entre sus asociados dentro del rubro especificado durante la vigencia del acuerdo.'
    );
    const [fechaFirma, setFechaFirma] = useState(() => {
        const hoy = new Date();
        const dia = hoy.getDate();
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const mes = meses[hoy.getMonth()];
        const anio = hoy.getFullYear();
        return `${dia} de ${mes} de ${anio}`;
    });
    const [ciudadFirma, setCiudadFirma] = useState('San José de Mayo');

    // Cargar datos si se pasa un ID de convenio
    useEffect(() => {
        if (!convenioId) return;

        setLoading(true);
        fetch('/api/convenios')
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.convenios)) {
                    const c = data.convenios.find((item: ConvenioData) => item.id === Number(convenioId));
                    if (c) {
                        setComercioNombre(c.nombre || '');
                        setRazonSocial(c.razon_social || c.nombre || '');
                        setRutComercio(c.rut_comercio || '');
                        setCategoriaComercio(c.categoria || 'Comercio');
                        setBeneficioComercio(c.beneficio || '');
                        setDescripcionComercio(c.descripcion || '');
                        setLogoUrlComercio(c.logo_url || null);
                        setDireccionComercio(c.direccion || '');
                        setTelefonoComercio(c.telefono || '');
                        if (c.representante_comercio) setRepComercioNombre(c.representante_comercio);
                        if (c.cargo_representante_comercio) setRepComercioCargo(c.cargo_representante_comercio);
                    }
                }
            })
            .catch(err => console.error('Error cargando convenio:', err))
            .finally(() => setLoading(false));
    }, [convenioId]);

    const handleImprimir = () => {
        window.print();
    };

    return (
        <div className="min-vh-100 bg-light pb-5">
            {/* CSS de Impresión A4 Editorial */}
            <style jsx global>{`
                @media print {
                    /* Ocultar elementos de navegación y paneles administrativos */
                    .no-print, header, footer, nav, .btn, .card-header-actions {
                        display: none !important;
                    }

                    body, html {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-family: Arial, Helvetica, sans-serif !important;
                        color: #1a1a1a !important;
                        font-size: 11pt !important;
                        line-height: 1.5 !important;
                    }

                    .page-container {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: #ffffff !important;
                    }

                    .doc-a4-sheet {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 1.8cm 1.8cm 1.5cm 1.8cm !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        background: #ffffff !important;
                        box-sizing: border-box !important;
                    }

                    .doc-header-border {
                        border-bottom: 2px solid #00244F !important;
                    }

                    .doc-gold-divider {
                        border-top: 1px solid #D4AF37 !important;
                    }

                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                    }
                }

                /* Estilos en pantalla */
                .doc-a4-sheet {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 2.2cm 2cm 2cm 2cm;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    box-sizing: border-box;
                    color: #1e293b;
                    position: relative;
                }
            `}</style>

            {/* Cabecera Administrativa (No imprimible) */}
            <div className="bg-white border-bottom shadow-sm py-3 mb-4 no-print">
                <Container fluid="lg">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <Link href="/admin/convenios">
                                <Button color="light" className="rounded-circle p-2 d-flex align-items-center justify-content-center">
                                    <ArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="h4 fw-bold mb-0 text-dark">
                                    Redactor de Convenios Institucionales
                                </h1>
                                <span className="small text-muted">
                                    Generá el documento PDF/A4 oficial impresurable del Círculo Policial San José
                                </span>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <Button
                                color="primary"
                                onClick={handleImprimir}
                                className="fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                                style={{ backgroundColor: artiguistaColors.azul, borderColor: artiguistaColors.azul }}
                            >
                                <Printer size={18} /> Imprimir / Guardar en PDF
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container fluid="lg">
                <Row className="g-4">
                    {/* Panel de Edición de Parámetros (No imprimible) */}
                    <Col lg={4} className="no-print">
                        <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: '20px' }}>
                            <CardBody className="p-4">
                                <h2 className="h5 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                    <Building2 size={18} className="text-primary" /> Parámetros del Documento
                                </h2>

                                {loading ? (
                                    <div className="text-center py-4">
                                        <Spinner color="primary" size="sm" />
                                        <p className="small text-muted mt-2">Cargando datos del convenio...</p>
                                    </div>
                                ) : (
                                    <Form className="small">
                                        {/* Firma del Círculo Policial */}
                                        <div className="mb-4 pb-3 border-bottom">
                                            <Label className="fw-bold text-uppercase text-primary small d-block mb-2">
                                                1. Representación Círculo Policial
                                            </Label>
                                            
                                            <FormGroup className="mb-3">
                                                <Label className="fw-semibold">RUT del Círculo Policial</Label>
                                                <Input 
                                                    type="text" 
                                                    value={rutCirculo} 
                                                    onChange={e => setRutCirculo(e.target.value)} 
                                                    placeholder="Ej. 219900110018"
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-3">
                                                <Label className="fw-semibold">Modalidad de Firma Institucional</Label>
                                                <div className="d-flex flex-wrap gap-2 mt-1">
                                                    <FormGroup check inline>
                                                        <Label check className="fw-medium">
                                                            <Input 
                                                                type="radio" 
                                                                name="tipoFirma" 
                                                                checked={tipoFirma === 'unica'} 
                                                                onChange={() => setTipoFirma('unica')}
                                                            /> 1 Firma (Pres.)
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Label check className="fw-medium">
                                                            <Input 
                                                                type="radio" 
                                                                name="tipoFirma" 
                                                                checked={tipoFirma === 'conjunta'} 
                                                                onChange={() => setTipoFirma('conjunta')}
                                                            /> 2 Firmas (Pres. + Sec.)
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Label check className="fw-medium">
                                                            <Input 
                                                                type="radio" 
                                                                name="tipoFirma" 
                                                                checked={tipoFirma === 'triple'} 
                                                                onChange={() => setTipoFirma('triple')}
                                                            /> 3 Firmas (Pres. + Sec. + Tes.)
                                                        </Label>
                                                    </FormGroup>
                                                </div>
                                            </FormGroup>

                                            <Row className="g-2 mb-2">
                                                <Col xs={7}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">Nombre Presidente</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={presidenteNombre} 
                                                            onChange={e => setPresidenteNombre(e.target.value)} 
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col xs={5}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">C.I. Presidente</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={presidenteCI} 
                                                            onChange={e => setPresidenteCI(e.target.value)} 
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {(tipoFirma === 'conjunta' || tipoFirma === 'triple') && (
                                                <Row className="g-2 mt-1">
                                                    <Col xs={7}>
                                                        <FormGroup className="mb-0">
                                                            <Label className="fw-semibold">Nombre Secretario</Label>
                                                            <Input 
                                                                type="text" 
                                                                value={secretarioNombre} 
                                                                onChange={e => setSecretarioNombre(e.target.value)} 
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col xs={5}>
                                                        <FormGroup className="mb-0">
                                                            <Label className="fw-semibold">C.I. Secretario</Label>
                                                            <Input 
                                                                type="text" 
                                                                value={secretarioCI} 
                                                                onChange={e => setSecretarioCI(e.target.value)} 
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {tipoFirma === 'triple' && (
                                                <Row className="g-2 mt-1">
                                                    <Col xs={7}>
                                                        <FormGroup className="mb-0">
                                                            <Label className="fw-semibold">Nombre Tesorero</Label>
                                                            <Input 
                                                                type="text" 
                                                                value={tesoreroNombre} 
                                                                onChange={e => setTesoreroNombre(e.target.value)} 
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col xs={5}>
                                                        <FormGroup className="mb-0">
                                                            <Label className="fw-semibold">C.I. Tesorero</Label>
                                                            <Input 
                                                                type="text" 
                                                                value={tesoreroCI} 
                                                                onChange={e => setTesoreroCI(e.target.value)} 
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}
                                        </div>

                                        {/* Datos del Comercio */}
                                        <div className="mb-4 pb-3 border-bottom">
                                            <Label className="fw-bold text-uppercase text-primary small d-block mb-2">
                                                2. Datos del Comercio / Institución Adherida
                                            </Label>

                                            <FormGroup className="mb-2">
                                                <Label className="fw-semibold">Nombre Comercial / Institución *</Label>
                                                <Input 
                                                    type="text" 
                                                    value={comercioNombre} 
                                                    onChange={e => setComercioNombre(e.target.value)} 
                                                    placeholder="Ej. VAL ORTOPEDIA / Asociación X"
                                                    required
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-2">
                                                <Label className="fw-semibold">Denominación Legal de la Contraparte</Label>
                                                <Input 
                                                    type="select" 
                                                    value={denominacionContraparte} 
                                                    onChange={e => setDenominacionContraparte(e.target.value)}
                                                >
                                                    <option value="LA ENTIDAD ADHERIDA">LA ENTIDAD ADHERIDA (Recomendado)</option>
                                                    <option value="LA INSTITUCIÓN">LA INSTITUCIÓN</option>
                                                    <option value="LA EMPRESA">LA EMPRESA</option>
                                                    <option value="EL COMERCIO">EL COMERCIO</option>
                                                </Input>
                                            </FormGroup>

                                            <Row className="g-2 mb-2">
                                                <Col xs={7}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">Razón Social</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={razonSocial} 
                                                            onChange={e => setRazonSocial(e.target.value)} 
                                                            placeholder="Ej. GODOY BELLINI LUCIA Y VICTORIA"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col xs={5}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">RUT Comercio</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={rutComercio} 
                                                            onChange={e => setRutComercio(e.target.value)} 
                                                            placeholder="Ej. 219761380012"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Row className="g-2 mb-2">
                                                <Col xs={7}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">Representante Legal / Titular</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={repComercioNombre} 
                                                            onChange={e => setRepComercioNombre(e.target.value)} 
                                                            placeholder="Ej. Victoria Godoy"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col xs={5}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">Cargo Representante</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={repComercioCargo} 
                                                            onChange={e => setRepComercioCargo(e.target.value)} 
                                                            placeholder="Ej. Co-Fundadora"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <FormGroup className="mb-2">
                                                <Label className="fw-semibold">Dirección Comercial</Label>
                                                <Input 
                                                    type="text" 
                                                    value={direccionComercio} 
                                                    onChange={e => setDireccionComercio(e.target.value)} 
                                                    placeholder="Ej. 25 de Mayo 704, San José de Mayo"
                                                />
                                            </FormGroup>
                                        </div>

                                        {/* Beneficios */}
                                        <div className="mb-4 pb-3 border-bottom">
                                            <Label className="fw-bold text-uppercase text-primary small d-block mb-2">
                                                3. Beneficios y Condiciones
                                            </Label>

                                            <FormGroup className="mb-2">
                                                <Label className="fw-semibold">Beneficio Principal Destacado *</Label>
                                                <Input 
                                                    type="text" 
                                                    value={beneficioComercio} 
                                                    onChange={e => setBeneficioComercio(e.target.value)} 
                                                    placeholder="Ej. 10% de Descuento en productos de ortopedia"
                                                    required
                                                />
                                            </FormGroup>

                                            <FormGroup className="mb-2">
                                                <Label className="fw-semibold">Detalle Extendido del Beneficio</Label>
                                                <Input 
                                                    type="textarea" 
                                                    rows={3} 
                                                    value={descripcionComercio} 
                                                    onChange={e => setDescripcionComercio(e.target.value)} 
                                                    placeholder="Describí los porcentajes, rubros o alcances del descuento..."
                                                />
                                            </FormGroup>

                                            <FormGroup check className="mt-3">
                                                <Label check className="fw-medium text-dark">
                                                    <Input 
                                                        type="checkbox" 
                                                        checked={incluirExclusividad} 
                                                        onChange={e => setIncluirExclusividad(e.target.checked)} 
                                                    /> Incluir Cláusula de Preferencia / Exclusividad
                                                </Label>
                                            </FormGroup>
                                        </div>

                                        {/* Lugar y Fecha */}
                                        <div>
                                            <Label className="fw-bold text-uppercase text-primary small d-block mb-2">
                                                4. Lugar y Fecha de Firma
                                            </Label>

                                            <Row className="g-2">
                                                <Col xs={5}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">Ciudad</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={ciudadFirma} 
                                                            onChange={e => setCiudadFirma(e.target.value)} 
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col xs={7}>
                                                    <FormGroup className="mb-0">
                                                        <Label className="fw-semibold">Fecha</Label>
                                                        <Input 
                                                            type="text" 
                                                            value={fechaFirma} 
                                                            onChange={e => setFechaFirma(e.target.value)} 
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Form>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Hoja A4 Imprimible */}
                    <Col lg={8} className="page-container">
                        <div className="doc-a4-sheet">

                            {/* Cabecera Bicéfala Institucional */}
                            <div className="d-flex align-items-center justify-content-between pb-3 mb-4 doc-header-border" style={{ borderBottom: `2px solid ${artiguistaColors.azul}` }}>
                                {/* Escudo Círculo Policial */}
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ position: 'relative', width: '65px', height: '65px' }}>
                                        <Image
                                            src="/images/logo-circulo-policial.png"
                                            alt="Escudo Círculo Policial San José"
                                            fill
                                            unoptimized
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="h6 fw-bold mb-0 text-uppercase" style={{ color: artiguistaColors.azul, letterSpacing: '0.5px' }}>
                                            Círculo Policial "Gral. José Artigas"
                                        </h3>
                                        <span className="small text-muted d-block fw-semibold" style={{ fontSize: '0.8rem' }}>
                                            San José de Mayo &bull; Personería Jurídica (1948)
                                        </span>
                                        {rutCirculo && (
                                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                RUT: {rutCirculo}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Logo Comercio Adherido */}
                                <div className="d-flex align-items-center gap-2">
                                    {logoUrlComercio ? (
                                        <div style={{ position: 'relative', width: '100px', height: '55px' }}>
                                            <Image
                                                src={logoUrlComercio}
                                                alt={comercioNombre || 'Logo Comercio'}
                                                fill
                                                unoptimized
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-end">
                                            <span className="fw-bold d-block text-dark" style={{ fontSize: '1rem' }}>
                                                {comercioNombre || 'ENTIDAD ADHERIDA'}
                                            </span>
                                            {rutComercio && (
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    RUT: {rutComercio}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Título Principal del Convenio */}
                            <div className="text-center my-4">
                                <h2 className="fw-bold text-uppercase m-0" style={{ color: artiguistaColors.azul, fontSize: '1.25rem', letterSpacing: '0.8px' }}>
                                    CONVENIO MARCO DE COOPERACIÓN Y BENEFICIOS INSTITUCIONALES
                                </h2>
                                <div className="mx-auto mt-2" style={{ width: '100px', height: '2px', backgroundColor: artiguistaColors.dorado }}></div>
                                <span className="small text-muted fw-bold d-block mt-2 text-uppercase" style={{ fontSize: '0.85rem' }}>
                                    CÍRCULO POLICIAL "GRAL. JOSÉ ARTIGAS" DE SAN JOSÉ &mdash; {comercioNombre.toUpperCase() || 'ENTIDAD ADHERIDA'}
                                </span>
                            </div>

                            {/* Cuerpo del Contrato (Cláusulas) */}
                            <div className="doc-body text-justify" style={{ fontSize: '10.5pt', lineHeight: '1.6' }}>
                                
                                {/* PRIMERA: Comparencia */}
                                <p className="mb-3">
                                    <strong>PRIMERA (Comparecencia):</strong> En la ciudad de {ciudadFirma}, a los {fechaFirma}, comparecen: 
                                    Por una parte, el <strong>CÍRCULO POLICIAL "GRAL. JOSÉ ARTIGAS" DE SAN JOSÉ</strong>
                                    {rutCirculo ? ` (RUT N° ${rutCirculo})` : ''}, fundado el 15 de abril de 1944 y con Personería Jurídica reconocida por el Estado en el año 1948, con domicilio legal en la calle Ituzaingó N° 441 de la ciudad de San José de Mayo, representada en este acto por {presidenteNombre} en su calidad de Presidente
                                    {tipoFirma === 'conjunta' ? ` y por ${secretarioNombre} en su calidad de Secretario` : ''}
                                    {tipoFirma === 'triple' ? `, por ${secretarioNombre} en su calidad de Secretario y por ${tesoreroNombre} en su calidad de Tesorero` : ''}, en adelante denominado <strong>"EL CÍRCULO"</strong>; 
                                    y por otra parte, {razonSocial ? <span>la entidad / empresa <strong>{razonSocial.toUpperCase()}</strong></span> : <span>la entidad <strong>{comercioNombre.toUpperCase() || '[Nombre Comercial / Institución]'}</strong></span>}
                                    {rutComercio ? ` (RUT N° ${rutComercio})` : ''}
                                    {direccionComercio ? `, fijando domicilio en ${direccionComercio}` : ''}
                                    {repComercioNombre ? `, representada por ${repComercioNombre} en su calidad de ${repComercioCargo}` : ''}, 
                                    en adelante denominada <strong>"{denominacionContraparte}"</strong>; quienes convienen en celebrar el presente acuerdo sujeto a las siguientes cláusulas:
                                </p>

                                {/* SEGUNDA: Objeto */}
                                <p className="mb-3">
                                    <strong>SEGUNDA (Objeto):</strong> El presente convenio tiene por objeto establecer un marco de alianza institucional y cooperación recíproca, 
                                    mediante el cual {denominacionContraparte} otorgará beneficios tarifarios y descuentos preferenciales a los socios del CÍRCULO POLICIAL DE SAN JOSÉ.
                                </p>

                                {/* TERCERA: Beneficios */}
                                <div className="mb-3 p-3 bg-light rounded-3" style={{ borderLeft: `4px solid ${artiguistaColors.azul}` }}>
                                    <strong className="d-block mb-1 text-uppercase" style={{ color: artiguistaColors.azul }}>
                                        TERCERA (Beneficios Otorgados):
                                    </strong>
                                    <p className="m-0 fw-bold text-dark mb-1">
                                        &bull; {beneficioComercio || 'Beneficio o porcentaje de descuento preferencial acordado.'}
                                    </p>
                                    {descripcionComercio && (
                                        <p className="m-0 text-muted small" style={{ whiteSpace: 'pre-wrap' }}>
                                            {descripcionComercio}
                                        </p>
                                    )}
                                    <span className="d-block mt-2 text-muted fst-italic" style={{ fontSize: '0.8rem' }}>
                                        Nota: Los beneficios no serán acumulables con otras promociones o liquidaciones temporales existentes en el establecimiento, salvo indicación expresa de {denominacionContraparte}.
                                    </span>
                                </div>

                                {/* CUARTA: Acreditación */}
                                <p className="mb-3">
                                    <strong>CUARTA (Mecanismo de Acreditación):</strong> Para hacer efectivo el beneficio, el socio deberá exhibir su 
                                    <strong> Carnet Oficial de Socio</strong> del Círculo Policial de San José junto con su 
                                    <strong> Cédula de Identidad</strong> al momento de la compra o contratación del servicio. {denominacionContraparte} no retendrá datos ni copias de documentos del usuario.
                                </p>

                                {/* QUINTA: Vigencia y Rescisión */}
                                <p className="mb-3">
                                    <strong>QUINTA (Vigencia y Renovación):</strong> El presente convenio tendrá una vigencia de <strong>un (1) año</strong> a partir de la fecha de su firma, 
                                    renovándose de forma automática por períodos iguales, salvo que cualquiera de las partes manifieste por escrito su voluntad de rescindirlo con una antelación mínima de treinta (30) días.
                                </p>

                                {/* SEXTA: Difusión Mutua */}
                                <p className="mb-3">
                                    <strong>SEXTA (Difusión Institucional):</strong> Ambas partes quedan autorizadas a difundir la existencia de esta alianza institucional a través de sus canales de comunicación habituales 
                                    (sitio web oficial, redes sociales, boletines informativos y carteleras institucionales).
                                </p>

                                {/* SÉPTIMA: Autonomía de las Partes */}
                                <p className="mb-3">
                                    <strong>SÉPTIMA (Autonomía Patrimonial):</strong> El presente acuerdo no genera vinculación laboral, societaria ni responsabilidad solidaria o patrimonial entre las partes. Cada institución conserva su total autonomía.
                                </p>

                                {/* OCTAVA: Exclusividad (Si aplica) */}
                                {incluirExclusividad && (
                                    <p className="mb-3">
                                        <strong>OCTAVA (Preferencia de Difusión):</strong> {textoExclusividad}
                                    </p>
                                )}
                            </div>

                            {/* Cierre y Firmas */}
                            <div className="doc-signatures page-break-inside-avoid mt-5 pt-3">
                                <p className="text-center mb-5 small">
                                    En señal de plena conformidad y aceptación, se firman dos (2) ejemplares de un mismo tenor e idéntico efecto en la ciudad de {ciudadFirma}, a los {fechaFirma}.
                                </p>

                                <div className="d-flex justify-content-between align-items-end text-center mt-5 pt-4 gap-2">
                                    {/* Firma 1 Círculo Policial: Presidente */}
                                    <div style={{ width: tipoFirma === 'triple' ? '23%' : tipoFirma === 'conjunta' ? '30%' : '42%' }}>
                                        <div className="mb-2" style={{ borderBottom: '1px solid #333', height: '45px' }}></div>
                                        <strong className="d-block text-dark" style={{ fontSize: '0.85rem' }}>
                                            Por Círculo Policial
                                        </strong>
                                        <span className="d-block text-muted small">{presidenteNombre}</span>
                                        <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                                            Presidente {presidenteCI ? `(C.I. ${presidenteCI})` : ''}
                                        </span>
                                    </div>

                                    {/* Firma 2 Círculo Policial: Secretario (Si es conjunta o triple) */}
                                    {(tipoFirma === 'conjunta' || tipoFirma === 'triple') && (
                                        <div style={{ width: tipoFirma === 'triple' ? '23%' : '30%' }}>
                                            <div className="mb-2" style={{ borderBottom: '1px solid #333', height: '45px' }}></div>
                                            <strong className="d-block text-dark" style={{ fontSize: '0.85rem' }}>
                                                Por Círculo Policial
                                            </strong>
                                            <span className="d-block text-muted small">{secretarioNombre}</span>
                                            <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                                                Secretario {secretarioCI ? `(C.I. ${secretarioCI})` : ''}
                                            </span>
                                        </div>
                                    )}

                                    {/* Firma 3 Círculo Policial: Tesorero (Si es triple) */}
                                    {tipoFirma === 'triple' && (
                                        <div style={{ width: '23%' }}>
                                            <div className="mb-2" style={{ borderBottom: '1px solid #333', height: '45px' }}></div>
                                            <strong className="d-block text-dark" style={{ fontSize: '0.85rem' }}>
                                                Por Círculo Policial
                                            </strong>
                                            <span className="d-block text-muted small">{tesoreroNombre}</span>
                                            <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                                                Tesorero {tesoreroCI ? `(C.I. ${tesoreroCI})` : ''}
                                            </span>
                                        </div>
                                    )}

                                    {/* Firma Contraparte Adherida */}
                                    <div style={{ width: tipoFirma === 'triple' ? '23%' : tipoFirma === 'conjunta' ? '30%' : '42%' }}>
                                        <div className="mb-2" style={{ borderBottom: '1px solid #333', height: '45px' }}></div>
                                        <strong className="d-block text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                                            Por {comercioNombre || denominacionContraparte}
                                        </strong>
                                        <span className="d-block text-muted small text-truncate">
                                            {repComercioNombre || 'Firma Titular / Rep.'}
                                        </span>
                                        <span className="d-block text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                                            {repComercioCargo} {repComercioCI ? `(C.I. ${repComercioCI})` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pie de página oficial del documento */}
                            <div className="text-center mt-5 pt-4 border-top" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                <span>Círculo Policial "Gral. José Artigas" de San José &bull; Ituzaingó N° 441, San José de Mayo, Uruguay &bull; Web: circulopolicialsj.org.uy</span>
                            </div>

                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default function ImprimirConvenioPage() {
    return (
        <Suspense fallback={
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <Spinner color="primary" />
            </div>
        }>
            <ImprimirConvenioContent />
        </Suspense>
    );
}
