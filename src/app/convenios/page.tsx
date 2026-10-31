import type { Metadata } from 'next';
import { getConvenios } from '@/lib/convenios';
import ConveniosClient from './ConveniosClient';

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
    title: 'Convenios Comerciales | Círculo Policial San José',
    description: 'Conoce todos los convenios comerciales y beneficios exclusivos para socios del Círculo Policial San José. Descuentos en comercios, salud, deportes y servicios.',
    openGraph: {
        title: 'Convenios Comerciales | Círculo Policial San José',
        description: 'Ahorrá y disfrutá. Presentá tu carnet de socio del Círculo Policial San José y accedé a beneficios exclusivos.',
        url: 'https://www.circulopolicialsj.org.uy/convenios',
        siteName: 'Círculo Policial San José',
        images: [
            {
                url: 'https://www.circulopolicialsj.org.uy/images/og-circulo-policial.jpg',
                secureUrl: 'https://www.circulopolicialsj.org.uy/images/og-circulo-policial.jpg',
                width: 1200,
                height: 630,
                type: 'image/jpeg',
                alt: 'Convenios Comerciales Círculo Policial San José',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Convenios Comerciales | Círculo Policial San José',
        description: 'Ahorrá y disfrutá. Presentá tu carnet de socio del Círculo Policial San José y accedé a beneficios exclusivos.',
        images: ['https://www.circulopolicialsj.org.uy/images/og-circulo-policial.jpg'],
    },
};

export default async function ConveniosPage() {
    const convenios = await getConvenios();
    return <ConveniosClient initialConvenios={convenios} />;
}
