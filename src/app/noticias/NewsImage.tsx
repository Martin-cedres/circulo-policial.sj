'use client';

import Image from 'next/image';
import { artiguistaColors } from '@/styles/colors';

interface NewsImageProps {
    src: string;
    alt: string;
}

export default function NewsImage({ src, alt }: NewsImageProps) {
    return (
        <div className="news-card-img-container skeleton-pulse">
            <Image
                src={src}
                alt={alt}
                fill
                style={{ objectFit: 'cover' }}
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
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    zIndex: 2
                }}
            >
                Novedad
            </div>
        </div>
    );
}
