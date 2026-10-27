'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    telefono?: string | null;
    direccion?: string | null;
    localidad?: string | null;
    email?: string | null;
    subcategoria?: string | null;
    tanda?: 'tanda_1' | 'tanda_2' | null;
    motivo_baja?: string | null;
    fecha_baja?: string | Date | null;
}

function AdminSociosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Pestaña activa ('activos' | 'bajas')
    const initialTab = (searchParams.get('tab') === 'bajas' || searchParams.get('estado') === 'baja') ? 'bajas' : 'activos';
    const [activeTab, setActiveTab] = useState<'activos' | 'bajas'>(initialTab);

    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [metodoFilter, setMetodoFilter] = useState(''); // 'haberes', 'externo', ''
    const [carnetFilter, setCarnetFilter] = useState(''); // 'pendiente', 'entregado', ''
    const [tandaFilter, setTandaFilter] = useState(''); // '', 'tanda_1', 'tanda_2', 'general'
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info', message: string } | null>(null);

    // Estado modales
    const [modalSocio, setModalSocio] = useState(false);
    const [modalImportar, setModalImportar] = useState(false);
    const [modalMigrar, setModalMigrar] = useState(false);
    const [editingSocio, setEditingSocio] = useState<Socio | null>(null);

    // Modal Confirmar Baja
    const [modalBaja, setModalBaja] = useState(false);
    const [socioABajar, setSocioABajar] = useState<Socio | null>(null);
    const [motivoBaja, setMotivoBaja] = useState('Renuncia voluntaria');
    const [observacionesBaja, setObservacionesBaja] = useState('');
    const [bajando, setBajando] = useState(false);

    // Formulario Migración de Tanda a Jefatura
    const [selectedTandaMigrar, setSelectedTandaMigrar] = useState<'tanda_1' | 'tanda_2'>('tanda_1');
    const [confirmMigrar, setConfirmMigrar] = useState(false);
    const [migrando, setMigrando] = useState(false);

    // Formulario Socio
    const [formSocio, setFormSocio] = useState({
        nombre: '',
        cedula: '',
        digito_verificador: '',
        metodo_pago: 'haberes' as 'haberes' | 'externo',
        telefono: '',
        direccion: '',
        localidad: '',
        email: '',
        subcategoria: 'general',
        tanda: '' as '' | 'tanda_1' | 'tanda_2'
    });

    // Importación de archivos
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);

    const fetchSocios = useCallback(async (
        searchQuery = search, 
        filterMetodo = metodoFilter, 
        filterCarnet = carnetFilter,
        filterTanda = tandaFilter
    ) => {
        setLoading(true);
        try {
            const url = `/api/admin/descuentos/socios?search=${encodeURIComponent(searchQuery)}&metodo=${filterMetodo}&carnet=${filterCarnet}&tanda=${filterTanda}&estado=todos`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setSocios(data.socios);
            } else {
                showMsg('danger', data.error || 'Error al cargar socios');
            }
        } catch {
            showMsg('danger', 'Error de red al cargar socios');
        } finally {
            setLoading(false);
        }
    }, [search, metodoFilter, carnetFilter, tandaFilter]);

    useEffect(() => {
        // Verificar token
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchSocios();
    }, [router, fetchSocios]);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const estadoParam = searchParams.get('estado');
        if (tabParam === 'bajas' || estadoParam === 'baja') {
            setActiveTab('bajas');
        }
    }, [searchParams]);

    const showMsg = (type: 'success' | 'danger' | 'warning' | 'info', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 7000);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        fetchSocios(val, metodoFilter, carnetFilter, tandaFilter);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMetodoFilter(val);
        fetchSocios(search, val, carnetFilter, tandaFilter);
    };

    const handleCarnetFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCarnetFilter(val);
        fetchSocios(search, metodoFilter, val, tandaFilter);
    };

    const handleTandaFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTandaFilter(val);
        fetchSocios(search, metodoFilter, carnetFilter, val);
    };

    const handleCambiarTab = (tab: 'activos' | 'bajas') => {
        setActiveTab(tab);
        if (tab === 'bajas') {
            router.replace('/admin/socios?tab=bajas');
        } else {
            router.replace('/admin/socios');
        }
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
                fetchSocios(search, metodoFilter, carnetFilter, tandaFilter);
            } else {
                showMsg('danger', data.error || 'Error al actualizar estado del carné');
            }
        } catch {
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
                metodo_pago: socio.metodo_pago,
                telefono: socio.telefono || '',
                direccion: socio.direccion || '',
                localidad: socio.localidad || '',
                email: socio.email || '',
                subcategoria: socio.subcategoria || 'general',
                tanda: socio.tanda || ''
            });
        } else {
            setEditingSocio(null);
            setFormSocio({
                nombre: '',
                cedula: '',
                digito_verificador: '',
                metodo_pago: 'haberes',
                telefono: '',
                direccion: '',
                localidad: '',
                email: '',
                subcategoria: 'general',
                tanda: ''
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
            
            const payload = {
                ...(isEditing ? { socioId: editingSocio.id } : {}),
                nombre: formSocio.nombre,
                cedula: formSocio.cedula,
                digito_verificador: formSocio.digito_verificador,
                metodo_pago: formSocio.metodo_pago,
                telefono: formSocio.telefono || null,
                direccion: formSocio.direccion || null,
                localidad: formSocio.localidad || null,
                email: formSocio.email || null,
                subcategoria: formSocio.tanda ? 'escuela_policia' : formSocio.subcategoria,
                tanda: formSocio.tanda ? formSocio.tanda : null
            };

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
                fetchSocios(search, metodoFilter, carnetFilter, tandaFilter);
            } else {
                showMsg('danger', data.error || 'Error al guardar socio');
            }
        } catch {
            showMsg('danger', 'Error de red al guardar socio');
        }
    };

    // Modal de Confirmación de Baja
    const abrirModalBaja = (socio: Socio) => {
        setSocioABajar(socio);
        setMotivoBaja('Renuncia voluntaria');
        setObservacionesBaja('');
        setModalBaja(true);
    };

    const handleConfirmarBajaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!socioABajar) return;

        setBajando(true);
        try {
            const fullReason = observacionesBaja.trim() 
                ? `${motivoBaja} - ${observacionesBaja.trim()}`
                : motivoBaja;

            const res = await fetch(`/api/admin/descuentos/socios?socioId=${socioABajar.id}&motivo=${encodeURIComponent(fullReason)}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                showMsg(
                    'warning', 
                    `⚠️ Socio ${socioABajar.nombre} dado de baja (Motivo: ${motivoBaja}). Registrado en el Archivo de Bajas.`
                );
                setModalBaja(false);
                setSocioABajar(null);
                fetchSocios(search, metodoFilter, carnetFilter, tandaFilter);
            } else {
                showMsg('danger', data.error || 'Error al procesar la baja');
            }
        } catch {
            showMsg('danger', 'Error de red al procesar la baja');
        } finally {
            setBajando(false);
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
                showMsg('success', `🟩 Socio ${socio.nombre} reactivado correctamente en el padrón activo.`);
                fetchSocios(search, metodoFilter, carnetFilter, tandaFilter);
            } else {
                showMsg('danger', data.error || 'Error al reactivar');
            }
        } catch {
            showMsg('danger', 'Error de red al reactivar');
        }
    };

    // Migración Masiva de Tanda a Jefatura
    const handleMigrarTandaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmMigrar) return;

        setMigrando(true);
        try {
            const res = await fetch('/api/admin/descuentos/socios/migrar-tanda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tanda: selectedTandaMigrar })
            });
            const data = await res.json();

            if (data.success) {
                showMsg(
                    'success', 
                    `🚀 Pase completado: ${data.message} (${data.totalMigrados} socios pasaron a descuento por Jefatura).`
                );
                setModalMigrar(false);
                setConfirmMigrar(false);
                fetchSocios(search, metodoFilter, carnetFilter, tandaFilter);
            } else {
                showMsg('danger', data.error || 'Error al procesar el pase a Jefatura');
            }
        } catch {
            showMsg('danger', 'Error de red al migrar tanda a Jefatura');
        } finally {
            setMigrando(false);
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
                fetchSocios(search, metodoFilter, carnetFilter, tandaFilter);
            } else {
                showMsg('danger', data.error || 'Error al importar archivo');
            }
        } catch {
            showMsg('danger', 'Error de red al importar archivo');
        } finally {
            setImporting(false);
        }
    };

    // Separación de listas
    const sociosActivos = socios.filter(s => s.estado === 'activo');
    const sociosBajas = socios.filter(s => s.estado === 'baja');

    // Conteo rápido de alumnos en tandas para el modal de pase
    const pendientesT1 = sociosActivos.filter(s => s.tanda === 'tanda_1' && s.metodo_pago === 'externo').length;
    const pendientesT2 = sociosActivos.filter(s => s.tanda === 'tanda_2' && s.metodo_pago === 'externo').length;

    const formatFechaBaja = (fechaStr: string | Date | null | undefined) => {
        if (!fechaStr) return '02/07/2026 (Inicial)';
        try {
            const d = new Date(fechaStr);
            if (isNaN(d.getTime())) return String(fechaStr);
            return d.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return String(fechaStr);
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
                    marginBottom: '1.5rem',
                }}
            >
                <Container>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <Link href="/admin/dashboard" className="text-white text-decoration-none">
                                <span className="me-2">← Volver</span>
                            </Link>
                            <h1 className="h4 mb-0 d-inline-block">Gestión de Socios</h1>
                        </div>
                        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-start justify-content-md-end">
                            {/* Botón Rutero Cobro A4 */}
                            <Button 
                                color="info" 
                                size="sm" 
                                className="fw-bold text-dark shadow-sm text-nowrap"
                                onClick={() => window.open('/admin/socios/rutero', '_blank')}
                                title="Abrir planilla de cobro a domicilio optimizada para A4 y dispositivos móviles"
                            >
                                📋 Rutero Cobro A4
                            </Button>

                            {/* Botón Pase a Jefatura por Tanda */}
                            <Button 
                                color="warning" 
                                size="sm" 
                                className="fw-bold text-dark shadow-sm text-nowrap"
                                onClick={() => {
                                    setConfirmMigrar(false);
                                    setModalMigrar(true);
                                }}
                                title="Migrar tandas completas de la Escuela Policial a retención por haberes de Jefatura"
                            >
                                🚀 Pase a Jefatura (Por Tanda)
                            </Button>

                            {/* Exportar A4 PDF */}
                            <Button 
                                color="light" 
                                outline 
                                size="sm" 
                                className="fw-bold text-white text-nowrap" 
                                onClick={() => window.open('/admin/socios/imprimir?tipo=total', '_blank')}
                            >
                                🖨️ Exportar A4 PDF
                            </Button>

                            <Button color="success" size="sm" className="fw-bold text-nowrap" onClick={() => toggleSocioModal()}>
                                + Registrar Socio
                            </Button>
                            <Button color="light" outline size="sm" className="text-nowrap" onClick={toggleImportarModal}>
                                📥 Cargar Excel
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

                {/* Conmutador de Pestañas: Socios Activos vs. Archivo de Bajas */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div className="btn-group shadow-sm p-1 bg-white rounded-pill border" role="group">
                        <button
                            type="button"
                            className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'activos' ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => handleCambiarTab('activos')}
                        >
                            👥 Socios Activos ({sociosActivos.length})
                        </button>
                        <button
                            type="button"
                            className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'bajas' ? 'btn-danger text-white shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => handleCambiarTab('bajas')}
                        >
                            🗄️ Archivo de Bajas ({sociosBajas.length})
                        </button>
                    </div>

                    <div className="text-muted small">
                        Padrón total registrado: <strong>{socios.length}</strong> (220 activos + {sociosBajas.length} bajas)
                    </div>
                </div>

                {/* Banner Informativo de Carnés Pendientes (solo en pestaña de activos) */}
                {activeTab === 'activos' && sociosActivos.filter(s => !s.carnet_entregado).length > 0 && (
                    <Alert color="warning" className="mb-4 shadow-sm border-0 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ backgroundColor: '#FFFBEB', color: '#92400E', borderRadius: '1rem', borderLeft: '5px solid #F59E0B' }}>
                        <div>
                            <strong style={{ fontSize: '1.05rem' }}>🪪 Control de Credenciales de Socio</strong>
                            <p className="mb-0 small mt-1">
                                Tenés <strong>{sociosActivos.filter(s => !s.carnet_entregado).length} socio(s) activo(s)</strong> con carné físico <strong>PENDIENTE de entrega</strong>.
                            </p>
                        </div>
                        {carnetFilter !== 'pendiente' && (
                            <Button size="sm" color="warning" className="text-dark fw-bold px-3 ms-auto" onClick={() => { setCarnetFilter('pendiente'); fetchSocios(search, metodoFilter, 'pendiente', tandaFilter); }}>
                                Ver Pendientes →
                            </Button>
                        )}
                    </Alert>
                )}

                {/* Barra de Filtros (para Socios Activos) */}
                {activeTab === 'activos' && (
                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
                        <CardBody className="p-3 p-md-4">
                            <Row className="g-2 align-items-center">
                                <Col xs={12} md={4} lg={4}>
                                    <InputGroup>
                                        <Input 
                                            placeholder="Buscar por Nombre o Cédula..." 
                                            value={search} 
                                            onChange={handleSearchChange} 
                                        />
                                    </InputGroup>
                                </Col>
                                <Col xs={12} sm={6} md={3} lg={3}>
                                    <Input type="select" value={tandaFilter} onChange={handleTandaFilterChange}>
                                        <option value="">Todas las Categorías / Tandas</option>
                                        <option value="tanda_1">Escuela Policial - Tanda 1</option>
                                        <option value="tanda_2">Escuela Policial - Tanda 2</option>
                                        <option value="general">Socios Generales</option>
                                    </Input>
                                </Col>
                                <Col xs={6} sm={3} md={2} lg={2}>
                                    <Input type="select" value={metodoFilter} onChange={handleFilterChange}>
                                        <option value="">Método (Todos)</option>
                                        <option value="haberes">Descuento Jefatura</option>
                                        <option value="externo">Pago por fuera</option>
                                    </Input>
                                </Col>
                                <Col xs={6} sm={3} md={2} lg={2}>
                                    <Input type="select" value={carnetFilter} onChange={handleCarnetFilterChange}>
                                        <option value="">Carné (Todos)</option>
                                        <option value="pendiente">🟨 Pendiente</option>
                                        <option value="entregado">🟩 Entregado</option>
                                    </Input>
                                </Col>
                                <Col xs={12} md={1} lg={1} className="text-md-end text-muted">
                                    <small>Total: <strong>{sociosActivos.length}</strong></small>
                                </Col>
                            </Row>

                            {/* Accesos directos y filtros rápidos */}
                            <Row className="mt-3 pt-3 border-top g-2 align-items-center">
                                <Col xs={12} md={3}>
                                    <small className="fw-bold text-uppercase text-muted d-block">🖨️ Rutas y Reportes A4:</small>
                                </Col>
                                <Col xs={12} md={9} className="d-flex flex-wrap gap-2 justify-content-md-end">
                                    <Button 
                                        color="info" 
                                        outline 
                                        size="sm" 
                                        className="fw-bold text-dark" 
                                        onClick={() => window.open('/admin/socios/rutero', '_blank')}
                                    >
                                        📋 Hoja de Ruta Domiciliaria (Escuela)
                                    </Button>
                                    <Button color="primary" outline size="sm" className="fw-bold" onClick={() => window.open('/admin/socios/imprimir?tipo=total', '_blank')}>
                                        📋 Padrón Total (A4)
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
                )}

                {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
                {activeTab === 'activos' ? (
                    /* TAB 1: SOCIOS ACTIVOS */
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <CardBody className="p-0">
                            {loading ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando socios activos...</span>
                                    </div>
                                </div>
                            ) : sociosActivos.length === 0 ? (
                                <div className="text-center p-5 text-muted">
                                    No se encontraron socios activos con los filtros seleccionados.
                                </div>
                            ) : (
                                <>
                                    {/* VISTA TABLA PARA PANTALLAS GRANDES (DESKTOP) */}
                                    <div className="d-none d-lg-block">
                                        <Table responsive hover className="align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-3" style={{ width: '115px', whiteSpace: 'nowrap' }}>Cédula</th>
                                                    <th>Nombre y Apellido</th>
                                                    <th style={{ width: '160px', whiteSpace: 'nowrap' }}>Método de Pago</th>
                                                    <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Estado Carné</th>
                                                    <th style={{ width: '85px', whiteSpace: 'nowrap' }}>Estado</th>
                                                    <th className="text-end pe-3" style={{ width: '210px', whiteSpace: 'nowrap' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sociosActivos.map(socio => (
                                                    <tr key={socio.id}>
                                                        <td className="ps-3 fw-bold" style={{ whiteSpace: 'nowrap' }}>
                                                            {parseInt(socio.cedula).toLocaleString('es-UY')}-{socio.digito_verificador}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="fw-semibold text-truncate" title={socio.nombre} style={{ maxWidth: '280px' }}>
                                                                    {socio.nombre}
                                                                </span>
                                                                {socio.tanda === 'tanda_1' && (
                                                                    <Badge 
                                                                        pill 
                                                                        className="flex-shrink-0"
                                                                        style={{ 
                                                                            backgroundColor: '#E0F2FE', 
                                                                            color: '#0369A1', 
                                                                            border: '1px solid #BAE6FD',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.72rem',
                                                                            padding: '0.25rem 0.5rem',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        Escuela T1
                                                                    </Badge>
                                                                )}
                                                                {socio.tanda === 'tanda_2' && (
                                                                    <Badge 
                                                                        pill 
                                                                        className="flex-shrink-0"
                                                                        style={{ 
                                                                            backgroundColor: '#F3E8FF', 
                                                                            color: '#6B21A8', 
                                                                            border: '1px solid #DDD6FE',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.72rem',
                                                                            padding: '0.25rem 0.5rem',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        Escuela T2
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {(socio.telefono || socio.direccion) && (
                                                                <div className="text-muted text-truncate mt-1" style={{ fontSize: '0.78rem', maxWidth: '360px' }} title={`${socio.telefono ? socio.telefono : ''} ${socio.direccion ? ' - ' + socio.direccion : ''}`}>
                                                                    {socio.telefono && <span className="me-2">📞 {socio.telefono}</span>}
                                                                    {socio.direccion && <span>📍 {socio.direccion}{socio.localidad ? `, ${socio.localidad}` : ''}</span>}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {socio.metodo_pago === 'haberes' ? (
                                                                <Badge color="primary" pill style={{ padding: '0.35rem 0.7rem' }}>
                                                                    Descuento Jefatura
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="warning" pill className="text-dark" style={{ padding: '0.35rem 0.7rem', backgroundColor: '#FFF3CD', border: '1px solid #FFEBA8' }}>
                                                                    Pago por Fuera
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {socio.carnet_entregado ? (
                                                                <Badge color="success" pill style={{ padding: '0.35rem 0.65rem' }}>
                                                                    🟩 Entregado
                                                                </Badge>
                                                            ) : (
                                                                <Badge pill className="text-dark" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '0.35rem 0.65rem' }}>
                                                                    🟨 Pendiente
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            <Badge color="success">Activo</Badge>
                                                        </td>
                                                        <td className="text-end pe-3" style={{ whiteSpace: 'nowrap' }}>
                                                            <div className="d-flex align-items-center justify-content-end gap-1 flex-nowrap">
                                                                {!socio.carnet_entregado ? (
                                                                    <Button 
                                                                        color="success" 
                                                                        size="sm" 
                                                                        className="px-2 py-1 fw-bold text-nowrap" 
                                                                        onClick={() => handleToggleCarnet(socio)}
                                                                        title="Marcar que se le entregó el carné de socio"
                                                                    >
                                                                        🪪 Carné
                                                                    </Button>
                                                                ) : (
                                                                    <Button 
                                                                        color="light" 
                                                                        outline 
                                                                        size="sm" 
                                                                        className="px-2 py-1 text-muted text-nowrap" 
                                                                        onClick={() => handleToggleCarnet(socio)}
                                                                        title="Volver a marcar como pendiente de entrega"
                                                                    >
                                                                        ↩️ Pendiente
                                                                    </Button>
                                                                )}
                                                                <Button 
                                                                color="primary" 
                                                                outline 
                                                                size="sm" 
                                                                className="px-2 py-1" 
                                                                onClick={() => toggleSocioModal(socio)}
                                                            >
                                                                Editar
                                                            </Button>
                                                            <Button 
                                                                color="danger" 
                                                                outline 
                                                                size="sm" 
                                                                className="px-2 py-1"
                                                                onClick={() => abrirModalBaja(socio)}
                                                                title="Dar de baja registrando motivo"
                                                            >
                                                                Baja
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* VISTA TARJETAS PARA DISPOSITIVOS MÓVILES Y TABLETS (< lg) */}
                                <div className="d-lg-none p-3 bg-light">
                                    <div className="d-flex flex-column gap-3">
                                        {sociosActivos.map(socio => (
                                            <Card key={socio.id} className="border shadow-sm" style={{ borderRadius: '0.75rem' }}>
                                                <CardBody className="p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <span className="fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
                                                                C.I. {parseInt(socio.cedula).toLocaleString('es-UY')}-{socio.digito_verificador}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex gap-1 flex-wrap justify-content-end">
                                                            {socio.tanda === 'tanda_1' && (
                                                                <Badge pill style={{ backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', fontSize: '0.72rem' }}>
                                                                    Escuela T1
                                                                </Badge>
                                                            )}
                                                            {socio.tanda === 'tanda_2' && (
                                                                <Badge pill style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', border: '1px solid #DDD6FE', fontSize: '0.72rem' }}>
                                                                    Escuela T2
                                                                </Badge>
                                                            )}
                                                            <Badge color="success" pill style={{ fontSize: '0.72rem' }}>
                                                                Activo
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '1rem', lineHeight: '1.25' }}>
                                                        {socio.nombre}
                                                    </h6>

                                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                                        {socio.metodo_pago === 'haberes' ? (
                                                            <Badge color="primary" pill style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                                🏛️ Descuento Jefatura
                                                            </Badge>
                                                        ) : (
                                                            <Badge color="warning" pill className="text-dark" style={{ padding: '0.3rem 0.6rem', backgroundColor: '#FFF3CD', border: '1px solid #FFEBA8', fontSize: '0.75rem' }}>
                                                                💵 Pago por Fuera
                                                            </Badge>
                                                        )}
                                                        {socio.carnet_entregado ? (
                                                            <Badge color="success" pill style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                                🟩 Carné Entregado
                                                            </Badge>
                                                        ) : (
                                                            <Badge pill className="text-dark" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                                🟨 Carné Pendiente
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {(socio.telefono || socio.direccion) && (
                                                        <div className="p-2 mb-3 rounded bg-white border" style={{ fontSize: '0.8rem' }}>
                                                            {socio.telefono && (
                                                                <div className="d-flex align-items-center justify-content-between mb-1">
                                                                    <span>📞 <strong>Tel:</strong> {socio.telefono}</span>
                                                                    <a href={`tel:${socio.telefono.replace(/\s+/g, '')}`} className="btn btn-outline-success btn-sm py-0 px-2" style={{ fontSize: '0.75rem' }}>
                                                                        Llamar
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {socio.direccion && (
                                                                <div className="text-muted">
                                                                    📍 <strong>Dir:</strong> {socio.direccion}{socio.localidad ? `, ${socio.localidad}` : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="d-flex justify-content-end gap-2 pt-2 border-top flex-wrap">
                                                        {!socio.carnet_entregado ? (
                                                            <Button 
                                                                color="success" 
                                                                size="sm" 
                                                                className="fw-bold" 
                                                                onClick={() => handleToggleCarnet(socio)}
                                                            >
                                                                🪪 Carné
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                color="light" 
                                                                outline 
                                                                size="sm" 
                                                                className="text-muted" 
                                                                onClick={() => handleToggleCarnet(socio)}
                                                            >
                                                                ↩️ Pendiente
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            color="primary" 
                                                            outline 
                                                            size="sm" 
                                                            onClick={() => toggleSocioModal(socio)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button 
                                                            color="danger" 
                                                            outline 
                                                            size="sm" 
                                                            onClick={() => abrirModalBaja(socio)}
                                                        >
                                                            Baja
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardBody>
                </Card>
                ) : (
                    /* TAB 2: ARCHIVO HISTÓRICO DE BAJAS */
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <div className="p-3 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <h2 className="h6 fw-bold mb-1" style={{ color: artiguistaColors.rojo }}>
                                    🗄️ Archivo Histórico de Bajas ({sociosBajas.length} registros)
                                </h2>
                                <p className="small text-muted mb-0">
                                    Listado oficial de socios desvinculados, con fecha y motivo de egreso. Cualquier socio puede ser reactivado en el padrón activo en un clic.
                                </p>
                            </div>
                            <Button 
                                color="outline-secondary" 
                                size="sm" 
                                onClick={() => handleCambiarTab('activos')}
                            >
                                ← Volver a Socios Activos
                            </Button>
                        </div>
                        <CardBody className="p-0">
                            {loading ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-danger" role="status">
                                        <span className="visually-hidden">Cargando archivo de bajas...</span>
                                    </div>
                                </div>
                            ) : sociosBajas.length === 0 ? (
                                <div className="text-center p-5 text-muted">
                                    No hay socios registrados como baja en el sistema.
                                </div>
                            ) : (
                                <>
                                    {/* TABLA DE BAJAS PARA ESCRITORIO */}
                                    <div className="d-none d-lg-block">
                                        <Table responsive hover className="align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-3" style={{ width: '120px', whiteSpace: 'nowrap' }}>Cédula</th>
                                                    <th>Nombre y Apellido</th>
                                                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Método Previo</th>
                                                    <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Fecha de Baja</th>
                                                    <th style={{ width: '240px' }}>Motivo de la Baja</th>
                                                    <th className="text-end pe-3" style={{ width: '140px', whiteSpace: 'nowrap' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sociosBajas.map(socio => (
                                                    <tr key={socio.id} style={{ backgroundColor: '#FFFDFD' }}>
                                                        <td className="ps-3 fw-bold text-muted" style={{ whiteSpace: 'nowrap' }}>
                                                            {parseInt(socio.cedula).toLocaleString('es-UY')}-{socio.digito_verificador}
                                                        </td>
                                                        <td>
                                                            <div className="fw-semibold text-dark">
                                                                {socio.nombre}
                                                            </div>
                                                            <small className="text-muted">ID Socio: #{socio.id}</small>
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {socio.metodo_pago === 'haberes' ? (
                                                                <Badge color="primary" outline pill style={{ fontSize: '0.75rem' }}>
                                                                    Jefatura (Haberes)
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="warning" outline pill className="text-dark" style={{ fontSize: '0.75rem' }}>
                                                                    Pago por Fuera
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }} className="text-muted">
                                                            📅 {formatFechaBaja(socio.fecha_baja)}
                                                        </td>
                                                        <td>
                                                            <Badge 
                                                                pill 
                                                                style={{ 
                                                                    backgroundColor: '#FEE2E2', 
                                                                    color: '#991B1B', 
                                                                    border: '1px solid #FECACA',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.75rem',
                                                                    padding: '0.35rem 0.65rem'
                                                                }}
                                                            >
                                                                {socio.motivo_baja || 'Baja solicitada'}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end pe-3" style={{ whiteSpace: 'nowrap' }}>
                                                            <Button 
                                                                color="success" 
                                                                outline 
                                                                size="sm" 
                                                                className="px-3 py-1 fw-semibold"
                                                                onClick={() => handleReactivarSocio(socio)}
                                                                title="Reincorporar este socio al padrón activo"
                                                            >
                                                                Reactivar
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* VISTA MÓVIL DE BAJAS (< lg) */}
                                    <div className="d-lg-none p-3 bg-light">
                                        <div className="d-flex flex-column gap-3">
                                            {sociosBajas.map(socio => (
                                                <Card key={socio.id} className="border shadow-sm" style={{ borderRadius: '0.75rem', borderLeft: '4px solid #DC2626' }}>
                                                    <CardBody className="p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <span className="fw-bold text-muted">
                                                                C.I. {parseInt(socio.cedula).toLocaleString('es-UY')}-{socio.digito_verificador}
                                                            </span>
                                                            <Badge color="danger" pill style={{ fontSize: '0.7rem' }}>
                                                                Baja
                                                            </Badge>
                                                        </div>
                                                        <h6 className="fw-bold text-dark mb-2">
                                                            {socio.nombre}
                                                        </h6>
                                                        <div className="mb-2">
                                                            <small className="text-muted d-block">
                                                                <strong>Método previo:</strong> {socio.metodo_pago === 'haberes' ? 'Descuento Jefatura' : 'Pago por fuera'}
                                                            </small>
                                                            <small className="text-muted d-block">
                                                                <strong>Fecha:</strong> {formatFechaBaja(socio.fecha_baja)}
                                                            </small>
                                                        </div>
                                                        <div className="mb-3">
                                                            <Badge 
                                                                pill 
                                                                style={{ 
                                                                    backgroundColor: '#FEE2E2', 
                                                                    color: '#991B1B', 
                                                                    border: '1px solid #FECACA',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                Motivo: {socio.motivo_baja || 'Baja solicitada'}
                                                            </Badge>
                                                        </div>
                                                        <div className="d-flex justify-content-end pt-2 border-top">
                                                            <Button 
                                                                color="success" 
                                                                outline 
                                                                size="sm" 
                                                                className="fw-bold"
                                                                onClick={() => handleReactivarSocio(socio)}
                                                            >
                                                                Reactivar Socio
                                                            </Button>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardBody>
                    </Card>
                )}
            </Container>

            {/* Modal Crear / Editar Socio */}
            <Modal isOpen={modalSocio} toggle={() => setModalSocio(!modalSocio)} centered size="lg">
                <ModalHeader toggle={() => setModalSocio(!modalSocio)}>
                    {editingSocio ? 'Editar Datos del Socio' : 'Registrar Nuevo Socio'}
                </ModalHeader>
                <Form onSubmit={handleSocioSubmit}>
                    <ModalBody>
                        <Row>
                            <Col md={8}>
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
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="tanda">Tanda Escuela Policial</Label>
                                    <Input 
                                        id="tanda" 
                                        type="select"
                                        value={formSocio.tanda}
                                        onChange={(e) => setFormSocio({...formSocio, tanda: e.target.value as '' | 'tanda_1' | 'tanda_2'})}
                                    >
                                        <option value="">Sin Tanda (Socio General)</option>
                                        <option value="tanda_1">Escuela Policial - Tanda 1</option>
                                        <option value="tanda_2">Escuela Policial - Tanda 2</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="cedula">Cédula (sin dígito) *</Label>
                                    <Input 
                                        id="cedula" 
                                        type="number"
                                        value={formSocio.cedula}
                                        onChange={(e) => setFormSocio({...formSocio, cedula: e.target.value})}
                                        placeholder="Ej: 1870773" 
                                        disabled={!!editingSocio}
                                        required 
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <Label for="dv">Dígito *</Label>
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
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="metodo">Método de Cobro / Pago *</Label>
                                    <Input 
                                        id="metodo" 
                                        type="select"
                                        value={formSocio.metodo_pago}
                                        onChange={(e) => setFormSocio({...formSocio, metodo_pago: e.target.value as 'haberes' | 'externo'})}
                                        required
                                    >
                                        <option value="haberes">Descuento por Haberes (Jefatura 514)</option>
                                        <option value="externo">Pago Externo (Caja / Cobrador)</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="telefono">Teléfono de Contacto</Label>
                                    <Input 
                                        id="telefono" 
                                        value={formSocio.telefono}
                                        onChange={(e) => setFormSocio({...formSocio, telefono: e.target.value})}
                                        placeholder="Ej: 099 123 456" 
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={5}>
                                <FormGroup>
                                    <Label for="direccion">Domicilio / Dirección</Label>
                                    <Input 
                                        id="direccion" 
                                        value={formSocio.direccion}
                                        onChange={(e) => setFormSocio({...formSocio, direccion: e.target.value})}
                                        placeholder="Ej: 25 de Mayo 432" 
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="localidad">Localidad</Label>
                                    <Input 
                                        id="localidad" 
                                        value={formSocio.localidad}
                                        onChange={(e) => setFormSocio({...formSocio, localidad: e.target.value})}
                                        placeholder="Ej: San José" 
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="email">Correo Electrónico</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={formSocio.email}
                                onChange={(e) => setFormSocio({...formSocio, email: e.target.value})}
                                placeholder="Ej: socio@correo.com" 
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setModalSocio(false)}>Cancelar</Button>
                        <Button color="primary" type="submit">Guardar Socio</Button>
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Modal Confirmar Baja de Socio */}
            <Modal isOpen={modalBaja} toggle={() => !bajando && setModalBaja(!modalBaja)} centered>
                <ModalHeader toggle={() => !bajando && setModalBaja(!modalBaja)} className="border-bottom-0 pb-0 text-danger">
                    <span className="fw-bold">⚠️ Confirmar Baja de Socio</span>
                </ModalHeader>
                <Form onSubmit={handleConfirmarBajaSubmit}>
                    <ModalBody>
                        {socioABajar && (
                            <div className="p-3 mb-3 rounded bg-light border">
                                <div className="fw-bold text-dark fs-6">{socioABajar.nombre}</div>
                                <div className="text-muted small">
                                    Cédula: <strong>{parseInt(socioABajar.cedula).toLocaleString('es-UY')}-{socioABajar.digito_verificador}</strong> &bull; Método: <strong>{socioABajar.metodo_pago === 'haberes' ? 'Descuento Jefatura' : 'Pago por fuera'}</strong>
                                </div>
                            </div>
                        )}

                        {socioABajar?.metodo_pago === 'haberes' && (
                            <Alert color="warning" className="small border-0 mb-3" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
                                ℹ️ <strong>Importante:</strong> Este socio tiene retención activa por Jefatura (Haberes). Al confirmar la baja, será <strong>removido automáticamente</strong> de las liquidaciones del Convenio 514.
                            </Alert>
                        )}

                        <FormGroup className="mb-3">
                            <Label for="motivoSelect" className="fw-bold small">Motivo de la Baja *</Label>
                            <Input 
                                id="motivoSelect" 
                                type="select"
                                value={motivoBaja}
                                onChange={(e) => setMotivoBaja(e.target.value)}
                                disabled={bajando}
                                required
                            >
                                <option value="Solicitud de baja">Solicitud de baja</option>
                                <option value="Renuncia voluntaria">Renuncia voluntaria</option>
                                <option value="Socio duplicado">Socio duplicado</option>
                                <option value="Pase a retiro">Pase a retiro</option>
                                <option value="Fallecimiento">Fallecimiento</option>
                                <option value="Traslado de dependencia">Traslado de dependencia</option>
                                <option value="Incumplimiento de pago">Incumplimiento de pago</option>
                                <option value="Otro motivo">Otro motivo</option>
                            </Input>
                        </FormGroup>

                        <FormGroup className="mb-2">
                            <Label for="observacionesText" className="fw-bold small">Observaciones adicionales (opcional)</Label>
                            <Input 
                                id="observacionesText" 
                                type="textarea"
                                rows={2}
                                value={observacionesBaja}
                                onChange={(e) => setObservacionesBaja(e.target.value)}
                                placeholder="Detalles u observaciones del trámite de egreso..."
                                disabled={bajando}
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter className="border-top-0 pt-0">
                        <Button color="secondary" outline onClick={() => setModalBaja(false)} disabled={bajando}>
                            Cancelar
                        </Button>
                        <Button color="danger" type="submit" className="fw-bold" disabled={bajando}>
                            {bajando ? 'Procesando baja...' : 'Confirmar Baja'}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>

            {/* Modal Interactivo: Pase a Jefatura por Tanda */}
            <Modal isOpen={modalMigrar} toggle={() => !migrando && setModalMigrar(!modalMigrar)} centered size="md">
                <ModalHeader toggle={() => !migrando && setModalMigrar(!modalMigrar)} className="border-bottom-0 pb-0">
                    <span className="fw-bold">🚀 Pase Masivo a Jefatura de Policía</span>
                </ModalHeader>
                <Form onSubmit={handleMigrarTandaSubmit}>
                    <ModalBody>
                        <p className="text-muted small">
                            Este proceso migra a los aspirantes de la Escuela Policial que se encuentran abonando de manera particular (&quot;Pago por fuera&quot;) hacia el sistema de descuento oficial por haberes en la Jefatura de Policía de San José (Convenio 514).
                        </p>

                        <FormGroup className="mb-3">
                            <Label for="tandaMigrar" className="fw-bold">Seleccionar Tanda de la Escuela a Migrar:</Label>
                            <Input 
                                id="tandaMigrar" 
                                type="select"
                                value={selectedTandaMigrar}
                                onChange={(e) => setSelectedTandaMigrar(e.target.value as 'tanda_1' | 'tanda_2')}
                                disabled={migrando}
                            >
                                <option value="tanda_1">
                                    Escuela Policial - Tanda 1 ({pendientesT1} socios pendientes de pase)
                                </option>
                                <option value="tanda_2">
                                    Escuela Policial - Tanda 2 ({pendientesT2} socios pendientes de pase)
                                </option>
                            </Input>
                        </FormGroup>

                        <Alert color="info" className="border-0 shadow-sm mb-3" style={{ backgroundColor: '#F0F9FF', color: '#0369A1' }}>
                            <div className="fw-bold mb-1">ℹ️ Efectos de esta operación:</div>
                            <ul className="mb-0 ps-3 small">
                                <li>
                                    Todos los socios activos de la <strong>{selectedTandaMigrar === 'tanda_1' ? 'Tanda 1' : 'Tanda 2'}</strong> pasarán de <em>&apos;Pago por fuera&apos;</em> a <em>&apos;Descuento Jefatura (Haberes)&apos;</em>.
                                </li>
                                <li>
                                    Se darán de alta automáticamente en el presupuesto mensual activo del <strong>Convenio 514</strong> con la cuota social estándar ($140).
                                </li>
                                <li>
                                    Ya no requerirán cobro domiciliario en el rutero del cobrador.
                                </li>
                            </ul>
                        </Alert>

                        <FormGroup check className="p-3 rounded bg-light border">
                            <Label check className="fw-semibold small text-dark d-flex align-items-center">
                                <Input 
                                    type="checkbox" 
                                    checked={confirmMigrar} 
                                    onChange={(e) => setConfirmMigrar(e.target.checked)}
                                    className="me-2"
                                    disabled={migrando}
                                />
                                Confirmo que la Jefatura de Policía autorizó la presupuestación de la {selectedTandaMigrar === 'tanda_1' ? 'Tanda 1' : 'Tanda 2'} y deseo ejecutar el pase.
                            </Label>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter className="border-top-0 pt-0">
                        <Button color="secondary" outline onClick={() => setModalMigrar(false)} disabled={migrando}>
                            Cancelar
                        </Button>
                        <Button 
                            color="success" 
                            type="submit" 
                            className="fw-bold" 
                            disabled={!confirmMigrar || migrando}
                        >
                            {migrando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Migrando socios...
                                </>
                            ) : (
                                '🚀 Ejecutar Pase a Jefatura'
                            )}
                        </Button>
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
                            Sube el archivo Excel consolidado de socios (`Socios_Circulo_Policial_2026.xlsx`) para cargar o actualizar de forma masiva los socios del Círculo. Los socios se clasificarán automáticamente como <strong>Descuento Jefatura</strong> o <strong>Pago por Fuera</strong> según su columna &quot;Lista de Origen&quot;.
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

export default function AdminSocios() {
    return (
        <Suspense fallback={<div className="p-5 text-center text-muted">Cargando gestión de socios...</div>}>
            <AdminSociosContent />
        </Suspense>
    );
}
