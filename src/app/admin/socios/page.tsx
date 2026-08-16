'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Container, Row, Col, Card, CardBody, Table, Button, 
    Input, InputGroup, Badge, Modal, ModalHeader, ModalBody, 
    ModalFooter, Form, FormGroup, Label, Alert 
} from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import Link from 'next/link';

interface Socio {
    id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: 'haberes' | 'externo';
    estado: 'activo' | 'baja';
    carnet_entregado?: boolean;
}

export default function AdminSocios() {
    const router = useRouter();
    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [metodoFilter, setMetodoFilter] = useState(''); // 'haberes', 'externo', ''
    const [carnetFilter, setCarnetFilter] = useState(''); // 'pendiente', 'entregado', ''
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info', message: string } | null>(null);

    // Estado modales
    const [modalSocio, setModalSocio] = useState(false);
    const [modalImportar, setModalImportar] = useState(false);
    const [editingSocio, setEditingSocio] = useState<Socio | null>(null);

    // Formulario Socio
    const [formSocio, setFormSocio] = useState({
        nombre: '',
        cedula: '',
        digito_verificador: '',
        metodo_pago: 'haberes'
    });

    // Importación de archivos
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Verificar token
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchSocios();
    }, [router]);

    const fetchSocios = async (searchQuery = search, filterMetodo = metodoFilter, filterCarnet = carnetFilter) => {
        setLoading(true);
        try {
            const url = `/api/admin/descuentos/socios?search=${encodeURIComponent(searchQuery)}&metodo=${filterMetodo}&carnet=${filterCarnet}&estado=todos`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setSocios(data.socios);
            } else {
                showMsg('danger', data.error || 'Error al cargar socios');
            }
        } catch (e) {
            showMsg('danger', 'Error de red al cargar socios');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type: 'success' | 'danger' | 'warning' | 'info', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 7000);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        fetchSocios(val, metodoFilter, carnetFilter);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMetodoFilter(val);
        fetchSocios(search, val, carnetFilter);
    };

    const handleCarnetFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCarnetFilter(val);
        fetchSocios(search, metodoFilter, val);
    };

    // Cambiar estado de entrega de carné con un clic
    const handleToggleCarnet = async (socio: Socio) => {
        const nuevoEstado = !socio.carnet_entregado;
        try {
            const res = await fetch('/api/admin/descuentos/socios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socioId: socio.id, carnet_entregado: nuevoEstado })
            });
            const data = await res.json();

            if (data.success) {
                showMsg(
                    nuevoEstado ? 'success' : 'warning', 
                    nuevoEstado 
                        ? `🟩 Carné de ${socio.nombre} marcado como ENTREGADO.` 
                        : `🟨 Carné de ${socio.nombre} marcado como PENDIENTE de entrega.`
                );
                fetchSocios(search, metodoFilter, carnetFilter);
            } else {
                showMsg('danger', data.error || 'Error al actualizar estado del carné');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al actualizar estado del carné');
        }
    };

    // Modal Socio (Alta / Modificación)
    const toggleSocioModal = (socio: Socio | null = null) => {
        if (socio) {
            setEditingSocio(socio);
            setFormSocio({
                nombre: socio.nombre,
                cedula: socio.cedula,
                digito_verificador: socio.digito_verificador,
                metodo_pago: socio.metodo_pago
            });
        } else {
            setEditingSocio(null);
            setFormSocio({
                nombre: '',
                cedula: '',
                digito_verificador: '',
                metodo_pago: 'haberes'
            });
        }
        setModalSocio(!modalSocio);
    };

    const handleSocioSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEditing = !!editingSocio;
            const url = '/api/admin/descuentos/socios';
            const method = isEditing ? 'PUT' : 'POST';
            
            const payload = isEditing 
                ? { socioId: editingSocio.id, ...formSocio }
                : formSocio;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                showMsg(
                    'success', 
                    isEditing 
                        ? 'Socio actualizado correctamente.' 
                        : `Socio ${formSocio.nombre} registrado con éxito. ⚠️ Recordá que su carné físico quedó registrado como PENDIENTE DE ENTREGA.`
                );
                setModalSocio(false);
                fetchSocios(search, metodoFilter, carnetFilter);
            } else {
                showMsg('danger', data.error || 'Error al guardar socio');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al guardar socio');
        }
    };

    const handleBajaSocio = async (socio: Socio) => {
        if (!confirm(`¿Estás seguro de que deseas dar de baja al socio ${socio.nombre}?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/descuentos/socios?socioId=${socio.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', 'Socio dado de baja correctamente');
                fetchSocios(search, metodoFilter);
            } else {
                showMsg('danger', data.error || 'Error al dar de baja');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al dar de baja');
        }
    };

    const handleReactivarSocio = async (socio: Socio) => {
        try {
            const res = await fetch('/api/admin/descuentos/socios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socioId: socio.id, estado: 'activo' })
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', 'Socio reactivado correctamente');
                fetchSocios(search, metodoFilter);
            } else {
                showMsg('danger', data.error || 'Error al reactivar');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al reactivar');
        }
    };

    // Modal Importación
    const toggleImportarModal = () => {
        setImportFile(null);
        setModalImportar(!modalImportar);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0]);
        }
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        setImporting(true);
        try {
            const fd = new FormData();
            fd.append('file', importFile);
            fd.append('tipo', 'consolidado'); // Importación de planilla maestra de socios

            const res = await fetch('/api/admin/descuentos/importar', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', data.message || 'Importación completada correctamente');
                setModalImportar(false);
                fetchSocios(search, metodoFilter);
            } else {
                showMsg('danger', data.error || 'Error al importar archivo');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al importar archivo');
        } finally {
            setImporting(false);
        }
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
                            <Link href="/admin/dashboard" className="text-white text-decoration-none">
                                <span className="me-2">← Volver</span>
                            </Link>
                            <h1 className="h4 mb-0 d-inline-block">Gestión de Socios</h1>
                        </div>
                        <div>
                            <div className="btn-group me-2">
                                <Button color="warning" size="sm" className="fw-bold text-dark" onClick={() => window.open('/admin/socios/imprimir?tipo=total', '_blank')}>
                                    🖨️ Exportar A4 PDF...
                                </Button>
                                <Button color="warning" size="sm" className="dropdown-toggle dropdown-toggle-split text-dark" onClick={() => {
                                    const select = document.getElementById('exportSelect');
                                    if (select) select.style.display = select.style.display === 'none' ? 'inline-block' : 'none';
                                }}>
                                </Button>
                            </div>
                            <Button color="success" size="sm" className="me-2" onClick={() => toggleSocioModal()}>
                                + Registrar Socio
                            </Button>
                            <Button color="light" outline size="sm" onClick={toggleImportarModal}>
                                📥 Cargar Excel Consolidados
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                {alert && (
                    <Alert color={alert.type} className="mb-4 shadow-sm" style={{ borderRadius: '0.8rem' }}>
                        {alert.message}
                    </Alert>
                )}

                {/* Banner Informativo de Carnés Pendientes */}
                {socios.filter(s => !s.carnet_entregado && s.estado === 'activo').length > 0 && (
                    <Alert color="warning" className="mb-4 shadow-sm border-0 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#FFFBEB', color: '#92400E', borderRadius: '1rem', borderLeft: '5px solid #F59E0B' }}>
                        <div>
                            <strong style={{ fontSize: '1.05rem' }}>🪪 Control de Credenciales de Socio</strong>
                            <p className="mb-0 small mt-1">
                                Tenés <strong>{socios.filter(s => !s.carnet_entregado && s.estado === 'activo').length} socio(s) activo(s)</strong> con carné físico <strong>PENDIENTE de entrega</strong>.
                            </p>
                        </div>
                        {carnetFilter !== 'pendiente' && (
                            <Button size="sm" color="warning" className="text-dark fw-bold px-3 ms-3" onClick={() => { setCarnetFilter('pendiente'); fetchSocios(search, metodoFilter, 'pendiente'); }}>
                                Ver Pendientes →
                            </Button>
                        )}
                    </Alert>
                )}

                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                    <CardBody className="p-4">
                        <Row className="g-3 align-items-center">
                            <Col md={5}>
                                <InputGroup>
                                    <Input 
                                        placeholder="Buscar por Nombre o Cédula..." 
                                        value={search} 
                                        onChange={handleSearchChange} 
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Input type="select" value={metodoFilter} onChange={handleFilterChange}>
                                    <option value="">Todos los Métodos de Pago</option>
                                    <option value="haberes">Descuento Jefatura (Haberes)</option>
                                    <option value="externo">Pago por fuera (Caja / Externo)</option>
                                </Input>
                            </Col>
                            <Col md={2}>
                                <Input type="select" value={carnetFilter} onChange={handleCarnetFilterChange}>
                                    <option value="">Estado Carné (Todos)</option>
                                    <option value="pendiente">🟨 Carné Pendiente</option>
                                    <option value="entregado">🟩 Carné Entregado</option>
                                </Input>
                            </Col>
                            <Col md={2} className="text-end text-muted">
                                <small>Socios visibles: <strong>{socios.length}</strong></small>
                            </Col>
                        </Row>

                        {/* Opciones de Exportación Impresión A4 PDF */}
                        <Row className="mt-3 pt-3 border-top g-2 align-items-center">
                            <Col md={3}>
                                <small className="fw-bold text-uppercase text-muted d-block">🖨️ Exportar / Imprimir A4 PDF:</small>
                            </Col>
                            <Col md={9} className="d-flex flex-wrap gap-2 justify-content-md-end">
                                <Button color="primary" outline size="sm" className="fw-bold" onClick={() => window.open('/admin/socios/imprimir?tipo=total', '_blank')}>
                                    📋 Total de Socios (A4)
                                </Button>
                                <Button color="info" outline size="sm" className="fw-bold" onClick={() => window.open('/admin/socios/imprimir?tipo=jefatura', '_blank')}>
                                    🏛️ Descuento Jefatura (A4)
                                </Button>
                                <Button color="warning" outline size="sm" className="fw-bold text-dark" onClick={() => window.open('/admin/socios/imprimir?tipo=externo', '_blank')}>
                                    💵 Pago por Fuera (A4)
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <CardBody className="p-0">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : socios.length === 0 ? (
                            <div className="text-center p-5 text-muted">
                                No se encontraron socios registrados con los filtros seleccionados.
                            </div>
                        ) : (
                            <Table responsive hover className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Cédula</th>
                                        <th>Nombre y Apellido</th>
                                        <th>Método de Pago</th>
                                        <th>Estado Carné Físico</th>
                                        <th>Estado Socio</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {socios.map(socio => (
                                        <tr key={socio.id} style={{ opacity: socio.estado === 'baja' ? 0.6 : 1 }}>
                                            <td className="ps-4 fw-bold">
                                                {parseInt(socio.cedula).toLocaleString('es-UY')}-{socio.digito_verificador}
                                            </td>
                                            <td>{socio.nombre}</td>
                                            <td>
                                                {socio.metodo_pago === 'haberes' ? (
                                                    <Badge color="primary" pill style={{ padding: '0.4rem 0.8rem' }}>
                                                        Descuento Jefatura
                                                    </Badge>
                                                ) : (
                                                    <Badge color="warning" pill className="text-dark" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#FFF3CD', border: '1px solid #FFEBA8' }}>
                                                        Pago por Fuera
                                                    </Badge>
                                                )}
                                            </td>
                                            <td>
                                                {socio.carnet_entregado ? (
                                                    <Badge color="success" pill style={{ padding: '0.4rem 0.7rem' }}>
                                                        🟩 Entregado
                                                    </Badge>
                                                ) : (
                                                    <Badge pill className="text-dark" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '0.4rem 0.7rem' }}>
                                                        🟨 Pendiente
                                                    </Badge>
                                                )}
                                            </td>
                                            <td>
                                                {socio.estado === 'activo' ? (
                                                    <Badge color="success">Activo</Badge>
                                                ) : (
                                                    <Badge color="secondary">Baja</Badge>
                                                )}
                                            </td>
                                            <td className="text-end pe-4">
                                                {!socio.carnet_entregado ? (
                                                    <Button 
                                                        color="success" 
                                                        size="sm" 
                                                        className="me-2 fw-bold" 
                                                        onClick={() => handleToggleCarnet(socio)}
                                                        title="Marcar que se le entregó el carné de socio"
                                                    >
                                                        🪪 Entregar Carné
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        color="light" 
                                                        outline 
                                                        size="sm" 
                                                        className="me-2 text-muted" 
                                                        onClick={() => handleToggleCarnet(socio)}
                                                        title="Volver a marcar como pendiente de entrega"
                                                    >
                                                        ↩️ Marcar Pendiente
                                                    </Button>
                                                )}
                                                <Button 
                                                    color="primary" 
                                                    outline 
                                                    size="sm" 
                                                    className="me-2" 
                                                    onClick={() => toggleSocioModal(socio)}
                                                >
                                                    Editar
                                                </Button>
                                                {socio.estado === 'activo' ? (
                                                    <Button 
                                                        color="danger" 
                                                        outline 
                                                        size="sm" 
                                                        onClick={() => handleBajaSocio(socio)}
                                                    >
                                                        Baja
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        color="success" 
                                                        outline 
                                                        size="sm" 
                                                        onClick={() => handleReactivarSocio(socio)}
                                                    >
                                                        Reactivar
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </Container>

            {/* Modal Crear / Editar Socio */}
            <Modal isOpen={modalSocio} toggle={() => setModalSocio(!modalSocio)} centered>
                <ModalHeader toggle={() => setModalSocio(!modalSocio)}>
                    {editingSocio ? 'Editar Datos del Socio' : 'Registrar Nuevo Socio'}
                </ModalHeader>
                <Form onSubmit={handleSocioSubmit}>
                    <ModalBody>
                        <FormGroup>
                            <Label for="nombre">Nombre Completo *</Label>
                            <Input 
                                id="nombre" 
                                value={formSocio.nombre}
                                onChange={(e) => setFormSocio({...formSocio, nombre: e.target.value})}
                                placeholder="Ej: PEREZ, JUAN" 
                                required 
                            />
                        </FormGroup>
                        <Row>
                            <Col md={8}>
                                <FormGroup>
                                    <Label for="cedula">Cédula de Identidad (sin dígito) *</Label>
                                    <Input 
                                        id="cedula" 
                                        type="number"
                                        value={formSocio.cedula}
                                        onChange={(e) => setFormSocio({...formSocio, cedula: e.target.value})}
                                        placeholder="Ej: 1870773" 
                                        disabled={!!editingSocio} // No cambiar la CI de un socio existente
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="dv">Dígito Verif. *</Label>
                                    <Input 
                                        id="dv" 
                                        value={formSocio.digito_verificador}
                                        onChange={(e) => setFormSocio({...formSocio, digito_verificador: e.target.value})}
                                        maxLength={1}
                                        placeholder="Ej: 5" 
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="metodo">Método de Cobro / Pago *</Label>
                            <Input 
                                id="metodo" 
                                type="select"
                                value={formSocio.metodo_pago}
                                onChange={(e) => setFormSocio({...formSocio, metodo_pago: e.target.value})}
                                required
                            >
                                <option value="haberes">Descuento por Haberes (Jefatura 514)</option>
                                <option value="externo">Pago Externo (Caja / Cobrador)</option>
                            </Input>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setModalSocio(false)}>Cancelar</Button>
                        <Button color="primary" type="submit">Guardar</Button>
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Modal Importar Excel Consolidado */}
            <Modal isOpen={modalImportar} toggle={toggleImportarModal} centered>
                <ModalHeader toggle={toggleImportarModal}>
                    Importar Socios desde Excel Consolidados
                </ModalHeader>
                <Form onSubmit={handleImportSubmit}>
                    <ModalBody>
                        <p className="text-muted small">
                            Sube el archivo Excel consolidado de socios (`Socios_Circulo_Policial_2026.xlsx`) para cargar o actualizar de forma masiva los socios del Círculo. Los socios se clasificarán automáticamente como <strong>Descuento Jefatura</strong> o <strong>Pago por Fuera</strong> según su columna "Lista de Origen".
                        </p>
                        <FormGroup>
                            <Label for="excelFile">Seleccionar Archivo Excel (.xlsx / .xls)</Label>
                            <Input 
                                id="excelFile" 
                                type="file" 
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                required 
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleImportarModal}>Cancelar</Button>
                        <Button color="success" type="submit" disabled={importing || !importFile}>
                            {importing ? 'Importando...' : 'Iniciar Importación'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
}
