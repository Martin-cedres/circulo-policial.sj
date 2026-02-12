import type { Metadata } from 'next';
import { Container, Row, Col } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';

export const metadata: Metadata = {
    title: 'Galería',
    description: 'Fotos de la sede, salones de eventos, cabañas Ordeig y actividades del Círculo Policial San José',
};

const galerias = {
    sede: [
        { src: '/images/fachada-circulo-policial-san-jose.webp', alt: 'Fachada sede Ituzaingó', caption: 'Sede Central - Ituzaingó' },
        { src: '/images/salon-chico-circulo-policial-san-jose.webp', alt: 'Salones de Eventos', caption: 'Salones Sociales para Fiestas' },
    ],
    cabanas: [
        { src: '/images/cabañas-ordeig-circulo-policial-san-jose.webp', alt: 'Cabañas Ordeig', caption: 'Balneario Ordeig' },
    ],
    eventos: [
        { src: '/images/hogar-estudiantil.svg', alt: 'Hogar Estudiantil', caption: 'Convenio Hogar Estudiantil' },
    ],
};

export default function GaleriaPage() {
    return (
        <main>
            {/* Hero */}
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
                        Galería Institucional
                    </h1>
                    <p className="lead">Conocé nuestras instalaciones y actividades</p>
                </Container>
            </section>

            {/* Galería Sede */}
            <section className="section-padding">
                <Container>
                    <h2 className="heading-secondary mb-4" style={{ color: artiguistaColors.azul }}>
                        Nuestra Sede
                    </h2>
                    <Row className="g-4">
                        {galerias.sede.map((foto, idx) => (
                            <Col md={6} key={idx}>
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '400px',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <Image
                                        src={foto.src}
                                        alt={foto.alt}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                            color: 'white',
                                            padding: '2rem 1.5rem 1rem',
                                        }}
                                    >
                                        <p className="mb-0 fw-bold">{foto.caption}</p>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Galería Cabañas */}
            <section
                className="section-padding"
                style={{ backgroundColor: artiguistaColors.gris[50] }}
            >
                <Container>
                    <h2 className="heading-secondary mb-4" style={{ color: artiguistaColors.azul }}>
                        Cabañas Ordeig
                    </h2>
                    <Row className="g-4">
                        {galerias.cabanas.map((foto, idx) => (
                            <Col md={12} key={idx}>
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '500px',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <Image
                                        src={foto.src}
                                        alt={foto.alt}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="100vw"
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                            color: 'white',
                                            padding: '2rem 1.5rem 1rem',
                                        }}
                                    >
                                        <p className="mb-0 fw-bold">{foto.caption}</p>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Galería Actividades */}
            <section className="section-padding">
                <Container>
                    <h2 className="heading-secondary mb-4" style={{ color: artiguistaColors.azul }}>
                        Actividades y Convenios
                    </h2>
                    <Row className="g-4">
                        {galerias.eventos.map((foto, idx) => (
                            <Col md={6} key={idx}>
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '400px',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <Image
                                        src={foto.src}
                                        alt={foto.alt}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                            color: 'white',
                                            padding: '2rem 1.5rem 1rem',
                                        }}
                                    >
                                        <p className="mb-0 fw-bold">{foto.caption}</p>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
        </main>
    );
}
