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
    const [modalCorreo, setModalCorreo] = useState(false);
    const [selectedSocio, setSelectedSocio] = useState<SocioPresupuesto | null>(null);
    const [newImporte, setNewImporte] = useState(140);

    // Configuración de Correo para Jefatura
    const [correoDestinatario, setCorreoDestinatario] = useState('"SJE" <jpsjose-presupuesto@minterior.gub.uy>');
    const [zimbraUrlBase, setZimbraUrlBase] = useState('https://correo.minterior.gub.uy');
    const [correoAsunto, setCorreoAsunto] = useState('');
    const [correoFirmante, setCorreoFirmante] = useState('Sargento Martín Fernando CEDRÉS MONTAÑO');
    const [correoCargo, setCorreoCargo] = useState('Por la Comisión Directiva — Círculo Policial San José');
    const [correoCopiado, setCorreoCopiado] = useState<string | null>(null);

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
                const mesNom = getNombreMes(data.presupuesto.mes);
                setCorreoAsunto(`Cód. 514 UE 19 - Presupuesto Retenciones ${mesNom} ${data.presupuesto.anio} - Círculo Policial San José`);
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

    const nombreTxtGenerado = presupuesto ? `514 ${String(presupuesto.mes).padStart(2, '0')} ${presupuesto.anio}.txt` : '';
    const nombreExcelGenerado = presupuesto ? `Excel 514 mes ${presupuesto.mes} ${presupuesto.anio}.xlsx` : '';

    const getTextoPlanoCorreo = () => {
        if (!presupuesto) return '';
        const mesNom = getNombreMes(presupuesto.mes);
        const totalSociosCount = filteredSocios.length;
        const total$ = totalImporte.toLocaleString('es-UY');

        return `Estimados,

Junto con saludarles, adjuntamos la documentación correspondiente a la retención del Convenio Cód. 514 (Círculo Policial de San José) para el período ${mesNom} ${presupuesto.anio}.

Resumen de la nómina enviada:
• Período: ${mesNom} ${presupuesto.anio}
• Funcionarios incluidos: ${totalSociosCount} socios activos
• Importe total solicitado: $ ${total$} (a razón de $140 por funcionario)

Archivos adjuntos:
• Planilla Excel: ${nombreExcelGenerado}
• Archivo Plano TXT: ${nombreTxtGenerado}

Quedamos a disposición ante cualquier consulta.

${correoCargo}, saluda atte.

${correoFirmante}
Círculo Policial San José | Convenio Cód. 514`;
    };

    const getHtmlCorreo = () => {
        if (!presupuesto) return '';
        const mesNom = getNombreMes(presupuesto.mes);
        const totalSociosCount = filteredSocios.length;
        const total$ = totalImporte.toLocaleString('es-UY');
        const logoUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/images/logo-circulo-policial.png`
            : 'https://circulopolicialsanjose.com/images/logo-circulo-policial.png';

        return `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; max-width: 650px;">
  <table style="width: 100%; border-bottom: 2px solid #002B49; padding-bottom: 12px; margin-bottom: 16px;">
    <tr>
      <td style="width: 65px; vertical-align: middle;">
        <img src="${logoUrl}" alt="Círculo Policial San José" width="60" height="60" style="display: block; border-radius: 4px;" />
      </td>
      <td style="vertical-align: middle; padding-left: 12px;">
        <div style="font-size: 16px; font-weight: bold; color: #002B49; text-transform: uppercase; letter-spacing: 0.5px;">
          Círculo Policial de San José
        </div>
        <div style="font-size: 12px; color: #B45309; font-weight: bold;">
          Convenio Retención de Haberes — Código 514 (UE 19)
        </div>
      </td>
    </tr>
  </table>

  <p style="margin: 0 0 12px 0;">
    <strong>Estimados,</strong>
  </p>

  <p style="margin: 0 0 12px 0;">
    Junto con saludarles, adjuntamos la documentación correspondiente a la retención del <strong>Convenio Cód. 514 (Círculo Policial de San José)</strong> para el período <strong>${mesNom} ${presupuesto.anio}</strong>.
  </p>

  <table style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 16px; font-size: 13px;">
    <tr>
      <td style="padding: 4px 8px;"><strong>• Período:</strong> ${mesNom} ${presupuesto.anio}</td>
      <td style="padding: 4px 8px;"><strong>• Funcionarios incluidos:</strong> ${totalSociosCount} socios activos</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px;"><strong>• Código de Descuento:</strong> 514 (UE 19)</td>
      <td style="padding: 4px 8px;"><strong>• Monto total solicitado:</strong> $ ${total$} ($140 c/u)</td>
    </tr>
  </table>

  <p style="margin: 0 0 8px 0;">
    <strong>Archivos adjuntos:</strong>
  </p>
  <ul style="margin: 0 0 16px 0; padding-left: 20px;">
    <li><strong>Planilla Excel:</strong> <code>${nombreExcelGenerado}</code></li>
    <li><strong>Archivo Plano TXT:</strong> <code>${nombreTxtGenerado}</code></li>
  </ul>

  <p style="margin: 0 0 16px 0;">
    Quedamos a disposición ante cualquier consulta.
  </p>

  <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 20px;">
    <p style="margin: 0; font-weight: bold; color: #002B49;">
      ${correoCargo}, saluda atte.
    </p>
    <p style="margin: 4px 0 0 0; font-weight: bold; color: #1e293b;">
      ${correoFirmante}
    </p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">
      Círculo Policial San José • 25 de Mayo 672 • San José de Mayo
    </p>
  </div>
</div>`;
    };

    const handleCopiarPortapapeles = async (formato: 'html' | 'texto') => {
        const textoPlano = getTextoPlanoCorreo();
        if (formato === 'html' && typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
            try {
                const html = getHtmlCorreo();
                const blobHtml = new Blob([html], { type: 'text/html' });
                const blobText = new Blob([textoPlano], { type: 'text/plain' });
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/html': blobHtml,
                        'text/plain': blobText,
                    })
                ]);
                setCorreoCopiado('html');
                showMsg('success', '¡Copiado con formato y logo! Ve a Zimbra y presiona Ctrl + V en el cuerpo del correo.');
                setTimeout(() => setCorreoCopiado(null), 4000);
                return;
            } catch (err) {
                console.warn('Fallback a texto plano en clipboard', err);
            }
        }

        await navigator.clipboard.writeText(textoPlano);
        setCorreoCopiado('texto');
        showMsg('success', 'Cuerpo de correo en texto plano copiado al portapapeles.');
        setTimeout(() => setCorreoCopiado(null), 4000);
    };

    const handleCopiarTexto = async (texto: string, label: string) => {
        await navigator.clipboard.writeText(texto);
        setCorreoCopiado(label);
        showMsg('success', `¡${label} copiado al portapapeles!`);
        setTimeout(() => setCorreoCopiado(null), 3000);
    };

    const handleAbrirMailto = () => {
        if (!presupuesto) return;
        const subject = encodeURIComponent(correoAsunto);
        const body = encodeURIComponent(getTextoPlanoCorreo());
        const mailtoUrl = `mailto:jpsjose-presupuesto@minterior.gub.uy?subject=${subject}&body=${body}`;
        window.open(mailtoUrl, '_blank');
    };

    const handleAbrirZimbra = async () => {
        if (!presupuesto) return;
        const to = 'jpsjose-presupuesto@minterior.gub.uy';
        const subject = correoAsunto;
        const body = getTextoPlanoCorreo();

        try {
            await handleCopiarPortapapeles('html');
        } catch {
            // Fallback silencioso
        }

        const baseUrl = zimbraUrlBase.trim().replace(/\/+$/, '');
        const zimbraUrl = `${baseUrl}/?app=mail&view=compose&to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(zimbraUrl, '_blank');
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

                                        <Button
                                            color="warning"
                                            className="fw-bold text-dark shadow-sm py-2 d-flex align-items-center justify-content-center gap-2"
                                            onClick={handleAbrirZimbra}
                                            style={{ backgroundColor: '#F59E0B', borderColor: '#D97706' }}
                                            title="Abre automáticamente el Webmail de Zimbra con para, asunto y texto listos"
                                        >
                                            <span>🚀</span>
                                            <span>Abrir en Zimbra (Auto-rellenado)</span>
                                        </Button>

                                        <Button
                                            color="light"
                                            outline
                                            size="sm"
                                            className="fw-bold text-dark border"
                                            onClick={() => setModalCorreo(true)}
                                        >
                                            ✉️ Ver / Personalizar Plantilla de Correo
                                        </Button>
                                        
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

            {/* Modal: Redactor y Plantilla de Correo para Jefatura (Zimbra) */}
            <Modal isOpen={modalCorreo} toggle={() => setModalCorreo(!modalCorreo)} size="lg" centered>
                <ModalHeader toggle={() => setModalCorreo(!modalCorreo)}>
                    <span className="fw-bold text-dark">✉️ Redacción de Correo Oficial para Jefatura (Zimbra)</span>
                </ModalHeader>
                <ModalBody className="p-3 p-md-4">
                    {presupuesto && (
                        <>
                            <div className="alert alert-info py-2 px-3 small border-0 mb-3" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
                                💡 <strong>Instrucciones para Webmail Zimbra:</strong>
                                <ol className="mb-0 ps-3 mt-1">
                                    <li>Haz clic en <strong>&ldquo;📋 Copiar con Formato y Logo&rdquo;</strong> (copia el escudo institucional en alta calidad y la tipografía).</li>
                                    <li>Abre tu correo en Zimbra, presiona <strong>Redactar</strong> y pega con <kbd>Ctrl + V</kbd> en el cuerpo del mensaje.</li>
                                    <li>Descarga los dos archivos adjuntos y agrégalos al correo.</li>
                                </ol>
                            </div>

                            {/* Datos de Cabecera del Correo */}
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Label className="fw-bold small text-muted text-uppercase mb-1">Destinatario:</Label>
                                    <InputGroup size="sm">
                                        <Input
                                            value={correoDestinatario}
                                            onChange={(e) => setCorreoDestinatario(e.target.value)}
                                            className="font-monospace fw-semibold"
                                        />
                                        <Button
                                            color="secondary"
                                            outline
                                            onClick={() => handleCopiarTexto('jpsjose-presupuesto@minterior.gub.uy', 'Email destinatario')}
                                            title="Copiar email de Jefatura"
                                        >
                                            📋 Copiar
                                        </Button>
                                    </InputGroup>
                                </Col>
                                <Col md={6}>
                                    <Label className="fw-bold small text-muted text-uppercase mb-1">Firmante:</Label>
                                    <Input
                                        bsSize="sm"
                                        value={correoFirmante}
                                        onChange={(e) => setCorreoFirmante(e.target.value)}
                                        placeholder="Nombre y grado de quien firma"
                                    />
                                </Col>
                                <Col xs={12}>
                                    <Label className="fw-bold small text-muted text-uppercase mb-1">Asunto del Correo:</Label>
                                    <InputGroup size="sm">
                                        <Input
                                            value={correoAsunto}
                                            onChange={(e) => setCorreoAsunto(e.target.value)}
                                            className="fw-bold text-dark"
                                        />
                                        <Button
                                            color="secondary"
                                            outline
                                            onClick={() => handleCopiarTexto(correoAsunto, 'Asunto')}
                                            title="Copiar asunto"
                                        >
                                            📋 Copiar Asunto
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>

                            {/* Vista Previa del Cuerpo con Membrete y Logo */}
                            <Label className="fw-bold small text-muted text-uppercase mb-1">
                                Vista Previa del Mensaje Institucional:
                            </Label>
                            <div
                                className="p-3 p-md-4 rounded-3 border bg-white shadow-sm mb-3"
                                style={{ maxHeight: '380px', overflowY: 'auto', backgroundColor: '#FFFFFF' }}
                            >
                                {/* Membrete con Logo */}
                                <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom" style={{ borderColor: '#002B49' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/images/logo-circulo-policial.png"
                                        alt="Círculo Policial San José"
                                        style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                                    />
                                    <div>
                                        <h6 className="fw-bold mb-0 text-uppercase" style={{ color: '#002B49', letterSpacing: '0.5px' }}>
                                            Círculo Policial de San José
                                        </h6>
                                        <div className="small fw-bold" style={{ color: '#B45309', fontSize: '0.8rem' }}>
                                            Convenio Retención de Haberes — Código 514 (UE 19)
                                        </div>
                                    </div>
                                </div>

                                <div className="small text-dark" style={{ lineHeight: 1.6 }}>
                                    <p className="mb-2">
                                        <strong>Estimados,</strong>
                                    </p>

                                    <p className="mb-2">
                                        Junto con saludarles, adjuntamos la documentación correspondiente a la retención del <strong>Convenio Cód. 514 (Círculo Policial de San José)</strong> para el período <strong>{getNombreMes(presupuesto.mes)} {presupuesto.anio}</strong>.
                                    </p>

                                    <div className="p-2 mb-3 rounded bg-light border">
                                        <Row className="g-1 small">
                                            <Col sm={6}>• <strong>Período:</strong> {getNombreMes(presupuesto.mes)} {presupuesto.anio}</Col>
                                            <Col sm={6}>• <strong>Funcionarios incluidos:</strong> {filteredSocios.length} socios activos</Col>
                                            <Col sm={6}>• <strong>Código de Descuento:</strong> 514 (UE 19)</Col>
                                            <Col sm={6}>• <strong>Importe total solicitado:</strong> ${totalImporte.toLocaleString('es-UY')} ($140 c/u)</Col>
                                        </Row>
                                    </div>

                                    <p className="mb-1"><strong>Archivos adjuntos:</strong></p>
                                    <ul className="mb-3 ps-3">
                                        <li><strong>Planilla Excel:</strong> <code>{nombreExcelGenerado}</code></li>
                                        <li><strong>Archivo Plano TXT:</strong> <code>{nombreTxtGenerado}</code></li>
                                    </ul>

                                    <p className="mb-3">
                                        Quedamos a disposición ante cualquier consulta.
                                    </p>

                                    <div className="pt-2 border-top">
                                        <div className="fw-bold" style={{ color: '#002B49' }}>{correoCargo}, saluda atte.</div>
                                        <div className="fw-bold text-dark">{correoFirmante}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            Círculo Policial San José • 25 de Mayo 672 • San José de Mayo
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accesos rápidos de descarga para adjuntar */}
                            <div className="p-2 rounded bg-light border d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                                <span className="small text-muted fw-bold">Descargar adjuntos para Zimbra:</span>
                                <div className="d-flex gap-2">
                                    <a
                                        href={`/api/admin/descuentos/exportar/txt?presupuestoId=${presupuestoId}`}
                                        className="btn btn-outline-primary btn-sm fw-bold"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        📄 Descargar TXT ({nombreTxtGenerado})
                                    </a>
                                    <a
                                        href={`/api/admin/descuentos/exportar/excel?presupuestoId=${presupuestoId}`}
                                        className="btn btn-outline-success btn-sm fw-bold"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        📊 Descargar Excel ({nombreExcelGenerado})
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </ModalBody>
                <ModalFooter className="d-flex flex-wrap justify-content-between gap-2">
                    <Button color="light" outline onClick={() => setModalCorreo(false)}>
                        Cerrar
                    </Button>
                    <div className="d-flex flex-wrap gap-2">
                        <Button
                            color="secondary"
                            outline
                            size="sm"
                            className="fw-bold"
                            onClick={() => handleCopiarPortapapeles('texto')}
                        >
                            📝 Copiar Solo Texto
                        </Button>
                        <Button
                            color="primary"
                            size="sm"
                            className="fw-bold shadow-sm"
                            style={{ backgroundColor: '#002B49', borderColor: '#002B49' }}
                            onClick={() => handleCopiarPortapapeles('html')}
                        >
                            {correoCopiado === 'html' ? '✅ ¡Copiado con Logo!' : '📋 Copiar con Formato y Logo (Zimbra)'}
                        </Button>
                        <Button
                            color="warning"
                            size="sm"
                            className="fw-bold text-dark shadow-sm px-3"
                            style={{ backgroundColor: '#F59E0B', borderColor: '#D97706' }}
                            onClick={handleAbrirZimbra}
                            title="Abre directamente Zimbra con destinatario, asunto y cuerpo listos"
                        >
                            🚀 Abrir en Zimbra Webmail
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </div>
    );
}
