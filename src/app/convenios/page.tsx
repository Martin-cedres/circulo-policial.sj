'use client';

import { useEffect, useState } from 'react';
import { 
    Container, Row, Col, Card, CardBody, Badge, 
    Form, FormGroup, Label, Input, Button, Alert, Spinner
} from 'reactstrap';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import AnimatedSection from '@/components/AnimatedSection';
import CarnetSocioDigital from '@/components/home/CarnetSocioDigital';
import { 
    ShoppingBag, HeartPulse, GraduationCap, 
    Utensils, Wrench, Landmark, MapPin, Globe, 
    Phone, Instagram, MessageCircle, Send, CheckCircle 
} from 'lucide-react';

interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
    sitio_web: string | null;
    whatsapp: string | null;
    instagram: string | null;
    telefono: string | null;
    direccion: string | null;
}



const getCategoryIcon = (category: string, size = 24, colorClass?: string) => {
    const cls = colorClass || '';
    switch (category.toLowerCase()) {
        case 'salud':
            return <HeartPulse className={cls || "text-danger"} size={size} />;
        case 'gastronomía':
            return <Utensils className={cls || "text-warning"} size={size} />;
        case 'educación':
            return <GraduationCap className={cls || "text-primary"} size={size} />;
        case 'servicios':
            return <Wrench className={cls || "text-secondary"} size={size} />;
        case 'financiero':
            return <Landmark className={cls || "text-success"} size={size} />;
        case 'comercio':
        default:
            return <ShoppingBag className={cls || "text-info"} size={size} />;
    }
};

export default function ConveniosPublicPage() {
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado para el formulario de solicitudes
    const [formSolicitud, setFormSolicitud] = useState({
        comercio_nombre: '',
        contacto_nombre: '',
        email: '',
        telefono: '',
        whatsapp: '',
        instagram: '',
        propuesta: ''
    });
    const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
    const [solicitudSuccess, setSolicitudSuccess] = useState(false);
    const [solicitudError, setSolicitudError] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    useEffect(() => {
        fetch('/api/convenios')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConvenios(data.convenios || []);
                }
            })
            .catch(err => console.error('Error fetching convenios:', err))
            .finally(() => setLoading(false));
    }, []);



    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviandoSolicitud(true);
        setSolicitudError('');
        setSolicitudSuccess(false);

        try {
            const res = await fetch('/api/convenios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formSolicitud)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSolicitudSuccess(true);
                setFormSolicitud({
                    comercio_nombre: '',
                    contacto_nombre: '',
                    email: '',
                    telefono: '',
                    whatsapp: '',
                    instagram: '',
                    propuesta: ''
                });
            } else {
                setSolicitudError(data.error || 'Error al enviar la propuesta. Revisa los datos.');
            }
        } catch (err) {
            setSolicitudError('Error de red. Intenta nuevamente.');
        } finally {
            setEnviandoSolicitud(false);
        }
    };



    return (
        <main style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    color: artiguistaColors.blanco,
                    padding: '5rem 0',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Patrón sutil */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none'
                }}></div>

                <Container className="position-relative">
                    <AnimatedSection direction="none">
                        <h1 className={`display-3 fw-bold mb-3 ${satisfy.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                            Convenios Comerciales
                        </h1>
                        <p className="lead opacity-90 mx-auto" style={{ maxWidth: '700px', fontSize: '1.25rem' }}>
                            Ahorrá y disfrutá. Presentá tu carnet de socio del Círculo Policial San José y accedé a beneficios exclusivos.
                        </p>
                    </AnimatedSection>
                </Container>
            </section>

            {/* Sección del Carnet de Socio y Requisitos */}
            <section className="py-5" style={{ backgroundColor: '#ffffff', borderBottom: `1px solid ${artiguistaColors.gris[200]}` }}>
                <Container>
                    <Row className="align-items-center g-5">
                        <Col lg={6}>
                            <AnimatedSection direction="left">
                                <Badge 
                                    color="primary" 
                                    className="px-3 py-2 mb-3 rounded-pill text-uppercase fw-bold border-0"
                                    style={{ backgroundColor: `${artiguistaColors.azul}15`, color: artiguistaColors.azul, fontSize: '0.8rem', letterSpacing: '1px' }}
                                >
                                    Tu Credencial de Beneficios
                                </Badge>
                                <h2 className="display-6 fw-bold mb-4" style={{ color: artiguistaColors.azul }}>
                                    ¿Cómo acceder a los descuentos?
                                </h2>
                                <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7' }}>
                                    Para disfrutar de los beneficios en los comercios adheridos, solo tenés que presentar tu <strong>Carnet de Socio</strong> junto con tu <strong>Cédula de Identidad</strong> y mantener tu cuota social al día.
                                </p>
                                
                                {/* Pasos */}
                                <div className="d-flex flex-column gap-3 mb-5">
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: artiguistaColors.azul, flexShrink: 0 }}>1</div>
                                        <div>
                                            <h4 className="h6 fw-bold text-dark mb-1">Asociate al Círculo Policial</h4>
                                            <p className="text-muted small mb-0">Adquirí tu carnet oficial de socio para formar parte de la red de beneficios.</p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: artiguistaColors.dorado, flexShrink: 0 }}>2</div>
                                        <div>
                                            <h4 className="h6 fw-bold text-dark mb-1">Presentá el Carnet + tu C.I.</h4>
                                            <p className="text-muted small mb-0">Al realizar tu compra en el comercio adherido, presentá tu carnet de socio junto a tu Cédula de Identidad.</p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: artiguistaColors.azul, flexShrink: 0 }}>3</div>
                                        <div>
                                            <h4 className="h6 fw-bold text-dark mb-1">Disfrutá del Beneficio</h4>
                                            <p className="text-muted small mb-0">El comercio te aplicará el descuento directo correspondiente (con la cuota social al día).</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex flex-wrap gap-3">
                                    <Link href="/asociarse" passHref legacyBehavior>
                                        <Button 
                                            color="primary"
                                            className="px-4 py-3 fw-bold hover-scale border-0 shadow-sm"
                                            style={{ backgroundColor: artiguistaColors.azul, borderRadius: '50px' }}
                                        >
                                            Quiero Asociarme y Obtener mi Carnet
                                        </Button>
                                    </Link>
                                    <a href="#listado" className="btn btn-outline-secondary px-4 py-3 fw-semibold rounded-pill hover-scale">
                                        Ver Comercios Adheridos
                                    </a>
                                </div>
                            </AnimatedSection>
                        </Col>
                        <Col lg={6} className="d-flex align-items-center justify-content-center">
                            <AnimatedSection direction="right" className="w-100">
                                <CarnetSocioDigital />
                            </AnimatedSection>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Listado de Convenios */}
            <section className="py-5" id="listado">
                <Container>
                    {/* Resultados */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="text-muted mt-2">Cargando beneficios...</p>
                        </div>
                    ) : convenios.length === 0 ? (
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
                            <ShoppingBag size={48} className="text-muted mb-3" />
                            <h3 className="h5 fw-bold text-dark">No hay convenios registrados</h3>
                            <p className="text-muted">Pronto sumaremos más convenios con comercios.</p>
                        </div>
                    ) : (
                        <Row className="g-4 mb-5">
                            <AnimatePresence mode="popLayout">
                                {convenios.map((c, index) => (
                                    <Col sm={6} md={4} lg={3} key={c.id}>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            whileHover={{ y: -8 }}
                                            transition={{ 
                                                type: "spring", 
                                                stiffness: 300, 
                                                damping: 20 
                                            }}
                                            className="h-100"
                                        >
                                            <Card 
                                                className="h-100 border-0 overflow-hidden"
                                                style={{ 
                                                    borderRadius: '1.25rem', 
                                                    backgroundColor: '#ffffff', 
                                                    boxShadow: '0 10px 30px rgba(0, 36, 79, 0.05)',
                                                    border: `1px solid ${artiguistaColors.gris[200]}`,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                {/* Foto / Banner del Comercio (Protagonista) */}
                                                <div 
                                                    className="position-relative w-100 overflow-hidden" 
                                                    style={{ 
                                                        aspectRatio: '1/1', 
                                                        backgroundColor: '#ffffff',
                                                        borderBottom: `1px solid ${artiguistaColors.gris[200]}`,
                                                        borderTopLeftRadius: '1.25rem',
                                                        borderTopRightRadius: '1.25rem'
                                                    }}
                                                >
                                                    {c.logo_url ? (
                                                        <img
                                                            src={c.logo_url}
                                                            alt={c.nombre}
                                                            style={{ 
                                                                width: '100%', 
                                                                height: '100%', 
                                                                objectFit: 'contain',
                                                                padding: '1.25rem',
                                                                borderTopLeftRadius: '1.25rem',
                                                                borderTopRightRadius: '1.25rem'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="w-100 h-100 d-flex align-items-center justify-content-center"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                                                                borderTopLeftRadius: '1.25rem',
                                                                borderTopRightRadius: '1.25rem'
                                                            }}
                                                        >
                                                            {getCategoryIcon(c.categoria, 48, 'text-white')}
                                                        </div>
                                                    )}
                                                </div>

                                                <CardBody className="p-4 d-flex flex-column" style={{ minHeight: '220px' }}>
                                                    {/* Nombre y Beneficio */}
                                                    <h3 className="h5 fw-bold text-dark mb-1 text-truncate" title={c.nombre}>{c.nombre}</h3>
                                                    
                                                    <div 
                                                        className="small fw-bold mb-3 px-2 py-1 rounded" 
                                                        style={{ 
                                                            color: artiguistaColors.rojo, 
                                                            backgroundColor: `${artiguistaColors.rojo}10`,
                                                            width: 'fit-content',
                                                            fontSize: '0.85rem',
                                                            letterSpacing: '0.3px'
                                                        }}
                                                    >
                                                        {c.beneficio}
                                                    </div>

                                                    {/* Descripción */}
                                                    <p className="text-muted small flex-grow-1 mb-4" style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                                                        {c.descripcion || 'Beneficio aplicable a todos los asociados presentando credencial vigente.'}
                                                    </p>

                                                    {/* Datos de Contacto y Botonera Redonda */}
                                                    <div className="border-top pt-3 d-flex flex-column gap-3 mt-auto">
                                                        {c.direccion && (
                                                            <a 
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.nombre + ' ' + c.direccion)}`}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-muted small text-decoration-none d-flex align-items-center gap-2 hover-text-primary text-truncate"
                                                                style={{ transition: 'color 0.2s ease' }}
                                                            >
                                                                <MapPin size={15} className="text-primary flex-shrink-0" />
                                                                <span className="text-truncate" style={{ fontSize: '0.85rem' }}>{c.direccion}</span>
                                                            </a>
                                                        )}
                                                        
                                                        {/* Botonera de Contacto Circular Minimalista */}
                                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                                            {c.telefono && (
                                                                <a 
                                                                    href={`tel:${c.telefono}`} 
                                                                    title={`Llamar: ${c.telefono}`}
                                                                    className="rounded-circle d-flex align-items-center justify-content-center hover-scale border"
                                                                    style={{ 
                                                                        width: '36px', 
                                                                        height: '36px', 
                                                                        backgroundColor: '#f8f9fa',
                                                                        color: artiguistaColors.azul,
                                                                        transition: 'all 0.2s ease',
                                                                        borderColor: '#dee2e6'
                                                                    }}
                                                                >
                                                                    <Phone size={16} />
                                                                </a>
                                                            )}
                                                            {c.sitio_web && (
                                                                <a 
                                                                    href={c.sitio_web.startsWith('http') ? c.sitio_web : `https://${c.sitio_web}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    title="Visitar sitio web"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center hover-scale border"
                                                                    style={{ 
                                                                        width: '36px', 
                                                                        height: '36px', 
                                                                        backgroundColor: '#f8f9fa',
                                                                        color: '#00a8cc',
                                                                        transition: 'all 0.2s ease',
                                                                        borderColor: '#dee2e6'
                                                                    }}
                                                                >
                                                                    <Globe size={16} />
                                                                </a>
                                                            )}
                                                            {c.instagram && (
                                                                <a 
                                                                    href={c.instagram.startsWith('http') ? c.instagram : `https://instagram.com/${c.instagram.replace('@', '')}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    title={`Instagram: ${c.instagram}`}
                                                                    className="rounded-circle d-flex align-items-center justify-content-center hover-scale"
                                                                    style={{ 
                                                                        width: '36px', 
                                                                        height: '36px', 
                                                                        backgroundColor: '#E1306C12',
                                                                        color: '#E1306C',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    <Instagram size={16} />
                                                                </a>
                                                            )}
                                                            {c.whatsapp && (
                                                                <a 
                                                                    href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    title="Enviar WhatsApp"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center hover-scale ms-auto"
                                                                    style={{ 
                                                                        width: '36px', 
                                                                        height: '36px', 
                                                                        backgroundColor: '#25D36615',
                                                                        color: '#25D366',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    <MessageCircle size={16} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </motion.div>
                                    </Col>
                                ))}
                            </AnimatePresence>
                        </Row>
                    )}
                </Container>
            </section>

            {/* Formulario de Marketing y Registro B2B */}
            <section 
                id="sumarse"
                className="py-5 text-white"
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.azul} 0%, ${artiguistaColors.azulOscuro} 100%)`
                }}
            >
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8} xl={7}>
                            <div className="text-center mb-5">
                                <Badge 
                                    className="px-3 py-2 mb-3 rounded-pill text-uppercase fw-bold"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.8rem' }}
                                >
                                    Alianzas Comerciales
                                </Badge>
                                <h2 className="display-6 fw-bold mb-3">¿Querés sumar tu comercio o institución?</h2>
                                <p className="lead opacity-90 mx-auto" style={{ maxWidth: '600px' }}>
                                    Es un excelente canal de promoción. Ofrecé un descuento o beneficio a nuestros afiliados, dale presencia digital a tu marca en nuestra web y atraé nuevos clientes.
                                </p>
                            </div>

                            {!mostrarFormulario ? (
                                <div className="text-center">
                                    <Button
                                        onClick={() => setMostrarFormulario(true)}
                                        size="lg"
                                        className="fw-bold hover-scale px-5 py-3"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            color: artiguistaColors.azul,
                                            borderColor: '#ffffff',
                                            borderRadius: '50px',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Comenzar Registro de Alianza <Send size={18} className="ms-2" />
                                    </Button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Card className="border-0 shadow-lg text-dark overflow-hidden" style={{ borderRadius: '1.5rem' }}>
                                        <CardBody className="p-4 p-md-5">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h3 className="h5 fw-bold mb-0" style={{ color: artiguistaColors.azul }}>
                                                    Enviar propuesta de convenio
                                                </h3>
                                                <Button
                                                    close
                                                    onClick={() => setMostrarFormulario(false)}
                                                    title="Cerrar Formulario"
                                                />
                                            </div>

                                            {solicitudSuccess ? (
                                                <div className="text-center py-4">
                                                    <CheckCircle className="text-success mb-3" size={64} />
                                                    <h4 className="fw-bold text-success">¡Propuesta enviada con éxito!</h4>
                                                    <p className="text-muted">
                                                        Agradecemos tu interés en colaborar con nosotros. Nuestro equipo administrativo revisará tu propuesta y se pondrá en contacto a la brevedad.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Form onSubmit={handleFormSubmit}>
                                                    {solicitudError && <Alert color="danger">{solicitudError}</Alert>}
                                                    
                                                    <Row>
                                                        <Col md={6}>
                                                            <FormGroup className="mb-3">
                                                                <Label for="comercio_nombre" className="small fw-semibold text-muted">Nombre del Comercio o Institución *</Label>
                                                                <Input
                                                                    type="text"
                                                                    id="comercio_nombre"
                                                                    value={formSolicitud.comercio_nombre}
                                                                    onChange={e => setFormSolicitud({...formSolicitud, comercio_nombre: e.target.value})}
                                                                    required
                                                                    disabled={enviandoSolicitud}
                                                                    placeholder="Ej. Farmacia Central"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={6}>
                                                            <FormGroup className="mb-3">
                                                                <Label for="contacto_nombre" className="small fw-semibold text-muted">Nombre de Contacto (Responsable) *</Label>
                                                                <Input
                                                                    type="text"
                                                                    id="contacto_nombre"
                                                                    value={formSolicitud.contacto_nombre}
                                                                    onChange={e => setFormSolicitud({...formSolicitud, contacto_nombre: e.target.value})}
                                                                    required
                                                                    disabled={enviandoSolicitud}
                                                                    placeholder="Ej. Juan Pérez"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col md={6}>
                                                            <FormGroup className="mb-3">
                                                                <Label for="email" className="small fw-semibold text-muted">Correo Electrónico *</Label>
                                                                <Input
                                                                    type="email"
                                                                    id="email"
                                                                    value={formSolicitud.email}
                                                                    onChange={e => setFormSolicitud({...formSolicitud, email: e.target.value})}
                                                                    required
                                                                    disabled={enviandoSolicitud}
                                                                    placeholder="Ej. contacto@comercio.com"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={6}>
                                                            <FormGroup className="mb-3">
                                                                <Label for="telefono" className="small fw-semibold text-muted">Teléfono de Contacto *</Label>
                                                                <Input
                                                                    type="tel"
                                                                    id="telefono"
                                                                    value={formSolicitud.telefono}
                                                                    onChange={e => setFormSolicitud({...formSolicitud, telefono: e.target.value})}
                                                                    required
                                                                    disabled={enviandoSolicitud}
                                                                    placeholder="Ej. 099 123 456"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <Row>
                                                        <Col md={6}>
                                                            <FormGroup className="mb-3">
                                                                <Label for="whatsapp" className="small fw-semibold text-muted">WhatsApp Comercial (Opcional)</Label>
                                                                <Input
                                                                    type="text"
                                                                    id="whatsapp"
                                                                    value={formSolicitud.whatsapp}
                                                                    onChange={e => setFormSolicitud({...formSolicitud, whatsapp: e.target.value})}
                                                                    disabled={enviandoSolicitud}
                                                                    placeholder="Ej. 099123456"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={6}>
                                                            <FormGroup className="mb-3">
                                                                <Label for="instagram" className="small fw-semibold text-muted">Instagram (Opcional)</Label>
                                                                <Input
                                                                    type="text"
                                                                    id="instagram"
                                                                    value={formSolicitud.instagram}
                                                                    onChange={e => setFormSolicitud({...formSolicitud, instagram: e.target.value})}
                                                                    disabled={enviandoSolicitud}
                                                                    placeholder="Ej. @mi.comercio"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <FormGroup className="mb-4">
                                                        <Label for="propuesta" className="small fw-semibold text-muted">Propuesta de Beneficio / Comentarios *</Label>
                                                        <Input
                                                            type="textarea"
                                                            id="propuesta"
                                                            rows={4}
                                                            value={formSolicitud.propuesta}
                                                            onChange={e => setFormSolicitud({...formSolicitud, propuesta: e.target.value})}
                                                            required
                                                            disabled={enviandoSolicitud}
                                                            placeholder="Describí brevemente qué descuento o beneficio querés otorgar a los socios del Círculo Policial San José..."
                                                        />
                                                    </FormGroup>

                                                    <div className="d-grid">
                                                        <Button 
                                                            type="submit" 
                                                            size="lg" 
                                                            disabled={enviandoSolicitud}
                                                            style={{ 
                                                                backgroundColor: artiguistaColors.azul, 
                                                                borderColor: artiguistaColors.azul, 
                                                                fontWeight: 'bold',
                                                                borderRadius: '50px' 
                                                            }}
                                                        >
                                                            {enviandoSolicitud ? (
                                                                <>
                                                                    <Spinner size="sm" className="me-2" /> Enviando...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Enviar Propuesta <Send size={18} className="ms-2" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </Form>
                                            )}
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
        </main>
    );
}
