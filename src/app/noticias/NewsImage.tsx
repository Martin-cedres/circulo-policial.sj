'use client';

import Image from 'next/image';

interface NewsImageProps {
    src: string;
    alt: string;
}

export default function NewsImage({ src, alt }: NewsImageProps) {
    return (
        <div className="news-card-img-container skeleton-pulse position-relative w-100 h-100" style={{ overflow: 'hidden' }}>
            <Image
                src={src}
                alt={alt}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-all duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoadingComplete={(img) => {
                    img.parentElement?.classList.remove('skeleton-pulse');
                }}
            />
        </div>
    );
}
