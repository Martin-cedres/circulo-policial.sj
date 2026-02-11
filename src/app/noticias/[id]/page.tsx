
export const dynamic = 'force-dynamic';

import { artiguistaColors } from '@/styles/colors';
import { getPostById } from '@/lib/blog';
import ShareButton from './ShareButton';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function DetalleNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
        return notFound();
    }

    return (
        <article style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '5rem' }}>
            {/* Cabecera / Hero con Imagen de Fondo si existe, o color sólido */}
            <div
                style={{
                    position: 'relative',
                    height: post.imageUrl ? '50vh' : '30vh',
                    minHeight: '300px',
                    backgroundColor: artiguistaColors.azul,
                    overflow: 'hidden'
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
                            background: 'linear-gradient(to bottom, rgba(0,51,102,0.3) 0%, rgba(0,51,102,0.9) 100%)'
                        }} />
                    </>
                )}

                <div className="container h-100 position-relative">
                    <div className="d-flex flex-column justify-content-end h-100 pb-5 text-white">
                        <Link href="/noticias" className="text-white mb-4 d-inline-flex align-items-center gap-2 text-decoration-none hover-opacity">
                            <ArrowLeft size={20} /> Volver a Noticias
                        </Link>

                        <div className="d-flex align-items-center gap-3 mb-3 text-white-50 small">
                            <span className="d-flex align-items-center gap-1 bg-white bg-opacity-10 px-3 py-1 rounded-pill">
                                <Calendar size={14} />
                                {post.createdAt
                                    ? new Date(post.createdAt).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                                    : 'Reciente'
                                }
                            </span>
                            <span className="d-flex align-items-center gap-1">
                                <User size={14} />
                                {post.author || 'Admin'}
                            </span>
                        </div>

                        <h1 className="display-4 fw-bold mb-3">{post.title}</h1>
                        {post.subtitle && (
                            <p className="lead opacity-90 mb-0" style={{ maxWidth: '800px' }}>{post.subtitle}</p>
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
                            style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#333' }}
                        >
                            {/* Renderizamos el contenido respetando saltos de línea */}
                            {post.content.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-4 text-justify">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-muted small">Círculo Policial San José</span>
                            <div className="d-flex gap-2">
                                <ShareButton title={post.title} text={post.subtitle || post.content.substring(0, 100)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
