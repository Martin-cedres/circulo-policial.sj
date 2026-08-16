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
        images: [
            {
                url: '/images/logo-circulo-policial.png',
                width: 1200,
                height: 630,
                alt: 'Convenios Comerciales Círculo Policial San José',
            }
        ],
    },
};

export default async function ConveniosPage() {
    const convenios = await getConvenios();
    return <ConveniosClient initialConvenios={convenios} />;
}
