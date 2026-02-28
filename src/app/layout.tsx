import type { Metadata } from "next";
import { muli, satisfy } from "@/styles/fonts";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { organizationSchema } from "@/lib/structured-data/schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.circulopolicialsj.org.uy';
const siteName = 'Círculo Policial "Gral. José Artigas" - San José';
const logoPath = '/images/logo-circulo-policial.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | Círculo Policial San José - Uruguay`,
    default: 'Círculo Policial San José | Bienestar Policial en Uruguay',
  },
  description: 'Círculo Policial San José, institución líder en beneficios y servicios para la familia policial en todo Uruguay. Noticias policiales, beneficios exclusivos, asesoría legal y social para el policía uruguayo. ¡Sumate al mejor círculo policial del país!',
  keywords: [
    'Círculo Policial San José',
    'Círculo Policial del Uruguay',
    'Noticias Círculo Policial',
    'Noticias Policiales San José',
    'Policía Uruguay',
    'Bienestar Policial',
    'Beneficios Socios Policías',
    'Sindicato Policial Uruguay',
    'Jefatura de Policía San José',
    'Servicios Sociales Policiales',
    'Retirados Policiales Uruguay'
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  icons: {
    icon: [
      { url: '/images/logo-circulo-policial.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo-circulo-policial.png', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    url: siteUrl,
    siteName,
    title: 'Círculo Policial San José | Beneficios y Noticias para Policías de Uruguay',
    description: 'El Círculo Policial San José brinda los mejores beneficios a nivel nacional. Infórmate sobre noticias policiales, servicios sociales y asociate desde cualquier parte de Uruguay.',
    images: [
      {
        url: logoPath,
        width: 1200,
        height: 630,
        alt: 'Escudo Oficial Círculo Policial San José - Uruguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Círculo Policial San José | Uruguay',
    description: 'La institución policial referente en San José y todo Uruguay. Beneficios, noticias y servicios para la familia policial.',
    images: [logoPath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'lIE7MTySnj2AXTd74Z8TGm1n_17MCEYdS40tJkOkVVU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${muli.variable} ${satisfy.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={muli.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

