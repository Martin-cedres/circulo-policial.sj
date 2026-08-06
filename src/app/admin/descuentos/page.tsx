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
    const [modalComparar, setModalComparar] = useState(false);

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

    // Formulario Comparación CSV
    const [fileAnterior, setFileAnterior] = useState<File | null>(null);
    const [fileActual, setFileActual] = useState<File | null>(null);
    const [comparando, setComparando] = useState(false);
    const [resultadoComparacion, setResultadoComparacion] = useState<any | null>(null);

    useEffect(() => {
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
                router.push(`/admin/descuentos/${data.presupuestoId}`);
            } else {
                showMsg('danger', data.error || 'Error al crear presupuesto');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al crear presupuesto');
        }
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        setImporting(true);
        try {
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
            const fd = new FormData();
            fd.append('file', importFile);
            fd.append('tipo', 'haberes');
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

    const handleCompararSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileAnterior || !fileActual) {
            showMsg('danger', 'Debe seleccionar ambos archivos CSV para comparar');
            return;
        }

        setComparando(true);
        setResultadoComparacion(null);

        try {
            const fd = new FormData();
            fd.append('fileAnterior', fileAnterior);
            fd.append('fileActual', fileActual);

            const res = await fetch('/api/admin/descuentos/comparar', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();

            if (data.success) {
                setResultadoComparacion(data.resultado);
                showMsg('success', 'Comparación generada con éxito');
            } else {
                showMsg('danger', data.error || 'Error al procesar la comparación de retenciones');
            }
        } catch (err) {
            showMsg('danger', 'Error de red al comparar archivos de retenciones');
        } finally {
            setComparando(false);
        }
    };

    const handleAbrirImpresion = () => {
        if (!resultadoComparacion) return;
        localStorage.setItem('cp_retenciones_comparacion', JSON.stringify(resultadoComparacion));
        window.open('/admin/descuentos/comparar/imprimir', '_blank');
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

    const fmtMoney = (val: number) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(val);
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
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <Link href="/admin/dashboard" className="text-white text-decoration-none">
                                <span className="me-2">← Volver</span>
                            </Link>
                            <h1 className="h4 mb-0 d-inline-block">Descuentos (Convenio 514)</h1>
                        </div>
                        <div>
                            <Button color="warning" size="sm" className="me-2 text-dark fw-bold" onClick={() => setModalComparar(true)}>
                                📊 Comparar Retenciones CSV
                            </Button>
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

                        {/* Recaudación Total Combinada */}
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', borderLeft: `5px solid ${artiguistaColors.dorado}` }}>
                                <CardBody className="p-3 d-flex align-items-center">
                                    <div style={{ fontSize: '2rem', marginRight: '0.8rem' }}>💰</div>
                                    <div>
                                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Ingreso Mensual Estimado</small>
                                        <span className="h5 fw-bold text-primary mb-0 d-block" style={{ color: artiguistaColors.azul }}>${stats.recaudacionTotalEstimada.toLocaleString('es-UY')}</span>
                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                            Jefatura + Cobradores
                                        </small>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Banner de aviso si hay socios sin presupuesto */}
                {stats.sociosHaberesSinPresupuestoCount > 0 && (
                    <Alert color="warning" className="d-flex align-items-center justify-content-between mb-4 shadow-sm" style={{ borderRadius: '0.8rem' }}>
                        <div>
                            <strong>⚠️ Atención: Hay {stats.sociosHaberesSinPresupuestoCount} socios activos de Haberes que no están incluidos en el último presupuesto.</strong>
                            <div className="small text-muted">Asegúrate de agregarlos al presupuesto mensual para que aparezcan en el archivo TXT oficial enviado a Jefatura.</div>
                        </div>
                        <Button color="dark" size="sm" outline onClick={() => router.push('/admin/socios')}>
                            Gestionar Padronal
                        </Button>
                    </Alert>
                )}

                {/* Tabla de Presupuestos Históricos */}
                <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                    <CardBody className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="h5 mb-0 font-weight-bold" style={{ color: artiguistaColors.azul }}>
                                Historial de Presupuestos Mensuales
                            </h2>
                            <Badge color="info" pill>
                                {presupuestos.length} períodos registrados
                            </Badge>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : presupuestos.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <p>No hay presupuestos creados aún.</p>
                                <Button color="primary" size="sm" onClick={() => setModalCrear(true)}>
                                    Crear el primer presupuesto mensual
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Período</th>
                                            <th>Convenio / UE</th>
                                            <th>Responsable</th>
                                            <th>Total Socios</th>
                                            <th>Importe Total</th>
                                            <th>Estado</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {presupuestos.map((p) => (
                                            <tr key={p.id}>
                                                <td className="fw-bold" style={{ color: artiguistaColors.azul }}>
                                                    {getNombreMes(p.mes)} {p.anio}
                                                </td>
                                                <td>
                                                    <Badge color="secondary" outline className="me-1">
                                                        Cód {p.codigo_descuento}
                                                    </Badge>
                                                    <span className="small text-muted">UE {p.unidad_ejecutora}</span>
                                                </td>
                                                <td>{p.responsable}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        {p.total_socios || 0} socios
                                                    </span>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    ${(Number(p.total_importe) || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    {p.estado === 'cerrado' ? (
                                                        <Badge color="secondary">🔒 Cerrado</Badge>
                                                    ) : (
                                                        <Badge color="success">✏️ Borrador / Activo</Badge>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => router.push(`/admin/descuentos/${p.id}`)}
                                                    >
                                                        ⚙️ Abrir / Generar TXT
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        outline
                                                        size="sm"
                                                        onClick={() => handleEliminarPresupuesto(p.id, `${getNombreMes(p.mes)} ${p.anio}`)}
                                                    >
                                                        🗑️
                                                    </Button>
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

            {/* Modal Comparar Retenciones CSV */}
            <Modal isOpen={modalComparar} toggle={() => setModalComparar(!modalComparar)} size="lg" centered>
                <ModalHeader toggle={() => setModalComparar(!modalComparar)} className="bg-light">
                    📊 Comparador de Retenciones Mensuales (Convenio 514)
                </ModalHeader>
                <Form onSubmit={handleCompararSubmit}>
                    <ModalBody>
                        <p className="text-muted small">
                            Sube los dos archivos CSV emitidos por Jefatura (`514 RETENCIONES...csv`) para analizar la evolución mensual, variaciones de cuotas, recaudación efectiva y movimientos de socios.
                        </p>
                        <Row className="g-3 mb-3">
                            <Col md={6}>
                                <Card className="border p-3 bg-light">
                                    <FormGroup className="mb-0">
                                        <Label for="fileAnt" className="fw-bold text-primary mb-1">1. Archivo Mes Anterior (ej. Junio)</Label>
                                        <Input
                                            id="fileAnt"
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => setFileAnterior(e.target.files?.[0] || null)}
                                            required
                                        />
                                        {fileAnterior && <small className="text-success mt-1 d-block">✓ {fileAnterior.name}</small>}
                                    </FormGroup>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border p-3 bg-light">
                                    <FormGroup className="mb-0">
                                        <Label for="fileAct" className="fw-bold text-primary mb-1">2. Archivo Mes Actual (ej. Julio)</Label>
                                        <Input
                                            id="fileAct"
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => setFileActual(e.target.files?.[0] || null)}
                                            required
                                        />
                                        {fileActual && <small className="text-success mt-1 d-block">✓ {fileActual.name}</small>}
                                    </FormGroup>
                                </Card>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-center mb-3">
                            <Button color="primary" type="submit" disabled={comparando || !fileAnterior || !fileActual}>
                                {comparando ? 'Procesando y analizando...' : '🚀 Calcular Comparativa de Recaudación'}
                            </Button>
                        </div>

                        {/* Resultado de la comparación */}
                        {resultadoComparacion && (
                            <div className="border-top pt-3 mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="h6 fw-bold mb-0 text-primary">
                                        Resultados de Comparación: {resultadoComparacion.fechaAnterior} vs {resultadoComparacion.fechaActual}
                                    </h5>
                                    <Button color="dark" size="sm" onClick={handleAbrirImpresion}>
                                        🖨️ Imprimir / PDF Oficial
                                    </Button>
                                </div>

                                {/* Tabla Financiera */}
                                <Table bordered hover size="sm" className="align-middle text-center small mb-3">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="text-start">Indicador</th>
                                            <th>Junio</th>
                                            <th>Julio</th>
                                            <th>Variación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="text-start fw-bold">Cuota Social Unitaria Base</td>
                                            <td>{fmtMoney(resultadoComparacion.financiero.cuotaAnterior)}</td>
                                            <td>{fmtMoney(resultadoComparacion.financiero.cuotaActual)}</td>
                                            <td className="fw-bold text-success">+{fmtMoney(resultadoComparacion.financiero.cuotaVar)} (+{resultadoComparacion.financiero.cuotaVarPct.toFixed(2)}%)</td>
                                        </tr>
                                        <tr className="table-light">
                                            <td className="text-start fw-bold">Recaudación Efectiva (Descontado)</td>
                                            <td>{fmtMoney(resultadoComparacion.financiero.recaudadoAnterior)}</td>
                                            <td>{fmtMoney(resultadoComparacion.financiero.recaudadoActual)}</td>
                                            <td className="fw-bold text-success">+{fmtMoney(resultadoComparacion.financiero.recaudadoVar)} (+{resultadoComparacion.financiero.recaudadoVarPct.toFixed(2)}%)</td>
                                        </tr>
                                        <tr>
                                            <td className="text-start fw-bold">Total No Descontado (Impago)</td>
                                            <td>{fmtMoney(resultadoComparacion.financiero.impagoAnterior)}</td>
                                            <td>{fmtMoney(resultadoComparacion.financiero.impagoActual)}</td>
                                            <td className="fw-bold text-success">{fmtMoney(resultadoComparacion.financiero.impagoVar)}</td>
                                        </tr>
                                        <tr className="table-light">
                                            <td className="text-start fw-bold">Cantidad Socios Impagos</td>
                                            <td>{resultadoComparacion.financiero.sociosImpagosAnterior} socios</td>
                                            <td>{resultadoComparacion.financiero.sociosImpagosActual} socios</td>
                                            <td className="fw-bold text-success">{resultadoComparacion.financiero.sociosImpagosVar} socios</td>
                                        </tr>
                                    </tbody>
                                </Table>

                                {/* Movimiento de Socios */}
                                <div className="bg-light p-3 rounded border small">
                                    <h6 className="fw-bold text-dark mb-2">Movimiento de Socios:</h6>
                                    
                                    <div className="mb-2">
                                        <strong className="text-danger">A. Bajas Notificadas ({resultadoComparacion.movimientos.bajas.length}):</strong>
                                        {resultadoComparacion.movimientos.bajas.length === 0 ? (
                                            <span className="text-muted ms-2">Ninguna</span>
                                        ) : (
                                            <ul className="mb-0 ps-3">
                                                {resultadoComparacion.movimientos.bajas.map((b: any, i: number) => (
                                                    <li key={i}>{b.nombre} (C.I. {b.ci}) {b.nota && `— ${b.nota}`}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <strong className="text-success">B. Socios Recuperados ({resultadoComparacion.movimientos.recuperados.length}):</strong>
                                        {resultadoComparacion.movimientos.recuperados.length === 0 ? (
                                            <span className="text-muted ms-2">Ninguno</span>
                                        ) : (
                                            <ul className="mb-0 ps-3">
                                                {resultadoComparacion.movimientos.recuperados.map((r: any, i: number) => (
                                                    <li key={i}>{r.nombre} (C.I. {r.ci}) — Cobrado: {fmtMoney(r.descActual)}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <strong className="text-primary">C. Socios Impagos Persistentes ({resultadoComparacion.movimientos.impagosPersistentes.length}):</strong>
                                        {resultadoComparacion.movimientos.impagosPersistentes.length === 0 ? (
                                            <span className="text-muted ms-2">Ninguno</span>
                                        ) : (
                                            <ol className="mb-0 ps-3">
                                                {resultadoComparacion.movimientos.impagosPersistentes.map((imp: any, i: number) => (
                                                    <li key={i}>{imp.nombre} (C.I. {imp.ci}) – Faltante: {fmtMoney(imp.noDescActual)}</li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setModalComparar(false)}>Cerrar</Button>
                        {resultadoComparacion && (
                            <Button color="dark" onClick={handleAbrirImpresion}>
                                🖨️ Abrir PDF e Imprimir
                            </Button>
                        )}
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Modal Crear Nuevo Presupuesto */}
            <Modal isOpen={modalCrear} toggle={() => setModalCrear(!modalCrear)} centered>
                <ModalHeader toggle={() => setModalCrear(!modalCrear)}>
                    Crear Nuevo Presupuesto Mensual
                </ModalHeader>
                <Form onSubmit={handleCrearSubmit}>
                    <ModalBody>
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
