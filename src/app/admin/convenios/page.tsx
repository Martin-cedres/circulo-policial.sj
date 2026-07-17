'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Container, Row, Col, Card, CardBody, Table, Button, 
    Badge, Modal, ModalHeader, ModalBody, ModalFooter, 
    Form, FormGroup, Label, Input, Alert, Nav, NavItem, NavLink, TabContent, TabPane, Spinner
} from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { 
    Plus, Edit, Trash2, Check, X, Eye, EyeOff, Star, 
    Mail, Phone, MessageSquare, Instagram, Globe, User, Award, ExternalLink
} from 'lucide-react';

interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
    sitio_web: string | null;
    whatsapp: string | null;
    instagram: string | null;
    telefono: string | null;
    direccion: string | null;
    destacado: boolean;
    visible: boolean;
    created_at: string;
}

interface Solicitud {
    id: number;
    comercio_nombre: string;
    contacto_nombre: string;
    email: string;
    telefono: string;
    whatsapp: string | null;
    instagram: string | null;
    propuesta: string;
    leido: boolean;
    created_at: string;
}

export default function AdminConvenios() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'convenios' | 'solicitudes'>('convenios');
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

    // Estado del modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Formulario de Convenio
    const [formValues, setFormValues] = useState({
        nombre: '',
        categoria: 'Comercio',
        beneficio: '',
        descripcion: '',
        sitio_web: '',
        whatsapp: '',
        instagram: '',
        telefono: '',
        direccion: '',
        destacado: false,
        visible: true,
        logo_url: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchData();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resConvenios, resSolicitudes] = await Promise.all([
                fetch('/api/admin/convenios'),
                fetch('/api/admin/convenios/solicitudes')
            ]);

            const dataC = await resConvenios.json();
            const dataS = await resSolicitudes.json();

            if (dataC.success) setConvenios(dataC.convenios);
            if (dataS.success) setSolicitudes(dataS.solicitudes);
        } catch (err) {
            showAlert('danger', 'Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type: 'success' | 'danger', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (modalOpen) {
            setEditingConvenio(null);
            setLogoFile(null);
            setFormValues({
                nombre: '',
                categoria: 'Comercio',
                beneficio: '',
                descripcion: '',
                sitio_web: '',
                whatsapp: '',
                instagram: '',
                telefono: '',
                direccion: '',
                destacado: false,
                visible: true,
                logo_url: ''
            });
        }
    };

    const handleEditClick = (c: Convenio) => {
        setEditingConvenio(c);
        setFormValues({
            nombre: c.nombre,
            categoria: c.categoria,
            beneficio: c.beneficio,
            descripcion: c.descripcion || '',
            sitio_web: c.sitio_web || '',
            whatsapp: c.whatsapp || '',
            instagram: c.instagram || '',
            telefono: c.telefono || '',
            direccion: c.direccion || '',
            destacado: c.destacado,
            visible: c.visible,
            logo_url: c.logo_url || ''
        });
        setModalOpen(true);
    };

    // Crear convenio a partir de una solicitud (Precarga rápida)
    const handleCrearDesdeSolicitud = (s: Solicitud) => {
        setFormValues({
            nombre: s.comercio_nombre,
            categoria: 'Comercio',
            beneficio: s.propuesta.substring(0, 100),
            descripcion: s.propuesta,
            sitio_web: '',
            whatsapp: s.whatsapp || '',
            instagram: s.instagram || '',
            telefono: s.telefono,
            direccion: '',
            destacado: false,
            visible: true,
            logo_url: ''
        });
        setModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este convenio?')) return;
        try {
            const res = await fetch(`/api/admin/convenios/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showAlert('success', 'Convenio eliminado correctamente.');
                fetchData();
            } else {
                showAlert('danger', data.error || 'Error al eliminar el convenio.');
            }
        } catch (err) {
            showAlert('danger', 'Error de conexión.');
        }
    };

    const handleToggleVisible = async (c: Convenio) => {
        try {
            const formData = new FormData();
            formData.append('nombre', c.nombre);
            formData.append('categoria', c.categoria);
            formData.append('beneficio', c.beneficio);
            formData.append('visible', String(!c.visible));
            formData.append('destacado', String(c.destacado));
            formData.append('logo_url', c.logo_url || '');

            const res = await fetch(`/api/admin/convenios/${c.id}`, {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            }
        } catch (err) {
            showAlert('danger', 'Error al cambiar visibilidad.');
        }
    };

    const handleToggleDestacado = async (c: Convenio) => {
        try {
            const formData = new FormData();
            formData.append('nombre', c.nombre);
            formData.append('categoria', c.categoria);
            formData.append('beneficio', c.beneficio);
            formData.append('visible', String(c.visible));
            formData.append('destacado', String(!c.destacado));
            formData.append('logo_url', c.logo_url || '');

            const res = await fetch(`/api/admin/convenios/${c.id}`, {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            }
        } catch (err) {
            showAlert('danger', 'Error al cambiar estado destacado.');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('nombre', formValues.nombre);
            formData.append('categoria', formValues.categoria);
            formData.append('beneficio', formValues.beneficio);
            formData.append('descripcion', formValues.descripcion);
            formData.append('sitio_web', formValues.sitio_web);
            formData.append('whatsapp', formValues.whatsapp);
            formData.append('instagram', formValues.instagram);
            formData.append('telefono', formValues.telefono);
            formData.append('direccion', formValues.direccion);
            formData.append('destacado', String(formValues.destacado));
            formData.append('visible', String(formValues.visible));
            
            if (editingConvenio) {
                formData.append('logo_url', formValues.logo_url);
            }

            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const url = editingConvenio ? `/api/admin/convenios/${editingConvenio.id}` : '/api/admin/convenios';
            const method = editingConvenio ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showAlert('success', editingConvenio ? 'Convenio actualizado correctamente.' : 'Convenio creado correctamente.');
                toggleModal();
                fetchData();
            } else {
                showAlert('danger', data.error || 'Error al guardar convenio.');
            }
        } catch (err) {
            showAlert('danger', 'Error de conexión.');
        } finally {
            setSaving(false);
        }
    };

    // Solicitudes actions
    const handleToggleSolicitudLeida = async (s: Solicitud) => {
        try {
            const res = await fetch('/api/admin/convenios/solicitudes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: s.id, leido: !s.leido })
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            }
        } catch (err) {
            showAlert('danger', 'Error al actualizar solicitud.');
        }
    };

    const handleDeleteSolicitud = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta propuesta?')) return;
        try {
            const res = await fetch(`/api/admin/convenios/solicitudes?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showAlert('success', 'Propuesta eliminada.');
                fetchData();
            }
        } catch (err) {
            showAlert('danger', 'Error de conexión.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        router.push('/admin');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: artiguistaColors.gris[50] }}>
            {/* Header Admin */}
            <div
                style={{
                    backgroundColor: artiguistaColors.azul,
                    color: artiguistaColors.blanco,
                    padding: '1.5rem 0',
                    marginBottom: '2rem',
                }}
            >
                <Container>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h4 mb-0">Gestión de Convenios y Alianzas</h1>
                            <small onClick={() => router.push('/admin/dashboard')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                ← Volver al Dashboard
                            </small>
                        </div>
                        <Button color="light" outline size="sm" onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    </div>
                </Container>
            </div>

            <Container className="pb-5">
                {alert && <Alert color={alert.type}>{alert.message}</Alert>}

                {/* Tabs */}
                <Nav tabs className="mb-4 border-bottom">
                    <NavItem>
                        <NavLink
                            className={`px-4 py-3 fw-bold border-0 ${activeTab === 'convenios' ? 'active text-primary border-bottom border-primary' : 'text-muted'}`}
                            style={{ cursor: 'pointer', background: 'transparent' }}
                            onClick={() => setActiveTab('convenios')}
                        >
                            Convenios Activos ({convenios.length})
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={`px-4 py-3 fw-bold border-0 ${activeTab === 'solicitudes' ? 'active text-primary border-bottom border-primary' : 'text-muted'}`}
                            style={{ cursor: 'pointer', background: 'transparent' }}
                            onClick={() => setActiveTab('solicitudes')}
                        >
                            Solicitudes de Comercios ({solicitudes.filter(s => !s.leido).length} nuevas)
                        </NavLink>
                    </NavItem>
                </Nav>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="text-muted mt-2">Cargando datos...</p>
                    </div>
                ) : (
                    <TabContent activeTab={activeTab}>
                        {/* Tab Convenios */}
                        <TabPane tabId="convenios">
                            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                                <CardBody className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="h5 fw-bold text-dark mb-0">Listado de Convenios</h2>
                                        <Button 
                                            style={{ backgroundColor: artiguistaColors.azul, borderColor: artiguistaColors.azul }}
                                            onClick={toggleModal}
                                            className="d-flex align-items-center gap-1 fw-bold"
                                        >
                                            <Plus size={18} /> Agregar Comercio
                                        </Button>
                                    </div>

                                    {convenios.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted mb-0">No hay convenios creados aún.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover borderless className="align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Logo</th>
                                                        <th>Comercio</th>
                                                        <th>Categoría</th>
                                                        <th>Beneficio</th>
                                                        <th className="text-center">Home (Dest.)</th>
                                                        <th className="text-center">Visible</th>
                                                        <th className="text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {convenios.map(c => (
                                                        <tr key={c.id}>
                                                            <td>
                                                                <div 
                                                                    className="rounded bg-light d-flex align-items-center justify-content-center"
                                                                    style={{ width: '48px', height: '48px', overflow: 'hidden', position: 'relative' }}
                                                                >
                                                                    {c.logo_url ? (
                                                                        <img
                                                                            src={c.logo_url}
                                                                            alt={c.nombre}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-muted font-bold" style={{ fontSize: '0.8rem' }}>CP</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="fw-semibold text-dark">{c.nombre}</span>
                                                                <div className="text-muted small">{c.direccion || 'Sin dirección'}</div>
                                                            </td>
                                                            <td>
                                                                <Badge color="light" className="text-dark border">{c.categoria}</Badge>
                                                            </td>
                                                            <td>
                                                                <span className="text-danger fw-bold">{c.beneficio}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <Button 
                                                                    color="link" 
                                                                    onClick={() => handleToggleDestacado(c)}
                                                                    className="p-0 border-0"
                                                                >
                                                                    <Star 
                                                                        size={20} 
                                                                        className={c.destacado ? 'text-warning fill-warning' : 'text-muted'} 
                                                                        style={{ fill: c.destacado ? '#FFC107' : 'none' }}
                                                                    />
                                                                </Button>
                                                            </td>
                                                            <td className="text-center">
                                                                <Button 
                                                                    color="link" 
                                                                    onClick={() => handleToggleVisible(c)}
                                                                    className="p-0 border-0"
                                                                >
                                                                    {c.visible ? (
                                                                        <Eye size={20} className="text-success" />
                                                                    ) : (
                                                                        <EyeOff size={20} className="text-muted" />
                                                                    )}
                                                                </Button>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    <Button 
                                                                        color="primary" 
                                                                        outline 
                                                                        size="sm" 
                                                                        onClick={() => handleEditClick(c)}
                                                                    >
                                                                        <Edit size={16} />
                                                                    </Button>
                                                                    <Button 
                                                                        color="danger" 
                                                                        outline 
                                                                        size="sm" 
                                                                        onClick={() => handleDeleteClick(c.id)}
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
                        </TabPane>

                        {/* Tab Solicitudes */}
                        <TabPane tabId="solicitudes">
                            <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                                <CardBody className="p-4">
                                    <h2 className="h5 fw-bold text-dark mb-4">Propuestas Recibidas de Comercios</h2>

                                    {solicitudes.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted mb-0">No se han recibido propuestas comerciales aún.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover borderless className="align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Fecha</th>
                                                        <th>Comercio</th>
                                                        <th>Contacto</th>
                                                        <th>Propuesta de Beneficio</th>
                                                        <th className="text-center">Estado</th>
                                                        <th className="text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {solicitudes.map(s => (
                                                        <tr key={s.id} style={{ opacity: s.leido ? 0.75 : 1 }}>
                                                            <td className="small text-muted">
                                                                {new Date(s.created_at).toLocaleDateString('es-UY')}
                                                            </td>
                                                            <td>
                                                                <span className="fw-semibold text-dark">{s.comercio_nombre}</span>
                                                                <div className="d-flex gap-2 mt-1">
                                                                    {s.whatsapp && (
                                                                        <a href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" title="WhatsApp" className="text-success small">
                                                                            <MessageSquare size={14} />
                                                                        </a>
                                                                    )}
                                                                    {s.instagram && (
                                                                        <a href={`https://instagram.com/${s.instagram.replace('@', '')}`} target="_blank" rel="noopener" title="Instagram" className="text-danger small">
                                                                            <Instagram size={14} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="small text-dark fw-medium">{s.contacto_nombre}</div>
                                                                <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                                                    <Mail size={12} className="me-1" /> {s.email}
                                                                </div>
                                                                <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                                                    <Phone size={12} className="me-1" /> {s.telefono}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div 
                                                                    className="bg-light p-2 rounded small"
                                                                    style={{ 
                                                                        maxHeight: '80px', 
                                                                        overflowY: 'auto', 
                                                                        fontSize: '0.85rem',
                                                                        whiteSpace: 'pre-wrap',
                                                                        maxWidth: '300px'
                                                                    }}
                                                                >
                                                                    {s.propuesta}
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <Badge 
                                                                    color={s.leido ? 'success' : 'warning'} 
                                                                    className="px-2 py-1"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleToggleSolicitudLeida(s)}
                                                                >
                                                                    {s.leido ? 'Leído' : 'Pendiente'}
                                                                </Badge>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    <Button 
                                                                        color="success" 
                                                                        outline 
                                                                        size="sm" 
                                                                        title="Crear Convenio"
                                                                        onClick={() => handleCrearDesdeSolicitud(s)}
                                                                    >
                                                                        <Award size={16} /> Adherir
                                                                    </Button>
                                                                    <Button 
                                                                        color="danger" 
                                                                        outline 
                                                                        size="sm" 
                                                                        title="Eliminar"
                                                                        onClick={() => handleDeleteSolicitud(s.id)}
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
                        </TabPane>
                    </TabContent>
                )}
            </Container>

            {/* Modal Crear / Editar Convenio */}
            <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
                <ModalHeader toggle={toggleModal} className="border-bottom">
                    <span className="fw-bold text-primary">
                        {editingConvenio ? `Editar Convenio: ${editingConvenio.nombre}` : 'Agregar Nuevo Convenio'}
                    </span>
                </ModalHeader>
                <Form onSubmit={handleFormSubmit}>
                    <ModalBody className="px-4 py-3">
                        <Row>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label for="nombre" className="small fw-semibold text-muted">Nombre del Comercio *</Label>
                                    <Input
                                        type="text"
                                        id="nombre"
                                        value={formValues.nombre}
                                        onChange={e => setFormValues({...formValues, nombre: e.target.value})}
                                        required
                                        disabled={saving}
                                        placeholder="Ej. Óptica San José"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label for="categoria" className="small fw-semibold text-muted">Categoría *</Label>
                                    <Input
                                        type="select"
                                        id="categoria"
                                        value={formValues.categoria}
                                        onChange={e => setFormValues({...formValues, categoria: e.target.value})}
                                        required
                                        disabled={saving}
                                    >
                                        <option value="Salud">Salud</option>
                                        <option value="Gastronomía">Gastronomía</option>
                                        <option value="Educación">Educación</option>
                                        <option value="Comercio">Comercio</option>
                                        <option value="Servicios">Servicios</option>
                                        <option value="Financiero">Financiero</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label for="beneficio" className="small fw-semibold text-muted">Beneficio Destacado *</Label>
                                    <Input
                                        type="text"
                                        id="beneficio"
                                        value={formValues.beneficio}
                                        onChange={e => setFormValues({...formValues, beneficio: e.target.value})}
                                        required
                                        disabled={saving}
                                        placeholder="Ej. 20% de Descuento"
                                    />
                                    <small className="text-muted">Es lo primero que el socio ve (ej: "15% OFF", "Matrícula Gratis").</small>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label for="logo" className="small fw-semibold text-muted">Logo o Foto del Comercio</Label>
                                    <Input
                                        type="file"
                                        id="logo"
                                        onChange={e => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setLogoFile(e.target.files[0]);
                                            }
                                        }}
                                        disabled={saving}
                                        accept="image/*"
                                    />
                                    {editingConvenio && editingConvenio.logo_url && (
                                        <small className="text-muted d-block mt-1">
                                            Ya tiene un logo cargado. Subir uno nuevo lo reemplazará.
                                        </small>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>

                        <FormGroup className="mb-3">
                            <Label for="descripcion" className="small fw-semibold text-muted">Descripción o Detalles del Convenio</Label>
                            <Input
                                type="textarea"
                                id="descripcion"
                                rows={3}
                                value={formValues.descripcion}
                                onChange={e => setFormValues({...formValues, descripcion: e.target.value})}
                                disabled={saving}
                                placeholder="Escribe detalles sobre las condiciones del beneficio, exclusiones, etc."
                            />
                        </FormGroup>

                        <Row>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label for="direccion" className="small fw-semibold text-muted">Dirección Física</Label>
                                    <Input
                                        type="text"
                                        id="direccion"
                                        value={formValues.direccion}
                                        onChange={e => setFormValues({...formValues, direccion: e.target.value})}
                                        disabled={saving}
                                        placeholder="Ej. Artigas 450, San José de Mayo"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup className="mb-3">
                                    <Label for="telefono" className="small fw-semibold text-muted">Teléfono de Contacto</Label>
                                    <Input
                                        type="text"
                                        id="telefono"
                                        value={formValues.telefono}
                                        onChange={e => setFormValues({...formValues, telefono: e.target.value})}
                                        disabled={saving}
                                        placeholder="Ej. 4342 1234"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <FormGroup className="mb-3">
                                    <Label for="sitio_web" className="small fw-semibold text-muted">Sitio Web / Enlace</Label>
                                    <Input
                                        type="text"
                                        id="sitio_web"
                                        value={formValues.sitio_web}
                                        onChange={e => setFormValues({...formValues, sitio_web: e.target.value})}
                                        disabled={saving}
                                        placeholder="Ej. www.comercio.com"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup className="mb-3">
                                    <Label for="whatsapp" className="small fw-semibold text-muted">WhatsApp (Número Completo)</Label>
                                    <Input
                                        type="text"
                                        id="whatsapp"
                                        value={formValues.whatsapp}
                                        onChange={e => setFormValues({...formValues, whatsapp: e.target.value})}
                                        disabled={saving}
                                        placeholder="Ej. 59899123456"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup className="mb-3">
                                    <Label for="instagram" className="small fw-semibold text-muted">Instagram (Usuario / Link)</Label>
                                    <Input
                                        type="text"
                                        id="instagram"
                                        value={formValues.instagram}
                                        onChange={e => setFormValues({...formValues, instagram: e.target.value})}
                                        disabled={saving}
                                        placeholder="Ej. @optica.sanjose"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col md={6}>
                                <FormGroup check className="mb-3">
                                    <Label check className="fw-semibold text-muted" style={{ cursor: 'pointer' }}>
                                        <Input
                                            type="checkbox"
                                            checked={formValues.destacado}
                                            onChange={e => setFormValues({...formValues, destacado: e.target.checked})}
                                            disabled={saving}
                                        />{' '}
                                        Destacar en el Home (Aparecerá en el carrusel de inicio)
                                    </Label>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup check className="mb-3">
                                    <Label check className="fw-semibold text-muted" style={{ cursor: 'pointer' }}>
                                        <Input
                                            type="checkbox"
                                            checked={formValues.visible}
                                            onChange={e => setFormValues({...formValues, visible: e.target.checked})}
                                            disabled={saving}
                                        />{' '}
                                        Visible en la Web (Activo para mostrar en listados)
                                    </Label>
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter className="border-top">
                        <Button color="secondary" outline onClick={toggleModal} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={saving}
                            style={{ backgroundColor: artiguistaColors.azul, borderColor: artiguistaColors.azul }}
                            className="fw-bold px-4"
                        >
                            {saving ? 'Guardando...' : 'Guardar Convenio'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
}
