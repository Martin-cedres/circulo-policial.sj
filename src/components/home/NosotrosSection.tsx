import { Container, Row, Col } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';

export default function NosotrosSection() {
    return (
        <section className="section-padding">
            <Container>
                {/* Ajuste de margen inferior: mb-3 en móvil, mb-5 en desktop */}
                <Row className="align-items-center mb-3 mb-lg-5">
                    <Col lg={6} className="mb-3 mb-lg-0">
                        {/* Altura ajustada: 250px en móvil, crece hasta 600px en desktop */}
                        <div className="position-relative w-100" style={{ height: 'clamp(300px, 50vh, 600px)', minHeight: '300px', borderRadius: '1rem', overflow: 'hidden' }}>
                            <Image
                                src="/images/logo circulo policial san jose.webp"
                                alt="Escudo Oficial Círculo Policial San José"
                                fill
                                className="object-fit-contain"
                                style={{
                                    padding: '0.5rem', // Menos padding aún
                                }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                    </Col>
                    <Col lg={6}>
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
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
