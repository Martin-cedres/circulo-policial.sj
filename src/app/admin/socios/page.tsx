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

interface SolicitudWeb {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    telefono: string;
    direccion?: string | null;
    localidad?: string | null;
    metodo_pago?: string | null;
    autoriza_descuento?: boolean;
    situacion: string;
    pertenencia_presupuestal?: string | null;
    jerarquia?: string | null;
    unidad?: string | null;
    mensaje?: string | null;
    aprobado: boolean;
    created_at: string;
    socio_existente?: {
        id: number;
        nombre: string;
        estado: string;
        metodo_pago: string;
        subcategoria?: string | null;
    } | null;
}

function AdminSociosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Pestaña activa ('activos' | 'bajas' | 'solicitudes')
    const initialTab = searchParams.get('tab') === 'solicitudes' 
        ? 'solicitudes' 
        : (searchParams.get('tab') === 'bajas' || searchParams.get('estado') === 'baja') 
            ? 'bajas' 
            : 'activos';
    const [activeTab, setActiveTab] = useState<'activos' | 'bajas' | 'solicitudes'>(initialTab);

    const [socios, setSocios] = useState<Socio[]>([]);
    const [solicitudes, setSolicitudes] = useState<SolicitudWeb[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
    const [filtroSolicitudes, setFiltroSolicitudes] = useState<'pendientes' | 'aprobados' | 'todos'>('pendientes');
    const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false);
    const [procesandoSolicitudId, setProcesandoSolicitudId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [metodoFilter, setMetodoFilter] = useState(''); // 'haberes', 'externo', ''
    const [carnetFilter, setCarnetFilter] = useState(''); // 'pendiente', 'entregado', ''
    const [tandaFilter, setTandaFilter] = useState(''); // '', 'tanda_1', 'tanda_2', 'general'
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info', message: string } | null>(null);

    // Totales globales permanentes para evitar confusión al aplicar filtros
    const [globalStats, setGlobalStats] = useState({ 
        totalActivos: 220, 
        totalBajas: 4, 
        totalGlobal: 224,
        desglose: {
            haberes: 99,
            transferencia: 0,
            domicilio: 2,
            alumnosEdp: 28,
            sinClasificar: 91,
            externosTotal: 121,
        }
    });

    // Estado modal Configurar y Aprobar Solicitud
    const [modalConfigurar, setModalConfigurar] = useState(false);
    const [configSolicitud, setConfigSolicitud] = useState({
        id: 0,
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        email: '',
        direccion: '',
        localidad: 'San José de Mayo',
        metodo_pago: 'transferencia',
        situacion: '',
        enviarEmail: true,
        yaExiste: false,
        socioExistenteId: null as number | null,
        socioExistenteNombre: '',
    });

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
                if (data.totalActivos !== undefined) {
                    setGlobalStats({
                        totalActivos: data.totalActivos,
                        totalBajas: data.totalBajas,
                        totalGlobal: data.totalGlobal,
                        desglose: data.desglose || {
                            haberes: 99,
                            transferencia: 0,
                            domicilio: 2,
                            alumnosEdp: 28,
                            sinClasificar: 91,
                            externosTotal: 121,
                        }
                    });
                }
            } else {
                showMsg('danger', data.error || 'Error al cargar socios');
            }
        } catch {
            showMsg('danger', 'Error de red al cargar socios');
        } finally {
            setLoading(false);
        }
    }, [search, metodoFilter, carnetFilter, tandaFilter]);

    const fetchSolicitudes = useCallback(async (filtro = filtroSolicitudes) => {
        setLoadingSolicitudes(true);
        try {
            const res = await fetch(`/api/admin/socios/solicitudes?filtro=${filtro}`);
            const data = await res.json();
            if (data.success) {
                setSolicitudes(data.solicitudes);
            }
        } catch {
            console.error('Error al cargar solicitudes');
        } finally {
            setLoadingSolicitudes(false);
        }
    }, [filtroSolicitudes]);

    useEffect(() => {
        // Verificar token
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }
        fetchSocios();
        fetchSolicitudes();
    }, [router, fetchSocios, fetchSolicitudes]);

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const estadoParam = searchParams.get('estado');
        if (tabParam === 'bajas' || estadoParam === 'baja') {
            setActiveTab('bajas');
        } else if (tabParam === 'solicitudes') {
            setActiveTab('solicitudes');
        }
    }, [searchParams]);

    const limpiarFiltros = () => {
        setSearch('');
        setMetodoFilter('');
        setCarnetFilter('');
        setTandaFilter('');
        fetchSocios('', '', '', '');
    };

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

    const handleCambiarTab = (tab: 'activos' | 'bajas' | 'solicitudes') => {
        setActiveTab(tab);
        if (tab === 'bajas') {
            router.replace('/admin/socios?tab=bajas');
        } else if (tab === 'solicitudes') {
            router.replace('/admin/socios?tab=solicitudes');
        } else {
            router.replace('/admin/socios');
        }
    };

    const handleAbrirConfigurar = (sol: SolicitudWeb) => {
        let metodoInicial = sol.metodo_pago || 'transferencia';
        if (sol.situacion === 'civil' || sol.situacion === 'retiro' || sol.situacion === 'policia_retirado') {
            if (metodoInicial === 'haberes') metodoInicial = 'transferencia';
        }

        setConfigSolicitud({
            id: sol.id,
            nombre: sol.nombre || '',
            apellido: sol.apellido || '',
            cedula: sol.cedula || '',
            telefono: sol.telefono || '',
            email: sol.email || '',
            direccion: sol.direccion || '',
            localidad: sol.localidad || 'San José de Mayo',
            metodo_pago: metodoInicial,
            situacion: sol.situacion || '',
            enviarEmail: true,
            yaExiste: !!sol.socio_existente,
            socioExistenteId: sol.socio_existente?.id || null,
            socioExistenteNombre: sol.socio_existente?.nombre || '',
        });
        setModalConfigurar(true);
    };

    const handleGuardarConfigurarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcesandoSolicitudId(configSolicitud.id);
        try {
            const res = await fetch('/api/admin/socios/solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: configSolicitud.id,
                    action: 'configurar_aprobar',
                    nombre: configSolicitud.nombre,
                    apellido: configSolicitud.apellido,
                    cedula: configSolicitud.cedula,
                    telefono: configSolicitud.telefono,
                    email: configSolicitud.email,
                    direccion: configSolicitud.direccion,
                    localidad: configSolicitud.localidad,
                    metodo_pago: configSolicitud.metodo_pago,
                    enviarEmail: configSolicitud.enviarEmail,
                })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', data.message || `Socio configurado y procesado con éxito.`);
                setModalConfigurar(false);
                fetchSolicitudes();
                fetchSocios();
            } else {
                showMsg('danger', data.error || 'Error al procesar solicitud');
            }
        } catch {
            showMsg('danger', 'Error de red al procesar solicitud');
        } finally {
            setProcesandoSolicitudId(null);
        }
    };

    const handleArchivarSolicitud = async (sol: SolicitudWeb) => {
        if (!window.confirm(`¿Confirmas archivar la solicitud de ${sol.nombre} ${sol.apellido}? Se marcará como procesada sin modificar el padrón.`)) return;
        setProcesandoSolicitudId(sol.id);
        try {
            const res = await fetch('/api/admin/socios/solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sol.id, action: 'archivar' })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('info', `📁 ${data.message}`);
                fetchSolicitudes();
            } else {
                showMsg('danger', data.error || 'Error al archivar solicitud');
            }
        } catch {
            showMsg('danger', 'Error de red al archivar solicitud');
        } finally {
            setProcesandoSolicitudId(null);
        }
    };

    const handleEnviarRecordatoriosBROU = async () => {
        if (!window.confirm('¿Confirmas el envío de recordatorios de cuota mensual ($140) con los datos del BROU a todos los socios activos que abonan por transferencia bancaria?')) return;
        setEnviandoRecordatorios(true);
        try {
            const res = await fetch('/api/admin/socios/recordatorio-cuotas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', `📧 ${data.message}`);
            } else {
                showMsg('danger', data.error || 'Error al enviar recordatorios');
            }
        } catch {
            showMsg('danger', 'Error de red al conectar con el servidor de correos');
        } finally {
            setEnviandoRecordatorios(false);
        }
    };

    const handleEnviarRecordatorioIndividual = async (socioId: number, nombre: string, email: string | null | undefined) => {
        if (!email) {
            showMsg('warning', 'Este socio no tiene un correo electrónico registrado.');
            return;
        }
        if (!window.confirm(`¿Confirmas enviar el recordatorio mensual de cuota ($140) con los datos de transferencia BROU a ${nombre} (${email})?`)) return;

        setEnviandoRecordatorios(true);
        try {
            const res = await fetch('/api/admin/socios/recordatorio-cuotas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socioId })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', `📧 Recordatorio BROU ($140) enviado con éxito a ${nombre} (${email}).`);
            } else {
                showMsg('danger', data.error || 'Error al enviar recordatorio.');
            }
        } catch {
            showMsg('danger', 'Error de red al conectar con el servidor de correo.');
        } finally {
            setEnviandoRecordatorios(false);
        }
    };

    const handleAprobarSolicitud = async (sol: SolicitudWeb) => {
        setProcesandoSolicitudId(sol.id);
        try {
            const res = await fetch('/api/admin/socios/solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sol.id, action: 'aprobar' })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', data.message || `Socio ${sol.nombre} ${sol.apellido} aprobado con éxito.`);
                fetchSolicitudes();
                fetchSocios();
            } else {
                showMsg('danger', data.error || 'Error al aprobar solicitud');
            }
        } catch {
            showMsg('danger', 'Error de red al aprobar solicitud');
        } finally {
            setProcesandoSolicitudId(null);
        }
    };

    const handleRechazarSolicitud = async (sol: SolicitudWeb) => {
        if (!window.confirm(`¿Seguro que deseas descartar la solicitud de ${sol.nombre} ${sol.apellido}?`)) return;
        setProcesandoSolicitudId(sol.id);
        try {
            const res = await fetch('/api/admin/socios/solicitudes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sol.id, action: 'rechazar' })
            });
            const data = await res.json();
            if (data.success) {
                showMsg('warning', `Solicitud de ${sol.nombre} ${sol.apellido} descartada.`);
                fetchSolicitudes();
            } else {
                showMsg('danger', data.error || 'Error al descartar solicitud');
            }
        } catch {
            showMsg('danger', 'Error de red al descartar solicitud');
        } finally {
            setProcesandoSolicitudId(null);
        }
    };

    const handleEnviarRecordatoriosCuotas = async () => {
        if (!window.confirm('¿Confirmas el envío de recordatorios de cuota mensual ($140) con los datos oficiales del BROU a todos los socios activos que abonan por transferencia?')) {
            return;
        }
        setEnviandoRecordatorios(true);
        try {
            const res = await fetch('/api/admin/socios/recordatorio-cuotas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (data.success) {
                showMsg('success', `✉️ ${data.message}`);
            } else {
                showMsg('danger', data.error || 'Error al enviar recordatorios');
            }
        } catch {
            showMsg('danger', 'Error de red al enviar recordatorios');
        } finally {
            setEnviandoRecordatorios(false);
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
    const solicitudesPendientes = solicitudes.filter(s => !s.aprobado);

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
                            {/* Botón Recordatorios de Cuota BROU */}
                            <Button 
                                color="primary" 
                                size="sm" 
                                className="fw-bold text-white shadow-sm text-nowrap"
                                style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                                onClick={handleEnviarRecordatoriosCuotas}
                                disabled={enviandoRecordatorios}
                                title="Enviar recordatorio de cuota mensual ($140) a socios que pagan por transferencia bancaria BROU"
                            >
                                {enviandoRecordatorios ? 'Enviando emails...' : '✉️ Recordatorios BROU ($140)'}
                            </Button>

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

                {/* Conmutador de 3 Pestañas: Activos vs. Solicitudes Web vs. Archivo de Bajas */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div className="btn-group shadow-sm p-1 bg-white rounded-pill border" role="group">
                        <button
                            type="button"
                            className={`btn rounded-pill px-3 px-md-4 py-2 fw-bold ${activeTab === 'activos' ? 'btn-primary text-white shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => handleCambiarTab('activos')}
                        >
                            👥 Socios Activos ({globalStats.totalActivos})
                        </button>
                        <button
                            type="button"
                            className={`btn rounded-pill px-3 px-md-4 py-2 fw-bold position-relative ${activeTab === 'solicitudes' ? 'btn-warning text-dark shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => handleCambiarTab('solicitudes')}
                        >
                            📝 Solicitudes Web
                            {solicitudesPendientes.length > 0 && (
                                <Badge color="danger" pill className="ms-2">
                                    {solicitudesPendientes.length}
                                </Badge>
                            )}
                        </button>
                        <button
                            type="button"
                            className={`btn rounded-pill px-3 px-md-4 py-2 fw-bold ${activeTab === 'bajas' ? 'btn-danger text-white shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => handleCambiarTab('bajas')}
                        >
                            🗄️ Archivo de Bajas ({globalStats.totalBajas})
                        </button>
                    </div>

                    <div className="text-muted small">
                        {(search || metodoFilter || carnetFilter || tandaFilter) ? (
                            <span>
                                Mostrando <strong>{sociosActivos.length}</strong> de <strong>{globalStats.totalActivos}</strong> socios activos 
                                <button type="button" className="btn btn-link btn-sm p-0 ms-2 text-decoration-none" onClick={limpiarFiltros}>
                                    (Ver todos)
                                </button>
                            </span>
                        ) : (
                            <span>Padrón institucional: <strong>{globalStats.totalGlobal}</strong> ({globalStats.totalActivos} activos + {globalStats.totalBajas} bajas)</span>
                        )}
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
                                        <option value="">Cobro: Todos</option>
                                        <option value="haberes">🏛️ Jefatura ({globalStats.desglose?.haberes || 99})</option>
                                        <option value="transferencia">💳 Transferencia BROU ({globalStats.desglose?.transferencia || 0})</option>
                                        <option value="cobrador">🛵 Cobro Domicilio ({globalStats.desglose?.domicilio || 0})</option>
                                        <option value="alumno">👮 Alumnos Cobro EDP ({globalStats.desglose?.alumnosEdp || 28})</option>
                                        <option value="sin_clasificar">⚠️ Sin Clasificar ({globalStats.desglose?.sinClasificar || 0})</option>
                                        <option value="externo">💵 Pagos Externos ({globalStats.desglose?.externosTotal || 121})</option>
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

                            {/* Píldoras de filtrado directo por modalidad */}
                            <div className="d-flex flex-wrap gap-2 mt-2 pt-2 border-top align-items-center">
                                <small className="text-muted fw-bold me-1">Modalidad de cobro:</small>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${metodoFilter === '' ? 'btn-dark text-white' : 'btn-light border text-muted'}`}
                                    onClick={() => { setMetodoFilter(''); fetchSocios(search, '', carnetFilter, tandaFilter); }}
                                >
                                    Todos ({globalStats.totalActivos})
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${metodoFilter === 'haberes' ? 'btn-primary text-white shadow-sm' : 'btn-light border text-primary'}`}
                                    onClick={() => { setMetodoFilter('haberes'); fetchSocios(search, 'haberes', carnetFilter, tandaFilter); }}
                                >
                                    🏛️ Jefatura ({globalStats.desglose?.haberes || 99})
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${metodoFilter === 'transferencia' ? 'btn-info text-white shadow-sm' : 'btn-light border text-info'}`}
                                    onClick={() => { setMetodoFilter('transferencia'); fetchSocios(search, 'transferencia', carnetFilter, tandaFilter); }}
                                >
                                    💳 Transferencia BROU ({globalStats.desglose?.transferencia || 0})
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${metodoFilter === 'cobrador' ? 'btn-warning text-dark shadow-sm' : 'btn-light border text-dark'}`}
                                    onClick={() => { setMetodoFilter('cobrador'); fetchSocios(search, 'cobrador', carnetFilter, tandaFilter); }}
                                >
                                    🛵 Cobro Domicilio ({globalStats.desglose?.domicilio || 0})
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${metodoFilter === 'alumno' ? 'btn-secondary text-white shadow-sm' : 'btn-light border text-secondary'}`}
                                    onClick={() => { setMetodoFilter('alumno'); fetchSocios(search, 'alumno', carnetFilter, tandaFilter); }}
                                >
                                    👮 Alumnos Cobro EDP ({globalStats.desglose?.alumnosEdp || 28})
                                </button>
                                {(globalStats.desglose?.sinClasificar || 0) > 0 && (
                                    <button 
                                        type="button" 
                                        className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${metodoFilter === 'sin_clasificar' ? 'btn-danger text-white shadow-sm' : 'btn-outline-danger'}`}
                                        onClick={() => { setMetodoFilter('sin_clasificar'); fetchSocios(search, 'sin_clasificar', carnetFilter, tandaFilter); }}
                                        title="Socios con pago por fuera que aún no se han asignado a Domicilio o Transferencia"
                                    >
                                        ⚠️ Sin Clasificar ({globalStats.desglose?.sinClasificar})
                                    </button>
                                )}
                            </div>

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
                                    <Button 
                                        color="success" 
                                        size="sm" 
                                        className="fw-bold text-white shadow-sm" 
                                        onClick={handleEnviarRecordatoriosBROU}
                                        disabled={enviandoRecordatorios}
                                        title="Enviar recordatorio mensual con datos de transferencia BROU a socios activos de esa modalidad"
                                    >
                                        {enviandoRecordatorios ? 'Enviando emails...' : '📧 Recordatorios BROU ($140)'}
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
                                                                    🏛️ Jefatura (514)
                                                                </Badge>
                                                            ) : socio.subcategoria === 'particular_transferencia' || socio.subcategoria === 'transferencia' ? (
                                                                <Badge color="info" pill style={{ padding: '0.35rem 0.7rem' }}>
                                                                    💳 Transferencia BROU ($140)
                                                                </Badge>
                                                            ) : socio.subcategoria === 'particular_domicilio' || socio.subcategoria === 'cobrador' ? (
                                                                <Badge color="warning" pill className="text-dark" style={{ padding: '0.35rem 0.7rem', backgroundColor: '#FFF3CD', border: '1px solid #FFEBA8' }}>
                                                                    🛵 Cobro Domicilio ($140)
                                                                </Badge>
                                                            ) : socio.subcategoria === 'escuela_policia' || socio.tanda ? (
                                                                <Badge 
                                                                    pill 
                                                                    style={{ 
                                                                        padding: '0.35rem 0.7rem', 
                                                                        backgroundColor: '#F3E8FF', 
                                                                        color: '#6B21A8', 
                                                                        border: '1px solid #DDD6FE' 
                                                                    }}
                                                                >
                                                                    👮 Alumnos Cobro EDP ($140)
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="secondary" outline pill style={{ padding: '0.35rem 0.7rem' }}>
                                                                    ⚠️ Por Fuera (Sin clasificar)
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
                                                                <a 
                                                                    href={`/api/admin/socios/${socio.id}/carnet`}
                                                                    download={`carnet-${socio.cedula}.jpg`}
                                                                    className="btn btn-outline-dark btn-sm px-2 py-1 text-nowrap fw-bold"
                                                                    title="Descargar carnet oficial JPG (1024x657) listo para Photoshop o impresión"
                                                                >
                                                                    🪪 Carnet JPG
                                                                </a>
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
                                                                {socio.email && (
                                                                    <Button 
                                                                        color="info" 
                                                                        outline 
                                                                        size="sm" 
                                                                        className="px-2 py-1 text-nowrap"
                                                                        onClick={() => handleEnviarRecordatorioIndividual(socio.id, socio.nombre, socio.email)}
                                                                        title={`Enviar recordatorio BROU ($140) a ${socio.email}`}
                                                                        disabled={enviandoRecordatorios}
                                                                    >
                                                                        📧
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
                                                                🏛️ Jefatura (514)
                                                            </Badge>
                                                        ) : socio.subcategoria === 'particular_transferencia' || socio.subcategoria === 'transferencia' ? (
                                                            <Badge color="info" pill style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                                💳 Transferencia BROU ($140)
                                                            </Badge>
                                                        ) : socio.subcategoria === 'particular_domicilio' || socio.subcategoria === 'cobrador' ? (
                                                            <Badge color="warning" pill className="text-dark" style={{ padding: '0.3rem 0.6rem', backgroundColor: '#FFF3CD', border: '1px solid #FFEBA8', fontSize: '0.75rem' }}>
                                                                🛵 Cobro Domicilio ($140)
                                                            </Badge>
                                                        ) : socio.subcategoria === 'escuela_policia' || socio.tanda ? (
                                                            <Badge pill style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#F3E8FF', color: '#6B21A8', border: '1px solid #DDD6FE' }}>
                                                                👮 Alumnos Cobro EDP ($140)
                                                            </Badge>
                                                        ) : (
                                                            <Badge color="secondary" outline pill style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                                ⚠️ Por Fuera (Sin clasificar)
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
                                                        <a 
                                                            href={`/api/admin/socios/${socio.id}/carnet`}
                                                            download={`carnet-${socio.cedula}.jpg`}
                                                            className="btn btn-outline-dark btn-sm fw-bold"
                                                            title="Descargar carnet oficial JPG"
                                                        >
                                                            🪪 Carnet JPG
                                                        </a>
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
                                                        {socio.email && (
                                                            <Button 
                                                                color="info" 
                                                                outline 
                                                                size="sm" 
                                                                className="fw-bold"
                                                                onClick={() => handleEnviarRecordatorioIndividual(socio.id, socio.nombre, socio.email)}
                                                                disabled={enviandoRecordatorios}
                                                                title={`Enviar recordatorio BROU a ${socio.email}`}
                                                            >
                                                                📧 Recordatorio
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
                ) : activeTab === 'solicitudes' ? (
                    /* TAB 3: SOLICITUDES DE ASOCIACIÓN WEB */
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                        <div className="p-3 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <h2 className="h6 fw-bold mb-1" style={{ color: '#002B49' }}>
                                    📝 Solicitudes de Ingreso Web ({solicitudes.length} registros)
                                </h2>
                                <p className="small text-muted mb-0">
                                    Revisá y aprobá con 1 clic: el socio pasa al padrón activo, su carnet físico queda listo para descargar en JPG y recibe el correo oficial con sus datos de pago.
                                </p>
                            </div>
                            <div className="d-flex gap-2 align-items-center flex-wrap">
                                <div className="btn-group btn-group-sm bg-white border rounded">
                                    <button 
                                        type="button"
                                        className={`btn btn-sm ${filtroSolicitudes === 'pendientes' ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                                        onClick={() => { setFiltroSolicitudes('pendientes'); fetchSolicitudes('pendientes'); }}
                                    >
                                        Pendientes ({solicitudesPendientes.length})
                                    </button>
                                    <button 
                                        type="button"
                                        className={`btn btn-sm ${filtroSolicitudes === 'aprobados' ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                                        onClick={() => { setFiltroSolicitudes('aprobados'); fetchSolicitudes('aprobados'); }}
                                    >
                                        Aprobadas
                                    </button>
                                    <button 
                                        type="button"
                                        className={`btn btn-sm ${filtroSolicitudes === 'todos' ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                                        onClick={() => { setFiltroSolicitudes('todos'); fetchSolicitudes('todos'); }}
                                    >
                                        Todas
                                    </button>
                                </div>
                                <Button 
                                    color="outline-secondary" 
                                    size="sm" 
                                    onClick={() => fetchSolicitudes()}
                                    title="Actualizar listado de solicitudes"
                                >
                                    🔄 Actualizar
                                </Button>
                            </div>
                        </div>
                        <CardBody className="p-0">
                            {loadingSolicitudes ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando solicitudes web...</span>
                                    </div>
                                </div>
                            ) : solicitudes.length === 0 ? (
                                <div className="text-center p-5 text-muted">
                                    {filtroSolicitudes === 'pendientes' 
                                        ? '🎉 No hay solicitudes pendientes de aprobación en este momento.' 
                                        : 'No hay solicitudes para mostrar con este filtro.'}
                                </div>
                            ) : (
                                <>
                                    {/* TABLA ESCRITORIO */}
                                    <div className="d-none d-lg-block">
                                        <Table responsive hover className="align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-3" style={{ width: '100px' }}>Fecha</th>
                                                    <th>Postulante</th>
                                                    <th>Cédula</th>
                                                    <th>Contacto</th>
                                                    <th>Forma de Pago</th>
                                                    <th>Situación / Datos</th>
                                                    <th className="text-end pe-3" style={{ width: '190px' }}>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {solicitudes.map(sol => (
                                                    <tr key={sol.id} style={{ backgroundColor: sol.aprobado ? '#FAFAFA' : '#FFFFFF' }}>
                                                        <td className="ps-3 text-muted small" style={{ whiteSpace: 'nowrap' }}>
                                                            {new Date(sol.created_at).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span className="fw-bold text-dark">{sol.nombre} {sol.apellido}</span>
                                                                {sol.socio_existente && (
                                                                    <Badge 
                                                                        pill 
                                                                        style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontSize: '0.72rem' }}
                                                                        title={`Ya figura en el padrón como #${sol.socio_existente.id}`}
                                                                    >
                                                                        ⚠️ En Padrón (#{sol.socio_existente.id})
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {sol.localidad && (
                                                                <small className="text-muted d-block">📍 {sol.localidad}</small>
                                                            )}
                                                        </td>
                                                        <td className="fw-bold text-dark" style={{ whiteSpace: 'nowrap' }}>
                                                            {sol.cedula}
                                                        </td>
                                                        <td>
                                                            <div className="small">📞 {sol.telefono}</div>
                                                            <div className="small text-muted">{sol.email}</div>
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {sol.metodo_pago === 'transferencia' ? (
                                                                <Badge color="info" pill style={{ padding: '0.35rem 0.65rem' }}>
                                                                    💳 Transferencia BROU ($140)
                                                                </Badge>
                                                            ) : sol.metodo_pago === 'cobrador' ? (
                                                                <Badge color="warning" pill className="text-dark" style={{ padding: '0.35rem 0.65rem' }}>
                                                                    🛵 Cobro Domicilio ($140)
                                                                </Badge>
                                                            ) : sol.metodo_pago === 'alumno' ? (
                                                                <Badge color="secondary" pill style={{ padding: '0.35rem 0.65rem' }}>
                                                                    🎓 Alumno Escuela Policial
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="primary" pill style={{ padding: '0.35rem 0.65rem' }}>
                                                                    🏛️ Descuento Sueldo
                                                                </Badge>
                                                            )}
                                                            {sol.autoriza_descuento && (
                                                                <div className="text-success small fw-bold mt-1">✓ Autorizó retención</div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="small fw-semibold">{sol.situacion}</div>
                                                            {sol.jerarquia && <div className="small text-muted">{sol.jerarquia} {sol.unidad ? `- ${sol.unidad}` : ''}</div>}
                                                            {sol.mensaje && <div className="small text-secondary fst-italic text-truncate" style={{ maxWidth: '200px' }} title={sol.mensaje}>&quot;{sol.mensaje}&quot;</div>}
                                                        </td>
                                                        <td className="text-end pe-3" style={{ whiteSpace: 'nowrap' }}>
                                                            {!sol.aprobado ? (
                                                                <div className="d-flex align-items-center justify-content-end gap-1">
                                                                    {sol.socio_existente ? (
                                                                        <>
                                                                            <Button
                                                                                color="warning"
                                                                                size="sm"
                                                                                className="fw-bold px-2 py-1 text-dark"
                                                                                disabled={procesandoSolicitudId === sol.id}
                                                                                onClick={() => handleAbrirConfigurar(sol)}
                                                                                title="Configurar y actualizar ficha del socio en el padrón"
                                                                            >
                                                                                ⚙️ Actualizar
                                                                            </Button>
                                                                            <Button
                                                                                color="secondary"
                                                                                outline
                                                                                size="sm"
                                                                                className="px-2 py-1"
                                                                                disabled={procesandoSolicitudId === sol.id}
                                                                                onClick={() => handleArchivarSolicitud(sol)}
                                                                                title="Archivar solicitud sin duplicar ni modificar el padrón"
                                                                            >
                                                                                📁 Archivar
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Button
                                                                                color="primary"
                                                                                size="sm"
                                                                                className="fw-bold px-2 py-1 text-nowrap"
                                                                                disabled={procesandoSolicitudId === sol.id}
                                                                                onClick={() => handleAbrirConfigurar(sol)}
                                                                                title="Revisar datos, asignar forma de pago y dar de alta"
                                                                            >
                                                                                ⚙️ Configurar y Aprobar
                                                                            </Button>
                                                                            <Button
                                                                                color="danger"
                                                                                outline
                                                                                size="sm"
                                                                                className="px-2 py-1"
                                                                                disabled={procesandoSolicitudId === sol.id}
                                                                                onClick={() => handleRechazarSolicitud(sol)}
                                                                                title="Descartar solicitud"
                                                                            >
                                                                                ✕
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <Badge color="success" pill style={{ padding: '0.4rem 0.8rem' }}>
                                                                    ✓ Procesado
                                                                </Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* VISTA MÓVIL */}
                                    <div className="d-lg-none p-3 bg-light">
                                        <div className="d-flex flex-column gap-3">
                                            {solicitudes.map(sol => (
                                                <Card key={sol.id} className="border shadow-sm" style={{ borderRadius: '0.75rem', borderLeft: sol.aprobado ? '4px solid #16A34A' : '4px solid #2563EB' }}>
                                                    <CardBody className="p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <span className="fw-bold text-dark">
                                                                    C.I. {sol.cedula}
                                                                </span>
                                                                {sol.socio_existente && (
                                                                    <Badge pill className="ms-2" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontSize: '0.7rem' }}>
                                                                        ⚠️ En Padrón (#{sol.socio_existente.id})
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {sol.aprobado ? (
                                                                <Badge color="success" pill>Procesado</Badge>
                                                            ) : (
                                                                <Badge color="warning" pill className="text-dark">Pendiente</Badge>
                                                            )}
                                                        </div>
                                                        <h6 className="fw-bold text-dark mb-1">
                                                            {sol.nombre} {sol.apellido}
                                                        </h6>
                                                        <div className="mb-2">
                                                            {sol.metodo_pago === 'transferencia' ? (
                                                                <Badge color="info" pill>💳 Transferencia BROU ($140)</Badge>
                                                            ) : sol.metodo_pago === 'cobrador' ? (
                                                                <Badge color="warning" pill className="text-dark">🛵 Cobro Domicilio ($140)</Badge>
                                                            ) : sol.metodo_pago === 'alumno' ? (
                                                                <Badge color="secondary" pill>🎓 Alumno Escuela</Badge>
                                                            ) : (
                                                                <Badge color="primary" pill>🏛️ Descuento Sueldo</Badge>
                                                            )}
                                                        </div>
                                                        <div className="small text-muted mb-2">
                                                            <div>📞 <strong>Tel:</strong> {sol.telefono}</div>
                                                            <div>✉️ <strong>Email:</strong> {sol.email}</div>
                                                            {sol.direccion && <div>📍 <strong>Dir:</strong> {sol.direccion}{sol.localidad ? `, ${sol.localidad}` : ''}</div>}
                                                            <div>👮 <strong>Situación:</strong> {sol.situacion} {sol.jerarquia ? `(${sol.jerarquia})` : ''}</div>
                                                            {sol.mensaje && <div className="mt-1 fst-italic">&quot;{sol.mensaje}&quot;</div>}
                                                        </div>
                                                        {!sol.aprobado && (
                                                            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                                                                {sol.socio_existente ? (
                                                                    <>
                                                                        <Button
                                                                            color="secondary"
                                                                            outline
                                                                            size="sm"
                                                                            disabled={procesandoSolicitudId === sol.id}
                                                                            onClick={() => handleArchivarSolicitud(sol)}
                                                                        >
                                                                            📁 Archivar
                                                                        </Button>
                                                                        <Button
                                                                            color="warning"
                                                                            size="sm"
                                                                            className="fw-bold text-dark"
                                                                            disabled={procesandoSolicitudId === sol.id}
                                                                            onClick={() => handleAbrirConfigurar(sol)}
                                                                        >
                                                                            ⚙️ Actualizar Ficha
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            color="danger"
                                                                            outline
                                                                            size="sm"
                                                                            disabled={procesandoSolicitudId === sol.id}
                                                                            onClick={() => handleRechazarSolicitud(sol)}
                                                                        >
                                                                            Descartar
                                                                        </Button>
                                                                        <Button
                                                                            color="primary"
                                                                            size="sm"
                                                                            className="fw-bold"
                                                                            disabled={procesandoSolicitudId === sol.id}
                                                                            onClick={() => handleAbrirConfigurar(sol)}
                                                                        >
                                                                            ⚙️ Configurar y Aprobar
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
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
                            <Col md={8}>
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
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="dv">Dígito Verificador *</Label>
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
                        <Row>
                            <Col md={12}>
                                <FormGroup className="p-3 bg-light rounded border mb-3">
                                    <Label for="modalidad-cobro" className="fw-bold text-dark d-block mb-1">
                                        💳 Método y Modalidad de Cobro *
                                    </Label>
                                    <Input 
                                        id="modalidad-cobro" 
                                        type="select"
                                        value={
                                            formSocio.subcategoria === 'particular_transferencia' || formSocio.subcategoria === 'transferencia' ? 'particular_transferencia' :
                                            formSocio.subcategoria === 'particular_domicilio' || formSocio.subcategoria === 'cobrador' ? 'particular_domicilio' :
                                            formSocio.subcategoria === 'escuela_policia' || formSocio.tanda ? 'escuela_policia' :
                                            formSocio.metodo_pago === 'externo' ? 'particular_transferencia' : 'haberes'
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'haberes') {
                                                setFormSocio({...formSocio, metodo_pago: 'haberes', subcategoria: 'policia_activo'});
                                            } else if (val === 'particular_transferencia') {
                                                setFormSocio({...formSocio, metodo_pago: 'externo', subcategoria: 'particular_transferencia'});
                                            } else if (val === 'particular_domicilio') {
                                                setFormSocio({...formSocio, metodo_pago: 'externo', subcategoria: 'particular_domicilio'});
                                            } else if (val === 'escuela_policia') {
                                                setFormSocio({...formSocio, metodo_pago: 'externo', subcategoria: 'escuela_policia'});
                                            }
                                        }}
                                        className="form-select fw-semibold"
                                        required
                                    >
                                        <option value="haberes">🏛️ Descuento por Haberes (Jefatura de Policía - Código 514)</option>
                                        <option value="particular_transferencia">💳 Pago por Transferencia BROU ($140 - Recordatorio Email)</option>
                                        <option value="particular_domicilio">🛵 Pago a Domicilio ($140 - Cobrador Particular)</option>
                                        <option value="escuela_policia">👮 Alumnos Cobro en EDP (Cobranza Presencial en Escuela por Cobrador)</option>
                                    </Input>
                                    <div className="small mt-2">
                                        {(formSocio.subcategoria === 'particular_transferencia' || formSocio.subcategoria === 'transferencia' || (formSocio.metodo_pago === 'externo' && formSocio.subcategoria !== 'particular_domicilio' && formSocio.subcategoria !== 'escuela_policia')) && (
                                            <span className="text-primary fw-semibold">✓ El socio abonará por BROU (CA 001579728-00001) y recibirá el correo mensual con enlace para adjuntar comprobante.</span>
                                        )}
                                        {(formSocio.subcategoria === 'particular_domicilio' || formSocio.subcategoria === 'cobrador') && (
                                            <span className="text-warning-emphasis fw-semibold">✓ El socio se incluirá automáticamente en la Hoja de Ruta Domiciliaria mensual impresa para el cobrador.</span>
                                        )}
                                        {formSocio.metodo_pago === 'haberes' && (
                                            <span className="text-secondary">✓ Se descuenta mensualmente de los haberes a través del código oficial 514 de Jefatura.</span>
                                        )}
                                        {(formSocio.subcategoria === 'escuela_policia' || formSocio.tanda) && (
                                            <span className="text-info fw-semibold">✓ Alumnos EDP: se les cobra presencialmente en la Escuela de Policía a través del cobrador hasta tanto pasen a retención por Jefatura.</span>
                                        )}
                                    </div>
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
                    <ModalFooter className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {editingSocio && (
                                <>
                                    <a 
                                        href={`/api/admin/socios/${editingSocio.id}/carnet`}
                                        download={`carnet-${editingSocio.cedula}.jpg`}
                                        className="btn btn-outline-dark btn-sm fw-bold"
                                        title="Descargar carnet oficial JPG (1024x657)"
                                    >
                                        🪪 Descargar Carnet JPG
                                    </a>
                                    <Button
                                        type="button"
                                        color="info"
                                        outline
                                        size="sm"
                                        className="fw-bold"
                                        disabled={!formSocio.email || enviandoRecordatorios}
                                        onClick={() => handleEnviarRecordatorioIndividual(editingSocio.id, formSocio.nombre, formSocio.email)}
                                        title={formSocio.email ? `Enviar recordatorio BROU ($140) a ${formSocio.email}` : 'Este socio no tiene un email registrado'}
                                    >
                                        {enviandoRecordatorios ? 'Enviando email...' : '📧 Enviar Recordatorio BROU ($140)'}
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <Button color="secondary" onClick={() => setModalSocio(false)}>Cancelar</Button>
                            <Button color="primary" type="submit">Guardar Socio</Button>
                        </div>
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

            {/* Modal Configurar y Aprobar Solicitud */}
            <Modal isOpen={modalConfigurar} toggle={() => setModalConfigurar(!modalConfigurar)} centered size="lg">
                <ModalHeader toggle={() => setModalConfigurar(!modalConfigurar)}>
                    {configSolicitud.yaExiste ? '⚙️ Actualizar Ficha de Socio Existente' : '⚙️ Configurar y Aprobar Solicitud de Ingreso'}
                </ModalHeader>
                <Form onSubmit={handleGuardarConfigurarSubmit}>
                    <ModalBody>
                        {configSolicitud.yaExiste && (
                            <Alert color="warning" className="d-flex align-items-center gap-2 mb-3 py-2">
                                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                                <div className="small">
                                    Este postulante ya se encuentra en el padrón activo como <strong>{configSolicitud.socioExistenteNombre}</strong> (ID #{configSolicitud.socioExistenteId}). 
                                    Al guardar se actualizarán sus datos de contacto y modalidad de cobro sin crear un registro duplicado.
                                </div>
                            </Alert>
                        )}

                        <Row className="g-2 mb-2">
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="cfg-nombre" className="small fw-bold">Nombre *</Label>
                                    <Input 
                                        id="cfg-nombre"
                                        value={configSolicitud.nombre}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, nombre: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="cfg-apellido" className="small fw-bold">Apellido *</Label>
                                    <Input 
                                        id="cfg-apellido"
                                        value={configSolicitud.apellido}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, apellido: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="g-2 mb-2">
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="cfg-cedula" className="small fw-bold">Cédula de Identidad *</Label>
                                    <Input 
                                        id="cfg-cedula"
                                        value={configSolicitud.cedula}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, cedula: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="cfg-telefono" className="small fw-bold">Teléfono de Contacto *</Label>
                                    <Input 
                                        id="cfg-telefono"
                                        value={configSolicitud.telefono}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, telefono: e.target.value })}
                                        placeholder="Ej: 099 123 456"
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="cfg-email" className="small fw-bold">Correo Electrónico *</Label>
                                    <Input 
                                        id="cfg-email"
                                        type="email"
                                        value={configSolicitud.email}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, email: e.target.value })}
                                        placeholder="Ej: socio@correo.com"
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="g-2 mb-3">
                            <Col md={8}>
                                <FormGroup>
                                    <Label for="cfg-direccion" className="small fw-bold">Dirección / Domicilio</Label>
                                    <Input 
                                        id="cfg-direccion"
                                        value={configSolicitud.direccion}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, direccion: e.target.value })}
                                        placeholder="Ej: 25 de Mayo 432"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="cfg-localidad" className="small fw-bold">Localidad</Label>
                                    <Input 
                                        id="cfg-localidad"
                                        value={configSolicitud.localidad}
                                        onChange={(e) => setConfigSolicitud({ ...configSolicitud, localidad: e.target.value })}
                                        placeholder="Ej: San José de Mayo"
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <FormGroup className="p-3 rounded border bg-light mb-3">
                            <Label for="cfg-metodo" className="fw-bold text-dark d-block mb-1">
                                💳 Forma de Pago Asignada:
                            </Label>
                            <Input 
                                id="cfg-metodo"
                                type="select"
                                value={configSolicitud.metodo_pago}
                                onChange={(e) => setConfigSolicitud({ ...configSolicitud, metodo_pago: e.target.value })}
                                className="form-select fw-semibold"
                            >
                                <option value="transferencia">💳 Transferencia Bancaria BROU ($140 - Recordatorios Activos)</option>
                                <option value="cobrador">🛵 Cobro a Domicilio ($140 - Hoja de Ruta / Rutero A4)</option>
                                <option value="alumno">👮 Alumnos Cobro en EDP (Cobranza en Escuela por Cobrador)</option>
                                <option value="haberes">🏛️ Retención por Haberes (Jefatura de Policía - Código 514)</option>
                            </Input>
                            <div className="small text-muted mt-2">
                                {configSolicitud.metodo_pago === 'transferencia' && (
                                    <span>✓ El socio recibirá recordatorios automáticos mensuales con la cuenta BROU CA 001579728-00001 y enlace para subir comprobante.</span>
                                )}
                                {configSolicitud.metodo_pago === 'cobrador' && (
                                    <span>✓ El socio se incluirá automáticamente en la Hoja de Ruta Domiciliaria mensual para el cobrador.</span>
                                )}
                                {configSolicitud.metodo_pago === 'alumno' && (
                                    <span>✓ Alumnos EDP: se les cobra presencialmente en la Escuela de Policía a través del cobrador hasta que se autorice el pase a retención por Jefatura.</span>
                                )}
                                {configSolicitud.metodo_pago === 'haberes' && (
                                    <span className="text-warning fw-bold">⚠️ Atención: Retención por haberes solo aplica para personal policial en actividad presupuestado en Jefatura. Civiles y retirados deben ir por Transferencia o Cobrador.</span>
                                )}
                            </div>
                        </FormGroup>

                        <FormGroup check className="p-3 rounded bg-white border">
                            <Label check className="fw-semibold small text-dark d-flex align-items-center mb-0">
                                <Input 
                                    type="checkbox" 
                                    checked={configSolicitud.enviarEmail}
                                    onChange={(e) => setConfigSolicitud({ ...configSolicitud, enviarEmail: e.target.checked })}
                                    className="me-2"
                                />
                                Enviar correo institucional de confirmación al socio con las instrucciones correspondientes.
                            </Label>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" outline onClick={() => setModalConfigurar(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            color={configSolicitud.yaExiste ? "warning" : "success"}
                            type="submit" 
                            className="fw-bold"
                            disabled={procesandoSolicitudId === configSolicitud.id}
                        >
                            {procesandoSolicitudId === configSolicitud.id ? (
                                'Guardando...'
                            ) : configSolicitud.yaExiste ? (
                                '💾 Guardar y Actualizar Padrón'
                            ) : (
                                '✓ Aprobar y Dar de Alta en Padrón'
                            )}
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
