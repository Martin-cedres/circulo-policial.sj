import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import BeneficiosSanJoseSection from '@/components/home/BeneficiosSanJoseSection';
import ConveniosSection from '@/components/home/ConveniosSection';
import NoticiasPreview from '@/components/home/NoticiasPreview';
import { getConvenios } from '@/lib/convenios';

export const metadata: Metadata = {
  title: 'Círculo Policial San José | Bienestar y Beneficios para nuestra Comunidad',
  description: 'Institución con trayectoria desde 1944 dedicada a la unión y apoyo de la familia del Círculo Policial de San José. Ofrecemos salones de eventos, cabañas en balneario Ordeig, beneficios sociales y convenios con importantes descuentos comerciales.',
  openGraph: {
    title: 'Círculo Policial San José | Bienestar y Beneficios para nuestra Comunidad',
    description: 'Institución con trayectoria desde 1944 dedicada a la unión y apoyo de la familia del Círculo Policial de San José. Ofrecemos salones de eventos, cabañas en balneario Ordeig, beneficios sociales y convenios con importantes descuentos comerciales.',
    url: 'https://www.circulopolicialsj.org.uy',
    siteName: 'Círculo Policial San José',
    images: [
      {
        url: 'https://www.circulopolicialsj.org.uy/images/og-circulo-policial.jpg',
        secureUrl: 'https://www.circulopolicialsj.org.uy/images/og-circulo-policial.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Círculo Policial "Gral. José Artigas" - San José, Uruguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Círculo Policial San José',
    description: 'Uniendo y brindando apoyo a la comunidad del Círculo Policial San José.',
    images: ['https://www.circulopolicialsj.org.uy/images/og-circulo-policial.jpg'],
  },
};

export const revalidate = 86400; // 24 hours

export default async function Home() {
  const convenios = await getConvenios({ destacadosOnly: true });

  return (
    <main>
      <HeroSection />
      <ConveniosSection initialConvenios={convenios} />
      <NoticiasPreview />
      <BeneficiosSanJoseSection />
    </main>
  );
}
