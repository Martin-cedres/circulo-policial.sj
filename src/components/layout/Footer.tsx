import { Container, Row, Col } from 'reactstrap';
import Link from 'next/link';
import { artiguistaColors } from '@/styles/colors';
import { presidentSchema } from '@/lib/structured-data/schemas';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            style={{
                backgroundColor: artiguistaColors.negro,
                color: artiguistaColors.blanco,
                paddingTop: '3rem',
                paddingBottom: '1.5rem',
                marginTop: '4rem',
            }}
        >
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 style={{ color: artiguistaColors.dorado, fontWeight: 'bold' }}>
                            Círculo Policial San José
                        </h5>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Fundado el 15 de abril de 1944
                            <br />
                            Personería Jurídica desde el 24 de diciembre de 1948
                            <br />
                            82 años de trayectoria institucional
                            <br />
                            Institución sin fines de lucro dedicada al bienestar integral de la familia policial.
                        </p>
                    </Col>

                    <Col md={4} className="mb-4">
                        <h5 style={{ color: artiguistaColors.dorado, fontWeight: 'bold' }}>
                            Nuestra Sede
                        </h5>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Calle Ituzaingó N° 441
                            <br />
                            San José de Mayo, Uruguay
                            <br />
                            <strong>Presidente:</strong> Comisario Mayor (R) Darcy Gonzalez
                            <br />
                            <strong>Email:</strong> sanjosecirculopolicial@gmail.com
                        </p>
                    </Col>

                    <Col md={4} className="mb-4">
                        <h5 style={{ color: artiguistaColors.dorado, fontWeight: 'bold' }}>
                            Enlaces Útiles
                        </h5>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                            <li className="mb-2">
                                <Link
                                    href="/nosotros"
                                    style={{ color: artiguistaColors.blanco, textDecoration: 'none' }}
                                >
                                    Nosotros
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    href="/beneficios"
                                    style={{ color: artiguistaColors.blanco, textDecoration: 'none' }}
                                >
                                    Beneficios
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    href="/asociarse"
                                    style={{ color: artiguistaColors.blanco, textDecoration: 'none' }}
                                >
                                    Asociarse
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    href="/privacidad"
                                    style={{ color: artiguistaColors.blanco, textDecoration: 'none' }}
                                >
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    href="/terminos"
                                    style={{ color: artiguistaColors.blanco, textDecoration: 'none' }}
                                >
                                    Términos de Uso
                                </Link>
                            </li>
                        </ul>
                    </Col>
                </Row>

                <hr style={{ borderColor: artiguistaColors.gris[700], margin: '2rem 0 1rem' }} />

                <Row>
                    <Col className="text-center">
                        <div
                            style={{ fontSize: '0.85rem', opacity: 0.8 }}
                            className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 flex-wrap"
                        >
                            <span>Círculo Policial "Gral. José Artigas" - San José</span>
                            <span className="d-none d-md-inline" style={{ color: artiguistaColors.dorado }}>•</span>
                            <span>Institución con estricta neutralidad política, racial, filosófica y religiosa</span>
                            <span className="d-none d-md-inline" style={{ color: artiguistaColors.dorado }}>•</span>
                            <span>© {currentYear} Todos los derechos reservados</span>
                        </div>
                    </Col>
                </Row>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(presidentSchema),
                    }}
                />
            </Container>
        </footer>
    );
}
