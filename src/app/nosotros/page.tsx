import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import { Container, Row, Col } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import { Target, Eye, Star, UserCircle, TrendingUp, Home, Handshake, PartyPopper } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Nosotros',
    description: '82 años de compromiso institucional. Historia del Círculo Policial "Gral. José Artigas" - San José. Fundado el 15 de abril de 1944. Neutralidad política, racial, filosófica y religiosa.',
};

export default function NosotrosPage() {
    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <section
                    style={{
                        background: `linear-gradient(135deg, ${artiguistaColors.azul} 0%, ${artiguistaColors.azulOscuro} 100%)`,
                        color: artiguistaColors.blanco,
                        padding: '5rem 0',
                        textAlign: 'center',
                    }}
                >
                    <Container>
                        <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                            Nuestra Historia
                        </h1>
                        <p className="lead">
                            82 años fortaleciendo la familia policial de San José
                        </p>
                    </Container>
                </section>

                {/* Sección: Fundación 1944 */}
                <section className="section-padding">
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6} className="mb-4 mb-lg-0">
                                <div className="position-relative" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
                                    <Image
                                        src="/images/logo circulo policial san jose.webp"
                                        alt="Escudo Oficial - Fundado 15-4-1944"
                                        fill
                                        style={{ objectFit: 'contain', padding: '2rem' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </Col>
                            <Col lg={6}>
                                <h2 className="heading-secondary mb-4" style={{ color: artiguistaColors.azul }}>
                                    Fundación - 15 de Abril de 1944
                                </h2>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                                    El Círculo Policial "Gral. José Artigas" de San José fue fundado el <strong>15 de abril de 1944</strong>,
                                    con el propósito de unir y apoyar a la familia policial en el departamento de San José.
                                </p>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                                    Desde sus inicios, la institución se ha caracterizado por mantener una <strong>estricta neutralidad
                                        política, racial, filosófica y religiosa</strong>, garantizando un espacio de respeto absoluto
                                    para todos sus asociados.
                                </p>
                                <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                                    A lo largo de estas <strong>ocho décadas</strong>, hemos sido testigos y protagonistas de la
                                    evolución del país, siempre comprometidos con el bienestar de quienes dedican su vida a
                                    proteger a la sociedad.
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Sección: Misión y Valores */}
                <section
                    className="section-padding"
                    style={{ backgroundColor: artiguistaColors.gris[50] }}
                >
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary">Misión, Visión y Valores</h2>
                        </div>
                        <Row className="g-4">
                            <Col md={4}>
                                <div
                                    className="p-4 h-100"
                                    style={{
                                        backgroundColor: artiguistaColors.blanco,
                                        borderRadius: '1rem',
                                        borderTop: `4px solid ${artiguistaColors.azul}`,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <h3 className="h4 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: artiguistaColors.azul }}>
                                        <Target size={28} /> Misión
                                    </h3>
                                    <p style={{ lineHeight: '1.7' }}>
                                        Unir y apoyar a quienes protegen a la sociedad, promoviendo su bienestar mediante
                                        programas de asistencia social y profesionalización.
                                    </p>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div
                                    className="p-4 h-100"
                                    style={{
                                        backgroundColor: artiguistaColors.blanco,
                                        borderRadius: '1rem',
                                        borderTop: `4px solid ${artiguistaColors.rojo}`,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <h3 className="h4 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: artiguistaColors.rojo }}>
                                        <Eye size={28} /> Visión
                                    </h3>
                                    <p style={{ lineHeight: '1.7' }}>
                                        Ser la institución de referencia en el apoyo integral a la familia policial de San José,
                                        promoviendo el desarrollo personal y profesional de nuestros asociados.
                                    </p>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div
                                    className="p-4 h-100"
                                    style={{
                                        backgroundColor: artiguistaColors.blanco,
                                        borderRadius: '1rem',
                                        borderTop: `4px solid ${artiguistaColors.dorado}`,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <h3 className="h4 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: artiguistaColors.dorado }}>
                                        <Star size={28} /> Valores
                                    </h3>
                                    <ul style={{ lineHeight: '1.7', paddingLeft: '1.5rem' }}>
                                        <li>Neutralidad absoluta</li>
                                        <li>Respeto y tolerancia</li>
                                        <li>Solidaridad</li>
                                        <li>Compromiso social</li>
                                        <li>Transparencia</li>
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Sección: Liderazgo Actual */}
                <section className="section-padding">
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary">Liderazgo Institucional</h2>
                        </div>
                        <Row className="justify-content-center">
                            <Col md={8} lg={6}>
                                <div
                                    className="text-center p-5"
                                    style={{
                                        backgroundColor: artiguistaColors.gris[50],
                                        borderRadius: '1rem',
                                        border: `2px solid ${artiguistaColors.azul}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            backgroundColor: artiguistaColors.azul,
                                            margin: '0 auto 1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '3rem',
                                            color: artiguistaColors.blanco,
                                        }}
                                    >
                                        <UserCircle size={80} />
                                    </div>
                                    <h3 className="h4 fw-bold mb-2" style={{ color: artiguistaColors.azul }}>
                                        Comisario Mayor (R) Darcy Gonzalez
                                    </h3>
                                    <p className="text-muted mb-3">Presidente - Comisario Mayor (R)</p>
                                    <p style={{ lineHeight: '1.7' }}>
                                        Bajo la presidencia del <strong>Comisario Mayor (R) Darcy Gonzalez</strong>, el Círculo Policial transita
                                        una etapa de renovación y fortalecimiento de nuestra actividad social, con el objetivo
                                        de recuperar dinamismo institucional y aumentar significativamente el número de socios activos.
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Sección: Objetivos Actuales */}
                <section
                    className="section-padding"
                    style={{ backgroundColor: artiguistaColors.gris[50] }}
                >
                    <Container>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary">Objetivos 2026</h2>
                            <p className="text-muted">Renovación y crecimiento institucional</p>
                        </div>
                        <Row className="g-4">
                            <Col md={6}>
                                <div className="d-flex align-items-start p-3">
                                    <div
                                        style={{
                                            fontSize: '2rem',
                                            color: artiguistaColors.azul,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <TrendingUp size={40} />
                                    </div>
                                    <div>
                                        <h3 className="h5 fw-bold mb-2">Captación de Socios</h3>
                                        <p>Meta: potenciar el crecimiento de nuestra comunidad mediante una estrategia de comunicación y beneficios mejorados.</p>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex align-items-start p-3">
                                    <div
                                        style={{
                                            fontSize: '2rem',
                                            color: artiguistaColors.rojo,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <Home size={40} />
                                    </div>
                                    <div>
                                        <h3 className="h5 fw-bold mb-2">Mejoras en Infraestructura</h3>
                                        <p>Acondicionamiento continuo del Salón Chico y las Cabañas Ordeig para el disfrute de la familia policial.</p>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex align-items-start p-3">
                                    <div
                                        style={{
                                            fontSize: '2rem',
                                            color: artiguistaColors.dorado,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <Handshake size={40} />
                                    </div>
                                    <div>
                                        <h3 className="h5 fw-bold mb-2">Fortalecimiento de Convenios</h3>
                                        <p>Ampliar la red de servicios y beneficios a través de nuevos acuerdos comerciales y sociales.</p>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex align-items-start p-3">
                                    <div
                                        style={{
                                            fontSize: '2rem',
                                            color: artiguistaColors.verde,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <PartyPopper size={40} />
                                    </div>
                                    <div>
                                        <h3 className="h5 fw-bold mb-2">Recuperación de Actividad Social</h3>
                                        <p>Organización de eventos, celebraciones y actividades que fortalezcan el vínculo entre asociados.</p>
                                    </div>
                                </div>
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
                        <h2 className="display-6 fw-bold mb-3">¿Querés ser parte de nuestra historia?</h2>
                        <p className="lead mb-4">
                            Sumate a nuestra comunidad y disfrutá de todos los beneficios del Círculo Policial
                        </p>
                        <a
                            href="/asociarse"
                            className="btn btn-light btn-lg"
                            style={{
                                fontWeight: 'bold',
                                padding: '1rem 3rem',
                            }}
                        >
                            Completar Formulario de Inscripción
                        </a>
                    </Container>
                </section>
            </main>
            <Footer />
            <CookieBanner />
        </>
    );
}
