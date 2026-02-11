'use client';

import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';

interface Beneficio {
    titulo: string;
    descripcion: string;
    imagen: string;
    alt: string;
}

const beneficiosSanJose: Beneficio[] = [
    {
        titulo: 'Salón Chico (Ituzaingó)',
        descripcion: 'Contamos con un salón social acondicionado en nuestra sede central de la calle Ituzaingó (ex-cantina), disponible para actividades de socios y público en general.',
        imagen: '/images/salon-chico-circulo-policial-san-jose.webp',
        alt: 'Salón social acondicionado en sede Ituzaingó',
    },
    {
        titulo: 'Cabañas en Balneario Ordeig',
        descripcion: 'Disfrutá de nuestras instalaciones recreativas frente al mar, con mejoras continuas para el descanso de la familia policial.',
        imagen: '/images/cabañas-ordeig-circulo-policial-san-jose.webp',
        alt: 'Galería Cabañas Ordeig',
    },
    {
        titulo: 'Hogar Estudiantil',
        descripcion: 'A través de un convenio estratégico con la Intendencia de San José, facilitamos el funcionamiento del Hogar Estudiantil en nuestro local, apoyando el futuro de los jóvenes de la comunidad.',
        imagen: '/images/hogar-estudiantil.svg',
        alt: 'Hogar Estudiantil convenio con Intendencia',
    },
    {
        titulo: 'Canastas Navideñas',
        descripcion: 'Reconocemos el compromiso de nuestros asociados con la entrega anual de canastas navideñas, un presente especial para compartir en familia durante las fiestas.',
        imagen: '/images/canastas-circulo-policial-san-jose.webp',
        alt: 'Entrega de canastas navideñas para socios',
    },
];

export default function BeneficiosSanJoseSection() {
    return (
        <section
            className="section-padding"
            style={{
                backgroundColor: artiguistaColors.gris[50],
            }}
        >
            <Container>
                <div className="text-center mb-4">
                    <h2 className="heading-secondary mb-2">
                        Beneficios en nuestra Sede de San José
                    </h2>
                    <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0' }}>
                        Servicios e instalaciones al servicio de la familia policial
                    </p>
                </div>

                <Row className="g-4">
                    {beneficiosSanJose.map((beneficio, index) => (
                        <Col md={6} lg={3} key={index}>
                            <Card
                                className="h-100 border-0"
                                style={{
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                }}
                            >
                                <div style={{ position: 'relative', height: '250px', width: '100%', backgroundColor: artiguistaColors.gris[200] }}>
                                    <Image
                                        src={beneficio.imagen}
                                        alt={beneficio.alt}
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <CardBody>
                                    <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>
                                        {beneficio.titulo}
                                    </h3>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: artiguistaColors.gris[700] }}>
                                        {beneficio.descripcion}
                                    </p>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
