import type { Metadata } from 'next';
import { Container, Row, Col, Card, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';

export const metadata: Metadata = {
    title: 'Beneficios',
    description: 'Beneficios exclusivos para socios del Círculo Policial San José: Salón Chico, Cabañas Ordeig, Hogar Estudiantil y Canastas Navideñas. Servicios e instalaciones al servicio de la familia policial de San José.',
};

export default function BeneficiosPage() {
    return (
        <main>
            {/* ... */}
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
                    <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                        Beneficios para Socios
                    </h1>
                    <p className="lead">
                        Servicios e instalaciones al servicio de la familia policial
                    </p>
                </Container>
            </section>

            {/* Beneficios San José */}
            <section className="section-padding">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="heading-secondary" style={{ color: artiguistaColors.azul }}>
                            Beneficios en San José
                        </h2>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                            Instalaciones y servicios en nuestra sede departamental
                        </p>
                    </div>

                    <Row className="g-4 mb-5">
                        {/* Salón Chico */}
                        <Col md={6} lg={3}>
                            <Card className="h-100 border-0 shadow">
                                <div style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}>
                                    <Image
                                        src="/images/salon-chico-circulo-policial-san-jose.webp"
                                        alt="Salón social acondicionado en sede Ituzaingó"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <CardBody>
                                    <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                        Salón Chico - Ituzaingó
                                    </h3>
                                    <p className="mb-3">
                                        Salón social acondicionado en nuestra sede central de calle Ituzaingó (ex-cantina).
                                    </p>
                                    <ListGroup flush>
                                        <ListGroupItem>✓ Disponible para actividades de socios</ListGroupItem>
                                        <ListGroupItem>✓ Apto para eventos sociales</ListGroupItem>
                                        <ListGroupItem>✓ Espacio climatizado</ListGroupItem>
                                        <ListGroupItem>✓ Reservas para público general</ListGroupItem>
                                    </ListGroup>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Cabañas Ordeig */}
                        <Col md={6} lg={3}>
                            <Card className="h-100 border-0 shadow">
                                <div style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}>
                                    <Image
                                        src="/images/cabañas-ordeig-circulo-policial-san-jose.webp"
                                        alt="Galería Cabañas Ordeig"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <CardBody>
                                    <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                        Cabañas Balneario Ordeig
                                    </h3>
                                    <p className="mb-3">
                                        Instalaciones recreativas frente al mar con mejoras continuas para el descanso familiar.
                                    </p>
                                    <ListGroup flush>
                                        <ListGroupItem>✓ Ubicación frente al mar</ListGroupItem>
                                        <ListGroupItem>✓ Tarifas preferenciales para socios</ListGroupItem>
                                        <ListGroupItem>✓ Instalaciones renovadas</ListGroupItem>
                                        <ListGroupItem>✓ Ideal para vacaciones familiares</ListGroupItem>
                                    </ListGroup>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Hogar Estudiantil */}
                        <Col md={6} lg={3}>
                            <Card className="h-100 border-0 shadow">
                                <div style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}>
                                    <Image
                                        src="/images/hogar-estudiantil.svg"
                                        alt="Hogar Estudiantil convenio con Intendencia"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <CardBody>
                                    <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                        Hogar Estudiantil
                                    </h3>
                                    <p className="mb-3">
                                        Convenio estratégico con la Intendencia de San José para facilitar el funcionamiento del Hogar Estudiantil.
                                    </p>
                                    <ListGroup flush>
                                        <ListGroupItem>✓ Apoyo a jóvenes estudiantes</ListGroupItem>
                                        <ListGroupItem>✓ Convenio con Intendencia</ListGroupItem>
                                        <ListGroupItem>✓ Compromiso educativo</ListGroupItem>
                                        <ListGroupItem>✓ Futuro de la comunidad</ListGroupItem>
                                    </ListGroup>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Canastas Navideñas */}
                        <Col md={6} lg={3}>
                            <Card className="h-100 border-0 shadow">
                                <div style={{ position: 'relative', height: '250px', backgroundColor: artiguistaColors.gris[200] }}>
                                    <Image
                                        src="/images/canastas-circulo-policial-san-jose.webp"
                                        alt="Entrega de canastas navideñas para socios"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <CardBody>
                                    <h3 className="h4 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                        Canastas Navideñas
                                    </h3>
                                    <p className="mb-3">
                                        Reconocemos tu compromiso con un presente especial para compartir en familia durante las fiestas.
                                    </p>
                                    <ListGroup flush>
                                        <ListGroupItem>✓ Entrega anual garantizada</ListGroupItem>
                                        <ListGroupItem>✓ Productos de primera calidad</ListGroupItem>
                                        <ListGroupItem>✓ Reconocimiento al socio</ListGroupItem>
                                        <ListGroupItem>✓ Para todos nuestros asociados</ListGroupItem>
                                    </ListGroup>
                                </CardBody>
                            </Card>
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
                </Container>
            </section>
        </main>
    );
}
