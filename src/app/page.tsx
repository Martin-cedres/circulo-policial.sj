import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import BeneficiosSanJoseSection from '@/components/home/BeneficiosSanJoseSection';
import ConveniosSection from '@/components/home/ConveniosSection';
import NoticiasPreview from '@/components/home/NoticiasPreview';

export const metadata: Metadata = {
  title: 'Círculo Policial San José | Bienestar y Beneficios para nuestra Comunidad',
  description: 'Institución con trayectoria desde 1944 dedicada a la unión y apoyo de la familia del Círculo Policial de San José. Ofrecemos salones de eventos, cabañas en balneario Ordeig, beneficios sociales y convenios con importantes descuentos comerciales.',
  openGraph: {
    title: 'Círculo Policial San José',
    description: 'Uniendo y brindando apoyo a la comunidad del Círculo Policial San José. Descubrí nuestros beneficios sociales, salones, cabañas, convenios comerciales y novedades institucionales.',
  },
};

export const revalidate = 86400; // 24 hours

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ConveniosSection />
      <NoticiasPreview />
      <BeneficiosSanJoseSection />
    </main>
  );
}
