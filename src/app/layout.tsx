import type { Metadata } from "next";
import { muli, satisfy } from "@/styles/fonts";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VisitTracker from '@/components/layout/VisitTracker';
import { organizationSchema } from "@/lib/structured-data/schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.circulopolicialsj.org.uy';
const siteName = 'Círculo Policial "Gral. José Artigas" - San José';
const logoPath = '/images/logo-circulo-policial.png';
const absoluteLogoUrl = `${siteUrl}${logoPath}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | Círculo Policial San José - Uruguay`,
    default: 'Círculo Policial San José | Bienestar y Apoyo Social',
  },
  description: 'Asociación con trayectoria desde 1944 enfocada en el bienestar, recreación y apoyo social de la comunidad del Círculo Policial de San José. Ofrecemos salones de eventos, alojamiento en balneario Ordeig, convenios comerciales y noticias oficiales.',
  keywords: [
    'Círculo Policial San José',
    'Bienestar Policial',
    'Beneficios Círculo Policial',
    'Comunidad Círculo Policial',
    'Familia Círculo Policial San José',
    'Servicios Sociales Círculo Policial'
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
    title: 'Círculo Policial San José | Beneficios y Novedades Institucionales',
    description: 'Brindamos apoyo, recreación y beneficios sociales a quienes forman parte de la comunidad del Círculo Policial de San José. Convenios comerciales y novedades oficiales al día.',
    images: [
      {
        url: absoluteLogoUrl,
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
    images: [absoluteLogoUrl],
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
        <VisitTracker />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

