import type { Metadata } from 'next';
import { Container, Row, Col, Card, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata: Metadata = {
    title: 'Beneficios',
    description: 'Beneficios exclusivos para socios del Círculo Policial San José: Dos Salones de Eventos, Cabañas Ordeig, Hogar Estudiantil y Canastas Navideñas. Servicios e instalaciones al servicio de la familia policial de San José.',
};

export default function BeneficiosPage() {
    return (
        <main>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.verde} 0%, ${artiguistaColors.verdeOscuro} 100%)`,
                    color: artiguistaColors.blanco,
                    padding: '5rem 0',
                    textAlign: 'center',
                }}
            >
                <Container>
                    <AnimatedSection direction="none">
                        <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                            Beneficios para Socios
                        </h1>
                        <p className="lead">
                            Servicios e instalaciones al servicio de la familia policial
                        </p>
                    </AnimatedSection>
                </Container>
            </section>

            {/* Beneficios San José */}
            <section className="section-padding overflow-hidden">
                <Container>
                    <AnimatedSection>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary" style={{ color: artiguistaColors.azul }}>
                                Beneficios en San José
                            </h2>
                            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                                Instalaciones y servicios en nuestra sede departamental
                            </p>
                        </div>
                    </AnimatedSection>

                    <Row className="g-4 mb-5">
                        {/* Salón Chico */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.1} className="h-100">
                                <Card className="h-100 border-0 shadow benefit-card">
                                    <div
                                        className="benefit-card-img-container"
                                        style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}
                                    >
                                        <Image
                                            src="/images/salon-chico-circulo-policial-san-jose.webp"
                                            alt="Salones de Eventos Sede Central"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <CardBody className="d-flex flex-column">
                                        <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul, minHeight: '3.5rem' }}>
                                            Salones de Eventos Sede Central
                                        </h3>
                                        <p className="mb-3 flex-grow-1">
                                            Dos amplios salones sociales totalmente equipados para fiestas y reuniones, con tarifas preferenciales para socios y disponibilidad para público general.
                                        </p>
                                        <ListGroup flush>
                                            <ListGroupItem>✓ Dos salones totalmente equipados</ListGroupItem>
                                            <ListGroupItem>✓ Disponibles para fiestas y eventos</ListGroupItem>
                                            <ListGroupItem>✓ Espacios climatizados</ListGroupItem>
                                            <ListGroupItem>✓ Tarifas preferenciales para socios</ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>

                        {/* Cabañas Ordeig */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.2} className="h-100">
                                <Card className="h-100 border-0 shadow benefit-card">
                                    <div
                                        className="benefit-card-img-container"
                                        style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}
                                    >
                                        <Image
                                            src="/images/cabañas-ordeig-circulo-policial-san-jose.webp"
                                            alt="Cabañas en Balneario Ordeig"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <CardBody className="d-flex flex-column">
                                        <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul, minHeight: '3.5rem' }}>
                                            Cabañas en Balneario Ordeig
                                        </h3>
                                        <p className="mb-3 flex-grow-1">
                                            Instalaciones recreativas ideales para el descanso familiar en un entorno natural único, con precios exclusivos para nuestros asociados durante todo el año.
                                        </p>
                                        <ListGroup flush>
                                            <ListGroupItem>✓ Entorno tranquilo y natural</ListGroupItem>
                                            <ListGroupItem>✓ Precios preferenciales para socios</ListGroupItem>
                                            <ListGroupItem>✓ Instalaciones renovadas</ListGroupItem>
                                            <ListGroupItem>✓ Disponibles para público general</ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>

                        {/* Hogar Estudiantil */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.3} className="h-100">
                                <Card className="h-100 border-0 shadow benefit-card">
                                    <div
                                        className="benefit-card-img-container"
                                        style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}
                                    >
                                        <Image
                                            src="/images/hogar-estudiantil-san-jose-de-mayo-circulo-policial.webp"
                                            alt="Hogar Estudiantil"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            priority
                                        />
                                    </div>
                                    <CardBody className="d-flex flex-column">
                                        <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul, minHeight: '3.5rem' }}>
                                            Convenio Hogar Estudiantil
                                        </h3>
                                        <p className="mb-3 flex-grow-1">
                                            Facilitamos nuestras instalaciones mediante un convenio con la Intendencia para el funcionamiento del Hogar Estudiantil, un servicio de apoyo a jóvenes estudiantes.
                                        </p>
                                        <ListGroup flush>
                                            <ListGroupItem>✓ Apoyo directo a la educación</ListGroupItem>
                                            <ListGroupItem>✓ Convenio con Intendencia</ListGroupItem>
                                            <ListGroupItem>✓ Compromiso social institucional</ListGroupItem>
                                            <ListGroupItem>✓ Infraestructura disponible</ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </AnimatedSection>
                        </Col>

                        {/* Canastas Navideñas */}
                        <Col md={6} lg={3}>
                            <AnimatedSection delay={0.4} className="h-100">
                                <Card className="h-100 border-0 shadow benefit-card">
                                    <div
                                        className="benefit-card-img-container"
                                        style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}
                                    >
                                        <Image
                                            src="/images/canastas-circulo-policial-san-jose.webp"
                                            alt="Canastas Navideñas Anuales"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <CardBody className="d-flex flex-column">
                                        <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul, minHeight: '3.5rem' }}>
                                            Canastas Navideñas Anuales
                                        </h3>
                                        <p className="mb-3 flex-grow-1">
                                            Reconocemos tu compromiso con la entrega de canastas navideñas, un presente especial de excelente calidad para compartir en familia durante las fiestas tradicionales.
                                        </p>
                                        <ListGroup flush>
                                            <ListGroupItem>✓ Entrega anual garantizada</ListGroupItem>
                                            <ListGroupItem>✓ Productos de primera calidad</ListGroupItem>
                                            <ListGroupItem>✓ Reconocimiento al socio</ListGroupItem>
                                            <ListGroupItem>✓ Para todos nuestros asociados</ListGroupItem>
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
