
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { artiguistaColors } from '@/styles/colors';

interface GalleryGridProps {
    images: string[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => setSelectedImage(index);
    const closeLightbox = () => setSelectedImage(null);
    const nextImage = () => setSelectedImage((prev) => (prev !== null ? (prev + 1) % images.length : null));
    const prevImage = () => setSelectedImage((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));

    return (
        <div className="mt-5 pt-4 border-top">
            <h3 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
                Galería de Fotos
            </h3>

            <div className="row g-3">
                {images.map((url, idx) => (
                    <div key={idx} className="col-6 col-md-4 col-lg-3">
                        <div
                            className="gallery-item position-relative rounded-3 overflow-hidden shadow-sm"
                            style={{ aspectRatio: '1/1', cursor: 'pointer' }}
                            onClick={() => openLightbox(idx)}
                        >
                            <Image
                                src={url}
                                alt={`Imagen de galería ${idx + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="transition-all duration-300 hover-scale"
                            />
                            <div className="overlay d-flex align-items-center justify-content-center opacity-0 transition-all">
                                <Maximize2 className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selectedImage !== null && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-95"
                    style={{ zIndex: 9999 }}
                    onClick={closeLightbox}
                >
                    <button
                        className="position-absolute top-0 end-0 m-4 btn btn-link text-white p-2"
                        onClick={closeLightbox}
                    >
                        <X size={32} />
                    </button>

                    <button
                        className="position-absolute start-0 m-2 m-md-4 btn btn-link text-white p-2 h-100 d-flex align-items-center"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <div
                        className="position-relative w-75 h-75"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[selectedImage]}
                            alt="Imagen ampliada"
                            fill
                            style={{ objectFit: 'contain' }}
                            className="img-fluid"
                        />
                    </div>

                    <button
                        className="position-absolute end-0 m-2 m-md-4 btn btn-link text-white p-2 h-100 d-flex align-items-center"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    >
                        <ChevronRight size={48} />
                    </button>

                    <div className="position-absolute bottom-0 mb-4 text-white-50">
                        Foto {selectedImage + 1} de {images.length}
                    </div>
                </div>
            )}

            <style jsx>{`
                .gallery-item:hover .overlay {
                    opacity: 1;
                    background: rgba(0,0,0,0.3);
                }
                .hover-scale {
                    transition: transform 0.5s ease;
                }
                .gallery-item:hover .hover-scale {
                    transform: scale(1.1);
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
}
