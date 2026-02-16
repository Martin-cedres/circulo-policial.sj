'use client';

import { Container, Row, Col } from 'reactstrap';
import Link from 'next/link';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { presidentSchema } from '@/lib/structured-data/schemas';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                backgroundColor: '#010B1A',
                color: artiguistaColors.blanco,
                borderTop: `4px solid ${artiguistaColors.dorado}`,
                paddingTop: '4rem',
                marginTop: '0',
            }}
        >
            <Container>
                <Row className="mb-5">
                    <Col lg={4} md={6} className="mb-4 mb-lg-0">
                        <div className="d-flex align-items-center mb-4">
                            <Image
                                src="/images/logo circulo policial san jose.webp"
                                alt="Logo Círculo Policial San José"
                                width={50}
                                height={50}
                                style={{ width: 'auto', height: '45px', filter: 'brightness(1.2)' }}
                                className="me-3"
                            />
                            <h5 className="mb-0 fw-bold" style={{ color: artiguistaColors.dorado, letterSpacing: '1px' }}>
                                Círculo Policial San José
                            </h5>
                        </div>
                        <p className="small opacity-75 mb-4" style={{ lineHeight: '1.8' }}>
                            Institución dedicada al bienestar integral de la familia policial de San José desde 1944. Comprometidos con el servicio, la cultura y el esparcimiento de nuestros asociados.
                        </p>
                    </Col>

                    <Col lg={2} md={6} className="mb-4 mb-lg-0 ms-lg-auto">
                        <h6 className="text-uppercase fw-bold mb-4" style={{ color: artiguistaColors.dorado, fontSize: '0.85rem' }}>
                            Institucional
                        </h6>
                        <ul className="list-unstyled">
                            {[
                                { name: 'Inicio', href: '/' },
                                { name: 'Nosotros', href: '/nosotros' },
                                { name: 'Noticias', href: '/noticias' },
                                { name: 'Galería', href: '/galeria' },
                            ].map((item) => (
                                <li key={item.href} className="mb-2">
                                    <Link href={item.href} className="footer-link-premium">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    <Col lg={2} md={6} className="mb-4 mb-lg-0">
                        <h6 className="text-uppercase fw-bold mb-4" style={{ color: artiguistaColors.dorado, fontSize: '0.85rem' }}>
                            Servicios
                        </h6>
                        <ul className="list-unstyled">
                            {[
                                { name: 'Beneficios', href: '/beneficios' },
                                { name: 'Asociarse', href: '/asociarse' },
                                { name: 'Contacto', href: '/contacto' },
                            ].map((item) => (
                                <li key={item.href} className="mb-2">
                                    <Link href={item.href} className="footer-link-premium">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    <Col lg={3} md={6}>
                        <h6 className="text-uppercase fw-bold mb-4" style={{ color: artiguistaColors.dorado, fontSize: '0.85rem' }}>
                            Contacto
                        </h6>
                        <ul className="list-unstyled small opacity-75">
                            <li className="mb-3 d-flex align-items-start gap-2">
                                <span style={{ color: artiguistaColors.dorado }}>📍</span>
                                Ituzaingó N° 441, San José de Mayo
                            </li>
                            <li className="mb-3 d-flex align-items-start gap-2">
                                <span style={{ color: artiguistaColors.dorado }}>✉️</span>
                                sanjosecirculopolicial@gmail.com
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>

            {/* Barra legal inferior */}
            <div style={{ backgroundColor: '#000812', padding: '1.5rem 0', marginTop: '2rem' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col md={8} className="text-center text-md-start mb-3 mb-md-0">
                            <p className="mb-0 small opacity-50" style={{ fontSize: '0.75rem' }}>
                                © {currentYear} Círculo Policial "Gral. José Artigas" - San José. Institución con estricta neutralidad política, racial, filosófica y religiosa.
                            </p>
                        </Col>
                        <Col md={4} className="text-center text-md-end">
                            <p className="mb-0 small opacity-50" style={{ fontSize: '0.75rem' }}>
                                <a
                                    href="https://wa.me/59891090705?text=Hola,%20vi%20el%20sitio%20del%20Círculo%20Policial%20y%20me%20interesaría%20consultarte%20por%20un%20proyecto."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white text-decoration-none signature-link"
                                >
                                    Desarrollo Web & Estrategia Digital: ¿Hablemos de tu próximo proyecto?
                                </a>
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>

            <style jsx>{`
                .footer-link-premium {
                    color: white;
                    text-decoration: none;
                    opacity: 0.7;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }
                .footer-link-premium:hover {
                    opacity: 1;
                    color: ${artiguistaColors.dorado};
                    padding-left: 5px;
                }
                .signature-link {
                    transition: all 0.3s ease;
                }
                .signature-link:hover {
                    opacity: 1 !important;
                    color: ${artiguistaColors.dorado} !important;
                }
            `}</style>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(presidentSchema),
                }}
            />
        </footer>
    );
}
