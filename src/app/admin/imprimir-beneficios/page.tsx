'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, Row, Col, Spinner } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';
import { ArrowLeft, Printer, Layout, FileText } from 'lucide-react';
import Image from 'next/image';

interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url?: string;
    direccion?: string;
    telefono?: string;
    whatsapp?: string;
}

/* ─── Constantes de diseño print-friendly ─── */
const C = {
    navy: '#002B49',
    navyLight: '#003D6B',
    gold: '#B8960C',
    goldLight: '#D4AF37',
    body: '#1A1A1A',
    muted: '#4B5563',
    mutedLight: '#6B7280',
    border: '#D1D5DB',
    borderLight: '#E5E7EB',
    accent: '#CE1126',
    white: '#FFFFFF',
} as const;

export default function ImprimirBeneficiosPage() {
    const router = useRouter();
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [loading, setLoading] = useState(true);
    const [diseno, setDiseno] = useState<'vertical' | 'diptico'>('vertical');

    useEffect(() => {
        // Verificar sesión de administrador
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }

        // Obtener convenios comerciales de la base de datos
        fetch('/api/convenios')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.convenios) {
                    const filtered = data.convenios.filter((c: Convenio) => 
                        !c.nombre.toLowerCase().includes('centro óptico') && 
                        !c.nombre.toLowerCase().includes('centro optico') &&
                        !c.nombre.toLowerCase().includes('dame')
                    );
                    setConvenios(filtered);
                }
            })
            .catch(err => console.error('Error cargando convenios:', err))
            .finally(() => setLoading(false));
    }, [router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                    <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Cargando beneficios y convenios...</p>
                </div>
            </div>
        );
    }

    /* ─────────── Componentes reutilizables para el folleto ─────────── */

    /** Título de sección con línea inferior dorada fina */
    const SectionTitle = ({ icon, children, className = '' }: { icon: string; children: React.ReactNode; className?: string }) => (
        <div className={`pf-section-title ${className}`}>
            <span className="pf-section-icon">{icon}</span>
            {children}
        </div>
    );

    /** Bloque de beneficio individual */
    const BenefitBlock = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
        <div className={`pf-benefit ${className}`}>
            <div className="pf-benefit-title">{title}</div>
            {children}
        </div>
    );

    /** Etiqueta de precio compacta */
    const PriceTag = ({ children }: { children: React.ReactNode }) => (
        <div className="pf-price">{children}</div>
    );

    /** Línea de contacto */
    const PhoneLine = ({ children }: { children: React.ReactNode }) => (
        <div className="pf-phone">{children}</div>
    );

    /** Fila de un miembro de mesa ejecutiva */
    const MesaRow = ({ cargo, rango, nombre }: { cargo: string; rango: string; nombre: string }) => (
        <div className="pf-mesa-row">
            <span className="pf-mesa-cargo">{cargo}</span>{' '}
            <span className="pf-mesa-rango">{rango}</span>{' '}
            <span className="pf-mesa-nombre">{nombre}</span>
        </div>
    );

    /** Nombre de vocal */
    const VocalName = ({ rango, nombre }: { rango: string; nombre: string }) => (
        <div className="pf-vocal">
            <span className="pf-vocal-rango">{rango}</span> <span className="pf-vocal-nombre">{nombre}</span>
        </div>
    );

    /* ─────────── Bloque QR de Afiliación (reutilizable) ─────────── */
    const AffiliationCTA = ({ compact = false }: { compact?: boolean }) => (
        <div className="pf-cta-box">
            <div className="pf-cta-inner">
                <div className="pf-cta-qr">
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://circulopolicialsj.org.uy/asociarse"
                        alt="QR Hacete Socio"
                        className="pf-qr-img"
                    />
                    <span className="pf-qr-label">Hacete Socio</span>
                </div>
                <div className="pf-cta-text">
                    <div className="pf-cta-headline">¿Aún no sos socio? ¡Sumate!</div>
                    <div className="pf-cta-price">
                        <span className="pf-cta-amount">$140</span>
                        <span className="pf-cta-period">/ mes</span>
                    </div>
                    {!compact && (
                        <div className="pf-cta-desc">
                            Escaneá el QR para afiliarte en línea de forma rápida.
                        </div>
                    )}
                </div>
            </div>
            <div className="pf-cta-contact">
                <div className="pf-cta-url">🌐 www.circulopolicialsj.org.uy</div>
                <div className="pf-cta-details">
                    📍 Ituzaingó N° 441, San José de Mayo &nbsp;·&nbsp; ✉ sanjosecirculopolicial@gmail.com
                </div>
            </div>
        </div>
    );

    /* ─────────── Bloque Comisión Directiva (reutilizable) ─────────── */
    const ComisionDirectiva = ({ size = 'normal' }: { size?: 'normal' | 'compact' }) => {
        const isCompact = size === 'compact';
        
        if (isCompact) {
            return (
                <div className="pf-comision pf-comision--compact">
                    <div className="pf-comision-header">Comisión Directiva — Ejercicio 2026</div>
                    <div className="pf-comision-grid">
                        {/* Mesa Ejecutiva */}
                        <div className="pf-comision-col pf-comision-mesa">
                            <div className="pf-comision-subtitle">Mesa Ejecutiva</div>
                            <MesaRow cargo="Presidente:" rango="Crio. Mayor (R)" nombre="Darcy González" />
                            <MesaRow cargo="Vicepresidente:" rango="Crio. (R)" nombre="Juan Silva" />
                            <MesaRow cargo="Secretario:" rango="Crio. Mayor (R)" nombre="Jorge Carrato" />
                            <MesaRow cargo="Prosecretario:" rango="Sgto." nombre="Martín Cedrés" />
                            <MesaRow cargo="Tesorero:" rango="Crio. P.A." nombre="Gabriel López" />
                            <MesaRow cargo="Protesorero:" rango="S.O.M. (R)" nombre="Sergio López" />
                        </div>

                        {/* Vocales */}
                        <div className="pf-comision-col pf-comision-vocales">
                            <div className="pf-comision-subtitle">Vocales</div>
                            <div className="pf-vocales-grid">
                                <div>
                                    <VocalName rango="Crio. Mayor (R)" nombre="Jorge Rielo" />
                                    <VocalName rango="Sub Crio. (R)" nombre="Luis Reyes" />
                                    <VocalName rango="Of. Ppal. (R)" nombre="Alejandro López" />
                                    <VocalName rango="S.O.M." nombre="Ricardo Cardozo" />
                                    <VocalName rango="S.O.M. (R)" nombre="Atilio Berrueta" />
                                    <VocalName rango="S.O.M. (R)" nombre="Juan Jara" />
                                </div>
                                <div>
                                    <VocalName rango="Cabo (R)" nombre="Gilberto Sellanes" />
                                    <VocalName rango="Cabo (R)" nombre="Robinson Marta" />
                                    <VocalName rango="Cabo (R)" nombre="Miguel Rodríguez" />
                                    <VocalName rango="Cabo (R)" nombre="Rosmary Dutruel" />
                                    <VocalName rango="Agte. 1ra. (R)" nombre="Rubén Petre" />
                                </div>
                            </div>
                        </div>

                        {/* Comisión Fiscal */}
                        <div className="pf-comision-col pf-comision-fiscal">
                            <div className="pf-comision-subtitle">Comisión Fiscal</div>
                            <VocalName rango="Comisario P.A. (R)" nombre="Raúl Castro" />
                            <VocalName rango="S.O.M. (R)" nombre="Walter Dotta" />
                            <VocalName rango="Cabo" nombre="Mariano Brum" />
                        </div>
                    </div>
                </div>
            );
        }

        // Diseño para Díptico A5 (normal): 2 columnas perfectamente distribuidas
        return (
            <div className="pf-comision pf-comision--normal">
                <div className="pf-comision-header">Comisión Directiva — Ejercicio 2026</div>
                <div className="pf-comision-2col-layout">
                    {/* Columna Izquierda: Mesa Ejecutiva + Comisión Fiscal */}
                    <div className="pf-comision-2col-left">
                        <div className="pf-comision-col pf-comision-mesa-normal">
                            <div className="pf-comision-subtitle">Mesa Ejecutiva</div>
                            <div className="pf-mesa-grid-normal">
                                <MesaRow cargo="Presidente:" rango="Crio. Mayor (R)" nombre="Darcy González" />
                                <MesaRow cargo="Vicepresidente:" rango="Crio. (R)" nombre="Juan Silva" />
                                <MesaRow cargo="Secretario:" rango="Crio. Mayor (R)" nombre="Jorge Carrato" />
                                <MesaRow cargo="Prosecretario:" rango="Sgto." nombre="Martín Cedrés" />
                                <MesaRow cargo="Tesorero:" rango="Crio. P.A." nombre="Gabriel López" />
                                <MesaRow cargo="Protesorero:" rango="S.O.M. (R)" nombre="Sergio López" />
                            </div>
                        </div>
                        
                        <div className="pf-comision-col pf-comision-fiscal-normal pf-mt-sm">
                            <div className="pf-comision-subtitle">Comisión Fiscal</div>
                            <div className="pf-fiscal-grid-normal">
                                <VocalName rango="Comisario P.A. (R)" nombre="Raúl Castro" />
                                <VocalName rango="S.O.M. (R)" nombre="Walter Dotta" />
                                <VocalName rango="Cabo" nombre="Mariano Brum" />
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Vocales (Listado en columna única) */}
                    <div className="pf-comision-2col-right">
                        <div className="pf-comision-col pf-comision-vocales-normal">
                            <div className="pf-comision-subtitle">Vocales</div>
                            <div className="pf-vocales-list-normal">
                                <VocalName rango="Crio. Mayor (R)" nombre="Jorge Rielo" />
                                <VocalName rango="Sub Crio. (R)" nombre="Luis Reyes" />
                                <VocalName rango="Of. Ppal. (R)" nombre="Alejandro López" />
                                <VocalName rango="S.O.M." nombre="Ricardo Cardozo" />
                                <VocalName rango="S.O.M. (R)" nombre="Atilio Berrueta" />
                                <VocalName rango="S.O.M. (R)" nombre="Juan Jara" />
                                <VocalName rango="Cabo (R)" nombre="Gilberto Sellanes" />
                                <VocalName rango="Cabo (R)" nombre="Robinson Marta" />
                                <VocalName rango="Cabo (R)" nombre="Miguel Rodríguez" />
                                <VocalName rango="Cabo (R)" nombre="Rosmary Dutruel" />
                                <VocalName rango="Agte. 1ra. (R)" nombre="Rubén Petre" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /* ═══════════════════════════════════════════════════════════════ */
    /*                         RENDER                                */
    /* ═══════════════════════════════════════════════════════════════ */
    return (
        <div className="min-vh-100 bg-light py-4 px-2 select-none-print pf-print-wrapper">
            {/* Barra de Herramientas Superior (No se imprime) */}
            <div className="no-print mb-4 p-3 bg-white shadow-sm rounded-3 mx-auto" style={{ maxWidth: '1100px' }}>
                <Row className="align-items-center g-3">
                    <Col xs={12} md={4} className="d-flex align-items-center gap-2">
                        <Button
                            color="secondary"
                            outline
                            size="sm"
                            onClick={() => router.push('/admin/dashboard')}
                            className="d-flex align-items-center gap-1 rounded-pill"
                        >
                            <ArrowLeft size={16} /> Volver al Dashboard
                        </Button>
                    </Col>
                    <Col xs={12} md={4} className="d-flex justify-content-center gap-2">
                        <Button
                            color={diseno === 'vertical' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('vertical')}
                            style={diseno === 'vertical' ? { backgroundColor: C.navy, borderColor: C.navy } : {}}
                        >
                            <FileText size={16} /> Ficha A4 Vertical
                        </Button>
                        <Button
                            color={diseno === 'diptico' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('diptico')}
                            style={diseno === 'diptico' ? { backgroundColor: C.navy, borderColor: C.navy } : {}}
                        >
                            <Layout size={16} /> Díptico A5 (A4 Apaisado)
                        </Button>
                    </Col>
                    <Col xs={12} md={4} className="text-end">
                        <Button
                            color="success"
                            size="md"
                            className="d-flex align-items-center gap-1 ms-md-auto rounded-pill px-4"
                            onClick={handlePrint}
                            style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                        >
                            <Printer size={18} /> Imprimir Folleto
                        </Button>
                    </Col>
                </Row>
                <div className="mt-3 p-2 bg-light rounded text-muted small text-center">
                    💡 <strong>Consejo:</strong> Configurá orientación <strong>{diseno === 'vertical' ? 'Vertical' : 'Horizontal'}</strong>, tamaño <strong>A4</strong> y activá <strong>&quot;Gráficos de fondo&quot;</strong> para los bordes y logos.
                </div>
            </div>

            {/* ═══ Contenedor del Folleto ═══ */}
            <div className="pf-folleto-container">
                {diseno === 'vertical' ? (
                    /* ==================== FICHA A4 VERTICAL ==================== */
                    <div className="pf-sheet pf-sheet--portrait" id="ficha-a4">

                        {/* ── Cabecera ── */}
                        <header className="pf-header">
                            <div className="pf-header-left">
                                <div className="pf-header-logo">
                                    <Image
                                        src="/images/logo-circulo-policial.png"
                                        alt="Escudo Círculo Policial San José"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <div className="pf-header-title">Círculo Policial de San José</div>
                                    <div className="pf-header-subtitle">&quot;General José G. Artigas&quot;</div>
                                    <div className="pf-header-meta">Fundado el 15/04/1944 — Personería Jurídica desde el 24/12/1948</div>
                                </div>
                            </div>
                            <div className="pf-header-right">
                                <div className="pf-header-badge">Guía de Beneficios</div>
                                <div className="pf-header-year">Ejercicio 2026</div>
                            </div>
                        </header>

                        {/* ── Contenido Principal (2 columnas) ── */}
                        <div className="pf-body">
                            {/* ─ Columna Izquierda: Servicios ─ */}
                            <div className="pf-col pf-col--left">
                                <SectionTitle icon="🏠">Servicios e Infraestructura</SectionTitle>

                                <BenefitBlock title="Cabañas en Balneario Ordeig (Kiyú)">
                                    <p className="pf-text">
                                        Dos cabañas equipadas para <strong>4 personas</strong> con <strong>Direct TV incluido</strong>.
                                    </p>
                                    <PhoneLine>📞 Reservas: <strong>099 342 372</strong></PhoneLine>
                                    <PriceTag>Socio: <strong>$1.500 / día</strong> &nbsp;|&nbsp; No Socio: <strong>$2.500 / día</strong></PriceTag>
                                </BenefitBlock>

                                <BenefitBlock title="Salones de Fiestas y Eventos (Sede Central)">
                                    <p className="pf-text">
                                        Espacios equipados y climatizados. El alquiler <strong>incluye freezer, uso de parrillas, climatización y limpieza posterior</strong>.
                                    </p>
                                    <PhoneLine>📞 Reservas: <strong>099 342 372</strong></PhoneLine>
                                    <PriceTag>
                                        Grande (60 pers.): Socio <strong>$4.200</strong> / No Socio <strong>$7.000</strong>
                                        <br />
                                        Chico (25 pers.): Socio <strong>$2.000</strong> / No Socio <strong>$3.800</strong>
                                    </PriceTag>
                                </BenefitBlock>

                                <BenefitBlock title="Canastas Navideñas Anuales">
                                    <p className="pf-text">
                                        Reconocimiento de fin de año con obsequio de una canasta navideña de excelente calidad para todos nuestros socios.
                                    </p>
                                </BenefitBlock>

                                <SectionTitle icon="🌟" className="pf-mt-sm">Compromiso y Apoyo Social</SectionTitle>

                                <BenefitBlock title="Convenio Hogar Estudiantil">
                                    <p className="pf-text">
                                        En acuerdo con la Intendencia Municipal de San José, parte de nuestras instalaciones son destinadas a alojar a estudiantes del interior del departamento, fomentando su formación académica.
                                    </p>
                                </BenefitBlock>
                            </div>

                            {/* ─ Columna Derecha: Alianzas y Convenios ─ */}
                            <div className="pf-col pf-col--right">
                                <SectionTitle icon="🎓">Alianzas Educativas Directas</SectionTitle>

                                <BenefitBlock title="Convenio UNI 3 UNAMA">
                                    <p className="pf-text">
                                        Alianza directa para el desarrollo cultural y bienestar físico de nuestros afiliados:
                                    </p>
                                    <ul className="pf-list">
                                        <li><strong>Talleres Gratuitos en la Sede:</strong> Danza y Baile en Línea (Lunes 9:30 a 11:00), Yoga (Martes 14:00) y Danza/Folklore (Viernes 15:00 a 16:45).</li>
                                        <li><strong>10 Becas de Estudio Completas:</strong> Acceso 100% gratuito a los 32 cursos de UNI 3 UNAMA. Cel. gestión: <strong>099 342 372</strong>.</li>
                                    </ul>
                                </BenefitBlock>

                                <SectionTitle icon="👥" className="pf-mt-sm">Red de Reciprocidad (ARPP San José)</SectionTitle>
                                <p className="pf-text pf-text--muted pf-text--sm">
                                    Mediante alianza con la Asociación de Retirados y Pensionistas Policiales de San José, nuestros socios acceden a sus servicios:
                                </p>

                                <BenefitBlock title="Asesorías Profesionales">
                                    <ul className="pf-list">
                                        <li><strong>Jurídica:</strong> Dr. Carlos Fajardo.</li>
                                        <li><strong>Notarial:</strong> Esc. Juan Martín Álvarez.</li>
                                        <li><strong>Arquitectura:</strong> Arq. Dayana Píriz.</li>
                                    </ul>
                                </BenefitBlock>

                                <BenefitBlock title="Cursos y Biblioteca">
                                    <ul className="pf-list">
                                        <li><strong>Inglés y Apoyo Estudiantil:</strong> Prof. Romina De Brun (099 830 930).</li>
                                        <li><strong>Biblioteca Social:</strong> Préstamo gratuito de libros generales e infantiles.</li>
                                    </ul>
                                </BenefitBlock>

                                <BenefitBlock title="Alojamiento en Maldonado">
                                    <p className="pf-text">Apartamentos equipados con promoción <strong>3 noches al precio de 2</strong>.</p>
                                </BenefitBlock>

                                <BenefitBlock title="Ópticas Adheridas">
                                    <p className="pf-text">
                                        <strong>20%</strong> de descuento en lentes en <strong>Óptica Sena</strong> (Asamblea 595) y <strong>Centro Óptico</strong> (Batlle y Ordóñez 595).
                                    </p>
                                </BenefitBlock>

                                <BenefitBlock title="Catering Profesional">
                                    <p className="pf-text">Descuentos en servicios de Catering a coordinar con la Asociación de Retirados y Pensionistas Policiales.</p>
                                </BenefitBlock>

                                <BenefitBlock title="Servicio de Acompañantes (DAME)">
                                    <p className="pf-text">
                                        <strong>35% OFF:</strong> Cobertura de 8 hrs durante 10 días al año por <strong>$150/mes</strong>. Descuento especial en cuota social (25 de Mayo 466 - Tel: 4342 2850).
                                    </p>
                                </BenefitBlock>
                            </div>
                        </div>

                        {/* ── Convenios Comerciales ── */}
                        <div className="pf-convenios-section">
                            <SectionTitle icon="🛍️">Convenios Comerciales (Descuentos con Carné de Socio)</SectionTitle>
                            <div className="pf-convenios-grid">
                                {convenios.map(c => (
                                    <div key={c.id} className="pf-convenio-card">
                                        {c.logo_url ? (
                                            <div className="pf-convenio-logo">
                                                <img src={c.logo_url} alt={`Logo ${c.nombre}`} />
                                            </div>
                                        ) : (
                                            <div className="pf-convenio-logo pf-convenio-logo--placeholder">🛍️</div>
                                        )}
                                        <div className="pf-convenio-info">
                                            <div className="pf-convenio-header">
                                                <span className="pf-convenio-name">{c.nombre}</span>
                                                <span className="pf-convenio-badge">{c.beneficio}</span>
                                            </div>
                                            {(c.direccion || c.telefono || c.whatsapp) && (
                                                <div className="pf-convenio-meta">
                                                    {c.direccion && (
                                                        <div className="pf-convenio-meta-row">
                                                            <span className="pf-meta-icon">📍</span>
                                                            <span className="pf-meta-text">{c.direccion}</span>
                                                        </div>
                                                    )}
                                                    {(c.telefono || c.whatsapp) && (
                                                        <div className="pf-convenio-meta-row">
                                                            <span className="pf-meta-icon">📞</span>
                                                            <span className="pf-meta-text">{c.telefono || c.whatsapp}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pf-convenios-note">
                                🌐 Para más información sobre todos los convenios, visitá nuestro sitio web: <strong>circulopolicialsj.org.uy/convenios</strong>
                            </div>
                        </div>

                        {/* ── Banner Carnet ── */}
                        <div className="pf-carnet-banner">
                            <div>
                                <strong>¡Retirá tu Nuevo Carnet de Socio Físico!</strong> — Ya estamos entregando las credenciales oficiales. Solicitalo a los miembros de la Comisión Directiva. Presentalo junto a tu C.I. para validar tus descuentos.
                            </div>
                        </div>

                        {/* ── Footer: Comisión + CTA ── */}
                        <footer className="pf-footer">
                            <div className="pf-footer-grid">
                                <div className="pf-footer-cta-col">
                                    <AffiliationCTA compact />
                                </div>
                                <div className="pf-footer-comision-col">
                                    <ComisionDirectiva size="compact" />
                                </div>
                            </div>
                        </footer>
                    </div>
                ) : (
                    /* ==================== DÍPTICO A5 (A4 APAISADO) ==================== */
                    <div className="pf-diptico-container" id="diptico-a5">

                        {/* ── PÁGINA 1: Caras Exteriores (Contratapa + Tapa) ── */}
                        <div className="pf-sheet pf-sheet--landscape pf-page-break">
                            <div className="pf-diptico-row">
                                {/* Contratapa (Izquierda) */}
                                <div className="pf-diptico-panel pf-diptico-panel--border-right">
                                    <div className="pf-diptico-content">
                                        <ComisionDirectiva />

                                        <div className="pf-carnet-banner pf-mt-sm">
                                            <div>
                                                <strong>¡Nuevo Carnet de Socio Físico!</strong> — Ya estamos entregando las credenciales oficiales. Retirá la tuya con los miembros de la Comisión Directiva. Presentala junto a tu C.I. para acceder a los beneficios.
                                            </div>
                                        </div>
                                    </div>

                                    <AffiliationCTA />
                                </div>

                                {/* Tapa (Derecha) */}
                                <div className="pf-diptico-panel pf-tapa">
                                    <div className="pf-tapa-accent"></div>
                                    <div className="pf-tapa-body">
                                        <div className="pf-tapa-logo">
                                            <Image
                                                src="/images/logo-circulo-policial.png"
                                                alt="Escudo Círculo Policial San José"
                                                fill
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div className="pf-tapa-title">Círculo Policial</div>
                                        <div className="pf-tapa-title">de San José</div>
                                        <div className="pf-tapa-divider"></div>
                                        <div className="pf-tapa-subtitle">&quot;General José G. Artigas&quot;</div>
                                        <div className="pf-tapa-badge">Guía de Beneficios 2026</div>
                                    </div>
                                    <div className="pf-tapa-footer">
                                        <div className="pf-tapa-footer-line">Fundado el 15 de Abril de 1944 — Personería Jurídica desde el 24/12/1948</div>
                                        <div className="pf-tapa-footer-address">📍 Ituzaingó N° 441, San José de Mayo</div>
                                        <div className="pf-tapa-footer-email">✉ sanjosecirculopolicial@gmail.com</div>
                                        <div className="pf-tapa-footer-url">🌐 www.circulopolicialsj.org.uy</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── PÁGINA 2: Caras Interiores ── */}
                        <div className="pf-sheet pf-sheet--landscape">
                            <div className="pf-diptico-row">
                                {/* Interior Izquierdo: Servicios, Educación y Apoyo Social */}
                                <div className="pf-diptico-panel pf-diptico-panel--border-right">
                                    <div className="pf-diptico-content">
                                        <SectionTitle icon="🏠">Servicios e Infraestructura</SectionTitle>

                                        <BenefitBlock title="Cabañas en Balneario Ordeig (Kiyú - Camino Mauricio)">
                                            <p className="pf-text">
                                                Dos cabañas para <strong>4 personas</strong> con <strong>Direct TV incluido</strong>.
                                            </p>
                                            <PhoneLine>📞 Reservas: 099 342 372</PhoneLine>
                                            <PriceTag>Socio: <strong>$1.500/día</strong> | No Socio: <strong>$2.500/día</strong></PriceTag>
                                        </BenefitBlock>

                                        <BenefitBlock title="Salón de Eventos Grande">
                                            <p className="pf-text">
                                                Capacidad <strong>60 personas</strong>. Incluye <strong>freezer, parrillas, climatización y limpieza posterior</strong>.
                                            </p>
                                            <PhoneLine>📞 Reservas de Salones: <strong>099 342 372</strong></PhoneLine>
                                            <PriceTag>Socio: <strong>$4.200/día</strong> | No Socio: <strong>$7.000/día</strong></PriceTag>
                                        </BenefitBlock>

                                        <BenefitBlock title="Salón de Eventos Chico">
                                            <p className="pf-text">
                                                Capacidad <strong>25 personas</strong>. Incluye <strong>freezer, parrillas, climatización y limpieza posterior</strong>.
                                            </p>
                                            <PriceTag>Socio: <strong>$2.000/día</strong> | No Socio: <strong>$3.800/día</strong></PriceTag>
                                        </BenefitBlock>

                                        <BenefitBlock title="Canastas Navideñas Exclusivas">
                                            <p className="pf-text">Tradicional obsequio anual de fin de año con una canasta navideña de excelente calidad para todos nuestros socios.</p>
                                        </BenefitBlock>

                                        <SectionTitle icon="🎓" className="pf-mt-sm">Educación y Apoyo Social</SectionTitle>

                                        <BenefitBlock title="Convenio Directo UNI 3 UNAMA">
                                            <p className="pf-text">
                                                Talleres sin costo de Yoga (Martes 14:00) y Danza/Folklore en la sede del Círculo Policial. Asignación de <strong>10 becas completas de estudio</strong> para los 32 cursos de UNI 3 (Cel. gestión: 099 342 372).
                                            </p>
                                        </BenefitBlock>

                                        <BenefitBlock title="Convenio Hogar Estudiantil (Apoyo Comunitario)">
                                            <p className="pf-text">
                                                En acuerdo con la Intendencia Municipal de San José, parte de nuestras instalaciones alojan a estudiantes del interior del departamento, fomentando su formación académica.
                                            </p>
                                        </BenefitBlock>
                                    </div>
                                </div>

                                {/* Interior Derecho: Red de Reciprocidad y Convenios */}
                                <div className="pf-diptico-panel">
                                    <div className="pf-diptico-content">
                                        <SectionTitle icon="👥">Red de Reciprocidad (Asociación de Retirados)</SectionTitle>
                                        <p className="pf-text pf-text--muted pf-text--sm">Nuestros afiliados acceden a los convenios y servicios de la Asociación de Retirados y Pensionistas Policiales de San José:</p>
                                        <BenefitBlock title="Asesorías Profesionales y Educación">
                                            <p className="pf-text">
                                                <strong>Asesoría gratis:</strong> Dr. C. Fajardo (Jurídica), Esc. J. M. Álvarez (Notarial), Arq. D. Píriz (Arquitectura).
                                            </p>
                                            <p className="pf-text">
                                                <strong>Cursos:</strong> Inglés y apoyo con Prof. R. De Brun (099 830 930). Préstamos en Biblioteca.
                                            </p>
                                        </BenefitBlock>

                                        <BenefitBlock title="Catering Profesional">
                                            <p className="pf-text">Descuentos en servicios de Catering a coordinar con la Asociación de Retirados y Pensionistas Policiales.</p>
                                        </BenefitBlock>

                                        {/* Convenios Comerciales en Interior del Díptico */}
                                        <div className="pf-convenios-section pf-mt-sm">
                                            <div className="pf-section-title pf-section-title--sm">
                                                <span className="pf-section-icon">🛍️</span> Convenios Comerciales
                                            </div>
                                            <div className="pf-convenios-grid pf-convenios-grid--2col">
                                                {convenios.map(c => (
                                                    <div key={c.id} className="pf-convenio-card">
                                                        {c.logo_url && (
                                                            <div className="pf-convenio-logo">
                                                                <img src={c.logo_url} alt={`Logo ${c.nombre}`} />
                                                            </div>
                                                        )}
                                                        <div className="pf-convenio-info">
                                                            <span className="pf-convenio-name">{c.nombre}</span>
                                                            <span className="pf-convenio-benefit">{c.beneficio}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pf-convenios-note pf-convenios-note--sm">
                                                🌐 Para más información de los convenios: <strong>circulopolicialsj.org.uy/convenios</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════ CSS GLOBAL — Print-Friendly Redesign ═══════════ */}
            <style jsx global>{`
                /* ═══ RESET & BASE ═══ */
                .pf-folleto-container {
                    display: flex;
                    justify-content: center;
                    padding-bottom: 3rem;
                }

                .pf-sheet {
                    box-sizing: border-box;
                    background: ${C.white};
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
                    color: ${C.body};
                    line-height: 1.35;
                    position: relative;
                }

                .pf-sheet--portrait {
                    width: 21cm;
                    height: 29.7cm;
                    padding: 0.5cm 0.8cm 0.4cm 0.8cm;
                }

                .pf-sheet--landscape {
                    width: 29.7cm;
                    height: 21cm;
                    padding: 0.6cm 1.3cm 0.5cm 1.3cm;
                }

                /* ═══ HEADER ═══ */
                .pf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 5px;
                    margin-bottom: 5px;
                    border-bottom: 2.5px solid ${C.navy};
                }

                .pf-header-left {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                }

                .pf-header-logo {
                    position: relative;
                    width: 44px;
                    height: 44px;
                    flex-shrink: 0;
                }

                .pf-header-title {
                    font-size: 1.10rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 0.3px;
                    line-height: 1.15;
                }

                .pf-header-subtitle {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: ${C.muted};
                }

                .pf-header-meta {
                    font-size: 0.66rem;
                    color: ${C.mutedLight};
                    font-weight: 500;
                    margin-top: 1px;
                }

                .pf-header-right {
                    text-align: right;
                }

                .pf-header-badge {
                    font-size: 1.10rem;
                    font-weight: 800;
                    color: ${C.accent};
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1.15;
                }

                .pf-header-year {
                    font-size: 0.70rem;
                    color: ${C.mutedLight};
                    font-family: 'Courier New', monospace;
                }

                /* ═══ BODY 2-COL ═══ */
                .pf-body {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                }

                .pf-col {
                    display: flex;
                    flex-direction: column;
                }

                .pf-col--left {
                    padding-right: 13px;
                    border-right: 1px solid ${C.borderLight};
                }

                .pf-col--right {
                    padding-left: 13px;
                }

                /* ═══ SECTION TITLES ═══ */
                .pf-section-title {
                    font-size: 0.86rem;
                    font-weight: 700;
                    color: ${C.navy};
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1.5px solid ${C.goldLight};
                    padding-bottom: 2px;
                    margin-bottom: 5px;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .pf-section-title--sm {
                    font-size: 0.70rem;
                    margin-bottom: 3px;
                }

                .pf-section-icon {
                    font-size: 0.85em;
                }

                .pf-mt-sm {
                    margin-top: 8px;
                }

                /* ═══ BENEFITS ═══ */
                .pf-benefit {
                    margin-bottom: 6px;
                }

                .pf-benefit-title {
                    font-size: 0.80rem;
                    font-weight: 700;
                    color: ${C.navyLight};
                    line-height: 1.22;
                }

                .pf-text {
                    font-size: 0.74rem;
                    color: ${C.muted};
                    margin: 2px 0 0 0;
                    line-height: 1.28;
                }

                .pf-text--muted {
                    color: ${C.mutedLight};
                    font-style: italic;
                }

                .pf-text--sm {
                    font-size: 0.70rem;
                }

                .pf-list {
                    margin: 2px 0 0 0;
                    padding-left: 15px;
                    font-size: 0.72rem;
                    color: ${C.muted};
                    line-height: 1.25;
                }

                .pf-list li {
                    margin-bottom: 2px;
                }

                .pf-phone {
                    font-size: 0.72rem;
                    color: ${C.navy};
                    font-weight: 600;
                    margin: 2px 0;
                }

                .pf-price {
                    font-size: 0.72rem;
                    color: ${C.accent};
                    font-weight: 600;
                    display: inline-block;
                    padding: 2px 9px;
                    border: 1px solid ${C.accent};
                    border-radius: 3px;
                    line-height: 1.28;
                    margin-top: 3px;
                }

                /* ═══ CONVENIOS GRID ═══ */
                .pf-convenios-section {
                    border-top: 1px solid ${C.borderLight};
                    padding-top: 6px;
                    margin-top: 7px;
                    width: 100%;
                    box-sizing: border-box;
                }

                .pf-convenios-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 4px;
                    margin-top: 5px;
                    width: 100%;
                    box-sizing: border-box;
                }

                .pf-convenios-grid--2col {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .pf-convenio-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 5px;
                    padding: 4px 5px;
                    border: 1px solid ${C.borderLight};
                    border-radius: 4px;
                    background: #FFFFFF;
                    min-width: 0;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .pf-convenio-logo {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 1px;
                }

                .pf-convenio-logo img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .pf-convenio-logo--placeholder {
                    font-size: 0.8rem;
                    background: #F3F4F6;
                    border-radius: 3px;
                }

                .pf-convenio-info {
                    min-width: 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .pf-convenio-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2px;
                    padding-bottom: 1px;
                    border-bottom: 1px dashed ${C.borderLight};
                    margin-bottom: 1px;
                    min-width: 0;
                    overflow: hidden;
                }

                .pf-convenio-name {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: ${C.navy};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-width: 0;
                    flex: 1;
                }

                .pf-convenio-badge {
                    font-size: 0.55rem;
                    font-weight: 800;
                    color: ${C.accent};
                    background: #FFF0F2;
                    border: 1px solid rgba(206, 17, 38, 0.25);
                    padding: 0px 3px;
                    border-radius: 3px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .pf-convenio-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    margin-top: 1px;
                    min-width: 0;
                    overflow: hidden;
                }

                .pf-convenio-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    font-size: 0.56rem;
                    color: ${C.muted};
                    line-height: 1.15;
                    min-width: 0;
                    overflow: hidden;
                }

                .pf-meta-icon {
                    font-size: 0.58rem;
                    flex-shrink: 0;
                }

                .pf-meta-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-width: 0;
                    flex: 1;
                }

                .pf-convenio-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    margin-top: 1px;
                }

                .pf-convenio-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 0.60rem;
                    color: ${C.muted};
                    line-height: 1.2;
                }

                .pf-meta-icon {
                    font-size: 0.62rem;
                    flex-shrink: 0;
                }

                .pf-meta-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-convenios-note {
                    text-align: center;
                    font-size: 0.64rem;
                    color: ${C.mutedLight};
                    font-style: italic;
                    margin-top: 4px;
                    line-height: 1.22;
                }

                .pf-convenios-note--sm {
                    font-size: 0.54rem;
                    margin-top: 2px;
                }

                /* ═══ CARNET BANNER ═══ */
                .pf-carnet-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 7px;
                    padding: 6px 10px;
                    border: 1.5px solid ${C.navy};
                    border-radius: 4px;
                    font-size: 0.71rem;
                    color: ${C.body};
                    line-height: 1.28;
                    margin-top: 7px;
                }

                .pf-carnet-icon {
                    font-size: 0.95rem;
                    flex-shrink: 0;
                    line-height: 1;
                }

                /* ═══ FOOTER ═══ */
                .pf-footer {
                    margin-top: auto;
                    padding-top: 6px;
                    border-top: 2.5px solid ${C.navy};
                }

                .pf-footer-grid {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 12px;
                    align-items: start;
                }

                .pf-footer-cta-col {
                    /* CTA column */
                }

                .pf-footer-comision-col {
                    /* Comisión column */
                }

                /* ═══ CTA BOX ═══ */
                .pf-cta-box {
                    border: 1.5px solid ${C.navy};
                    border-radius: 4px;
                    padding: 6px;
                    margin-top: auto;
                }

                .pf-cta-inner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                }

                .pf-cta-qr {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-shrink: 0;
                }

                .pf-qr-img {
                    width: 76px;
                    height: 76px;
                    object-fit: contain;
                }

                .pf-qr-label {
                    font-size: 0.52rem;
                    font-weight: 700;
                    color: ${C.accent};
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 3px;
                }

                .pf-cta-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .pf-cta-headline {
                    font-size: 0.70rem;
                    font-weight: 800;
                    color: ${C.navy};
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    line-height: 1.2;
                }

                .pf-cta-price {
                    display: flex;
                    align-items: baseline;
                    gap: 3px;
                    margin-top: 3px;
                    margin-bottom: 2px;
                }

                .pf-cta-amount {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: ${C.accent};
                    line-height: 1;
                }

                .pf-cta-period {
                    font-size: 0.60rem;
                    color: ${C.mutedLight};
                }

                .pf-cta-desc {
                    font-size: 0.55rem;
                    color: ${C.muted};
                    line-height: 1.25;
                    margin-top: 2px;
                }

                .pf-cta-contact {
                    margin-top: 5px;
                    padding-top: 4px;
                    border-top: 1px solid ${C.borderLight};
                    text-align: center;
                }

                .pf-cta-url {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 0.2px;
                    line-height: 1;
                }

                .pf-cta-details {
                    font-size: 0.48rem;
                    color: ${C.mutedLight};
                    margin-top: 3px;
                    line-height: 1.2;
                }

                /* ═══ COMISIÓN DIRECTIVA ═══ */
                .pf-comision {
                    /* Base styling */
                }

                .pf-comision-header {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: ${C.navy};
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    border-bottom: 1.5px solid ${C.goldLight};
                    padding-bottom: 2px;
                    margin-bottom: 4px;
                }

                .pf-comision-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1.6fr 0.9fr;
                    gap: 6px;
                }

                .pf-comision-col {
                    /* Column base */
                }

                .pf-comision-mesa {
                    border-right: 1px solid ${C.borderLight};
                    padding-right: 6px;
                }

                .pf-comision-vocales {
                    border-right: 1px solid ${C.borderLight};
                    padding-right: 6px;
                }

                .pf-comision-subtitle {
                    font-size: 0.5rem;
                    font-weight: 700;
                    color: ${C.gold};
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    border-bottom: 1px solid ${C.borderLight};
                    padding-bottom: 1px;
                    margin-bottom: 3px;
                }

                .pf-mesa-row {
                    font-size: 0.52rem;
                    line-height: 1.3;
                    margin-bottom: 1px;
                    white-space: nowrap;
                }

                .pf-mesa-cargo {
                    color: ${C.mutedLight};
                    font-weight: 400;
                    display: inline-block;
                    width: 62px;
                }

                .pf-mesa-rango {
                    color: ${C.mutedLight};
                    font-weight: 400;
                }

                .pf-mesa-nombre {
                    color: ${C.body};
                    font-weight: 700;
                }

                .pf-vocales-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 6px;
                }

                .pf-vocal {
                    font-size: 0.48rem;
                    line-height: 1.3;
                    margin-bottom: 1px;
                    white-space: nowrap;
                }

                .pf-vocal-rango {
                    color: ${C.mutedLight};
                }

                .pf-vocal-nombre {
                    color: ${C.body};
                    font-weight: 700;
                }

                .pf-comision--compact .pf-comision-header {
                    font-size: 0.6rem;
                    margin-bottom: 3px;
                }

                .pf-comision--compact .pf-mesa-row {
                    font-size: 0.48rem;
                    line-height: 1.25;
                }

                .pf-comision--compact .pf-vocal {
                    font-size: 0.44rem;
                    line-height: 1.25;
                }

                .pf-comision--compact .pf-comision-subtitle {
                    font-size: 0.44rem;
                    margin-bottom: 2px;
                }

                /* ═══ DÍPTICO ═══ */
                .pf-diptico-container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .pf-diptico-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
                }

                .pf-diptico-panel {
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .pf-diptico-panel--border-right {
                    border-right: 1px solid ${C.borderLight};
                }

                .pf-diptico-content {
                    flex: 1;
                }

                /* ═══ DÍPTICO-SPECIFIC OVERRIDES ═══ */
                #diptico-a5 .pf-section-title {
                    font-size: 1.05rem;
                    margin-bottom: 8px;
                    padding-bottom: 4px;
                    margin-top: 8px;
                }

                #diptico-a5 .pf-benefit {
                    margin-bottom: 10px;
                }

                #diptico-a5 .pf-benefit-title {
                    font-size: 0.96rem;
                }

                #diptico-a5 .pf-text {
                    font-size: 0.84rem;
                    line-height: 1.35;
                    margin-top: 2px;
                }

                #diptico-a5 .pf-text--sm {
                    font-size: 0.78rem;
                }

                #diptico-a5 .pf-list {
                    font-size: 0.82rem;
                    line-height: 1.35;
                    margin-top: 3px;
                }

                #diptico-a5 .pf-list li {
                    margin-bottom: 3px;
                }

                #diptico-a5 .pf-phone {
                    font-size: 0.80rem;
                    margin: 3px 0;
                }

                #diptico-a5 .pf-price {
                    font-size: 0.82rem;
                    padding: 3px 10px;
                    margin-top: 3px;
                }

                #diptico-a5 .pf-carnet-banner {
                    font-size: 0.84rem;
                    padding: 8px 12px;
                    margin-top: 10px;
                    line-height: 1.35;
                }

                #diptico-a5 .pf-mt-sm {
                    margin-top: 10px;
                }

                #diptico-a5 .pf-convenio-card {
                    padding: 4px 8px;
                    min-height: 34px;
                    gap: 8px;
                }

                #diptico-a5 .pf-convenio-logo {
                    width: 36px;
                    height: 22px;
                }

                #diptico-a5 .pf-convenio-name {
                    font-size: 0.80rem;
                }

                #diptico-a5 .pf-convenio-benefit {
                    font-size: 0.72rem;
                }

                #diptico-a5 .pf-comision-header {
                    font-size: 0.92rem;
                    margin-bottom: 6px;
                    padding-bottom: 3px;
                }

                #diptico-a5 .pf-mesa-row {
                    font-size: 0.72rem;
                    line-height: 1.35;
                    margin-bottom: 3px;
                }

                #diptico-a5 .pf-vocal {
                    font-size: 0.68rem;
                    line-height: 1.35;
                    margin-bottom: 3px;
                }

                #diptico-a5 .pf-comision-subtitle {
                    font-size: 0.68rem;
                    margin-bottom: 4px;
                    padding-bottom: 2px;
                }

                #diptico-a5 .pf-comision-2col-layout {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 16px;
                }

                #diptico-a5 .pf-comision-2col-left {
                    display: flex;
                    flex-direction: column;
                }

                #diptico-a5 .pf-comision-mesa-normal {
                    padding-right: 12px;
                }

                #diptico-a5 .pf-cta-box {
                    padding: 8px;
                }

                #diptico-a5 .pf-cta-inner {
                    gap: 12px;
                }

                #diptico-a5 .pf-qr-img {
                    width: 78px;
                    height: 78px;
                }

                #diptico-a5 .pf-qr-label {
                    font-size: 0.58rem;
                    margin-top: 3px;
                }

                #diptico-a5 .pf-cta-headline {
                    font-size: 0.80rem;
                }

                #diptico-a5 .pf-cta-price {
                    margin-top: 3px;
                }

                #diptico-a5 .pf-cta-amount {
                    font-size: 1.30rem;
                }

                #diptico-a5 .pf-cta-period {
                    font-size: 0.68rem;
                }

                #diptico-a5 .pf-cta-desc {
                    font-size: 0.66rem;
                    margin-top: 3px;
                }

                #diptico-a5 .pf-cta-contact {
                    margin-top: 6px;
                    padding-top: 4px;
                }

                #diptico-a5 .pf-cta-url {
                    font-size: 0.88rem;
                }

                #diptico-a5 .pf-cta-details {
                    font-size: 0.60rem;
                    margin-top: 3px;
                }

                #diptico-a5 .pf-mesa-cargo {
                    display: inline-block;
                    width: 92px;
                }

                /* ═══ TAPA ═══ */
                .pf-tapa {
                    text-align: center;
                    position: relative;
                }

                .pf-tapa-accent {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 5px;
                    background: linear-gradient(to bottom, ${C.navy} 45%, ${C.accent} 45%, ${C.accent} 55%, ${C.navy} 55%);
                }

                .pf-tapa-body {
                    margin: auto 0;
                    padding: 0 20px;
                }

                .pf-tapa-logo {
                    position: relative;
                    width: 145px;
                    height: 145px;
                    margin: 10px auto 18px;
                }

                .pf-tapa-title {
                    font-size: 2.30rem;
                    font-weight: 800;
                    color: ${C.navy};
                    line-height: 1.2;
                    letter-spacing: 0.5px;
                }

                .pf-tapa-divider {
                    width: 85px;
                    height: 3px;
                    background: ${C.goldLight};
                    margin: 14px auto;
                }

                .pf-tapa-subtitle {
                    font-size: 1.28rem;
                    font-weight: 600;
                    color: ${C.muted};
                    text-transform: uppercase;
                    letter-spacing: 1.0px;
                    margin-bottom: 20px;
                }

                .pf-tapa-badge {
                    display: inline-block;
                    font-size: 1.08rem;
                    font-weight: 700;
                    color: ${C.accent};
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    padding: 6px 22px;
                    border: 2px solid ${C.accent};
                    border-radius: 24px;
                }

                .pf-tapa-slogan {
                    font-size: 0.95rem;
                    color: ${C.mutedLight};
                    font-style: italic;
                    margin-top: 14px;
                    margin-bottom: 18px;
                    line-height: 1.4;
                }

                .pf-tapa-url {
                    display: inline-block;
                    font-size: 1.38rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    padding: 8px 28px;
                    border: 3.0px solid ${C.navy};
                    border-radius: 8px;
                    margin-top: 8px;
                }

                .pf-tapa-footer {
                    font-size: 0.85rem;
                    color: ${C.mutedLight};
                    line-height: 1.5;
                    margin-top: auto;
                    text-align: center;
                }

                .pf-tapa-footer-line {
                    font-size: 0.85rem;
                }

                .pf-tapa-footer-address {
                    font-size: 0.94rem;
                    font-weight: 600;
                    color: ${C.muted};
                    margin-top: 4px;
                }

                .pf-tapa-footer-email {
                    font-size: 0.90rem;
                    font-weight: 600;
                    color: ${C.navy};
                    margin-top: 2px;
                }

                .pf-tapa-footer-url {
                    font-size: 0.94rem;
                    font-weight: 700;
                    color: ${C.navy};
                    margin-top: 3px;
                }

                /* ═══ NO PRINT ═══ */
                .select-none-print {
                    user-select: text;
                }

                /* ═══ @MEDIA PRINT ═══ */
                @media print {
                    .no-print {
                        display: none !important;
                    }

                    body, html {
                        background-color: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        min-height: auto !important;
                    }

                    .min-vh-100 {
                        min-height: auto !important;
                    }

                    .bg-light {
                        background-color: white !important;
                    }

                    .pf-print-wrapper {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: none !important;
                    }

                    .pf-folleto-container {
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                    }

                    .pf-sheet {
                        box-shadow: none !important;
                        margin: 0 !important;
                        border: none !important;
                        page-break-after: always;
                        page-break-inside: avoid;
                    }

                    .pf-sheet--portrait {
                        width: 21cm !important;
                        height: 29.7cm !important;
                        max-height: 29.7cm !important;
                        padding: 0.6cm 0.7cm 0.5cm 0.7cm !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    .pf-sheet--landscape {
                        width: 29.7cm !important;
                        height: 21cm !important;
                        max-height: 21cm !important;
                        padding: 0.6cm 0.7cm 0.5cm 0.7cm !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    .pf-diptico-container {
                        gap: 0 !important;
                    }

                    .pf-page-break {
                        page-break-after: always !important;
                    }

                    @page {
                        size: A4 ${diseno === 'vertical' ? 'portrait' : 'landscape'};
                        margin: 0;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
