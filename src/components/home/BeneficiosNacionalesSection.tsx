'use client';

import { Container, Row, Col } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { Home, Scale, Hospital, Handshake } from 'lucide-react';

interface BeneficioNacional {
    titulo: string;
    descripcion: string;
    icono: React.ReactNode;
}

const beneficiosNacionales: BeneficioNacional[] = [
    {
        titulo: 'Alojamiento en Montevideo',
        descripcion: 'Hospedaje para socios en la sede de Guayabos 1606.',
        icono: <Home size={40} />,
    },
    {
        titulo: 'Asesoramiento Legal',
        descripcion: 'Defensa activa de los derechos laborales y jurídicos del policía.',
        icono: <Scale size={40} />,
    },
    {
        titulo: 'Atención en Salud',
        descripcion: 'Programas de asistencia y convenios sanitarios.',
        icono: <Hospital size={40} />,
    },
    {
        titulo: 'Convenios Comerciales',
        descripcion: 'Acceso a una red de ventajas en diversos comercios y servicios.',
        icono: <Handshake size={40} />,
    },
];

export default function BeneficiosNacionalesSection() {
    return (
        <section className="section-padding">
            <Container>
                <div className="text-center mb-3">
                    <h2 className="heading-secondary mb-2">
                        Apoyo Integral en todo el País
                    </h2>
                    <p className="text-muted" style={{ fontSize: '1rem', marginBottom: '0' }}>
                        Servicios compartidos con el Círculo Policial Central
                    </p>
                </div>

                <Row className="g-3">
                    {beneficiosNacionales.map((beneficio, index) => (
                        <Col md={6} lg={3} key={index}>
                            <div
                                className="text-center p-4 d-flex flex-column align-items-center"
                                style={{
                                    backgroundColor: artiguistaColors.blanco,
                                    border: `2px solid ${artiguistaColors.azul}`,
                                    borderRadius: '1rem',
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = artiguistaColors.azul;
                                    const svg = e.currentTarget.querySelector('svg');
                                    if (svg) svg.style.color = artiguistaColors.blanco;
                                    e.currentTarget.querySelectorAll('h3, p').forEach(el => {
                                        (el as HTMLElement).style.color = artiguistaColors.blanco;
                                    });
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = artiguistaColors.blanco;
                                    const svg = e.currentTarget.querySelector('svg');
                                    if (svg) svg.style.color = artiguistaColors.azul;
                                    e.currentTarget.querySelectorAll('h3, p').forEach(el => {
                                        (el as HTMLElement).style.color = '';
                                    });
                                }}
                            >
                                <div style={{ color: artiguistaColors.azul, marginBottom: '1.5rem', transition: 'color 0.3s ease' }}>
                                    {beneficio.icono}
                                </div>
                                <h3
                                    className="h5 fw-bold mb-3"
                                    style={{
                                        color: artiguistaColors.azul,
                                        transition: 'color 0.3s ease',
                                    }}
                                >
                                    {beneficio.titulo}
                                </h3>
                                <p
                                    style={{
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        color: artiguistaColors.gris[700],
                                        transition: 'color 0.3s ease',
                                    }}
                                >
                                    {beneficio.descripcion}
                                </p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
