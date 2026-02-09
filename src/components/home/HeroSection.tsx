'use client';

import { Container, Row, Col, Button } from 'reactstrap';
import Image from 'next/image';
import Link from 'next/link';
import { artiguistaColors } from '@/styles/colors';

export default function HeroSection() {
    return (
        <section
            className="d-block d-lg-flex align-items-lg-center hero-section" // Clase custom para altura responsive
            style={{
                position: 'relative',
                // minHeight controlado por CSS (.hero-section)
                paddingBottom: '0',
                overflow: 'hidden',
                paddingTop: '0',
            }}
        >
            {/* Imagen de fondo optimizada con Next Image */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                }}
            >
                <Image
                    src="/images/fachada-circulo-policial-san-jose.webp"
                    alt="Fachada de la sede en calle Ituzaingó"
                    fill
                    priority
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}
                    sizes="100vw"
                />
                {/* Overlay con degradado artiguista */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro}ee 0%, ${artiguistaColors.azul}dd 50%, ${artiguistaColors.azulClaro}cc 100%)`,
                    }}
                />
            </div>

            <Container className="position-relative h-100">
                {/* 
                   Alineación Vertical: 
                   - Móvil: align-items-start (Arriba) + pt-5 (Espacio controlado)
                   - Desktop: align-items-lg-center (Centrado vertical) + pt-lg-0 (Sin padding extra)
                */}
                <Row className="justify-content-center justify-content-lg-center align-items-start align-items-lg-center h-100 pt-3 pt-lg-0">
                    <Col xs={12} lg={9} xl={8} className="text-white">
                        <div
                            className="p-3 p-md-4 p-lg-5 mt-4 mt-lg-0 text-center" // Centrado
                            style={{
                                backgroundColor: 'rgba(0, 20, 50, 0.9)',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            }}
                        >
                            <h1
                                className="fw-bold mb-3 fade-in"
                                style={{
                                    lineHeight: '1.2',
                                    color: '#FFFFFF',
                                    fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                                    wordWrap: 'break-word',
                                }}
                            >
                                Fortaleciendo la Familia Policial de San José desde 1944
                            </h1>
                            <p
                                className="mb-3"
                                style={{
                                    fontWeight: '500',
                                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                                    color: '#FFFFFF',
                                    opacity: 0.95,
                                }}
                            >
                                Protegemos y cuidamos a quienes protegen a nuestra sociedad
                            </p>
                            <p
                                className="mb-4 d-none d-sm-block"
                                style={{
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    color: '#e0e0e0',
                                }}
                            >
                                Celebramos <strong className="text-warning">82 años de vida institucional</strong>. Somos una entidad sin fines de lucro
                                dedicada a brindar apoyo integral a policías en actividad y retiro.
                            </p>

                            {/* Versión móvil del texto largo (más corta) */}
                            <p className="mb-4 d-block d-sm-none" style={{ fontSize: '0.9rem', color: '#e0e0e0' }}>
                                82 años brindando apoyo integral a la familia policial.
                            </p>

                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                                <Button
                                    tag={Link}
                                    href="/asociarse"
                                    className="w-100 w-sm-auto btn-lg"
                                    style={{
                                        backgroundColor: artiguistaColors.rojo,
                                        borderColor: artiguistaColors.rojo,
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        padding: '0.8rem 1.5rem',
                                    }}
                                >
                                    ¡Hacete socio hoy!
                                </Button>
                                <Button
                                    tag={Link}
                                    href="/nosotros"
                                    outline
                                    color="light"
                                    className="w-100 w-sm-auto btn-lg"
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        padding: '0.8rem 1.5rem',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                    }}
                                >
                                    Nuestra Historia
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
