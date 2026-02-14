'use client';

import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';

interface NewsImageProps {
    src: string;
    alt: string;
}

export default function NewsImage({ src, alt }: NewsImageProps) {
    return (
        <div className="news-card-img-container skeleton-pulse" style={{ aspectRatio: '16/9', height: 'auto' }}>
            <Image
                src={src}
                alt={alt}
                fill
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                className="transition-all duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoadingComplete={(img) => {
                    img.parentElement?.classList.remove('skeleton-pulse');
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: artiguistaColors.azul,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                    fontSize: '0.74rem',
                    fontWeight: 'bold',
                    zIndex: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                Novedad
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
                    zIndex: 1
                }}
            />
        </div>
    );
}
