export interface OrganizationSchema {
    '@context': 'https://schema.org';
    '@type': 'Organization';
    name: string;
    alternateName?: string;
    description: string;
    url: string;
    logo: string;
    foundingDate: string;
    areaServed?: string;
    address: {
        '@type': 'PostalAddress';
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
    };
    email?: string;
    sameAs: string[];
}

export const organizationSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Círculo Policial "Gral. José Artigas" - San José',
    alternateName: 'Círculo Policial San José - Uruguay',
    description: 'Institución de referencia en Uruguay dedicada al bienestar integral de la familia policial aportando beneficios y servicios a nivel país. Fundada el 15 de abril de 1944.',
    url: 'https://www.circulopolicialsj.org.uy',
    logo: 'https://www.circulopolicialsj.org.uy/images/logo-circulo-policial.png',
    foundingDate: '1944-04-15',
    areaServed: 'UY',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle Ituzaingó N° 441',
        addressLocality: 'San José de Mayo',
        addressRegion: 'San José',
        addressCountry: 'UY',
    },
    email: 'sanjosecirculopolicial@gmail.com',
    sameAs: [],
};

export interface PersonSchema {
    '@context': 'https://schema.org';
    '@type': 'Person';
    name: string;
    jobTitle: string;
    affiliation: {
        '@type': 'Organization';
        name: string;
    };
}

export const presidentSchema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Darcy Gonzalez',
    jobTitle: 'Presidente - Comisario Mayor (R)',
    affiliation: {
        '@type': 'Organization',
        name: 'Círculo Policial "Gral. José Artigas" - San José',
    },
};

export interface ArticleSchema {
    '@context': 'https://schema.org';
    '@type': 'NewsArticle';
    headline: string;
    description: string;
    image: string[];
    datePublished: string;
    author: {
        '@type': 'Person' | 'Organization';
        name: string;
    }[];
    publisher: {
        '@type': 'Organization';
        name: string;
        logo: {
            '@type': 'ImageObject';
            url: string;
        };
    };
}

export function generateArticleSchema(post: {
    title: string;
    description: string;
    imageUrl: string;
    createdAt?: Date | string;
    author?: string;
}): ArticleSchema {
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: post.description,
        image: [post.imageUrl],
        datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
        author: [{
            '@type': post.author === 'Admin' ? 'Organization' : 'Person',
            name: post.author === 'Admin' ? 'Círculo Policial San José' : (post.author || 'Círculo Policial San José')
        }],
        publisher: {
            '@type': 'Organization',
            name: 'Círculo Policial "Gral. José Artigas" - San José',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.circulopolicialsj.org.uy/images/logo-circulo-policial.png'
            }
        }
    };
}
