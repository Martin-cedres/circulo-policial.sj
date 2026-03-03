
export const revalidate = 3600; // 1 hour

import { Metadata } from 'next';
import { artiguistaColors } from '@/styles/colors';
import { getPosts } from '@/lib/blog';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import NewsImage from './NewsImage';

export const metadata: Metadata = {
    title: 'Noticias Policiales San José | Últimas novedades de Uruguay',
    description: 'Mantente informado sobre las últimas noticias del Círculo Policial San José y novedades policiales de Uruguay. Comunicados, beneficios y eventos de la Jefatura de Policía de San José.',
    openGraph: {
        title: 'Noticias | Círculo Policial San José',
        description: 'Todas las noticias y comunicados del Círculo Policial y la familia policial uruguaya.',
    }
};

// Server Component (sin 'use client')
export default async function NoticiasPage() {
    // Fetch directo en el servidor
    const posts = await getPosts();

    // 1. Ordenar todos los posts por fecha descendente
    const sortedPosts = [...posts].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    // 2. Buscar la noticia marcada como destacada (la más reciente si hay varias)
    let featuredPost = sortedPosts.find(post => post.isFeatured);

    // 3. Si no hay ninguna marcada como destacada, tomar la más reciente
    if (!featuredPost && sortedPosts.length > 0) {
        featuredPost = sortedPosts[0];
    }

    // 4. Filtrar la noticia destacada de la lista secundaria
    const otherPosts = sortedPosts.filter(post => post.id !== featuredPost?.id);

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'Eventos': return artiguistaColors.rojo;
            case 'Beneficios': return artiguistaColors.dorado;
            case 'Comunicado': return artiguistaColors.negro;
            default: return artiguistaColors.azul;
        }
    };

    return (
        <main style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '5rem' }}>
            {/* Hero Section para Noticias */}
            <section
                className="position-relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    color: 'white',
                    padding: '4rem 0 6rem 0',
                }}
            >
                {/* Patrón sutil de fondo */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none'
                }}></div>

                <div className="container position-relative">
                    <div className="row justify-content-center text-center">
                        <div className="col-11 col-md-10 col-lg-8">
                            <h1 className="display-4 fw-bold mb-3">Novedades y Noticias</h1>
                            <p className="lead mb-0 opacity-90 mx-auto" style={{ maxWidth: '600px' }}>
                                Mantente informado sobre todas las actividades, comunicados y eventos del Círculo Policial de San José.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                {posts.length === 0 ? (
                    <div className="bg-white rounded-4 shadow-sm text-center py-5">
                        <div className="mb-3 text-muted opacity-50 d-inline-block">
                            <Calendar size={64} strokeWidth={1} />
                        </div>
                        <h3 className="h5 text-muted">No hay noticias publicadas aún</h3>
                        <p className="text-muted">Pronto compartiremos las últimas novedades de la institución.</p>
                    </div>
                ) : (
                    <>
                        {/* Noticia Destacada */}
                        {featuredPost && (
                            <div className="col-12 mb-5">
                                <div className="card border-0 shadow-lg" style={{ borderRadius: '1.5rem', overflow: 'hidden', isolation: 'isolate' }}>
                                    <div className="row g-0">
                                        <div className="col-lg-7 p-3">
                                            <div className="position-relative h-100 min-vh-25 min-vh-md-40" style={{
                                                aspectRatio: '16/9',
                                                overflow: 'hidden',
                                                borderRadius: '1rem',
                                                backgroundColor: '#f8f9fa'
                                            }}>
                                                <NewsImage
                                                    src={featuredPost.imageUrl || '/images/placeholder-news.jpg'}
                                                    alt={featuredPost.title}
                                                    contain={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-5 d-flex align-items-center">
                                            <div className="card-body p-4 p-md-5">
                                                <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                                                    <span className="text-uppercase fw-bold" style={{ color: getCategoryColor(featuredPost.category), fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                        {featuredPost.category || 'Institucional'}
                                                    </span>
                                                    {/* Control manual: isNew */}
                                                    {featuredPost.isNew && (
                                                        <>
                                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>•</span>
                                                            <span className="text-danger fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                                NUEVO
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                <h2 className="h2 fw-bold mb-3" style={{ color: artiguistaColors.negro }}>
                                                    <Link href={`/noticias/${featuredPost.id}`} className="text-decoration-none text-dark hover-text-blue">
                                                        {featuredPost.title}
                                                    </Link>
                                                </h2>

                                                <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                                                    <Calendar size={14} />
                                                    {featuredPost.createdAt ? new Date(featuredPost.createdAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Reciente'}
                                                </div>

                                                <p className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
                                                    {featuredPost.subtitle || featuredPost.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
                                                </p>

                                                <Link href={`/noticias/${featuredPost.id}`} className="btn btn-primary rounded-pill px-4 shadow-sm" style={{ backgroundColor: artiguistaColors.azul, borderColor: artiguistaColors.azul }}>
                                                    Continuar leyendo
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grilla de Otras Noticias */}
                        <div className="row g-4">
                            {otherPosts.map((post) => (
                                <div className="col-md-6 col-lg-4" key={post.id}>
                                    <div className="card h-100 border-0 shadow-sm hover-lift" style={{ borderRadius: '1.25rem', overflow: 'hidden', isolation: 'isolate' }}>
                                        <div className="p-3 pb-0">
                                            <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', borderRadius: '0.75rem', backgroundColor: '#f8f9fa' }}>
                                                <NewsImage
                                                    src={post.imageUrl || '/images/placeholder-news.jpg'}
                                                    alt={post.title}
                                                    contain={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="card-body p-4 d-flex flex-column">

                                            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                                <span className="text-uppercase fw-bold" style={{ color: getCategoryColor(post.category), fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                    {post.category || 'Institucional'}
                                                </span>
                                                {/* Control manual: isNew */}
                                                {post.isNew && (
                                                    <>
                                                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>•</span>
                                                        <span className="text-danger fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                                                            NUEVO
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <h3 className="h6 fw-bold mb-3" style={{ color: artiguistaColors.negro, lineHeight: '1.4' }}>
                                                <Link href={`/noticias/${post.id}`} className="text-decoration-none text-dark stretched-link hover-text-blue">
                                                    {post.title}
                                                </Link>
                                            </h3>

                                            <p className="text-muted small mb-0 line-clamp-3 mb-4">
                                                {post.subtitle || post.content.substring(0, 80).replace(/<[^>]*>/g, '') + '...'}
                                            </p>

                                            <div className="mt-auto d-flex align-items-center justify-content-between border-top pt-3">
                                                <div className="d-flex align-items-center gap-2 small text-muted">
                                                    <Calendar size={12} />
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }) : 'Reciente'}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 small text-muted">
                                                    <User size={12} />
                                                    {post.author || 'Admin'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-lift {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
                }
                .hover-text-blue:hover {
                    color: ${artiguistaColors.azul} !important;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}} />
        </main>
    );
}
