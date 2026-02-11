import type { Metadata } from "next";
import { muli, satisfy } from "@/styles/fonts";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { organizationSchema } from "@/lib/structured-data/schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.circulopolicialsj.org.uy';
const siteName = 'Círculo Policial "Gral. José Artigas" - San José';
const logoPath = '/images/logo%20circulo%20policial%20san%20jose.webp';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: siteName,
  },
  description: 'Unimos y apoyamos a la familia policial de San José. 82 años de trayectoria promoviendo el bienestar integral, servicios sociales y defensa de derechos. ¡Sumate hoy!',
  keywords: ['Círculo Policial San José', 'Policía Uruguay', 'Bienestar Policial', '82 Aniversario', 'Servicios Sociales', 'Familia Policial'],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  icons: {
    icon: logoPath,
    shortcut: logoPath,
    apple: logoPath,
  },
  openGraph: {
    type: 'website',
    locale: 'es_UY',
    url: siteUrl,
    siteName,
    title: siteName,
    description: 'Unimos y apoyamos a la familia policial de San José. 82 años de trayectoria promoviendo el bienestar integral.',
    images: [
      {
        url: logoPath,
        width: 1200,
        height: 630,
        alt: 'Escudo Oficial Círculo Policial San José',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: 'Unimos y apoyamos a la familia policial de San José. 82 años de trayectoria.',
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
    // google: 'your-google-verification-code',
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
        {children}
      </body>
    </html>
  );
}

