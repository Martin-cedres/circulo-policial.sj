export const revalidate = 3600; // 1 hour

import { artiguistaColors } from '@/styles/colors';
import { getPostById, getPosts, Post } from '@/lib/blog';
import ShareButton from './ShareButton';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import GalleryGrid from './GalleryGrid';
import { generateArticleSchema } from '@/lib/structured-data/schemas';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const post = await getPostById(parseInt(id));

    if (!post) return { title: 'Noticia no encontrada' };

    const title = `${post.title} | Noticias Círculo Policial San José, Uruguay`;
    const description = post.seoDescription || post.subtitle || `Últimas novedades y noticias del Círculo Policial San José para toda la familia policial de Uruguay: ${post.title}`;
    const url = `/noticias/${id}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.circulopolicialsj.org.uy';
    const rawImageUrl = post.imageUrl || '/images/logo-circulo-policial.png';
    const imageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `${siteUrl}${rawImageUrl}`;

    return {
        title,
        description,
        keywords: post.seoKeywords || 'noticias policiales, circulo policial san jose, circulo policial uruguay, jefatura de policia',
        openGraph: {
            title: post.title,
            description,
            url,
            siteName: 'Círculo Policial San José - Novedades Uruguay',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
            locale: 'es_UY',
            type: 'article',
            publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
            authors: [post.author || 'Admin'],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        }
    };
}

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post: Post) => ({
        id: post.id.toString(),
    }));
}

export default async function DetalleNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
        return notFound();
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.circulopolicialsj.org.uy';
    const rawImageUrl = post.imageUrl || '/images/logo-circulo-policial.png';
    const absoluteImageUrl = rawImageUrl.startsWith('http') ? rawImageUrl : `${siteUrl}${rawImageUrl}`;

    const schemaData = generateArticleSchema({
        title: post.title,
        description: post.seoDescription || post.subtitle || `Novedad institucional: ${post.title}`,
        imageUrl: absoluteImageUrl,
        createdAt: post.createdAt,
        author: post.author
    });

    return (
        <article style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '6rem', overflowX: 'hidden' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(schemaData),
                }}
            />
            {/* Cabecera / Hero con diseño premium */}
            <div
                style={{
                    position: 'relative',
                    minHeight: '350px',
                    display: 'flex',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    padding: '80px 0',
                    overflow: 'hidden'
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
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <Link href="/noticias" className="btn btn-outline-light btn-sm rounded-pill mb-4 px-3 d-inline-flex align-items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                                <ArrowLeft size={16} /> Volver a Noticias
                            </Link>

                            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                                <span className={`badge px-3 py-2 rounded-pill shadow-sm`} style={{
                                    backgroundColor: post.category === 'Eventos' ? artiguistaColors.rojo :
                                        post.category === 'Beneficios' ? artiguistaColors.dorado :
                                            post.category === 'Comunicado' ? artiguistaColors.negro : artiguistaColors.azul,
                                    color: 'white'
                                }}>
                                    {post.category || 'Institucional'}
                                </span>
                                <div className="d-flex align-items-center gap-2 text-white-50 small">
                                    <Calendar size={14} />
                                    {post.createdAt
                                        ? new Date(post.createdAt).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Reciente'
                                    }
                                </div>
                                <div className="d-flex align-items-center gap-2 text-white-50 small ms-lg-2">
                                    <User size={14} />
                                    {post.author || 'Admin'}
                                </div>
                            </div>

                            <h1 className="display-4 fw-bold text-white mb-3" style={{
                                lineHeight: '1.2',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>{post.title}</h1>
                            {post.subtitle && (
                                <p className="lead text-white opacity-90 mb-0" style={{
                                    maxWidth: '800px',
                                    fontSize: '1.3rem'
                                }}>{post.subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal con Contenedor Premium */}
            <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="bg-white rounded-4 shadow-lg overflow-hidden border-0">
                            {/* Imagen Destacada de Gran Calidad */}
                            <div className="p-4 p-md-5 pb-0">
                                {post.imageUrl && (
                                    <div
                                        className="mx-auto shadow-sm overflow-hidden"
                                        style={{
                                            position: 'relative',
                                            aspectRatio: '16/9',
                                            width: '100%',
                                            maxWidth: '800px', // Tope para que no sea gigante
                                            borderRadius: '1rem',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                    >
                                        <Image
                                            src={post.imageUrl}
                                            alt={post.title}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            priority
                                        />

                                    </div>
                                )}
                            </div>

                            <div className="p-4 p-md-5">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div
                                            className="content-body rich-content"
                                            style={{
                                                fontSize: '1.25rem',
                                                lineHeight: '1.9',
                                                color: '#2D3748',
                                            }}
                                        >
                                            {/* Renderizamos el contenido HTML */}
                                            <div
                                                dangerouslySetInnerHTML={{ __html: post.content.replace(/&nbsp;|\u00A0/g, ' ') }}
                                            />
                                        </div>

                                        {/* Galería de Fotos (Opción 2) */}
                                        {post.galleryUrls && post.galleryUrls.length > 0 && (
                                            <GalleryGrid images={post.galleryUrls} />
                                        )}

                                        <div className="mt-5 pt-5 border-top d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                                            <div>
                                                <h4 className="h6 fw-bold text-uppercase tracking-wider mb-2 text-muted">¿Crees que sea útil para otros?</h4>
                                                <ShareButton title={post.title} text={post.subtitle || post.content.substring(0, 100).replace(/<[^>]*>/g, '')} />
                                            </div>
                                            <div className="text-md-end">
                                                <p className="small text-muted mb-0">Publicado por</p>
                                                <p className="fw-bold text-dark mb-0">{post.author || 'Administración Círculo Policial'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pie de página de la noticia */}
                        <div className="mt-4 text-center">
                            <Link href="/noticias" className="btn btn-link text-decoration-none text-muted hover-text-blue transition-all">
                                <ArrowLeft size={16} className="me-2" /> Leer más noticias institucionales
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
