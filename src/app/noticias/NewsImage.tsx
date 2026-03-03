'use client';

import Image from 'next/image';

interface NewsImageProps {
    src: string;
    alt: string;
    contain?: boolean;
}

export default function NewsImage({ src, alt, contain = false }: NewsImageProps) {
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
                src={src}
                alt={alt}
                fill
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
