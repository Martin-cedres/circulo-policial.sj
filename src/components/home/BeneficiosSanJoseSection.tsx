'use client';

import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { motion } from 'framer-motion';

interface Beneficio {
    titulo: string;
    descripcion: string;
    imagen: string;
    alt: string;
}

const beneficiosSanJose: Beneficio[] = [
    {
        titulo: 'Salones de Eventos Sede Central',
        descripcion: 'Dos amplios salones sociales totalmente equipados para fiestas y reuniones, con tarifas preferenciales para socios y disponibilidad para público general.',
        imagen: '/images/salon-chico-circulo-policial-san-jose.webp',
        alt: 'Salones de eventos en sede central Ituzaingó',
    },
    {
        titulo: 'Cabañas en Balneario Ordeig',
        descripcion: 'Instalaciones recreativas ideales para el descanso familiar en un entorno natural único, con precios exclusivos para nuestros asociados durante todo el año.',
        imagen: '/images/cabañas-ordeig-circulo-policial-san-jose.webp',
        alt: 'Galería Cabañas Ordeig',
    },
    {
        titulo: 'Convenio Hogar Estudiantil',
        descripcion: 'Facilitamos nuestras instalaciones mediante un convenio con la Intendencia para el funcionamiento del Hogar Estudiantil, un servicio de apoyo a jóvenes estudiantes.',
        imagen: '/images/hogar-estudiantil-san-jose-de-mayo-circulo-policial.webp',
        alt: 'Fachada del Hogar Estudiantil San José de Mayo',
    },
    {
        titulo: 'Canastas Navideñas Anuales',
        descripcion: 'Reconocemos tu compromiso con la entrega de canastas navideñas, un presente especial de excelente calidad para compartir en familia durante las fiestas tradicionales.',
        imagen: '/images/canastas-circulo-policial-san-jose.webp',
        alt: 'Entrega de canastas navideñas para socios',
    },
];

export default function BeneficiosSanJoseSection() {
    return (
        <section
            className="section-padding"
            style={{
                backgroundColor: artiguistaColors.gris[50], overflow: 'hidden'
            }}
        >
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-4"
                >
                    <h2 className="display-6 fw-bold mb-2" style={{ color: artiguistaColors.azul }}>
                        Servicios y Beneficios
                    </h2>
                    <div className="mx-auto" style={{ width: '120px', height: '3px', backgroundColor: artiguistaColors.dorado, borderRadius: '2px' }}></div>
                </motion.div>

                <Row className="g-2 g-sm-3 g-md-4">
                    {beneficiosSanJose.map((beneficio, index) => (
                        <Col xs={6} lg={3} key={index} className="d-flex">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="h-100 w-100 d-flex flex-column"
                            >
                                <Card
                                    className="h-100 w-100 border-0 benefit-card overflow-hidden d-flex flex-column shadow-sm"
                                    style={{
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        borderRadius: 'clamp(0.85rem, 2vw, 1.25rem)'
                                    }}
                                >
                                    <div
                                        className="p-2 p-sm-3 pb-0"
                                        style={{ width: '100%' }}
                                    >
                                        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 'clamp(0.6rem, 1.5vw, 0.75rem)' }}>
                                            <Image
                                                src={beneficio.imagen}
                                                alt={beneficio.alt}
                                                fill
                                                style={{
                                                    objectFit: 'cover',
                                                }}
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        </div>
                                    </div>
                                    <CardBody 
                                        className="d-flex flex-column flex-grow-1"
                                        style={{ padding: 'clamp(0.65rem, 2vw, 1.25rem)' }}
                                    >
                                        <h3 
                                            className="fw-bold mb-2 lh-sm" 
                                            style={{ 
                                                color: artiguistaColors.azul, 
                                                fontSize: 'clamp(0.82rem, 2.3vw, 1.15rem)',
                                                minHeight: '2.5em',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {beneficio.titulo}
                                        </h3>
                                        <p 
                                            className="flex-grow-1 mb-0" 
                                            style={{ 
                                                fontSize: 'clamp(0.72rem, 1.8vw, 0.88rem)', 
                                                lineHeight: '1.45', 
                                                color: artiguistaColors.gris[700],
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {beneficio.descripcion}
                                        </p>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
