
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { createPostAction } from '@/app/actions';
import { ArrowLeft, Save, Upload, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function CrearNoticiaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        content: '',
        author: 'Administrador',
        seoDescription: '',
        seoKeywords: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const generateAISEO = async () => {
        if (!formData.content || formData.content.length < 50) {
            setError('Primero escribe el contenido de la noticia para poder generar el SEO.');
            return;
        }

        setAiLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/generate-seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: formData.content.replace(/<[^>]*>/g, '') }) // Limpiar HTML para IA
            });

            if (!response.ok) throw new Error('Error al conectar con la IA');
            const data = await response.json();

            setFormData(prev => ({
                ...prev,
                seoDescription: data.description || prev.seoDescription,
                seoKeywords: data.keywords || prev.seoKeywords
            }));
        } catch (err: any) {
            setError('Error de IA: ' + err.message);
        } finally {
            setAiLoading(false);
        }
    };

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
            dataToSubmit.append('seoDescription', formData.seoDescription);
            dataToSubmit.append('seoKeywords', formData.seoKeywords);
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
                                                <Label for="content" className="fw-bold d-flex align-items-center gap-2">
                                                    <Type size={18} /> Contenido Principal <span className="text-danger">*</span>
                                                </Label>
                                                <RichTextEditor
                                                    value={formData.content}
                                                    onChange={(content) => setFormData({ ...formData, content })}
                                                    placeholder="Escribe aquí el cuerpo de la noticia..."
                                                />
                                                <small className="text-muted d-block mt-2">
                                                    Usa el editor para dar formato a tu noticia. Todo lo que escribas aquí se verá reflejado en la web.
                                                </small>
                                            </FormGroup>
                                        </div>

                                        <div className="col-md-4">
                                            <Card className="bg-light border-0 mb-3">
                                                <CardBody>
                                                    <Label className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                        <ImageIcon size={18} /> Imagen Destacada
                                                    </Label>

                                                    <div
                                                        className="border rounded bg-white d-flex align-items-center justify-content-center overflow-hidden position-relative"
                                                        style={{
                                                            aspectRatio: '16/9',
                                                            width: '100%',
                                                            borderStyle: 'dashed !important',
                                                            borderColor: '#dee2e6',
                                                            backgroundColor: '#f8f9fa'
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

                                            <FormGroup>
                                                <Label for="author" className="fw-bold">Autor</Label>
                                                <Input
                                                    type="text"
                                                    id="author"
                                                    value={formData.author}
                                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                />
                                            </FormGroup>

                                            <Card className="bg-light border-0 mt-3">
                                                <CardBody>
                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                        <h4 className="h6 fw-bold mb-0">SEO y Visibilidad (Google)</h4>
                                                        <Button
                                                            size="sm"
                                                            color="dark"
                                                            outline
                                                            type="button"
                                                            onClick={generateAISEO}
                                                            disabled={aiLoading}
                                                            className="d-flex align-items-center gap-2 py-1 px-2 shadow-sm"
                                                            style={{ fontSize: '0.75rem', borderRadius: '0.5rem' }}
                                                        >
                                                            {aiLoading ? <Spinner size="sm" /> : <Sparkles size={14} />}
                                                            {aiLoading ? 'Generando...' : 'Generar con IA'}
                                                        </Button>
                                                    </div>
                                                    <FormGroup>
                                                        <Label for="seoDescription" className="small fw-bold">Meta Descripción SEO</Label>
                                                        <Input
                                                            type="textarea"
                                                            id="seoDescription"
                                                            rows={3}
                                                            placeholder="Resumen para Google (máx 160 caracteres)..."
                                                            value={formData.seoDescription}
                                                            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value.substring(0, 160) })}
                                                        />
                                                        <small className="text-muted d-block mt-1">
                                                            {formData.seoDescription.length}/160 caracteres
                                                        </small>
                                                    </FormGroup>
                                                    <FormGroup className="mb-0">
                                                        <Label for="seoKeywords" className="small fw-bold">Etiquetas (Keywords)</Label>
                                                        <Input
                                                            type="text"
                                                            id="seoKeywords"
                                                            placeholder="noticias, circulo policial, san jose..."
                                                            value={formData.seoKeywords}
                                                            onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
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
