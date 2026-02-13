import type { Metadata } from 'next';
import { Container, Row, Col } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import { MapPin, Mail, CheckCircle2 } from 'lucide-react';
import AsociarseForm from './AsociarseForm';

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
    title: 'Hacerse Socio',
    description: 'Unite al Círculo Policial San José. Formá parte de nuestra comunidad y disfrutá de beneficios exclusivos, servicios sociales y apoyo integral para la familia policial.',
    openGraph: {
        title: 'Hacerse Socio | Círculo Policial San José',
        description: 'Sumate a nuestra institución institucional. 82 años de trayectoria promoviendo el bienestar integral.',
        images: [
            {
                url: '/images/logo%20circulo%20policial%20san%20jose.webp',
                width: 1200,
                height: 630,
                alt: 'Formulario de Asociación Círculo Policial San José',
            }
        ],
    },
};

export default function AsociarsePage() {
    return (
        <main>
            {/* Hero Section */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.rojo} 0%, ${artiguistaColors.rojoOscuro} 100%)`,
                    color: artiguistaColors.blanco,
                    padding: '5rem 0',
                    textAlign: 'center',
                }}
            >
                <Container>
                    <h1 className={`display-4 fw-bold mb-3 ${satisfy.className}`}>
                        Formá parte de nuestra comunidad
                    </h1>
                    <p className="lead">
                        Sumate al Círculo Policial y accedé a beneficios exclusivos
                    </p>
                </Container>
            </section>

            {/* Formulario */}
            <section className="section-padding">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <AsociarseForm />
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Información adicional */}
            <section
                className="section-padding"
                style={{ backgroundColor: artiguistaColors.gris[50] }}
            >
                <Container>
                    <Row>
                        <Col md={6} className="mb-4">
                            <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                ¿Por qué asociarse?
                            </h3>
                            <ul className="list-unstyled" style={{ lineHeight: '1.8' }}>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Acceso a instalaciones recreativas</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Asesoramiento legal gratuito</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Beneficios en salud</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Convenios comerciales</li>
                                <li className="d-flex align-items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /> Red de apoyo y contención</li>
                            </ul>
                        </Col>
                        <Col md={6} className="mb-4">
                            <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                ¿Dudas?
                            </h3>
                            <p style={{ lineHeight: '1.8' }}>
                                Si tenés consultas sobre el proceso de asociación o los beneficios, no dudes en contactarnos:
                            </p>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-2">
                                    <MapPin size={20} className="text-muted mt-1" />
                                    <span>Calle Ituzaingó y Ciganda, San José de Mayo</span>
                                </div>
                                <div className="d-flex align-items-start gap-2">
                                    <Mail size={20} className="text-muted mt-1" />
                                    <span>
                                        Email: <a href="mailto:sanjosecirculopolicial@gmail.com" style={{ color: artiguistaColors.azul }}>
                                            sanjosecirculopolicial@gmail.com
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </main>
    );
}
