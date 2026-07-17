import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import BeneficiosSanJoseSection from '@/components/home/BeneficiosSanJoseSection';
import ConveniosSection from '@/components/home/ConveniosSection';
import AsociarseSection from '@/components/home/AsociarseSection';

export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Fortaleciendo la Familia Policial desde 1944. Unimos y apoyamos a los policías de San José y el país con servicios, convenios comerciales, beneficios exclusivos y noticias de la jefatura policial siempre al día.',
  openGraph: {
    title: 'Inicio | Círculo Policial San José - Referente en Uruguay',
    description: 'Fortaleciendo la Familia Policial en todo Uruguay desde 1944. Convenios, servicios médicos, turismo y noticias policiales. Afíliate hoy.',
  },
};

export const revalidate = 86400; // 24 hours

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ConveniosSection />
      <BeneficiosSanJoseSection />
      <AsociarseSection />
    </main>
  );
}
