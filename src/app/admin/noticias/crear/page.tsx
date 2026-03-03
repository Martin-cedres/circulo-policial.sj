
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { createPostAction } from '@/app/actions';
import { ArrowLeft, Save, Upload, Type, Image as ImageIcon, Sparkles, X, Plus } from 'lucide-react';
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
        seoKeywords: '',
        isFeatured: false,
        isNew: false,
        category: 'Institucional'
    });

    // Imagen Principal
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Galería
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

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

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));

            setGalleryFiles(prev => [...prev, ...files]);
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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
            dataToSubmit.append('isFeatured', String(formData.isFeatured));
            dataToSubmit.append('isNew', String(formData.isNew));
            dataToSubmit.append('category', formData.category);

            if (imageFile) {
                dataToSubmit.append('image', imageFile);
            }

            // Agregar archivos de galería
            galleryFiles.forEach(file => {
                dataToSubmit.append('gallery', file);
            });

            const result = await createPostAction(dataToSubmit);
            if (result?.success) {
                router.push('/admin/noticias');
            } else {
                setError('Error al guardar: ' + (result?.error || 'Intenta nuevamente.'));
                setLoading(false);
            }
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
                                            </FormGroup>

                                            {/* Sección de Galería */}
                                            <div className="mt-5">
                                                <Label className="fw-bold d-flex align-items-center gap-2 mb-3">
                                                    <Plus size={18} /> Galería de Fotos (Opcional)
                                                </Label>
                                                <Card className="bg-light border-0">
                                                    <CardBody>
                                                        <div className="row g-3">
                                                            {galleryPreviews.map((url, idx) => (
                                                                <div key={idx} className="col-4 col-md-3">
                                                                    <div className="position-relative rounded overflow-hidden" style={{ aspectRatio: '1/1' }}>
                                                                        <Image src={url} alt={`Gallery ${idx}`} fill style={{ objectFit: 'cover' }} />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeGalleryImage(idx)}
                                                                            className="position-absolute top-0 end-0 m-1 btn btn-danger btn-sm p-1 rounded-circle"
                                                                            style={{ lineHeight: 0 }}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="col-4 col-md-3">
                                                                <label
                                                                    className="d-flex flex-column align-items-center justify-content-center border rounded bg-white w-100 h-100 mb-0"
                                                                    style={{ aspectRatio: '1/1', borderStyle: 'dashed !important', cursor: 'pointer' }}
                                                                >
                                                                    <Plus size={24} className="text-muted" />
                                                                    <span className="small text-muted mt-1 text-center">Añadir Fotos</span>
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        hidden
                                                                        accept="image/*"
                                                                        onChange={handleGalleryChange}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <small className="text-muted d-block mt-3">
                                                            Puedes seleccionar varias fotos a la vez. Aparecerán en una galería al final de la noticia.
                                                        </small>
                                                    </CardBody>
                                                </Card>
                                            </div>
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
                                                            <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#f8f9fa' }}>
                                                                <Image
                                                                    src={previewUrl}
                                                                    alt="Preview"
                                                                    fill
                                                                    style={{ objectFit: 'contain' }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-muted p-3">
                                                                <Upload size={32} className="mb-2" />
                                                                <p className="small mb-0">Foto principal de portada</p>
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

                                            <FormGroup>
                                                <Label for="category" className="fw-bold">Categoría</Label>
                                                <Input
                                                    type="select"
                                                    id="category"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    <option value="Institucional">Institucional</option>
                                                    <option value="Eventos">Eventos</option>
                                                    <option value="Beneficios">Beneficios</option>
                                                    <option value="Comunicado">Comunicado</option>
                                                </Input>
                                            </FormGroup>

                                            <FormGroup check className="mt-4 mb-2 p-3 border rounded bg-white shadow-sm">
                                                <Label check className="fw-bold d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                                    <Input
                                                        type="checkbox"
                                                        id="isNew"
                                                        checked={formData.isNew}
                                                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                                        className="me-2"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                    <span>Marcar como "NUEVO"</span>
                                                </Label>
                                            </FormGroup>

                                            <FormGroup check className="mb-3 p-3 border rounded bg-white shadow-sm">
                                                <Label check className="fw-bold d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                                    <Input
                                                        type="checkbox"
                                                        id="isFeatured"
                                                        checked={formData.isFeatured}
                                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                                        className="me-2"
                                                        style={{ width: '20px', height: '20px' }}
                                                    />
                                                    <span>Destacar noticia en portada</span>
                                                </Label>
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
                                                            className="d-flex align-items-center gap-2 py-1 px-2"
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
                                                            value={formData.seoDescription}
                                                            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value.substring(0, 160) })}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup className="mb-0">
                                                        <Label for="seoKeywords" className="small fw-bold">Etiquetas (Keywords)</Label>
                                                        <Input
                                                            type="text"
                                                            id="seoKeywords"
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
