'use client';

import { Container, Row, Col } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { motion } from 'framer-motion';

export default function NosotrosSection() {
    return (
        <section className="section-padding overflow-hidden">
            <Container>
                <Row className="align-items-center mb-3 mb-lg-5">
                    <Col lg={6} className="mb-3 mb-lg-0">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="position-relative w-100"
                            style={{ height: 'clamp(300px, 50vh, 600px)', minHeight: '300px', borderRadius: '1rem', overflow: 'hidden' }}
                        >
                            <Image
                                src="/images/logo circulo policial san jose.webp"
                                alt="Escudo Oficial Círculo Policial San José"
                                fill
                                className="object-fit-contain"
                                style={{
                                    padding: '0.5rem',
                                }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </motion.div>
                    </Col>
                    <Col lg={6}>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h2 className="heading-secondary mb-2 mb-md-4" style={{ color: artiguistaColors.azul }}>
                                82 Años de Compromiso Institucional
                            </h2>

                            <div className="mb-2 mb-md-4">
                                <h3 className="h5 fw-bold mb-1" style={{ color: artiguistaColors.rojo }}>
                                    Misión
                                </h3>
                                <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                                    Unir y apoyar a quienes protegen a la sociedad, promoviendo su bienestar mediante
                                    programas de asistencia social y profesionalización.
                                </p>
                            </div>

                            <div className="mb-2 mb-md-4">
                                <h3 className="h5 fw-bold mb-1" style={{ color: artiguistaColors.rojo }}>
                                    Valores
                                </h3>
                                <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                                    Nuestra institución mantiene una <strong>estricta neutralidad política, racial,
                                        filosófica y religiosa</strong>, garantizando un espacio de respeto absoluto para
                                    todos sus asociados.
                                </p>
                            </div>

                            <div className="mb-2 mb-md-4">
                                <h3 className="h5 fw-bold mb-1" style={{ color: artiguistaColors.rojo }}>
                                    Liderazgo
                                </h3>
                                <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                                    Bajo la presidencia del <strong>Comisario Mayor (R) Darcy Gonzalez</strong>, transitamos una etapa de
                                    renovación y fortalecimiento de nuestra actividad social.
                                </p>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
