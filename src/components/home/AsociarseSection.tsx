'use client';

import { Container, Row, Col, Button } from 'reactstrap';
import Link from 'next/link';
import { artiguistaColors } from '@/styles/colors';
import { motion } from 'framer-motion';

export default function AsociarseSection() {
    return (
        <section
            className="section-padding text-white overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${artiguistaColors.rojo} 0%, ${artiguistaColors.rojoOscuro} 100%)`,
            }}
        >
            <Container>
                <Row className="justify-content-center text-center">
                    <Col lg={8}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2
                                className="display-5 fw-bold mb-4"
                                style={{
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                Formá parte de nuestra comunidad
                            </h2>

                            <p className="fs-5 mb-4" style={{ lineHeight: '1.8' }}>
                                Sumate a nuestra comunidad y disfrutá de todos los beneficios.
                                Tu aporte nos permite seguir mejorando las instalaciones y defendiendo las
                                mejores condiciones laborales para todos.
                            </p>

                            <Button
                                tag={Link}
                                href="/asociarse"
                                size="lg"
                                style={{
                                    backgroundColor: artiguistaColors.blanco,
                                    color: artiguistaColors.rojo,
                                    borderColor: artiguistaColors.blanco,
                                    fontWeight: 'bold',
                                    padding: '1rem 3rem',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                Completar Formulario de Inscripción
                            </Button>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
