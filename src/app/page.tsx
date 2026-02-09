import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import HeroSection from '@/components/home/HeroSection';
import AniversarioBanner from '@/components/home/AniversarioBanner';
import NosotrosSection from '@/components/home/NosotrosSection';
import BeneficiosSanJoseSection from '@/components/home/BeneficiosSanJoseSection';
import AsociarseSection from '@/components/home/AsociarseSection';

export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Fortaleciendo la Familia Policial de San José desde 1944. Unimos y apoyamos a la familia policial con servicios sociales, beneficios exclusivos y defensa de derechos. ¡Hacete socio hoy!',
  openGraph: {
    title: 'Círculo Policial "Gral. José Artigas" - San José',
    description: 'Fortaleciendo la Familia Policial de San José desde 1944. 82 años de compromiso institucional.',
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AniversarioBanner />
        <NosotrosSection />
        <BeneficiosSanJoseSection />
        <AsociarseSection />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
