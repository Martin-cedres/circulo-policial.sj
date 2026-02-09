export interface OrganizationSchema {
    '@context': 'https://schema.org';
    '@type': 'Organization';
    name: string;
    description: string;
    url: string;
    logo: string;
    foundingDate: string;
    address: {
        '@type': 'PostalAddress';
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
    };
    sameAs: string[];
}

export const organizationSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Círculo Policial "Gral. José Artigas" - San José',
    description: 'Institución sin fines de lucro dedicada al bienestar integral de la familia policial de San José. Fundada el 15 de abril de 1944.',
    url: 'https://www.circulopolicialsj.org.uy',
    logo: 'https://www.circulopolicialsj.org.uy/images/logo circulo policial san jose.webp',
    foundingDate: '1944-04-15',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle Ituzaingó',
        addressLocality: 'San José',
        addressRegion: 'San José',
        addressCountry: 'UY',
    },
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
