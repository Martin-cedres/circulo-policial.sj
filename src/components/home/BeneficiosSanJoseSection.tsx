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
        titulo: 'Dos Salones de Eventos',
        descripcion: 'Disponemos de dos amplios salones sociales totalmente acondicionados para fiestas y eventos, con tarifas preferenciales para socios y disponibilidad para público en general.',
        imagen: '/images/salon-chico-circulo-policial-san-jose.webp',
        alt: 'Salones de eventos en sede central Ituzaingó',
    },
    {
        titulo: 'Cabañas en Balneario Ordeig',
        descripcion: 'Disfrutá de nuestras instalaciones recreativas en Balneario Ordeig con precios especiales para socios, con mejoras continuas pensadas para el descanso familiar.',
        imagen: '/images/cabañas-ordeig-circulo-policial-san-jose.webp',
        alt: 'Galería Cabañas Ordeig',
    },
    {
        titulo: 'Compromiso: Hogar Estudiantil',
        descripcion: 'Facilitamos nuestras instalaciones mediante un convenio con la Intendencia para el funcionamiento del Hogar Estudiantil, un servicio de apoyo a jóvenes estudiantes.',
        imagen: '/images/hogar-estudiantil-san-jose-de-mayo-circulo-policial.webp',
        alt: 'Fachada del Hogar Estudiantil San José de Mayo',
    },
    {
        titulo: 'Canastas Navideñas Anuales',
        descripcion: 'Reconocemos el compromiso de nuestros asociados con la entrega anual de canastas navideñas, un presente especial de gran calidad para compartir en familia durante las fiestas.',
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
                    <h2 className="heading-secondary mb-2">
                        Beneficios en nuestra Sede de San José
                    </h2>
                    <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0' }}>
                        Servicios e instalaciones al servicio de la familia policial
                    </p>
                </motion.div>

                <Row className="g-4">
                    {beneficiosSanJose.map((beneficio, index) => (
                        <Col md={6} lg={3} key={index}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="h-100"
                            >
                                <Card
                                    className="h-100 border-0 benefit-card"
                                    style={{
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <div
                                        className="benefit-card-img-container"
                                        style={{ position: 'relative', height: '250px', width: '100%', backgroundColor: artiguistaColors.gris[200] }}
                                    >
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
                                    <CardBody className="d-flex flex-column">
                                        <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul, minHeight: '3rem' }}>
                                            {beneficio.titulo}
                                        </h3>
                                        <p className="flex-grow-1" style={{ fontSize: '0.95rem', lineHeight: '1.6', color: artiguistaColors.gris[700] }}>
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
