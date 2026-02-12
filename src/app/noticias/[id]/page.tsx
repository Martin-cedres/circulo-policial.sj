export const dynamic = 'force-dynamic';

import { artiguistaColors } from '@/styles/colors';
import { getPostById, getPosts } from '@/lib/blog';
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

    return {
        title: `${post.title} | Círculo Policial San José`,
        description: post.seoDescription || post.subtitle || `Lee la última noticia: ${post.title}`,
        keywords: post.seoKeywords || 'noticias, circulo policial, san jose',
        openGraph: {
            title: post.title,
            description: post.seoDescription || post.subtitle || '',
            images: post.imageUrl ? [post.imageUrl] : [],
            type: 'article',
        }
    };
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
                    minHeight: post.imageUrl ? '50vh' : '300px',
                    display: 'flex',
                    alignItems: 'center',
                    background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                    padding: '80px 0'
                }}
            >
                {post.imageUrl && (
                    <>
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            style={{ objectFit: 'cover', opacity: 0.6 }}
                            priority
                        />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(to bottom, transparent 0%, ${artiguistaColors.azulOscuro}ee 100%)`
                        }} />
                    </>
                )}

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

                        <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2', wordBreak: 'normal', overflowWrap: 'break-word' }}>{post.title}</h1>
                        {post.subtitle && (
                            <p className="lead opacity-90 mb-0" style={{ maxWidth: '850px', lineHeight: '1.6', wordBreak: 'normal', overflowWrap: 'break-word' }}>{post.subtitle}</p>
                        )}
                    </div>
                </div>
            </div>

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
