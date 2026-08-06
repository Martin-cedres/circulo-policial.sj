'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface NewsImageProps {
    src: string;
    alt: string;
    contain?: boolean;
}

export default function NewsImage({ src, alt, contain = false }: NewsImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src || '/images/logo-circulo-policial.png');

    useEffect(() => {
        setImgSrc(src || '/images/logo-circulo-policial.png');
    }, [src]);

    return (
        <div
            className="news-card-img-container position-relative w-100 h-100"
            style={{
                overflow: 'hidden',
                backgroundColor: '#f8f9fa',
                isolation: 'isolate' // Previene sangrado de píxeles en bordes redondeados
            }}
        >
            <Image
                src={imgSrc}
                alt={alt}
                fill
                unoptimized
                onError={() => {
                    if (imgSrc !== '/images/logo-circulo-policial.png') {
                        setImgSrc('/images/logo-circulo-policial.png');
                    }
                }}
                style={{
                    objectFit: contain ? 'contain' : 'cover',
                    objectPosition: 'center',
                }}
                className="transition-all duration-700 ease-in-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
}

