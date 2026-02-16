'use client';

import { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';
import { satisfy } from '@/styles/fonts';
import AnimatedSection from '@/components/AnimatedSection';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const galerias = {
    sede: [
        { src: '/images/fachada-circulo-policial-san-jose.webp', alt: 'Fachada sede Ituzaingó', caption: 'Sede Central - Ituzaingó' },
        { src: '/images/salon-chico-circulo-policial-san-jose.webp', alt: 'Salones de Eventos', caption: 'Salones Sociales para Fiestas' },
    ],
    cabanas: [
        { src: '/images/cabañas-ordeig-circulo-policial-san-jose.webp', alt: 'Cabañas Ordeig', caption: 'Balneario Ordeig' },
    ],
    eventos: [
        { src: '/images/hogar-estudiantil-san-jose-de-mayo-circulo-policial.webp', alt: 'Hogar Estudiantil', caption: 'Convenio Hogar Estudiantil' },
    ],
};

// Aplanamos todas las imágenes para el lightbox global
const todasLasImagenes = [...galerias.sede, ...galerias.cabanas, ...galerias.eventos];

export default function GaleriaPage() {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    const openLightbox = (imgSrc: string) => {
        const index = todasLasImagenes.findIndex(img => img.src === imgSrc);
        if (index !== -1) setSelectedImage(index);
    };

    const closeLightbox = () => setSelectedImage(null);
    const nextImage = () => setSelectedImage((prev) => (prev !== null ? (prev + 1) % todasLasImagenes.length : null));
    const prevImage = () => setSelectedImage((prev) => (prev !== null ? (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length : null));

    const renderFoto = (foto: { src: string; alt: string; caption: string }, idx: number, delay: number) => (
        <Col md={6} lg={4} key={idx}>
            <AnimatedSection delay={delay} direction="up">
                <div
                    className="gallery-item-container"
                    style={{
                        padding: '12px',
                        backgroundColor: '#fff',
                        borderRadius: '1.25rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        cursor: 'pointer'
                    }}
                    onClick={() => openLightbox(foto.src)}
                >
                    <div
                        style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            borderRadius: '0.8rem',
                            overflow: 'hidden',
                        }}
                    >
                        <Image
                            src={foto.src}
                            alt={foto.alt}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="transition-all duration-500 hover-scale"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="gallery-overlay d-flex align-items-center justify-content-center opacity-0 transition-all">
                            <Maximize2 className="text-white" size={32} />
                        </div>
                    </div>
                    <div className="pt-3 pb-1 px-2">
                        <p className="mb-0 fw-bold text-center" style={{ color: artiguistaColors.azulOscuro }}>{foto.caption}</p>
                    </div>
                </div>
            </AnimatedSection>
        </Col>
    );

    return (
        <main style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            {/* Hero */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    color: artiguistaColors.blanco,
                    padding: '6rem 0',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Patrón sutil de fondo */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none'
                }}></div>

                <Container className="position-relative">
                    <AnimatedSection direction="none">
                        <h1 className={`display-3 fw-bold mb-3 ${satisfy.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                            Galería Institucional
                        </h1>
                        <p className="lead opacity-90 mx-auto" style={{ maxWidth: '600px', fontSize: '1.25rem' }}>
                            Conocé nuestras instalaciones y el compromiso con la familia policial de San José
                        </p>
                    </AnimatedSection>
                </Container>
            </section>

            {/* Grilla Unificada de Galería */}
            <section className="section-padding overflow-hidden">
                <Container>
                    <AnimatedSection>
                        <div className="text-center mb-5">
                            <h2 className="display-5 fw-bold mb-2" style={{ color: artiguistaColors.azul }}>
                                Nuestras Instalaciones y Actividades
                            </h2>
                            <div className="mx-auto" style={{ width: '80px', height: '4px', backgroundColor: artiguistaColors.dorado, borderRadius: '2px' }}></div>
                            <p className="text-muted mt-3 mx-auto" style={{ maxWidth: '600px' }}>
                                Un recorrido visual por los espacios y servicios que el Círculo Policial ofrece a sus asociados.
                            </p>
                        </div>
                    </AnimatedSection>
                    <Row className="g-4">
                        {todasLasImagenes.map((foto, idx) => renderFoto(foto, idx, idx * 0.05))}
                    </Row>
                </Container>
            </section>

            {/* Lightbox */}
            {selectedImage !== null && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-95"
                    style={{ zIndex: 10000 }}
                    onClick={closeLightbox}
                >
                    <button
                        className="position-absolute top-0 end-0 m-4 btn btn-link text-white p-2"
                        style={{ zIndex: 2 }}
                        onClick={closeLightbox}
                    >
                        <X size={32} />
                    </button>

                    <button
                        className="position-absolute start-0 m-2 m-md-4 btn btn-link text-white p-2 h-100 d-flex align-items-center"
                        style={{ zIndex: 2 }}
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <div
                        className="position-relative w-75 h-75 d-flex flex-column align-items-center justify-content-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="position-relative w-100 h-100">
                            <Image
                                src={todasLasImagenes[selectedImage].src}
                                alt="Imagen ampliada"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="img-fluid"
                            />
                        </div>
                        <div className="mt-3 text-white text-center">
                            <h4 className="h5 fw-bold mb-1">{todasLasImagenes[selectedImage].caption}</h4>
                            <p className="small opacity-75">Foto {selectedImage + 1} de {todasLasImagenes.length}</p>
                        </div>
                    </div>

                    <button
                        className="position-absolute end-0 m-2 m-md-4 btn btn-link text-white p-2 h-100 d-flex align-items-center"
                        style={{ zIndex: 2 }}
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    >
                        <ChevronRight size={48} />
                    </button>
                </div>
            )}

            <style jsx>{`
                .gallery-item-container:hover .gallery-overlay {
                    opacity: 1;
                    background: rgba(0, 72, 173, 0.3);
                }
                .hover-scale {
                    transition: transform 0.7s ease;
                }
                .gallery-item-container:hover .hover-scale {
                    transform: scale(1.1);
                }
                .gallery-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
            `}</style>
        </main>
    );
}
