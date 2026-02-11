
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { createPostAction } from '@/app/actions';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CrearNoticiaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        content: '',
        author: 'Administrador'
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title || !formData.content) {
            setError('Por favor completa los campos obligatorios (Título y Contenido).');
            setLoading(false);
            return;
        }

        try {
            const dataToSubmit = new FormData();
            dataToSubmit.append('title', formData.title);
            dataToSubmit.append('subtitle', formData.subtitle);
            dataToSubmit.append('content', formData.content);
            dataToSubmit.append('author', formData.author);
            if (imageFile) {
                dataToSubmit.append('image', imageFile);
            }

            await createPostAction(dataToSubmit);
            router.push('/admin/noticias');
        } catch (err: any) {
            console.error(err);
            setError('Error al guardar: ' + (err.message || 'Intenta nuevamente.'));
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: artiguistaColors.gris[50], paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ backgroundColor: artiguistaColors.azul, padding: '2rem 0', marginBottom: '2rem', color: 'white' }}>
                <Container>
                    <div className="d-flex align-items-center gap-3">
                        <Link href="/admin/noticias" className="text-white">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="h3 fw-bold mb-0">Nueva Noticia</h1>
                            <p className="mb-0 opacity-75">Redacta una nueva publicación para los socios</p>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <Card className="border-0 shadow-sm">
                            <CardBody className="p-4 p-md-5">
                                {error && <Alert color="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <FormGroup>
                                                <Label for="title" className="fw-bold">Título de la Noticia <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="text"
                                                    id="title"
                                                    bsSize="lg"
                                                    placeholder="Ej: Gran Cena Anual de Socios"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    required
                                                />
                                            </FormGroup>

                                            <FormGroup>
                                                <Label for="subtitle" className="fw-bold">Subtítulo / Bajada</Label>
                                                <Input
                                                    type="textarea"
                                                    id="subtitle"
                                                    rows={2}
                                                    placeholder="Breve resumen que aparecerá debajo del título..."
                                                    value={formData.subtitle}
                                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                                />
                                            </FormGroup>

                                            <FormGroup>
                                                <Label for="content" className="fw-bold">Contenido Principal <span className="text-danger">*</span></Label>
                                                <Input
                                                    type="textarea"
                                                    id="content"
                                                    rows={12}
                                                    placeholder="Escribe aquí el cuerpo de la noticia..."
                                                    value={formData.content}
                                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                    required
                                                    style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
                                                />
                                                <small className="text-muted d-block mt-1">Puedes usar saltos de línea para separar párrafos.</small>
                                            </FormGroup>
                                        </div>

                                        <div className="col-md-4">
                                            <Card className="bg-light border-0 mb-3">
                                                <CardBody>
                                                    <Label className="fw-bold mb-3">Imagen Destacada</Label>

                                                    <div
                                                        className="border rounded bg-white d-flex align-items-center justify-content-center overflow-hidden position-relative"
                                                        style={{
                                                            height: '200px',
                                                            borderStyle: 'dashed !important',
                                                            borderColor: '#dee2e6'
                                                        }}
                                                    >
                                                        {previewUrl ? (
                                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                                <Image
                                                                    src={previewUrl}
                                                                    alt="Preview"
                                                                    fill
                                                                    style={{ objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-muted p-3">
                                                                <Upload size={32} className="mb-2" />
                                                                <p className="small mb-0">Haga clic abajo para subir una imagen</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <FormGroup className="mt-3">
                                                        <Input
                                                            type="file"
                                                            id="image"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                        />
                                                        <small className="text-muted d-block mt-1">Recomendado: 1200x630px (Formato horizontal)</small>
                                                    </FormGroup>
                                                </CardBody>
                                            </Card>

                                            <Card className="bg-light border-0">
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="author" className="fw-bold">Autor</Label>
                                                        <Input
                                                            type="text"
                                                            id="author"
                                                            value={formData.author}
                                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                        />
                                                    </FormGroup>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
                                        <Link href="/admin/noticias">
                                            <Button color="light" className="border">Cancelar</Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            style={{ backgroundColor: artiguistaColors.azul, borderColor: artiguistaColors.azul }}
                                            disabled={loading}
                                            className="px-4"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} className="me-2" />
                                                    Publicar Noticia
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
}
