'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Container, Row, Col, Card, CardBody, Table, Button, 
    Badge, Input, InputGroup, Modal, ModalHeader, ModalBody, 
    ModalFooter, Form, FormGroup, Label, Alert 
} from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import Link from 'next/link';

interface SocioPresupuesto {
    detalle_id: number;
    importe: number;
    socio_id: number;
    cedula: string;
    digito_verificador: string;
    nombre: string;
    metodo_pago: 'haberes' | 'externo';
}

interface CabeceraPresupuesto {
    id: number;
    anio: number;
    mes: number;
    codigo_descuento: number;
    unidad_ejecutora: number;
    responsable: string;
    estado: 'borrador' | 'cerrado';
}

export default function AdminPresupuestoDetalle({ params }: { params: Promise<{ id: string }> }) {
    const { id: idParam } = use(params);
    const router = useRouter();
    const presupuestoId = parseInt(idParam);

    const [presupuesto, setPresupuesto] = useState<CabeceraPresupuesto | null>(null);
    const [socios, setSocios] = useState<SocioPresupuesto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

    // Estados Modales
    const [modalAlta, setModalAlta] = useState(false);
    const [modalEditImporte, setModalEditImporte] = useState(false);
    const [selectedSocio, setSelectedSocio] = useState<SocioPresupuesto | null>(null);
    const [newImporte, setNewImporte] = useState(140);

    // Formulario de Alta Rápida
    const [formAlta, setFormAlta] = useState({
        nombre: '',
        cedula: '',
        digito_verificador: '',
        importe: 140
    });

    // Edición de cabecera
    const [responsable, setResponsable] = useState('');
    const [isEditingResponsable, setIsEditingResponsable] = useState(false);

    useEffect(() => {
        // Verificar token
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchPresupuestoDetalle();
    }, [router, presupuestoId]);

    const fetchPresupuestoDetalle = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/descuentos/presupuestos/${presupuestoId}`);
            const data = await res.json();
            if (data.success) {
                setPresupuesto(data.presupuesto);
                setSocios(data.socios);
                setResponsable(data.presupuesto.responsable);
            } else {
                showMsg('danger', data.error || 'Error al cargar detalles del presupuesto');
            }
        } catch (e) {
            showMsg('danger', 'Error de red al cargar el presupuesto');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type: 'success' | 'danger', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    // Filtrar socios por búsqueda local
    const filteredSocios = socios.filter(s => 
        s.nombre.toUpperCase().includes(search.toUpperCase()) || 
        s.cedula.includes(search)
    );

    // Guardar cambio de responsable de firma
    const handleSaveResponsable = async () => {
        try {
            const res = await fetch(`/api/admin/descuentos/presupuestos/${presupuestoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responsable })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', 'Responsable de firma actualizado');
                setIsEditingResponsable(false);
                if (presupuesto) {
                    setPresupuesto({ ...presupuesto, responsable });
                }
            } else {
                showMsg('danger', data.error || 'Error al actualizar responsable');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al actualizar responsable');
        }
    };

    // Cambiar estado del presupuesto (Borrador / Cerrado)
    const handleToggleEstado = async (nuevoEstado: 'borrador' | 'cerrado') => {
        try {
            const res = await fetch(`/api/admin/descuentos/presupuestos/${presupuestoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', nuevoEstado === 'cerrado' ? 'Presupuesto cerrado correctamente' : 'Presupuesto reabierto');
                if (presupuesto) {
                    setPresupuesto({ ...presupuesto, estado: nuevoEstado });
                }
            } else {
                showMsg('danger', data.error || 'Error al cambiar estado');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al cambiar estado');
        }
    };

    // Dar de baja a un socio (elimina del mes y marca baja en maestro)
    const handleBajaSocio = async (socio: SocioPresupuesto) => {
        if (!confirm(`¿Deseas dar de baja a ${socio.nombre}? Se quitará de la nómina de este mes y se inactivará para los meses siguientes.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/descuentos/socios?socioId=${socio.socio_id}&presupuestoId=${presupuestoId}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', 'Socio dado de baja y removido de la planilla del mes');
                fetchPresupuestoDetalle();
            } else {
                showMsg('danger', data.error || 'Error al procesar la baja');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al dar de baja');
        }
    };

    // Alta Rápida de socio
    const handleAltaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/descuentos/socios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formAlta,
                    metodo_pago: 'haberes', // Siempre haberes
                    presupuestoId
                })
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', 'Funcionario incorporado al presupuesto con éxito');
                setModalAlta(false);
                setFormAlta({ nombre: '', cedula: '', digito_verificador: '', importe: 140 });
                fetchPresupuestoDetalle();
            } else {
                showMsg('danger', data.error || 'Error al incorporar funcionario');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al incorporar funcionario');
        }
    };

    // Editar Importe modal
    const openEditImporteModal = (socio: SocioPresupuesto) => {
        setSelectedSocio(socio);
        setNewImporte(socio.importe);
        setModalEditImporte(true);
    };

    const handleEditImporteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSocio) return;

        try {
            const res = await fetch('/api/admin/descuentos/socios', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    socioId: selectedSocio.socio_id,
                    presupuestoId,
                    importe: newImporte
                })
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', 'Importe de cuota social actualizado correctamente');
                setModalEditImporte(false);
                fetchPresupuestoDetalle();
            } else {
                showMsg('danger', data.error || 'Error al actualizar importe');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al actualizar importe');
        }
    };

    const getNombreMes = (num: number) => {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[num - 1] || '';
    };

    const totalImporte = filteredSocios.reduce((sum, s) => sum + Number(s.importe), 0);

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
                            <Link href="/admin/descuentos" className="text-white text-decoration-none">
                                <span className="me-2">← Volver a Presupuestos</span>
                            </Link>
                            {presupuesto && (
                                <h1 className="h4 mb-0 d-block mt-1">
                                    Presupuesto {getNombreMes(presupuesto.mes)} / {presupuesto.anio}
                                </h1>
                            )}
                        </div>
                        {presupuesto && presupuesto.estado === 'borrador' && (
                            <Button color="success" size="sm" onClick={() => setModalAlta(true)}>
                                ➕ Incorporar Funcionario (Alta)
                            </Button>
                        )}
                    </div>
                </Container>
            </div>

            <Container>
                {alert && (
                    <Alert color={alert.type} className="mb-4">
                        {alert.message}
                    </Alert>
                )}

                {presupuesto && (
                    <Row className="g-4 mb-4">
                        {/* Tarjeta de Información e Configuración */}
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                                <CardBody className="p-4">
                                    <h2 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>Configuración del Presupuesto</h2>
                                    
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Estado del Presupuesto</small>
                                        <div className="d-flex align-items-center justify-content-between mt-1">
                                            {presupuesto.estado === 'borrador' ? (
                                                <Badge color="warning" className="text-dark" style={{ padding: '0.4rem 0.8rem' }}>Borrador</Badge>
                                            ) : (
                                                <Badge color="success" style={{ padding: '0.4rem 0.8rem' }}>Cerrado (Enviado)</Badge>
                                            )}
                                            
                                            {presupuesto.estado === 'borrador' ? (
                                                <Button color="outline-danger" size="sm" onClick={() => handleToggleEstado('cerrado')}>
                                                    🔒 Cerrar Período
                                                </Button>
                                            ) : (
                                                <Button color="outline-warning" size="sm" className="text-dark" onClick={() => handleToggleEstado('borrador')}>
                                                    🔓 Reabrir Período
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <hr />

                                    <div className="mb-3">
                                        <small className="text-muted d-block">Responsable de Firma (PDF/Excel)</small>
                                        {isEditingResponsable ? (
                                            <div className="d-flex gap-2 mt-2">
                                                <Input 
                                                    value={responsable} 
                                                    onChange={(e) => setResponsable(e.target.value)} 
                                                    bsSize="sm"
                                                />
                                                <Button color="success" size="sm" onClick={handleSaveResponsable}>OK</Button>
                                                <Button color="secondary" size="sm" onClick={() => setIsEditingResponsable(false)}>X</Button>
                                            </div>
                                        ) : (
                                            <div className="d-flex justify-content-between align-items-center mt-1">
                                                <span className="fw-bold">{presupuesto.responsable}</span>
                                                <Button color="link" size="sm" className="p-0" onClick={() => setIsEditingResponsable(true)}>
                                                    Editar
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <hr />

                                    <div className="mb-3">
                                        <small className="text-muted d-block">Parámetros de Convenio</small>
                                        <div className="mt-2 text-muted small">
                                            <div>Código Descuento: <strong>{presupuesto.codigo_descuento}</strong></div>
                                            <div>Unidad Ejecutora: <strong>{presupuesto.unidad_ejecutora} (San José)</strong></div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Tarjeta de Descarga de Archivos */}
                            <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                                <CardBody className="p-4">
                                    <h2 className="h5 fw-bold mb-3" style={{ color: artiguistaColors.azul }}>Descargar Archivos Oficiales</h2>
                                    <p className="small text-muted">Genera y descarga en tiempo real los archivos en los formatos oficiales requeridos por la Jefatura.</p>
                                    
                                    <div className="d-grid gap-3">
                                        <a 
                                            href={`/api/admin/descuentos/exportar/txt?presupuestoId=${presupuestoId}`} 
                                            className="btn btn-primary fw-bold"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📄 Descargar Archivo TXT (SLH)
                                        </a>
                                        <a 
                                            href={`/api/admin/descuentos/exportar/excel?presupuestoId=${presupuestoId}`} 
                                            className="btn btn-success fw-bold"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📊 Descargar Excel Original (.xlsx)
                                        </a>
                                        
                                        <div className="bg-light p-3 rounded-3 small text-muted border">
                                            <strong>Nota para el PDF:</strong> Para generar el PDF firmado, descarga el archivo Excel, ábrelo en Microsoft Excel y haz click en Guardar como PDF, o haz click derecho e imprime directamente.
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Listado y Edición de la Nómina */}
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                                <CardBody className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                                        <div>
                                            <h2 className="h5 fw-bold mb-0" style={{ color: artiguistaColors.azul }}>
                                                Nómina de Descuentos del Mes
                                            </h2>
                                            <small className="text-muted">Total: {filteredSocios.length} funcionarios</small>
                                        </div>
                                        <div className="h5 mb-0 fw-bold">
                                            Suma Total: <span className="text-primary">${totalImporte.toLocaleString('es-UY')}</span>
                                        </div>
                                    </div>

                                    <FormGroup className="mb-4">
                                        <Input 
                                            placeholder="Buscar funcionario por nombre o cédula en esta planilla..." 
                                            value={search} 
                                            onChange={(e) => setSearch(e.target.value)} 
                                        />
                                    </FormGroup>

                                    {filteredSocios.length === 0 ? (
                                        <div className="text-center p-5 text-muted border rounded-3">
                                            No se encontraron funcionarios que coincidan con la búsqueda.
                                        </div>
                                    ) : (
                                        <Table responsive hover className="align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>C.I. No.</th>
                                                    <th>DIG.</th>
                                                    <th>Apellido y Nombre</th>
                                                    <th className="text-end">Importe</th>
                                                    <th className="text-end pe-3">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSocios.map((s) => (
                                                    <tr key={s.detalle_id}>
                                                        <td className="fw-bold">
                                                            {parseInt(s.cedula).toLocaleString('es-UY')}
                                                        </td>
                                                        <td>{s.digito_verificador}</td>
                                                        <td className="small">{s.nombre}</td>
                                                        <td className="text-end fw-bold" style={{ color: artiguistaColors.azul }}>
                                                            ${Number(s.importe).toLocaleString('es-UY')}
                                                        </td>
                                                        <td className="text-end pe-3">
                                                            {presupuesto.estado === 'borrador' && (
                                                                <>
                                                                    <Button 
                                                                        color="primary" 
                                                                        outline 
                                                                        size="sm" 
                                                                        className="me-2"
                                                                        onClick={() => openEditImporteModal(s)}
                                                                    >
                                                                        Editar Cuota
                                                                    </Button>
                                                                    <Button 
                                                                        color="danger" 
                                                                        outline 
                                                                        size="sm"
                                                                        onClick={() => handleBajaSocio(s)}
                                                                    >
                                                                        Baja
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>

            {/* Modal Alta Rápida de Funcionario */}
            <Modal isOpen={modalAlta} toggle={() => setModalAlta(!modalAlta)} centered>
                <ModalHeader toggle={() => setModalAlta(!modalAlta)}>
                    Incorporar Funcionario al Presupuesto (Alta)
                </ModalHeader>
                <Form onSubmit={handleAltaSubmit}>
                    <ModalBody>
                        <p className="text-muted small">
                            Registra el alta de un funcionario. El sistema lo agregará a la base general de socios y lo vinculará directamente a la planilla de descuento de haberes de este mes.
                        </p>
                        <FormGroup>
                            <Label for="altaNombre">Nombre y Apellido *</Label>
                            <Input 
                                id="altaNombre" 
                                value={formAlta.nombre}
                                onChange={(e) => setFormAlta({...formAlta, nombre: e.target.value})}
                                placeholder="Ej: LOPEZ, CLAUDIA" 
                                required 
                            />
                        </FormGroup>
                        <Row>
                            <Col md={8}>
                                <FormGroup>
                                    <Label for="altaCedula">Cédula de Identidad (sin dígito) *</Label>
                                    <Input 
                                        id="altaCedula" 
                                        type="number"
                                        value={formAlta.cedula}
                                        onChange={(e) => setFormAlta({...formAlta, cedula: e.target.value})}
                                        placeholder="Ej: 1870773" 
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="altaDv">Dígito Verif. *</Label>
                                    <Input 
                                        id="altaDv" 
                                        value={formAlta.digito_verificador}
                                        onChange={(e) => setFormAlta({...formAlta, digito_verificador: e.target.value})}
                                        maxLength={1}
                                        placeholder="Ej: 5" 
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="altaImporte">Importe de Cuota Social ($) *</Label>
                            <Input 
                                id="altaImporte" 
                                type="number"
                                value={formAlta.importe}
                                onChange={(e) => setFormAlta({...formAlta, importe: parseInt(e.target.value)})}
                                placeholder="Ej: 140" 
                                required 
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setModalAlta(false)}>Cancelar</Button>
                        <Button color="primary" type="submit">Incorporar Alta</Button>
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Modal Editar Importe */}
            <Modal isOpen={modalEditImporte} toggle={() => setModalEditImporte(!modalEditImporte)} centered>
                <ModalHeader toggle={() => setModalEditImporte(!modalEditImporte)}>
                    Editar Importe de Cuota Social
                </ModalHeader>
                {selectedSocio && (
                    <Form onSubmit={handleEditImporteSubmit}>
                        <ModalBody>
                            <div className="mb-3">
                                <strong>Funcionario:</strong> {selectedSocio.nombre}<br />
                                <strong>C.I.:</strong> {parseInt(selectedSocio.cedula).toLocaleString('es-UY')}-{selectedSocio.digito_verificador}
                            </div>
                            <FormGroup>
                                <Label for="editImporte">Nuevo Importe de Cuota ($) *</Label>
                                <Input 
                                    id="editImporte" 
                                    type="number"
                                    value={newImporte}
                                    onChange={(e) => setNewImporte(parseInt(e.target.value))}
                                    required 
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={() => setModalEditImporte(false)}>Cancelar</Button>
                            <Button color="primary" type="submit">Guardar Cambios</Button>
                        </ModalFooter>
                    </Form>
                )}
            </Modal>
        </div>
    );
}
