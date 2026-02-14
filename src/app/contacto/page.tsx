import type { Metadata } from 'next';
import { Container, Row, Col } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import { MapPin, User, Clock, ArrowRight, Mail } from 'lucide-react';
import ContactoForm from './ContactoForm';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata: Metadata = {
    title: 'Contacto',
    description: '¿Tenés alguna consulta? Estamos para ayudarte. Contactanos por email, visitanos en nuestra sede en San José de Mayo o envianos un mensaje a través de nuestro formulario.',
    openGraph: {
        title: 'Contacto | Círculo Policial San José',
        description: 'Dejanos tu consulta o visitanos en nuestra sede central.',
        images: [
            {
                url: '/images/logo%20circulo%20policial%20san%20jose.webp',
                width: 1200,
                height: 630,
                alt: 'Contacto Círculo Policial San José',
            }
        ],
    },
};

export default function ContactoPage() {
    return (
        <main>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.dorado} 0%, #B8860B 100%)`,
                    color: artiguistaColors.negro,
                    padding: '5rem 0',
                    textAlign: 'center',
                }}
            >
                <Container>
                    <AnimatedSection direction="none">
                        <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                            Contacto
                        </h1>
                        <p className="lead">
                            Estamos para ayudarte. Dejanos tu consulta
                        </p>
                    </AnimatedSection>
                </Container>
            </section>

            <section className="section-padding overflow-hidden">
                <Container>
                    <Row>
                        {/* Información de Contacto */}
                        <Col lg={4} className="mb-5 mb-lg-0">
                            <AnimatedSection direction="left">
                                <div
                                    className="p-4"
                                    style={{
                                        backgroundColor: artiguistaColors.azul,
                                        color: artiguistaColors.blanco,
                                        borderRadius: '1rem',
                                        height: '100%',
                                    }}
                                >
                                    <h2 className="h4 fw-bold mb-4">Información de Contacto</h2>

                                    <div className="mb-4">
                                        <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                            <MapPin size={18} /> Dirección
                                        </h3>
                                        <p className="mb-0">
                                            Calle Ituzaingó N° 441<br />
                                            San José de Mayo, Uruguay
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                            <User size={18} /> Presidente
                                        </h3>
                                        <p className="mb-0">Comisario Mayor (R) Darcy Gonzalez</p>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                            <Clock size={18} /> Horarios
                                        </h3>
                                        <p className="mb-0">
                                            Consultar disponibilidad mediante el formulario de contacto
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="h6 fw-bold mb-2 d-flex align-items-center gap-2">
                                            <Mail size={18} /> Correo Electrónico
                                        </h3>
                                        <p className="mb-0 overflow-hidden text-break">
                                            sanjosecirculopolicial@gmail.com
                                        </p>
                                    </div>

                                    <hr style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '2rem 0' }} />

                                    <div>
                                        <h3 className="h6 fw-bold mb-3">Enlaces Rápidos</h3>
                                        <div className="d-flex flex-column gap-2">
                                            <a href="/nosotros" className="d-flex align-items-center gap-2" style={{ color: artiguistaColors.blanco }}>
                                                <ArrowRight size={16} /> Sobre Nosotros
                                            </a>
                                            <a href="/beneficios" className="d-flex align-items-center gap-2" style={{ color: artiguistaColors.blanco }}>
                                                <ArrowRight size={16} /> Beneficios
                                            </a>
                                            <a href="/asociarse" className="d-flex align-items-center gap-2" style={{ color: artiguistaColors.blanco }}>
                                                <ArrowRight size={16} /> Hacerse Socio
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </Col>

                        {/* Formulario */}
                        <Col lg={8}>
                            <AnimatedSection direction="right" delay={0.2}>
                                <ContactoForm />
                            </AnimatedSection>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Mapa Real de Google Maps */}
            <section style={{ backgroundColor: artiguistaColors.gris[100], padding: '3rem 0', overflow: 'hidden' }}>
                <Container>
                    <AnimatedSection>
                        <div
                            style={{
                                overflow: 'hidden',
                                borderRadius: '1.5rem',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                border: `1px solid ${artiguistaColors.gris[200]}`,
                                height: '450px',
                                position: 'relative'
                            }}
                        >
                            <iframe
                                src="https://maps.google.com/maps?hl=es&q=Ituzaing%C3%B3%20441,%20San%20Jos%C3%A9%20de%20Mayo,%20Uruguay&t=m&z=17&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación Círculo Policial San José"
                            ></iframe>
                        </div>
                    </AnimatedSection>
                    <div className="text-center mt-3">
                        <a
                            href="https://maps.app.goo.gl/uX7RzC5N3H1P5KZA9"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm"
                            style={{ color: artiguistaColors.azul, fontWeight: 'bold' }}
                        >
                            Ver en Google Maps Grande
                        </a>
                    </div>
                </Container>
            </section>
        </main>
    );
}

