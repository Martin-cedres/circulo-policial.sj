'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, CardBody, Button, Table, Spinner, Badge } from 'reactstrap';
import { Post } from '@/lib/blog';
import { getPostsAction, deletePostAction } from '@/app/actions';
import Link from 'next/link';
import { Trash2, Edit, Plus, ExternalLink, Calendar } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminNoticiasPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
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
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '3rem' }}>
            <AdminHeader
                titulo="Gestión de Noticias y Comunicados"
                subtitulo="Administra las publicaciones, eventos, convenios y novedades del Círculo Policial"
                acciones={
                    <Button 
                        color="success" 
                        size="sm" 
                        className="fw-bold shadow-sm d-flex align-items-center gap-1"
                        onClick={() => router.push('/admin/noticias/crear')}
                    >
                        <Plus size={16} /> Nueva Noticia
                    </Button>
                }
            />

            <Container fluid="xl" className="py-4 px-3 px-md-4">
                <Card className="border-0 shadow-sm" style={{ borderRadius: '0.85rem', overflow: 'hidden' }}>
                    <CardBody className="p-0">
                        {posts.length === 0 ? (
                            <div className="text-center p-5">
                                <div className="mb-3 text-muted">
                                    <Calendar size={48} strokeWidth={1} />
                                </div>
                                <h3 className="h5 text-muted">No hay noticias publicadas aún</h3>
                                <p className="small text-muted mb-4">Comienza creando la primera publicación para informar a los socios.</p>
                                <Button color="primary" onClick={() => router.push('/admin/noticias/crear')}>
                                    Crear Primera Noticia
                                </Button>
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
                                                        <a href={`/noticias/${post.slug || post.id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" title="Ver Publicación">
                                                            <ExternalLink size={16} />
                                                        </a>
                                                        <Link href={`/admin/noticias/editar/${post.id}`} passHref>
                                                            <Button size="sm" color="light" className="text-primary border" title="Editar">
                                                                <Edit size={16} />
                                                            </Button>
                                                        </Link>
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
