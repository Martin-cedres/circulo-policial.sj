import type { Metadata } from 'next';
import { Container, Row, Col, Card, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata: Metadata = {
    title: 'Beneficios | Círculo Policial San José, Uruguay',
    description: 'Descubre los beneficios exclusivos para socios en todo Uruguay: turismo, convenios médicos, cabañas, salones y más. El mejor Círculo Policial del país a tu servicio.',
};

export default function BeneficiosPage() {
    return (
        <main>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    color: artiguistaColors.blanco,
                    padding: '6rem 0',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Patrón sutil de fondo */}
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
                        <h1 className="display-3 fw-bold mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                            Beneficios para Socios
                        </h1>
                        <p className="lead opacity-90 mx-auto" style={{ maxWidth: '700px', fontSize: '1.25rem' }}>
                            Servicios e instalaciones de primer nivel, diseñados exclusivamente para el bienestar de la familia policial
                        </p>
                    </AnimatedSection>
                </Container>
            </section>

            {/* Beneficios San José */}
            <section className="section-padding overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
                <Container>
                    <AnimatedSection>
                        <div className="text-center mb-5">
                            <h2 className="display-5 fw-bold mb-2" style={{ color: artiguistaColors.azul }}>
                                Nuestros Servicios
                            </h2>
                            <div className="mx-auto mb-4" style={{ width: '80px', height: '4px', backgroundColor: artiguistaColors.dorado, borderRadius: '2px' }}></div>
                            <p className="text-muted mx-auto" style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
                                Instalaciones y beneficios pensados para tu descanso, eventos y apoyo familiar
                            </p>
                        </div>
                    </AnimatedSection>

                    <Row className="g-4 mb-5">
                        {/* Salones de Eventos */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.1} className="h-100">
                                <Card className="h-100 border-0 shadow-sm benefit-card overflow-hidden" style={{ borderRadius: '1.25rem' }}>
                                    <div className="p-3 pb-0">
                                        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '0.8rem', overflow: 'hidden' }}>
                                            <Image
                                                src="/images/salon-chico-circulo-policial-san-jose.webp"
                                                alt="Salones de Eventos Sede Central"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    </div>
                                    <CardBody className="d-flex flex-column px-4 pb-4">
                                        <h3 className="h5 fw-bold mb-3 mt-2" style={{ color: artiguistaColors.azul, minHeight: '3rem' }}>
                                            Salones de Eventos Sede Central
                                        </h3>
                                        <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                                            Dos amplios salones sociales totalmente equipados para fiestas y reuniones, con tarifas preferenciales para socios y disponibilidad para público general.
                                        </p>
                                        <ListGroup flush className="border-0">
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Dos salones totalmente equipados
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Disponibles para fiestas y eventos
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Espacios climatizados
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Tarifas preferenciales para socios
                                            </ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>

                        {/* Cabañas Ordeig */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.2} className="h-100">
                                <Card className="h-100 border-0 shadow-sm benefit-card overflow-hidden" style={{ borderRadius: '1.25rem' }}>
                                    <div className="p-3 pb-0">
                                        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '0.8rem', overflow: 'hidden' }}>
                                            <Image
                                                src="/images/cabañas-ordeig-circulo-policial-san-jose.webp"
                                                alt="Cabañas en Balneario Ordeig"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    </div>
                                    <CardBody className="d-flex flex-column px-4 pb-4">
                                        <h3 className="h5 fw-bold mb-3 mt-2" style={{ color: artiguistaColors.azul, minHeight: '3rem' }}>
                                            Cabañas en Balneario Ordeig
                                        </h3>
                                        <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                                            Instalaciones recreativas ideales para el descanso familiar en un entorno natural único, con precios exclusivos para nuestros asociados durante todo el año.
                                        </p>
                                        <ListGroup flush className="border-0">
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Entorno tranquilo y natural
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Precios preferenciales para socios
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Instalaciones renovadas
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Disponibles para público general
                                            </ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>

                        {/* Hogar Estudiantil */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.3} className="h-100">
                                <Card className="h-100 border-0 shadow-sm benefit-card overflow-hidden" style={{ borderRadius: '1.25rem' }}>
                                    <div className="p-3 pb-0">
                                        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '0.8rem', overflow: 'hidden' }}>
                                            <Image
                                                src="/images/hogar-estudiantil-san-jose-de-mayo-circulo-policial.webp"
                                                alt="Hogar Estudiantil"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    </div>
                                    <CardBody className="d-flex flex-column px-4 pb-4">
                                        <h3 className="h5 fw-bold mb-3 mt-2" style={{ color: artiguistaColors.azul, minHeight: '3rem' }}>
                                            Convenio Hogar Estudiantil
                                        </h3>
                                        <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                                            Facilitamos nuestras instalaciones mediante un convenio con la Intendencia para el funcionamiento del Hogar Estudiantil, un servicio de apoyo a jóvenes estudiantes.
                                        </p>
                                        <ListGroup flush className="border-0">
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Apoyo directo a la educación
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Convenio con Intendencia
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Compromiso social institucional
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Infraestructura disponible
                                            </ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>

                        {/* Canastas Navideñas */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.4} className="h-100">
                                <Card className="h-100 border-0 shadow-sm benefit-card overflow-hidden" style={{ borderRadius: '1.25rem' }}>
                                    <div className="p-3 pb-0">
                                        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '0.8rem', overflow: 'hidden' }}>
                                            <Image
                                                src="/images/canastas-circulo-policial-san-jose.webp"
                                                alt="Canastas Navideñas Anuales"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    </div>
                                    <CardBody className="d-flex flex-column px-4 pb-4">
                                        <h3 className="h5 fw-bold mb-3 mt-2" style={{ color: artiguistaColors.azul, minHeight: '3rem' }}>
                                            Canastas Navideñas Anuales
                                        </h3>
                                        <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                                            Reconocemos tu compromiso con la entrega de canastas navideñas, un presente especial de excelente calidad para compartir en familia durante las fiestas tradicionales.
                                        </p>
                                        <ListGroup flush className="border-0">
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Entrega anual garantizada
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Productos de primera calidad
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Reconocimiento al socio
                                            </ListGroupItem>
                                            <ListGroupItem className="px-0 py-2 border-0 small d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-1"><span className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>✓</span></div> Para todos nuestros asociados
                                            </ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Final */}
            <section
                className="section-padding text-white text-center"
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.rojo} 0%, ${artiguistaColors.rojoOscuro} 100%)`,
                }}
            >
                <Container>
                    <AnimatedSection direction="up">
                        <h2 className="display-6 fw-bold mb-3">Accedé a todos estos beneficios</h2>
                        <p className="lead mb-4">
                            Sumate hoy y comenzá a disfrutar de los servicios exclusivos para socios
                        </p>
                        <a
                            href="/asociarse"
                            className="btn btn-light btn-lg"
                            style={{
                                fontWeight: 'bold',
                                padding: '1rem 3rem',
                            }}
                        >
                            Hacete Socio Ahora
                        </a>
                    </AnimatedSection>
                </Container>
            </section>
        </main>
    );
}
