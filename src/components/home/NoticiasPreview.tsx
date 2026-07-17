import { getPosts } from '@/lib/blog';
import { artiguistaColors } from '@/styles/colors';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import NewsImage from '@/app/noticias/NewsImage';

export default async function NoticiasPreview() {
    // Obtener los últimos 3 posts ordenados de forma descendente por fecha
    const posts = await getPosts(3);

    // Si no hay posts guardados, no mostramos la sección
    if (!posts || posts.length === 0) {
        return null;
    }

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'Eventos': return artiguistaColors.rojo;
            case 'Beneficios': return artiguistaColors.dorado;
            case 'Comunicado': return artiguistaColors.negro;
            default: return artiguistaColors.azul;
        }
    };

    return (
        <section 
            className="py-5 position-relative overflow-hidden" 
            style={{ 
                backgroundColor: '#F9FAFB',
                borderTop: `1px solid ${artiguistaColors.gris[200]}`
            }}
        >
            <div className="container">
                {/* Cabecera de Sección */}
                <div className="text-center mb-5">
                    <h2 className="display-6 fw-bold mb-2" style={{ color: artiguistaColors.azul }}>
                        Últimas Novedades
                    </h2>
                    <div 
                        className="mx-auto" 
                        style={{ 
                            width: '120px', 
                            height: '3px', 
                            backgroundColor: artiguistaColors.dorado, 
                            borderRadius: '2px' 
                        }}
                    ></div>
                </div>

                {/* Tarjetas de Novedades */}
                <div className="row g-4 justify-content-center mb-5">
                    {posts.map((post) => (
                        <div className="col-md-6 col-lg-4" key={post.id}>
                            <div 
                                className="card h-100 border-0 shadow-sm hover-lift transition-all duration-300" 
                                style={{ 
                                    borderRadius: '1.25rem', 
                                    overflow: 'hidden', 
                                    isolation: 'isolate',
                                    backgroundColor: '#ffffff'
                                }}
                            >
                                <div className="p-3 pb-0">
                                    <div 
                                        style={{ 
                                            aspectRatio: '16/9', 
                                            position: 'relative', 
                                            overflow: 'hidden', 
                                            borderRadius: '0.75rem', 
                                            backgroundColor: '#f8f9fa',
                                            padding: '0.25rem'
                                        }}
                                    >
                                        <NewsImage
                                            src={post.imageUrl || '/images/placeholder-news.jpg'}
                                            alt={post.title}
                                            contain={true}
                                        />
                                    </div>
                                </div>
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                                        <span 
                                            className="text-uppercase fw-bold" 
                                            style={{ 
                                                color: getCategoryColor(post.category), 
                                                fontSize: '0.7rem', 
                                                letterSpacing: '0.5px' 
                                            }}
                                        >
                                            {post.category || 'Institucional'}
                                        </span>
                                        {post.isNew && (
                                            <>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>•</span>
                                                <span 
                                                    className="text-danger fw-bold text-uppercase" 
                                                    style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
                                                >
                                                    Nuevo
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h3 
                                        className="h5 fw-bold mb-3 line-clamp-2" 
                                        style={{ 
                                            color: artiguistaColors.negro,
                                            minHeight: '2.8rem',
                                            lineHeight: '1.4'
                                        }}
                                    >
                                        <Link 
                                            href={`/noticias/${post.slug || post.id}`} 
                                            className="text-decoration-none text-dark hover-text-blue"
                                            style={{ transition: 'color 0.2s ease' }}
                                        >
                                            {post.title}
                                        </Link>
                                    </h3>

                                    <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                                        <Calendar size={14} />
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Reciente'}
                                    </div>

                                    <p 
                                        className="text-muted mb-4 line-clamp-3 fs-6" 
                                        style={{ 
                                            lineHeight: '1.5',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {post.subtitle || (post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...')}
                                    </p>

                                    <div className="mt-auto pt-2">
                                        <Link 
                                            href={`/noticias/${post.slug || post.id}`} 
                                            className="text-decoration-none fw-bold d-inline-flex align-items-center small"
                                            style={{ color: artiguistaColors.azul }}
                                        >
                                            Leer noticia <ArrowRight size={14} className="ms-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ver todas */}
                <div className="text-center">
                    <Link href="/noticias" passHref legacyBehavior>
                        <button 
                            className="btn btn-outline-primary px-4 py-2 hover-scale"
                            style={{ 
                                color: artiguistaColors.azul, 
                                borderColor: artiguistaColors.azul,
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem'
                            }}
                        >
                            Ver Todas las Novedades <ArrowRight size={16} className="ms-2" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
