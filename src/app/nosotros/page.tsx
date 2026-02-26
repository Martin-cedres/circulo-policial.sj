import type { Metadata } from 'next';
import { Container, Row, Col } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import { Target, Eye, Star, UserCircle, TrendingUp, Home, Handshake, PartyPopper, Globe } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
    title: 'Nuestra Historia | Círculo Policial San José, Uruguay',
    description: 'Conoce los 82 años de compromiso institucional del Círculo Policial San José, brindando servicios y beneficios a toda la familia policial de Uruguay. Fundado el 15 de abril de 1944. Neutralidad política y defensa del policía.',
};

export default function NosotrosPage() {
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
                        <h1 className={`display-3 fw-bold mb-3 ${satisfy.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                            Nuestra Historia
                        </h1>
                        <p className="lead opacity-90 mx-auto" style={{ maxWidth: '700px', fontSize: '1.25rem' }}>
                            82 años fortaleciendo la familia policial de San José
                        </p>
                    </AnimatedSection>
                </Container>
            </section>

            {/* Sección: Fundación 1944 */}
            <section className="section-padding overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
                <Container>
                    <Row className="align-items-center g-5">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <AnimatedSection direction="left">
                                <div className="p-3 bg-white shadow-sm" style={{ borderRadius: '1.5rem' }}>
                                    <div className="position-relative" style={{ aspectRatio: '4/3', borderRadius: '1rem', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                        <Image
                                            src="/images/logo circulo policial san jose.webp"
                                            alt="Escudo Oficial - Fundado 15-4-1944"
                                            fill
                                            style={{ objectFit: 'contain', padding: '3rem' }}
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                </div>
                            </AnimatedSection>
                        </Col>
                        <Col lg={6}>
                            <AnimatedSection direction="right" delay={0.2}>
                                <div className="ps-lg-4">
                                    <h2 className="display-5 fw-bold mb-4 text-center" style={{ color: artiguistaColors.azul }}>
                                        Fundación y Trayectoria
                                    </h2>
                                    <div className="mb-4 mx-auto" style={{ width: '60px', height: '4px', backgroundColor: artiguistaColors.dorado, borderRadius: '2px' }}></div>
                                    <p className="mb-4 text-center" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: artiguistaColors.gris[800] }}>
                                        El Círculo Policial "Gral. José Artigas" de San José fue fundado el <strong>15 de abril de 1944</strong>, con el propósito inalterable de unir y apoyar a la familia policial en nuestro departamento.
                                    </p>
                                    <p className="mb-4 text-center" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: artiguistaColors.gris[800] }}>
                                        Desde la obtención de nuestra <strong>Personería Jurídica en 1948</strong>, hemos trabajado incansablemente bajo una estricta <strong>neutralidad política, racial y religiosa</strong>, garantizando un espacio de respeto para todos.
                                    </p>
                                </div>
                            </AnimatedSection>
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
                    <AnimatedSection>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary">Misión, Visión y Valores</h2>
                        </div>
                    </AnimatedSection>
                    <Row className="g-4">
                        <Col md={4} className="d-flex">
                            <AnimatedSection delay={0.1} className="w-100 h-100">
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
                                    <p style={{ lineHeight: '1.7', marginBottom: 0 }}>
                                        Promover la solidaridad y el bienestar integral de la familia policial, brindando servicios de excelencia y manteniendo instalaciones de primer nivel para el beneficio recreativo y social de todos nuestros asociados.
                                    </p>
                                </div>
                            </AnimatedSection>
                        </Col>
                        <Col md={4} className="d-flex">
                            <AnimatedSection delay={0.2} className="w-100 h-100">
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
                                    <p style={{ lineHeight: '1.7', marginBottom: 0 }}>
                                        Ser la institución líder y referente en San José, reconocida por su compromiso con el desarrollo personal y profesional de sus socios, impulsando una gestión moderna que fortalezca los lazos institucionales.
                                    </p>
                                </div>
                            </AnimatedSection>
                        </Col>
                        <Col md={4} className="d-flex">
                            <AnimatedSection delay={0.3} className="w-100 h-100">
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
                                    <p style={{ lineHeight: '1.7', marginBottom: 0 }}>
                                        Sustentar nuestra labor en la neutralidad absoluta, el respeto mutuo y la transparencia. Estos pilares garantizan un ambiente de tolerancia y solidaridad constante en beneficio del crecimiento de nuestra comunidad.
                                    </p>
                                </div>
                            </AnimatedSection>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Section Comisión Directiva */}
            <section className="section-padding">
                <Container>
                    <AnimatedSection>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary" style={{ color: artiguistaColors.azul }}>Comisión Directiva Periodo 2026</h2>
                            <hr style={{ width: '50px', margin: '1rem auto', borderTop: `3px solid ${artiguistaColors.dorado}`, opacity: 1 }} />
                        </div>
                    </AnimatedSection>

                    <div className="mx-auto" style={{ maxWidth: '850px' }}>
                        {/* Mesa Ejecutiva */}
                        <AnimatedSection direction="up" delay={0.1}>
                            <div className="mb-5 shadow-sm rounded-4 overflow-hidden border">
                                <div className="p-3 text-center text-white" style={{ backgroundColor: artiguistaColors.azul }}>
                                    <h3 className="h6 mb-0 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Mesa Ejecutiva</h3>
                                </div>
                                <div className="bg-white">
                                    {[
                                        { cargo: 'Presidente', nombre: 'Crio. Mayor (R) Darcy González' },
                                        { cargo: 'Vicepresidente', nombre: 'Crio. (R) Juan Silva' },
                                        { cargo: 'Secretario', nombre: 'Crio. Mayor (R) Jorge Carrato' },
                                        { cargo: 'Prosecretario', nombre: 'Sgto. Martín Cedrés' },
                                        { cargo: 'Tesorero', nombre: 'Crio. P.A. Gabriel López' },
                                        { cargo: 'Protesorero', nombre: 'S.O.M. (R) Sergio López' },
                                    ].map((item, index) => (
                                        <div key={item.cargo} className={`d-flex align-items-center p-3 ${index !== 5 ? 'border-bottom' : ''}`}>
                                            <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.75rem', width: '35%' }}>{item.cargo}</div>
                                            <div className="fw-bold" style={{ color: artiguistaColors.azul, width: '65%' }}>{item.nombre}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Vocales */}
                        <AnimatedSection direction="up" delay={0.2}>
                            <div className="mb-5 shadow-sm rounded-4 overflow-hidden border">
                                <div className="p-3 text-center text-white" style={{ backgroundColor: artiguistaColors.azul }}>
                                    <h3 className="h6 mb-0 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Vocales</h3>
                                </div>
                                <div className="bg-white p-2">
                                    <div className="row g-0">
                                        {/* Vocales */}
                                        {[
                                            'Crio. Mayor (R) Jorge Rielo', 'Sub Crio. (R) Luis Reyes', 'Of. Ppal. (R) Alejandro López',
                                            'S.O.M. Ricardo Cardozo', 'S.O.M. (R) Atilio Berrueta', 'S.O.M. (R) Juan Jara',
                                            'Cabo (R) Gilberto Sellanes', 'Cabo (R) Robinson Marta', 'Cabo (R) Miguel Rodríguez',
                                            'Cabo (R) Rosmary Dutruel', 'Agte. 1ra. (R) Rubén Petre'
                                        ].map((vocal) => (
                                            <div key={vocal} className="col-md-6 p-3 border-bottom-light">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: artiguistaColors.dorado }}></div>
                                                    <span className="fw-bold" style={{ color: artiguistaColors.azul, fontSize: '0.9rem' }}>{vocal}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Comisión Fiscal */}
                        <AnimatedSection direction="up" delay={0.3}>
                            <div className="shadow-sm rounded-4 overflow-hidden border">
                                <div className="p-3 text-center text-white" style={{ backgroundColor: artiguistaColors.azul }}>
                                    <h3 className="h6 mb-0 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Comisión Fiscal</h3>
                                </div>
                                <div className="bg-white">
                                    {[
                                        'Comisario P.A. (R) Raúl Castro',
                                        'S.O.M. (R) Walter Dotta',
                                        'Cabo Mariano Brum'
                                    ].map((fiscal, index) => (
                                        <div key={fiscal} className={`p-3 text-center ${index !== 2 ? 'border-bottom' : ''}`}>
                                            <p className="mb-0 fw-bold" style={{ color: artiguistaColors.azul }}>{fiscal}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </Container>
            </section>

            {/* Sección: Objetivos Actuales */}
            <section
                className="section-padding"
                style={{ backgroundColor: artiguistaColors.gris[50] }}
            >
                <Container>
                    <AnimatedSection>
                        <div className="text-center mb-5">
                            <h2 className="heading-secondary">Objetivos 2026</h2>
                            <p className="text-muted">Renovación y crecimiento institucional</p>
                        </div>
                    </AnimatedSection>
                    <Row className="g-4">
                        {[
                            {
                                color: '#00bcd4',
                                icon: <Globe size={40} />,
                                title: "Presencia Digital Oficial",
                                desc: "Habiendo concretado el sitio web como meta de gestión, nos enfocamos en afianzar esta plataforma como el canal oficial y permanente para el acceso a beneficios, trámites y comunicación en tiempo real."
                            },
                            {
                                color: artiguistaColors.azul,
                                icon: <TrendingUp size={40} />,
                                title: "Captación de Socios",
                                desc: "Meta: potenciar el crecimiento de nuestra comunidad mediante una estrategia de comunicación y beneficios mejorados."
                            },
                            {
                                color: artiguistaColors.rojo,
                                icon: <Home size={40} />,
                                title: "Mejoras en Infraestructura",
                                desc: "Acondicionamiento continuo de nuestros dos Salones de Eventos y las Cabañas Ordeig para el festejo y disfrute de la familia policial."
                            },
                            {
                                color: artiguistaColors.dorado,
                                icon: <Handshake size={40} />,
                                title: "Fortalecimiento de Convenios",
                                desc: "Ampliar la red de servicios y beneficios a través de nuevos acuerdos comerciales y sociales."
                            },
                            {
                                color: artiguistaColors.verde,
                                icon: <PartyPopper size={40} />,
                                title: "Recuperación de Actividad Social",
                                desc: "Organización de eventos, celebraciones y actividades que fortalezcan el vínculo entre asociados."
                            }
                        ].map((obj, i) => (
                            <Col md={6} key={i}>
                                <AnimatedSection delay={i * 0.1} direction={i % 2 === 0 ? 'right' : 'left'}>
                                    <div className="d-flex align-items-start p-3">
                                        <div
                                            style={{
                                                fontSize: '2rem',
                                                color: obj.color,
                                                marginRight: '1rem',
                                            }}
                                        >
                                            {obj.icon}
                                        </div>
                                        <div>
                                            <h3 className="h5 fw-bold mb-2">{obj.title}</h3>
                                            <p>{obj.desc}</p>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            </Col>
                        ))}
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
                    </AnimatedSection>
                </Container>
            </section>
        </main>
    );
}

