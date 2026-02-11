
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, CardBody, Button, Table, Spinner, Badge } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { Post } from '@/lib/blog';
import { getPostsAction, deletePostAction } from '@/app/actions';
import Link from 'next/link';
import { Trash2, Edit, Plus, ExternalLink, Calendar } from 'lucide-react';

export default function AdminNoticiasPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            // Verificar auth (simple check for now)
            const token = localStorage.getItem('admin-token');
            if (!token) {
                router.push('/admin');
                return;
            }

            try {
                const postsData = await getPostsAction();
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [router]);

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta noticia? Esta acción no se puede deshacer.')) {
            try {
                await deletePostAction(id);
                setPosts(posts.filter(post => post.id !== id));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Hubo un error al eliminar la noticia.");
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner color="primary" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: artiguistaColors.gris[50], paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ backgroundColor: artiguistaColors.azul, padding: '2rem 0', marginBottom: '2rem', color: 'white' }}>
                <Container>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h3 fw-bold mb-1">Gestión de Noticias</h1>
                            <p className="mb-0 opacity-75">Administra las publicaciones del Círculo Policial</p>
                        </div>
                        <div className='d-flex gap-2'>
                            <Button
                                color="light"
                                outline
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                ← Volver al Panel
                            </Button>
                            <Link href="/admin/noticias/crear" passHref>
                                <Button style={{ backgroundColor: artiguistaColors.rojo, border: 'none' }}>
                                    <Plus size={18} className="me-2" />
                                    Nueva Noticia
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <Card className="border-0 shadow-sm">
                    <CardBody className="p-0">
                        {posts.length === 0 ? (
                            <div className="text-center p-5">
                                <div className="mb-3 text-muted">
                                    <Calendar size={48} strokeWidth={1} />
                                </div>
                                <h3 className="h5 text-muted">No hay noticias publicadas aún</h3>
                                <p className="small text-muted mb-4">Comienza creando la primera publicación para informar a los socios.</p>
                                <Link href="/admin/noticias/crear">
                                    <Button color="primary">Crear Primera Noticia</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3" style={{ width: '40%' }}>Título</th>
                                            <th className="py-3">Fecha</th>
                                            <th className="py-3">Autor</th>
                                            <th className="pe-4 py-3 text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((post) => (
                                            <tr key={post.id}>
                                                <td className="ps-4 fw-medium text-dark">
                                                    {post.title}
                                                </td>
                                                <td className="text-muted small">
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-UY') : 'Reciente'}
                                                </td>
                                                <td>
                                                    <Badge color="light" className="text-dark border">
                                                        {post.author || 'Admin'}
                                                    </Badge>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <a href={`/noticias/${post.id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" title="Ver Publicación">
                                                            <ExternalLink size={16} />
                                                        </a>
                                                        {/* TODO: Add Edit functionality later
                                                        <Button size="sm" color="light" className="text-primary border" title="Editar">
                                                            <Edit size={16} />
                                                        </Button>
                                                        */}
                                                        <Button
                                                            size="sm"
                                                            color="light"
                                                            className="text-danger border"
                                                            title="Eliminar"
                                                            onClick={() => handleDelete(post.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
}
