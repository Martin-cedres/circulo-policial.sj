
export const revalidate = 3600; // 1 hour

import { artiguistaColors } from '@/styles/colors';
import { getPosts } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import NewsImage from './NewsImage';

// Server Component (sin 'use client')
export default async function NoticiasPage() {
    // Fetch directo en el servidor
    const posts = await getPosts();

    return (
        <main style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Hero Section para Noticias */}
            <section
                style={{
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    color: 'white',
                    padding: '2.2rem 0',
                    marginBottom: '2rem'
                }}
            >
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-11 col-md-10 col-lg-8">
                            <h1 className="h2 fw-bold mb-3">Novedades y Noticias</h1>
                            <p className="lead mb-0 opacity-90">
                                Mantente informado sobre todas las actividades, comunicados y eventos del Círculo Policial de San José.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {posts.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-3 text-muted opacity-50 d-inline-block">
                            <Calendar size={64} strokeWidth={1} />
                        </div>
                        <h3 className="h5 text-muted">No hay noticias publicadas aún</h3>
                        <p className="text-muted">Pronto compartiremos las últimas novedades de la institución.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {posts.map((post) => (
                            <div className="col-md-6 col-lg-4 mb-2" key={post.id}>
                                <div
                                    className="card h-100 border-0 shadow-sm overflow-hidden transition-all duration-300 hover-elevate"
                                    style={{ borderRadius: '1rem' }}
                                >
                                    {/* Imagen de Portada con efecto Client-side */}
                                    {post.imageUrl ? (
                                        <NewsImage src={post.imageUrl} alt={post.title} />
                                    ) : (
                                        <div className="news-card-img-container" style={{ aspectRatio: '16/9', position: 'relative', height: 'auto' }}>
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                                <Image
                                                    src="/images/logo circulo policial san jose.webp"
                                                    alt="Placeholder"
                                                    width={80}
                                                    height={80}
                                                    style={{ opacity: 0.3, objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    backgroundColor: artiguistaColors.azul,
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '50px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    zIndex: 2
                                                }}
                                            >
                                                Novedad
                                            </div>
                                        </div>
                                    )}

                                    <div className="card-body d-flex flex-column p-4">
                                        <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                                            <div className="d-flex align-items-center gap-1">
                                                <Calendar size={14} />
                                                {/* Corrección de fecha para SQL standard */}
                                                {post.createdAt
                                                    ? new Date(post.createdAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : 'Reciente'
                                                }
                                            </div>
                                        </div>

                                        <h3 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.negro, lineHeight: '1.4' }}>
                                            <Link href={`/noticias/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }} className="stretched-link hover-text-blue">
                                                {post.title}
                                            </Link>
                                        </h3>

                                        {post.subtitle && (
                                            <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {post.subtitle}
                                            </p>
                                        )}

                                        {!post.subtitle && (
                                            <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {post.content.substring(0, 120)}...
                                            </p>
                                        )}

                                        <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top">
                                            <div className="d-flex align-items-center gap-2 small text-muted">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                    <User size={12} />
                                                </div>
                                                {post.author || 'Admin'}
                                            </div>
                                            <span style={{ color: artiguistaColors.rojo, fontSize: '0.85rem', fontWeight: 600 }} className="d-flex align-items-center gap-1">
                                                Leer más <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
