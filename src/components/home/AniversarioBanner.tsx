'use client';

import { Container } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';

export default function AniversarioBanner() {
    return (
        <section
            style={{
                background: `linear-gradient(90deg, ${artiguistaColors.dorado} 0%, ${artiguistaColors.blanco} 50%, ${artiguistaColors.dorado} 100%)`,
                padding: 'clamp(1.5rem, 3vw, 3rem) 0', // Más compacto en móvil
                textAlign: 'center',
                borderTop: `4px solid ${artiguistaColors.azul}`,
                borderBottom: `4px solid ${artiguistaColors.rojo}`,
            }}
        >
            <Container>
                <h2
                    className={satisfy.className}
                    style={{
                        fontSize: '3rem',
                        color: artiguistaColors.azul,
                        marginBottom: '1rem',
                    }}
                >
                    82 Años de Historia
                </h2>
                <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                    {/* Años agrupados */}
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="text-nowrap"
                            style={{
                                fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                                fontWeight: 'bold',
                                color: artiguistaColors.negro,
                            }}
                        >
                            1944
                        </div>

                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: artiguistaColors.gris[600] }}>-</div>

                        <div
                            className="text-nowrap"
                            style={{
                                fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                                fontWeight: 'bold',
                                color: artiguistaColors.rojo,
                            }}
                        >
                            2026
                        </div>
                    </div>

                    {/* Texto descriptivo debajo */}
                    <div
                        className="text-center mt-2"
                        style={{
                            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                            color: artiguistaColors.negro,
                            fontWeight: '300',
                        }}
                    >
                        Ocho décadas de compromiso
                    </div>
                </div>
            </Container>
        </section>
    );
}
