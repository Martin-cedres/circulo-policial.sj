'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Container, Row, Col, Card, CardBody, Table, Button, 
    Badge, Modal, ModalHeader, ModalBody, ModalFooter, 
    Form, FormGroup, Label, Input, Alert 
} from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import Link from 'next/link';

interface Presupuesto {
    id: number;
    anio: number;
    mes: number;
    codigo_descuento: number;
    unidad_ejecutora: number;
    responsable: string;
    estado: 'borrador' | 'cerrado';
    total_socios: number;
    total_importe: number;
    created_at: string;
}

export default function AdminDescuentos() {
    const router = useRouter();
    const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
    const [stats, setStats] = useState({
        totalSocios: 0,
        sociosHaberes: 0,
        sociosExternos: 0,
        haberesLiquidadosCount: 0,
        recaudacionHaberes: 0,
        recaudacionExternosHipotetica: 0,
        recaudacionTotalEstimada: 0,
        sociosHaberesSinPresupuestoCount: 0
    });

    // Estado modales
    const [modalCrear, setModalCrear] = useState(false);
    const [modalImportar, setModalImportar] = useState(false);

    // Formulario Crear
    const [formCrear, setFormCrear] = useState({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        responsable: 'DARCY GONZALEZ'
    });

    // Formulario Importar Inicial
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [formImportar, setFormImportar] = useState({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        responsable: 'DARCY GONZALEZ'
    });

    useEffect(() => {
        // Verificar token
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchPresupuestos();
        fetchEstadisticas();
    }, [router]);

    const fetchEstadisticas = async () => {
        try {
            const res = await fetch('/api/admin/descuentos/estadisticas');
            const data = await res.json();
            if (data.success) {
                setStats(data.estadisticas);
            }
        } catch (e) {
            console.error('Error fetching statistics:', e);
        }
    };

    const fetchPresupuestos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/descuentos/presupuestos');
            const data = await res.json();
            if (data.success) {
                setPresupuestos(data.presupuestos);
            } else {
                showMsg('danger', data.error || 'Error al obtener presupuestos');
            }
        } catch (e) {
            showMsg('danger', 'Error de red al conectar con la base de datos');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type: 'success' | 'danger', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    // Crear presupuesto (clona el anterior)
    const handleCrearSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/descuentos/presupuestos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formCrear)
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', data.message || 'Presupuesto creado con éxito');
                setModalCrear(false);
                fetchPresupuestos();
                // Redirigir al editor del presupuesto recién creado
                router.push(`/admin/descuentos/${data.presupuestoId}`);
            } else {
                showMsg('danger', data.error || 'Error al crear presupuesto');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al crear presupuesto');
        }
    };

    // Importar presupuesto inicial (crea cabecera e importa socios de haberes desde .xls)
    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        setImporting(true);
        try {
            // 1. Primero crear el presupuesto vacío
            const resPres = await fetch('/api/admin/descuentos/presupuestos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formImportar)
            });
            const dataPres = await resPres.json();

            if (!dataPres.success) {
                showMsg('danger', dataPres.error || 'Error al iniciar cabecera del presupuesto');
                setImporting(false);
                return;
            }

            const newPresupuestoId = dataPres.presupuestoId;

            // 2. Subir el archivo de Excel y vincular los socios al presupuestoId creado
            const fd = new FormData();
            fd.append('file', importFile);
            fd.append('tipo', 'haberes'); // Importación de planilla de haberes
            fd.append('presupuestoId', newPresupuestoId);

            const resImport = await fetch('/api/admin/descuentos/importar', {
                method: 'POST',
                body: fd
            });
            const dataImport = await resImport.json();

            if (dataImport.success) {
                showMsg('success', `Presupuesto creado e importado. ${dataImport.message}`);
                setModalImportar(false);
                fetchPresupuestos();
                router.push(`/admin/descuentos/${newPresupuestoId}`);
            } else {
                showMsg('danger', dataImport.error || 'Error al importar socios en el presupuesto');
            }

        } catch (err) {
            showMsg('danger', 'Error de red al procesar importación');
        } finally {
            setImporting(false);
        }
    };

    const handleEliminarPresupuesto = async (id: number, periodoStr: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el presupuesto de ${periodoStr}? Se borrará el historial y los importes de ese mes.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/descuentos/presupuestos/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                showMsg('success', 'Presupuesto eliminado correctamente');
                fetchPresupuestos();
            } else {
                showMsg('danger', data.error || 'Error al eliminar');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al eliminar presupuesto');
        }
    };

    const getNombreMes = (num: number) => {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[num - 1] || '';
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
                            <h1 className="h4 mb-0 d-inline-block">Descuentos (Convenio 514)</h1>
                        </div>
                        <div>
                            <Button color="success" size="sm" className="me-2" onClick={() => setModalCrear(true)}>
                                ➕ Nuevo Presupuesto Mensual
                            </Button>
                            <Button color="light" outline size="sm" onClick={() => setModalImportar(true)}>
                                📥 Cargar Excel de Haberes Inicial
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="pb-5">
                {alert && (
                    <Alert color={alert.type} className="mb-4">
                        {alert.message}
                    </Alert>
                )}

                {/* Tarjetas Estadísticas Resumen de Recaudación */}
                {!loading && (
                    <Row className="g-3 mb-4">
                        {/* Total Socios */}
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.azul}` }}>
                                <CardBody className="p-3 d-flex align-items-center">
                                    <div style={{ fontSize: '2rem', marginRight: '0.8rem' }}>👥</div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Socios Activos</small>
                                        <span className="h5 fw-bold mb-0 d-block">{stats.totalSocios}</span>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            {stats.sociosHaberes} haberes | {stats.sociosExternos} ext.
                                        </small>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Recaudación Haberes */}
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: '5px solid #28A745' }}>
                                <CardBody className="p-3 d-flex align-items-center">
                                    <div style={{ fontSize: '2rem', marginRight: '0.8rem' }}>🏢</div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Recaudado Jefatura</small>
                                        <span className="h5 fw-bold text-success mb-0 d-block">${stats.recaudacionHaberes.toLocaleString('es-UY')}</span>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            {stats.haberesLiquidadosCount} socios liquidados
                                        </small>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Recaudación Externa */}
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: '5px solid #FFC107' }}>
                                <CardBody className="p-3 d-flex align-items-center">
                                    <div style={{ fontSize: '2rem', marginRight: '0.8rem' }}>✉️</div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Recaudación Externa</small>
                                        <span className="h5 fw-bold text-warning mb-0 d-block" style={{ color: '#E0A800' }}>${stats.recaudacionExternosHipotetica.toLocaleString('es-UY')}</span>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            Estimado externo ({stats.sociosExternos} socios)
                                        </small>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Recaudación Total */}
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.dorado}` }}>
                                <CardBody className="p-3 d-flex align-items-center">
                                    <div style={{ fontSize: '2rem', marginRight: '0.8rem' }}>💰</div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Total Recaudación</small>
                                        <span className="h5 fw-bold text-primary mb-0 d-block">${stats.recaudacionTotalEstimada.toLocaleString('es-UY')}</span>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            Ingresos consolidados
                                        </small>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Alertas de inconsistencia */}
                {!loading && stats.sociosHaberesSinPresupuestoCount > 0 && (
                    <Alert color="warning" className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                        <strong>⚠️ Alerta del Sistema:</strong> Hay {stats.sociosHaberesSinPresupuestoCount} socios activos de haberes que no han sido incluidos en el presupuesto de liquidación actual de la Jefatura.
                    </Alert>
                )}

                <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <CardBody className="p-0">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : presupuestos.length === 0 ? (
                            <div className="text-center p-5 text-muted">
                                <p className="mb-3">No hay presupuestos mensuales creados en la base de datos.</p>
                                <p className="small">Utiliza el botón <strong>Cargar Excel de Haberes Inicial</strong> para subir tu planilla del mes pasado y empezar la base de datos de socios.</p>
                            </div>
                        ) : (
                            <Table responsive hover className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Período</th>
                                        <th>Responsable de Firma</th>
                                        <th>Cantidad de Socios</th>
                                        <th>Total Liquidado</th>
                                        <th>Estado</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {presupuestos.map(p => {
                                        const periodoStr = `${getNombreMes(p.mes)} / ${p.anio}`;
                                        return (
                                            <tr key={p.id}>
                                                <td className="ps-4 fw-bold">
                                                    {periodoStr}
                                                </td>
                                                <td>{p.responsable}</td>
                                                <td>{p.total_socios} funcionarios</td>
                                                <td className="fw-bold" style={{ color: artiguistaColors.azul }}>
                                                    ${p.total_importe.toLocaleString('es-UY')}
                                                </td>
                                                <td>
                                                    {p.estado === 'borrador' ? (
                                                        <Badge color="warning" className="text-dark">Borrador</Badge>
                                                    ) : (
                                                        <Badge color="success">Cerrado (Enviado)</Badge>
                                                    )}
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button 
                                                        color="primary" 
                                                        size="sm" 
                                                        className="me-2"
                                                        onClick={() => router.push(`/admin/descuentos/${p.id}`)}
                                                    >
                                                        Gestionar
                                                    </Button>
                                                    <Button 
                                                        color="danger" 
                                                        outline 
                                                        size="sm"
                                                        onClick={() => handleEliminarPresupuesto(p.id, periodoStr)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </Container>

            {/* Modal Crear Presupuesto (clona el anterior) */}
            <Modal isOpen={modalCrear} toggle={() => setModalCrear(!modalCrear)} centered>
                <ModalHeader toggle={() => setModalCrear(!modalCrear)}>
                    Crear Presupuesto Mensual
                </ModalHeader>
                <Form onSubmit={handleCrearSubmit}>
                    <ModalBody>
                        <p className="text-muted small">
                            Se creará una nueva cabecera y el sistema <strong>clonará automáticamente la nómina activa de descuento por haberes del presupuesto del mes anterior</strong> para que puedas realizar las modificaciones correspondientes sobre ella de forma directa.
                        </p>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="mes">Mes del Presupuesto *</Label>
                                    <Input 
                                        id="mes" 
                                        type="select"
                                        value={formCrear.mes}
                                        onChange={(e) => setFormCrear({...formCrear, mes: parseInt(e.target.value)})}
                                        required
                                    >
                                        <option value={1}>Enero</option>
                                        <option value={2}>Febrero</option>
                                        <option value={3}>Marzo</option>
                                        <option value={4}>Abril</option>
                                        <option value={5}>Mayo</option>
                                        <option value={6}>Junio</option>
                                        <option value={7}>Julio</option>
                                        <option value={8}>Agosto</option>
                                        <option value={9}>Septiembre</option>
                                        <option value={10}>Octubre</option>
                                        <option value={11}>Noviembre</option>
                                        <option value={12}>Diciembre</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="anio">Año *</Label>
                                    <Input 
                                        id="anio" 
                                        type="number"
                                        value={formCrear.anio}
                                        onChange={(e) => setFormCrear({...formCrear, anio: parseInt(e.target.value)})}
                                        placeholder="Ej: 2026" 
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="responsable">Nombre del Responsable (Firma) *</Label>
                            <Input 
                                id="responsable" 
                                value={formCrear.responsable}
                                onChange={(e) => setFormCrear({...formCrear, responsable: e.target.value})}
                                placeholder="Ej: DARCY GONZALEZ" 
                                required 
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setModalCrear(false)}>Cancelar</Button>
                        <Button color="primary" type="submit">Crear Período</Button>
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Modal Importar Presupuesto Inicial */}
            <Modal isOpen={modalImportar} toggle={() => setModalImportar(!modalImportar)} centered>
                <ModalHeader toggle={() => setModalImportar(!modalImportar)}>
                    Cargar Presupuesto de Haberes Inicial
                </ModalHeader>
                <Form onSubmit={handleImportSubmit}>
                    <ModalBody>
                        <p className="text-muted small">
                            Usa este formulario para subir por primera vez una planilla de Excel de haberes (`514  mes 7  2026.xls`). El sistema creará el presupuesto y poblará la nómina de socios de descuento por haberes a partir de los registros del archivo.
                        </p>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="mesImp">Mes del Presupuesto *</Label>
                                    <Input 
                                        id="mesImp" 
                                        type="select"
                                        value={formImportar.mes}
                                        onChange={(e) => setFormImportar({...formImportar, mes: parseInt(e.target.value)})}
                                        required
                                    >
                                        <option value={1}>Enero</option>
                                        <option value={2}>Febrero</option>
                                        <option value={3}>Marzo</option>
                                        <option value={4}>Abril</option>
                                        <option value={5}>Mayo</option>
                                        <option value={6}>Junio</option>
                                        <option value={7}>Julio</option>
                                        <option value={8}>Agosto</option>
                                        <option value={9}>Septiembre</option>
                                        <option value={10}>Octubre</option>
                                        <option value={11}>Noviembre</option>
                                        <option value={12}>Diciembre</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="anioImp">Año *</Label>
                                    <Input 
                                        id="anioImp" 
                                        type="number"
                                        value={formImportar.anio}
                                        onChange={(e) => setFormImportar({...formImportar, anio: parseInt(e.target.value)})}
                                        placeholder="Ej: 2026" 
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="responsableImp">Nombre del Responsable (Firma) *</Label>
                            <Input 
                                id="responsableImp" 
                                value={formImportar.responsable}
                                onChange={(e) => setFormImportar({...formImportar, responsable: e.target.value})}
                                placeholder="Ej: DARCY GONZALEZ" 
                                required 
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="excelFile">Seleccionar Archivo Excel (.xls)</Label>
                            <Input 
                                id="excelFile" 
                                type="file" 
                                accept=".xls"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                required 
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setModalImportar(false)}>Cancelar</Button>
                        <Button color="success" type="submit" disabled={importing || !importFile}>
                            {importing ? 'Importando...' : 'Crear e Importar'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
}
