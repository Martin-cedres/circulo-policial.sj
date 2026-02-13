export const revalidate = 3600; // 1 hour

import { artiguistaColors } from '@/styles/colors';
import { getPostById, getPosts, Post } from '@/lib/blog';
import ShareButton from './ShareButton';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const post = await getPostById(parseInt(id));

    if (!post) return { title: 'Noticia no encontrada' };

    const title = `${post.title} | Círculo Policial San José`;
    const description = post.seoDescription || post.subtitle || `Lee la última noticia del Círculo Policial: ${post.title}`;
    const url = `/noticias/${id}`;
    const imageUrl = post.imageUrl || '/images/logo%20circulo%20policial%20san%20jose.webp';

    return {
        title,
        description,
        keywords: post.seoKeywords || 'noticias, circulo policial, san jose',
        openGraph: {
            title: post.title,
            description,
            url,
            siteName: 'Círculo Policial San José',
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

    return (
        <article style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '5rem', overflowX: 'hidden' }}>
            {/* Cabecera / Hero con Imagen de Fondo si existe, o color sólido */}
            <div
                style={{
                    position: 'relative',
                    minHeight: '280px',
                    display: 'flex',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    padding: '60px 0'
                }}
            >

                <div className="container position-relative">
                    <div className="text-white" style={{ maxWidth: '1000px' }}>
                        <Link href="/noticias" className="text-white mb-4 d-inline-flex align-items-center gap-2 text-decoration-none hover-opacity">
                            <ArrowLeft size={20} /> Volver a Noticias
                        </Link>

                        <div className="d-flex flex-wrap align-items-center gap-3 mb-4 text-white-50 small">
                            <span className="d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1 rounded-pill">
                                <Calendar size={14} />
                                {post.createdAt
                                    ? new Date(post.createdAt).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                                    : 'Reciente'
                                }
                            </span>
                            <span className="d-flex align-items-center gap-2">
                                <User size={14} />
                                {post.author || 'Admin'}
                            </span>
                        </div>

                        <h1 className="display-4 fw-bold mb-3" style={{
                            lineHeight: '1.2',
                            wordBreak: 'normal',
                            overflowWrap: 'break-word'
                        }}>{post.title}</h1>
                        {post.subtitle && (
                            <p className="lead opacity-90 mb-0" style={{
                                maxWidth: '850px',
                                lineHeight: '1.6',
                                wordBreak: 'normal',
                                overflowWrap: 'break-word'
                            }}>{post.subtitle}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Imagen Destacada / Carrusel (Nueva ubicación fuera del hero) */}
            {post.imageUrl && (
                <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div
                                className="shadow rounded-4 overflow-hidden bg-white"
                                style={{
                                    aspectRatio: '21/9',
                                    width: '100%',
                                    minHeight: '300px',
                                    position: 'relative',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.1) !important'
                                }}
                            >
                                <Image
                                    src={post.imageUrl}
                                    alt={post.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido Principal */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div
                            className="content-body"
                            style={{
                                fontSize: '1.2rem',
                                lineHeight: '1.8',
                                color: '#333',
                                textAlign: 'left',
                                maxWidth: '100%',
                                overflowX: 'hidden'
                            }}
                        >
                            {/* Renderizamos el contenido HTML del editor enriquecido, limpiando espacios no-ruptivos que causan problemas de layout */}
                            <div
                                dangerouslySetInnerHTML={{ __html: post.content.replace(/&nbsp;|\u00A0/g, ' ') }}
                                className="rich-content"
                            />
                        </div>

                        <div className="mt-5 pt-4 border-top d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            <span className="fw-bold text-muted small">Círculo Policial San José</span>
                            <div className="d-flex gap-2">
                                <ShareButton title={post.title} text={post.subtitle || post.content.substring(0, 100).replace(/<[^>]*>/g, '')} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
