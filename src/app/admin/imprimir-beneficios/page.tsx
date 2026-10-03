'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Row, Col, Spinner } from 'reactstrap';
import { ArrowLeft, Printer, Layout, FileText, BookOpen } from 'lucide-react';
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

/* ─── Paleta de Colores Institucional Artiguista ─── */
const C = {
    navy: '#002B49',
    navyDark: '#001B30',
    navyLight: '#0047AB',
    navySoft: '#0B3B60',
    gold: '#B8960C',
    goldLight: '#D4AF37',
    goldPale: '#FBF7EA',
    goldBorder: '#E6C86E',
    body: '#1E293B',
    muted: '#475569',
    mutedLight: '#64748B',
    border: '#CBD5E1',
    borderLight: '#E2E8F0',
    borderSubtle: '#EEF2F6',
    accent: '#CE1126',
    accentDark: '#A10F1E',
    accentSoft: '#FFF0F2',
    accentBorder: '#F8B4BD',
    white: '#FFFFFF',
    bgLight: '#F8FAFC',
} as const;

/* Convenios oficiales base */
const CONVENIOS_DEFAULT: Convenio[] = [
    {
        id: 1,
        nombre: 'CECATEC',
        categoria: 'Educación y Capacitación',
        beneficio: '10% OFF y 50% OFF',
        descripcion: '10% de dto. en cursos presenciales. 50% de dto. a hijos de socios de 14 a 17 años.',
        direccion: 'Eduardo Víctor Haedo 2146, Montevideo',
        telefono: '094 200 800',
    },
    {
        id: 2,
        nombre: 'Carnicería Colón',
        categoria: 'Alimentación',
        beneficio: '10% OFF',
        descripcion: '10% de descuento en compras para socios del Círculo Policial San José.',
        direccion: 'Ellauri casi Santiago Vázquez, San José',
        telefono: '',
    },
    {
        id: 3,
        nombre: 'Carnicería Digui',
        categoria: 'Alimentación',
        beneficio: '10% OFF',
        descripcion: 'Presentando carné de socio, 10% de descuento en todas tus compras.',
        direccion: 'Av. Dr. Luis A. de Herrera y Acuña de Figueroa',
        telefono: '4342 3069',
        logo_url: '/images/convenio-digui.jpg',
    },
    {
        id: 4,
        nombre: 'Complejo El Abasto',
        categoria: 'Deportes y Recreación',
        beneficio: 'Cancha F5 a $U 1.000',
        descripcion: 'Cancha de fútbol 5 con césped sintético e iluminación LED. Beneficio exclusivo.',
        direccion: 'Calle 33 entre Zudañez y Fco. Muñoz',
        telefono: '095 551 445',
        logo_url: '/images/convenio-el-abasto.jpg',
    },
    {
        id: 5,
        nombre: 'Ferretería YAGUARON',
        categoria: 'Hogar y Construcción',
        beneficio: 'Hasta 5% OFF',
        descripcion: '5% de dto. en artículos chicos; 3% de dto. en herramientas y maquinaria.',
        direccion: 'Avda. Dr. Luis Alberto de Herrera y Colón',
        telefono: '4342 3890',
    },
    {
        id: 6,
        nombre: 'Inmobiliaria Montaño',
        categoria: 'Inmobiliaria',
        beneficio: '10% dto en alquileres',
        descripcion: '10% de descuento en nuevos contratos de alquiler para socios del Círculo.',
        direccion: 'San José de Mayo',
        telefono: '092 776 715',
        logo_url: '/images/convenio-inmobiliaria-montano.jpg',
    },
    {
        id: 7,
        nombre: 'Kamapuso Papelería Personalizada',
        categoria: 'Comercio y Regalería',
        beneficio: '10% OFF',
        descripcion: '10% de descuento en artículos y papelería personalizada.',
        direccion: 'Calle Ramón Massini N° 136, San José',
        telefono: '098 615 074',
        logo_url: '/images/convenio-kamaluso.jpg',
    },
    {
        id: 8,
        nombre: 'La Lentería',
        categoria: 'Salud y Óptica',
        beneficio: '25% OFF',
        descripcion: '25% de descuento a los socios del Círculo Policial de San José.',
        direccion: 'Asamblea 582, San José de Mayo',
        telefono: '4343 5635',
        logo_url: '/images/convenio-lenteria.jpg',
    },
    {
        id: 9,
        nombre: 'Óptica Florida',
        categoria: 'Salud y Óptica',
        beneficio: '20% armazón y cristales',
        descripcion: '20% en armazón y cristales (receta). 2x1 en recetas. 15% lentes de contacto. 10% sol.',
        direccion: 'Sarandí N° 515, San José de Mayo',
        telefono: '4346 3882',
    },
    {
        id: 10,
        nombre: 'Riogas San José',
        categoria: 'Hogar y Energía',
        beneficio: '25% OFF y 10% OFF',
        descripcion: '25% dto. en envío en San José. 10% dto. en accesorios, válvulas y mangueras.',
        direccion: 'Atilio Pelossi N° 052, San José',
        telefono: '4342 1710',
        logo_url: '/images/convenio-riogas.jpg',
    },
    {
        id: 11,
        nombre: 'VAL ORTOPEDIA',
        categoria: 'Salud y Bienestar',
        beneficio: '10% OFF',
        descripcion: '10% de descuento sobre precio de lista en ortopedia e insumos médicos.',
        direccion: '25 de Mayo 704, San José de Mayo',
        telefono: '4343 7412',
        logo_url: '/images/convenio-val-ortopedia.jpg',
    },
    {
        id: 12,
        nombre: 'VCA STORE',
        categoria: 'Tecnología y Hogar',
        beneficio: '10% OFF y 5% OFF',
        descripcion: '10% dto. en audio, TV, accesorios, movilidad; 5% en celulares y accesorios.',
        direccion: '18 de Julio 573, San José de Mayo',
        telefono: '096 170 920',
    },
    {
        id: 13,
        nombre: 'Vidriería Barceló',
        categoria: 'Hogar y Construcción',
        beneficio: '10% OFF',
        descripcion: '10% de descuento en vidriería para socios del Círculo Policial.',
        direccion: 'Av. Gral. Manuel Oribe y Manuel D. Rodríguez',
        telefono: '098 460 344',
    },
];

export default function ImprimirBeneficiosPage() {
    const router = useRouter();
    const [convenios, setConvenios] = useState<Convenio[]>(CONVENIOS_DEFAULT);
    const [loading, setLoading] = useState(true);
    const [diseno, setDiseno] = useState<'vertical' | 'cuadernillo-plegable' | 'cuadernillo-secuencial'>('cuadernillo-plegable');

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (!token) {
            router.push('/admin');
            return;
        }

        fetch('/api/convenios')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.convenios && data.convenios.length > 0) {
                    const filtered = data.convenios.filter((c: Convenio) => 
                        !c.nombre.toLowerCase().includes('centro óptico') && 
                        !c.nombre.toLowerCase().includes('centro optico') &&
                        !c.nombre.toLowerCase().includes('dame')
                    );
                    if (filtered.length > 0) {
                        setConvenios(filtered);
                    }
                }
            })
            .catch(err => {
                console.warn('Usando convenios base locales:', err);
            })
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
                    <p className="mt-3 text-muted">Cargando guía oficial de beneficios...</p>
                </div>
            </div>
        );
    }

    /* ─────────── Componentes Tipográficos y Estructurales ─────────── */

    const SectionTitle = ({ icon, children, className = '' }: { icon: string; children: React.ReactNode; className?: string }) => (
        <div className={`pf-section-title ${className}`}>
            <span className="pf-section-icon">{icon}</span>
            <span className="pf-section-text">{children}</span>
        </div>
    );

    const PriceTag = ({ children }: { children: React.ReactNode }) => (
        <div className="pf-price">{children}</div>
    );

    const PhoneLine = ({ children }: { children: React.ReactNode }) => (
        <div className="pf-phone">{children}</div>
    );

    const MesaRow = ({ cargo, rango, nombre }: { cargo: string; rango: string; nombre: string }) => (
        <div className="pf-mesa-row">
            <span className="pf-mesa-cargo">{cargo}</span>
            <span className="pf-mesa-rango">{rango}</span>
            <span className="pf-mesa-nombre">{nombre}</span>
        </div>
    );

    const VocalName = ({ rango, nombre }: { rango: string; nombre: string }) => (
        <div className="pf-vocal">
            <span className="pf-vocal-rango">{rango}</span>
            <span className="pf-vocal-nombre">{nombre}</span>
        </div>
    );

    /* ─────────── Componente CTA de Afiliación Oficial ─────────── */
    const AffiliationCTA = ({ size = 'compact' }: { size?: 'compact' | 'large' }) => (
        <div className={`pf-cta-box ${size === 'large' ? 'pf-cta-box--lg' : 'pf-cta-box--sm'}`}>
            <div className="pf-cta-inner">
                <div className="pf-cta-qr">
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://circulopolicialsj.org.uy/asociarse"
                        alt="QR Afiliación Online"
                        className="pf-qr-img"
                    />
                    <span className="pf-qr-label">ESCANEAR PARA ASOCIARTE</span>
                </div>
                <div className="pf-cta-text">
                    <div className="pf-cta-headline">¿AÚN NO SOS SOCIO? ¡SUMATE!</div>
                    <div className="pf-cta-price-wrap">
                        <span className="pf-cta-amount">$140</span>
                        <span className="pf-cta-period">/ mes</span>
                    </div>
                    <div className="pf-cta-desc">
                        Afiliación online inmediata. Abierto a policías en actividad, retiro, pensionistas y civiles.
                    </div>
                    <div className="pf-cta-link">
                        🌐 <strong>circulopolicialsj.org.uy/asociarse</strong>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ─────────── Componente Comisión Directiva ─────────── */
    const ComisionDirectiva = ({ layout = 'compact' }: { layout?: 'compact' | 'editorial' }) => {
        if (layout === 'compact') {
            return (
                <div className="pf-comision pf-comision--compact">
                    <div className="pf-comision-header">COMISIÓN DIRECTIVA — EJERCICIO 2026</div>
                    <div className="pf-comision-grid-compact">
                        <div className="pf-comision-col pf-comision-col--border">
                            <div className="pf-comision-subtitle">Mesa Ejecutiva</div>
                            <MesaRow cargo="Pte.:" rango="Crio. Mayor (R)" nombre="Darcy González" />
                            <MesaRow cargo="Vice.:" rango="Crio. (R)" nombre="Juan Silva" />
                            <MesaRow cargo="Sec.:" rango="Crio. Mayor (R)" nombre="Jorge Carrato" />
                            <MesaRow cargo="Prosec.:" rango="Sgto." nombre="Martín Cedrés" />
                            <MesaRow cargo="Tes.:" rango="Crio. P.A." nombre="Gabriel López" />
                            <MesaRow cargo="Protes.:" rango="S.O.M. (R)" nombre="Sergio López" />
                        </div>
                        <div className="pf-comision-col pf-comision-col--border">
                            <div className="pf-comision-subtitle">Vocales</div>
                            <div className="pf-vocales-grid-compact">
                                <div>
                                    <VocalName rango="Crio. Mayor (R)" nombre="Jorge Rielo" />
                                    <VocalName rango="Sub Crio. (R)" nombre="Luis Reyes" />
                                    <VocalName rango="Of. Ppal. (R)" nombre="A. López" />
                                    <VocalName rango="S.O.M." nombre="R. Cardozo" />
                                    <VocalName rango="S.O.M. (R)" nombre="A. Berrueta" />
                                    <VocalName rango="S.O.M. (R)" nombre="J. Jara" />
                                </div>
                                <div>
                                    <VocalName rango="Cabo (R)" nombre="G. Sellanes" />
                                    <VocalName rango="Cabo (R)" nombre="R. Marta" />
                                    <VocalName rango="Cabo (R)" nombre="M. Rodríguez" />
                                    <VocalName rango="Cabo (R)" nombre="R. Dutruel" />
                                    <VocalName rango="Agte. 1ra. (R)" nombre="R. Petre" />
                                </div>
                            </div>
                        </div>
                        <div className="pf-comision-col">
                            <div className="pf-comision-subtitle">Comisión Fiscal</div>
                            <VocalName rango="Crio. P.A. (R)" nombre="Raúl Castro" />
                            <VocalName rango="S.O.M. (R)" nombre="Walter Dotta" />
                            <VocalName rango="Cabo" nombre="Mariano Brum" />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="pf-comision pf-comision--editorial">
                <div className="pf-comision-header-editorial">
                    COMISIÓN DIRECTIVA — EJERCICIO 2026
                </div>
                <div className="pf-comision-editorial-grid">
                    <div className="pf-comision-box">
                        <div className="pf-comision-box-title">MESA EJECUTIVA</div>
                        <div className="pf-mesa-editorial-list">
                            <MesaRow cargo="Presidente:" rango="Crio. Mayor (R)" nombre="Darcy González" />
                            <MesaRow cargo="Vicepresidente:" rango="Crio. (R)" nombre="Juan Silva" />
                            <MesaRow cargo="Secretario:" rango="Crio. Mayor (R)" nombre="Jorge Carrato" />
                            <MesaRow cargo="Prosecretario:" rango="Sgto." nombre="Martín Cedrés" />
                            <MesaRow cargo="Tesorero:" rango="Crio. P.A." nombre="Gabriel López" />
                            <MesaRow cargo="Protesorero:" rango="S.O.M. (R)" nombre="Sergio López" />
                        </div>

                        <div className="pf-comision-box-title pf-mt-xs">COMISIÓN FISCAL</div>
                        <div className="pf-fiscal-editorial-list">
                            <VocalName rango="Comisario P.A. (R)" nombre="Raúl Castro" />
                            <VocalName rango="S.O.M. (R)" nombre="Walter Dotta" />
                            <VocalName rango="Cabo" nombre="Mariano Brum" />
                        </div>
                    </div>

                    <div className="pf-comision-box">
                        <div className="pf-comision-box-title">VOCALES</div>
                        <div className="pf-vocales-editorial-grid">
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
                </div>
            </div>
        );
    };

    /* ═══════════════════════════════════════════════════════════════ */
    /*           PÁGINAS INDIVIDUALES DEL CUADERNILLO A5 (1 A 8)      */
    /* ═══════════════════════════════════════════════════════════════ */

    /* PÁGINA 1: PORTADA */
    const Page1Portada = () => (
        <div className="pf-page-panel pf-page-panel--portada">
            <div className="pf-portada-border">
                <div className="pf-portada-topbar">
                    <div className="pf-artigas-stripe">
                        <span className="pf-stripe-blue"></span>
                        <span className="pf-stripe-white"></span>
                        <span className="pf-stripe-red"></span>
                    </div>
                </div>

                <div className="pf-portada-center">
                    <div className="pf-portada-logo">
                        <Image
                            src="/images/logo-circulo-policial.png"
                            alt="Escudo Oficial Círculo Policial San José"
                            fill
                            priority
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                    <h1 className="pf-portada-title-1">CÍRCULO POLICIAL</h1>
                    <h2 className="pf-portada-title-2">DE SAN JOSÉ</h2>
                    <div className="pf-portada-artigas">&ldquo;General José Gervasio Artigas&rdquo;</div>
                    <div className="pf-portada-divider"></div>

                    <div className="pf-portada-badge-guia">
                        GUÍA OFICIAL DE BENEFICIOS Y SERVICIOS
                    </div>

                    <div className="pf-portada-badge-year">
                        EJERCICIO 2026
                    </div>
                </div>

                <div className="pf-portada-bottom">
                    <div className="pf-portada-legal">
                        Fundado el 15 de Abril de 1944 &nbsp;·&nbsp; Personería Jurídica del 24/12/1948
                    </div>
                    <div className="pf-portada-contacts">
                        <div>📍 Sede Central: Ituzaingó N° 441, San José</div>
                        <div>📞 Reservas y Contacto: 099 342 372</div>
                        <div>✉ sanjosecirculopolicial@gmail.com</div>
                        <div>🌐 www.circulopolicialsj.org.uy</div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* PÁGINA 2: CABAÑAS EN BALNEARIO ORDEIG (KIYÚ) */
    const Page2Cabanas = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 2</span>
            </header>

            <div className="pf-page-body">
                <SectionTitle icon="🏠">Servicios Propios e Infraestructura</SectionTitle>

                <div className="pf-card-large pf-mt-sm">
                    <div className="pf-card-large-header">
                        <span className="pf-card-large-title">Cabañas en Balneario Ordeig (Kiyú - Camino Mauricio)</span>
                        <span className="pf-card-badge">Descanso &amp; Naturaleza</span>
                    </div>

                    <p className="pf-text-p">
                        Dos confortables cabañas totalmente equipadas para <strong>4 personas</strong>, en un entorno natural privilegiado.
                    </p>

                    <div className="pf-feature-box">
                        <div className="pf-feature-box-title">Equipamiento y Comodidades Incluidas:</div>
                        <ul className="pf-list-spacious">
                            <li><strong>Direct TV satelital</strong> incluido sin costo adicional.</li>
                            <li>Parrillero individual exclusivo y vajilla completa de cocina.</li>
                            <li>Refrigerador con freezer, microondas, calefón y ambientes ventilados.</li>
                            <li>Exclusivo para socios y sus familias, con tarifa subsidiada y posibilidad de acompañantes.</li>
                        </ul>
                    </div>

                    <div className="pf-price-box pf-mt-md">
                        <div className="pf-price-box-item">
                            <span className="pf-price-box-label">TARIFA SOCIO:</span>
                            <span className="pf-price-box-val pf-price-box-val--accent">$1.500 / día</span>
                        </div>
                        <div className="pf-price-box-divider"></div>
                        <div className="pf-price-box-item">
                            <span className="pf-price-box-label">TARIFA NO SOCIO:</span>
                            <span className="pf-price-box-val">$2.500 / día</span>
                        </div>
                    </div>

                    <div className="pf-booking-alert pf-mt-md">
                        <div className="pf-booking-alert-icon">📞</div>
                        <div>
                            <div className="pf-booking-alert-title">Coordinación de Estadías y Reservas:</div>
                            <div className="pf-booking-alert-num">Celular / WhatsApp: <strong>099 342 372</strong></div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Pág. 2 · Cabañas Balneario Ordeig</span>
            </footer>
        </div>
    );

    /* PÁGINA 3: SALONES DE EVENTOS Y CANASTAS NAVIDEÑAS */
    const Page3Salones = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 3</span>
            </header>

            <div className="pf-page-body">
                <SectionTitle icon="🎉">Salones de Eventos Sociales y Recreación</SectionTitle>

                <div className="pf-card-large pf-mt-xs">
                    <div className="pf-card-large-header">
                        <span className="pf-card-large-title">Salón de Eventos Principal Grande (Sede Central)</span>
                        <span className="pf-card-badge">Hasta 60 Personas</span>
                    </div>
                    <p className="pf-text-p">
                        Espacio climatizado integralmente (frío/calor) para celebraciones, cumpleaños, aniversarios y reuniones sociales familiares.
                    </p>
                    <ul className="pf-list-spacious">
                        <li>Incluye freezer industrial de gran capacidad y mobiliario (mesas y sillas).</li>
                        <li>Uso de amplias parrillas techadas y mesadas de apoyo.</li>
                        <li><strong>Servicio de limpieza posterior incluido</strong> en la tarifa del alquiler.</li>
                    </ul>
                    <div className="pf-price-box pf-mt-xs">
                        <div className="pf-price-box-item">
                            <span className="pf-price-box-label">SOCIO:</span>
                            <span className="pf-price-box-val pf-price-box-val--accent">$4.200</span>
                        </div>
                        <div className="pf-price-box-divider"></div>
                        <div className="pf-price-box-item">
                            <span className="pf-price-box-label">NO SOCIO:</span>
                            <span className="pf-price-box-val">$7.000</span>
                        </div>
                    </div>
                </div>

                <div className="pf-card-large pf-mt-sm">
                    <div className="pf-card-large-header">
                        <span className="pf-card-large-title">Salón de Eventos Íntimo Chico (Sede Central)</span>
                        <span className="pf-card-badge">Hasta 25 Personas</span>
                    </div>
                    <p className="pf-text-p">
                        Ideal para asados, reuniones íntimas y festejos familiares en Ituzaingó N° 441. Incluye vajilla base, freezer, parrillero y limpieza posterior.
                    </p>
                    <div className="pf-price-box pf-mt-xs">
                        <div className="pf-price-box-item">
                            <span className="pf-price-box-label">SOCIO:</span>
                            <span className="pf-price-box-val pf-price-box-val--accent">$2.000</span>
                        </div>
                        <div className="pf-price-box-divider"></div>
                        <div className="pf-price-box-item">
                            <span className="pf-price-box-label">NO SOCIO:</span>
                            <span className="pf-price-box-val">$3.800</span>
                        </div>
                    </div>
                    <div className="pf-booking-alert-num text-end pf-mt-xs">
                        📞 Reservas de Salones: <strong>099 342 372</strong>
                    </div>
                </div>

                <div className="pf-card-festive pf-mt-sm">
                    <div className="pf-card-festive-title">🎄 Tradicionales Canastas Navideñas Anuales</div>
                    <p className="pf-text-p mb-0">
                        Cada fin de año, el Círculo Policial de San José retribuye la confianza de sus afiliados obsequiando una <strong>canasta navideña</strong> para el 100% de los socios con cuota al día.
                    </p>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Pág. 3 · Salones y Canastas</span>
            </footer>
        </div>
    );

    /* PÁGINA 4: ALIANZAS EDUCATIVAS Y COMPROMISO SOCIAL */
    const Page4Educacion = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 4</span>
            </header>

            <div className="pf-page-body">
                <SectionTitle icon="🎓">Alianzas Educativas y Compromiso Social</SectionTitle>

                <div className="pf-card-large pf-mt-sm">
                    <div className="pf-card-large-header">
                        <span className="pf-card-large-title">Convenio Directo UNI 3 UNAMA</span>
                        <span className="pf-card-badge">Cultura &amp; Salud</span>
                    </div>

                    <p className="pf-text-p">
                        Alianza estratégica directa orientada al desarrollo cultural, la capacitación y el bienestar físico y emocional de nuestros afiliados y sus familias:
                    </p>

                    <div className="pf-feature-box">
                        <div className="pf-feature-box-title">Talleres Gratuitos Permanentes en la Sede Social:</div>
                        <ul className="pf-list-spacious">
                            <li><strong>Danza y Baile en Línea:</strong> Lunes de 9:30 a 11:00 hs.</li>
                            <li><strong>Yoga y Meditación:</strong> Martes 14:00 hs.</li>
                            <li><strong>Expresión y Danza Folklórica:</strong> Viernes de 15:00 a 16:45 hs.</li>
                        </ul>
                    </div>

                    <div className="pf-becas-box pf-mt-md">
                        <div className="pf-becas-badge">10 BECAS DE ESTUDIO COMPLETAS</div>
                        <div className="pf-becas-desc">
                            Acceso 100% bonificado y gratuito a los <strong>32 cursos oficiales</strong> dictados por UNI 3 UNAMA en el departamento de San José.
                        </div>
                        <div className="pf-becas-phone">
                            📞 Celular de gestión de becas: <strong>099 342 372</strong>
                        </div>
                    </div>
                </div>

                <div className="pf-card-large pf-mt-md">
                    <div className="pf-card-large-header">
                        <span className="pf-card-large-title">Convenio Hogar Estudiantil (Apoyo a la Juventud)</span>
                        <span className="pf-card-badge">Acción Social</span>
                    </div>
                    <p className="pf-text-p mb-0">
                        En acuerdo institucional con la <strong>Intendencia Municipal de San José</strong>, parte de nuestras instalaciones se destinan a alojar y acompañar a estudiantes provenientes del interior del departamento, fomentando su formación académica y futuro profesional.
                    </p>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Pág. 4 · Educación y Cultura</span>
            </footer>
        </div>
    );

    /* PÁGINA 5: RED DE RECIPROCIDAD ARPP SAN JOSÉ */
    const Page5Reciprocidad = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 5</span>
            </header>

            <div className="pf-page-body">
                <SectionTitle icon="👥">Red de Reciprocidad — ARPP San José</SectionTitle>
                <p className="pf-text-p pf-text-p--muted mb-2">
                    Mediante alianza estratégica con la Asociación de Retirados y Pensionistas Policiales de San José, nuestros socios acceden directamente a:
                </p>

                <div className="pf-recip-grid-full">
                    <div className="pf-recip-card-full">
                        <div className="pf-recip-card-header">
                            <span className="pf-recip-icon">⚖</span>
                            <span className="pf-recip-title">Asesorías Profesionales Gratuitas</span>
                        </div>
                        <ul className="pf-list-spacious">
                            <li><strong>Asesoría Jurídica:</strong> Dr. Carlos Fajardo.</li>
                            <li><strong>Asesoría Notarial:</strong> Esc. Juan Martín Álvarez.</li>
                            <li><strong>Asesoría de Arquitectura:</strong> Arq. Dayana Píriz.</li>
                        </ul>
                    </div>

                    <div className="pf-recip-card-full">
                        <div className="pf-recip-card-header">
                            <span className="pf-recip-icon">📚</span>
                            <span className="pf-recip-title">Cursos y Biblioteca Social</span>
                        </div>
                        <ul className="pf-list-spacious">
                            <li><strong>Inglés y Apoyo Estudiantil:</strong> Prof. Romina De Brun (099 830 930).</li>
                            <li><strong>Biblioteca Social:</strong> Préstamo gratuito de literatura general e infantil.</li>
                        </ul>
                    </div>

                    <div className="pf-recip-card-full">
                        <div className="pf-recip-card-header">
                            <span className="pf-recip-icon">🏖</span>
                            <span className="pf-recip-title">Alojamiento en Maldonado</span>
                        </div>
                        <p className="pf-text-p mb-0">
                            Apartamentos totalmente equipados con promoción exclusiva de <strong>3 noches al precio de 2</strong>.
                        </p>
                    </div>

                    <div className="pf-recip-card-full">
                        <div className="pf-recip-card-header">
                            <span className="pf-recip-icon">👓</span>
                            <span className="pf-recip-title">Salud, Ópticas y Acompañantes</span>
                        </div>
                        <ul className="pf-list-spacious">
                            <li><strong>20% OFF en Ópticas:</strong> Óptica Sena (Asamblea 595) y Centro Óptico (Batlle y Ordóñez 595).</li>
                            <li><strong>Servicio de Acompañantes DAME (35% OFF):</strong> Cobertura de 8 hrs durante 10 días al año por <strong>$150/mes</strong>. Descuento en cuota social (25 de Mayo 466 - Tel: 4342 2850).</li>
                            <li><strong>Catering Profesional:</strong> Descuentos a coordinar con la Asociación.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Pág. 5 · Red de Reciprocidad</span>
            </footer>
        </div>
    );

    /* PÁGINA 6: CONVENIOS COMERCIALES (PARTE 1) */
    const Page6ConveniosParte1 = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 6</span>
            </header>

            <div className="pf-page-body">
                <SectionTitle icon="🛍️">Convenios Comerciales (Parte 1)</SectionTitle>
                <p className="pf-text-p pf-text-p--muted mb-2">
                    Presentá tu Carnet de Socio junto a tu C.I. para hacer efectivos estos beneficios:
                </p>

                <div className="pf-conv-list-full">
                    {convenios.slice(0, 7).map(c => (
                        <div key={c.id} className="pf-conv-full-card">
                            <div className="pf-conv-full-left">
                                <div className="pf-conv-full-logo">
                                    {c.logo_url ? (
                                        <img src={c.logo_url} alt={c.nombre} />
                                    ) : (
                                        <span>🛍️</span>
                                    )}
                                </div>
                            </div>
                            <div className="pf-conv-full-body">
                                <div className="pf-conv-full-top">
                                    <span className="pf-conv-full-name">{c.nombre}</span>
                                    <span className="pf-conv-full-badge">{c.beneficio}</span>
                                </div>
                                {c.descripcion && (
                                    <div className="pf-conv-full-desc">{c.descripcion}</div>
                                )}
                                <div className="pf-conv-full-meta">
                                    {c.direccion && <span>📍 {c.direccion}</span>}
                                    {(c.telefono || c.whatsapp) && <span>📞 {c.telefono || c.whatsapp}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Pág. 6 · Convenios Comerciales</span>
            </footer>
        </div>
    );

    /* PÁGINA 7: CONVENIOS COMERCIALES (PARTE 2) Y CARNET DE SOCIO */
    const Page7ConveniosParte2 = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 7</span>
            </header>

            <div className="pf-page-body">
                <SectionTitle icon="🛍️">Convenios Comerciales (Parte 2)</SectionTitle>
                <p className="pf-text-p pf-text-p--muted mb-2">
                    Nuestras alianzas:
                </p>

                <div className="pf-conv-list-full">
                    {convenios.slice(7).map(c => (
                        <div key={c.id} className="pf-conv-full-card">
                            <div className="pf-conv-full-left">
                                <div className="pf-conv-full-logo">
                                    {c.logo_url ? (
                                        <img src={c.logo_url} alt={c.nombre} />
                                    ) : (
                                        <span>🛍️</span>
                                    )}
                                </div>
                            </div>
                            <div className="pf-conv-full-body">
                                <div className="pf-conv-full-top">
                                    <span className="pf-conv-full-name">{c.nombre}</span>
                                    <span className="pf-conv-full-badge">{c.beneficio}</span>
                                </div>
                                {c.descripcion && (
                                    <div className="pf-conv-full-desc">{c.descripcion}</div>
                                )}
                                <div className="pf-conv-full-meta">
                                    {c.direccion && <span>📍 {c.direccion}</span>}
                                    {(c.telefono || c.whatsapp) && <span>📞 {c.telefono || c.whatsapp}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Banner de Carnet Oficial */}
                <div className="pf-carnet-card-editorial pf-mt-md">
                    <div className="pf-carnet-icon-lg">🪪</div>
                    <div>
                        <div className="pf-carnet-title-lg">¡Nuevo Carnet de Socio Físico Oficial!</div>
                        <div className="pf-carnet-desc-lg">
                            Ya están disponibles las nuevas credenciales oficiales plastificadas. Retirá la tuya con cualquier miembro de la Comisión Directiva. Presentala junto a tu Cédula de Identidad en todos los comercios adheridos para acceder a los beneficios.
                        </div>
                    </div>
                </div>

                <div className="pf-web-banner pf-mt-sm">
                    🌐 <strong>Guía Digital Interactiva en Vivo:</strong> Consultá comercios y novedades en <strong>circulopolicialsj.org.uy/convenios</strong>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Pág. 7 · Convenios y Carnet</span>
            </footer>
        </div>
    );

    /* PÁGINA 8: CONTRATAPA — COMISIÓN DIRECTIVA, AFILIACIÓN Y SEDE */
    const Page8Contratapa = () => (
        <div className="pf-page-panel pf-page-panel--contratapa">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={26} height={26} />
                    <span className="pf-page-header-inst">CÍRCULO POLICIAL DE SAN JOSÉ</span>
                </div>
                <span className="pf-page-number">PÁGINA 8</span>
            </header>

            <div className="pf-page-body">
                {/* Comisión Directiva Completa */}
                <ComisionDirectiva layout="editorial" />

                {/* Gran Módulo de Afiliación (CTA) */}
                <div className="pf-mt-md">
                    <AffiliationCTA size="large" />
                </div>

                {/* Canales Oficiales y Sede Central */}
                <div className="pf-contact-channels pf-mt-md">
                    <div className="pf-channels-title">CANALES OFICIALES DE ATENCIÓN Y CONTACTO</div>
                    <div className="pf-channels-grid">
                        <div className="pf-channel-box">
                            <span className="pf-channel-icon">📍</span>
                            <div>
                                <div className="pf-channel-lbl">Sede Social Central</div>
                                <div className="pf-channel-val">Ituzaingó N° 441, San José de Mayo</div>
                            </div>
                        </div>
                        <div className="pf-channel-box">
                            <span className="pf-channel-icon">📞</span>
                            <div>
                                <div className="pf-channel-lbl">Reservas y Consultas</div>
                                <div className="pf-channel-val">099 342 372</div>
                            </div>
                        </div>
                        <div className="pf-channel-box">
                            <span className="pf-channel-icon">✉</span>
                            <div>
                                <div className="pf-channel-lbl">Correo Electrónico</div>
                                <div className="pf-channel-val">sanjosecirculopolicial@gmail.com</div>
                            </div>
                        </div>
                        <div className="pf-channel-box">
                            <span className="pf-channel-icon">🌐</span>
                            <div>
                                <div className="pf-channel-lbl">Portal Web Oficial</div>
                                <div className="pf-channel-val">www.circulopolicialsj.org.uy</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="pf-page-footer pf-page-footer--artiguista">
                <div className="pf-artigas-stripe">
                    <span className="pf-stripe-blue"></span>
                    <span className="pf-stripe-white"></span>
                    <span className="pf-stripe-red"></span>
                </div>
                <div className="pf-footer-copy">
                    © 2026 Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo, Uruguay &nbsp;·&nbsp; Pág. 8
                </div>
            </footer>
        </div>
    );

    /* ═══════════════════════════════════════════════════════════════ */
    /*                         RENDER PRINCIPAL                      */
    /* ═══════════════════════════════════════════════════════════════ */
    return (
        <div className="min-vh-100 bg-light py-4 px-2 pf-print-wrapper">
            {/* Barra Superior de Herramientas (No se imprime) */}
            <div className="no-print mb-4 p-3 bg-white shadow-sm rounded-3 mx-auto" style={{ maxWidth: '1150px' }}>
                <Row className="align-items-center g-3">
                    <Col xs={12} lg={3} className="d-flex align-items-center gap-2">
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

                    <Col xs={12} lg={6} className="d-flex justify-content-center flex-wrap gap-2">
                        <Button
                            color={diseno === 'vertical' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('vertical')}
                            style={diseno === 'vertical' ? { backgroundColor: C.navy, borderColor: C.navy, fontWeight: 700 } : {}}
                        >
                            <FileText size={16} /> Ficha A4 (1 Sola Hoja)
                        </Button>
                        <Button
                            color={diseno === 'cuadernillo-plegable' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('cuadernillo-plegable')}
                            style={diseno === 'cuadernillo-plegable' ? { backgroundColor: C.navy, borderColor: C.navy, fontWeight: 700 } : {}}
                        >
                            <Layout size={16} /> Cuadernillo para Doblar (2 Hojas A4 = 4 Carillas)
                        </Button>
                        <Button
                            color={diseno === 'cuadernillo-secuencial' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('cuadernillo-secuencial')}
                            style={diseno === 'cuadernillo-secuencial' ? { backgroundColor: C.navy, borderColor: C.navy, fontWeight: 700 } : {}}
                        >
                            <BookOpen size={16} /> Folleto Completo (8 Págs. Continuas)
                        </Button>
                    </Col>

                    <Col xs={12} lg={3} className="text-lg-end text-center">
                        <Button
                            color="success"
                            size="md"
                            className="d-flex align-items-center gap-2 ms-lg-auto mx-auto rounded-pill px-4 shadow-sm"
                            onClick={handlePrint}
                            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
                        >
                            <Printer size={18} /> Imprimir / Exportar PDF
                        </Button>
                    </Col>
                </Row>

                <div className="mt-3 p-2 bg-light rounded text-muted small text-center border">
                    {diseno === 'vertical' && (
                        <span>💡 <strong>Ficha A4 (1 Sola Hoja):</strong> Tipografía ampliada y diagramación ejecutiva sin espacios vacíos. Orientación <strong>Vertical</strong>, tamaño <strong>A4</strong>. Entra 100% en una sola hoja.</span>
                    )}
                    {diseno === 'cuadernillo-plegable' && (
                        <span>💡 <strong>Cuadernillo para Doblar:</strong> Exporta <strong>4 carillas horizontales (2 hojas A4 doble faz = 8 páginas A5)</strong> con imposición lista para plegar al medio y armar el folleto físico.</span>
                    )}
                    {diseno === 'cuadernillo-secuencial' && (
                        <span>💡 <strong>Folleto 8 Páginas Continuas:</strong> Las 8 páginas en orden correlativo (Pág. 1 a 8), ideal para lectura digital, WhatsApp o envío por correo electrónico.</span>
                    )}
                </div>
            </div>

            {/* ═══ Contenedor de Hojas para Visualización e Impresión ═══ */}
            <div className="pf-canvas">
                {diseno === 'vertical' && (
                    /* ============================================================== */
                    /*           MODO 1: FICHA A4 VERTICAL MEJORADA (1 SOLA HOJA)     */
                    /* ============================================================== */
                    <div className="pf-sheet pf-sheet--portrait" id="ficha-a4">
                        {/* Cabecera Enriquecida */}
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
                                    <div className="pf-header-title">CÍRCULO POLICIAL DE SAN JOSÉ</div>
                                    <div className="pf-header-subtitle">&ldquo;General José G. Artigas&rdquo;</div>
                                    <div className="pf-header-meta">Fundado el 15/04/1944 — Personería Jurídica otorgada el 24/12/1948</div>
                                </div>
                            </div>
                            <div className="pf-header-right">
                                <div className="pf-header-badge">GUÍA DE BENEFICIOS</div>
                                <div className="pf-header-year">EJERCICIO 2026</div>
                            </div>
                        </header>

                        {/* Cuerpo Principal en 2 Columnas Generosas */}
                        <div className="pf-body-2col">
                            {/* Columna Izquierda: Servicios e Infraestructura */}
                            <div className="pf-body-col pf-body-col--left">
                                <SectionTitle icon="🏠">Servicios e Infraestructura</SectionTitle>

                                <div className="pf-benefit-block">
                                    <div className="pf-benefit-title">Cabañas en Balneario Ordeig (Kiyú - Cno. Mauricio)</div>
                                    <p className="pf-text">
                                        Dos cabañas equipadas para <strong>4 personas</strong> con <strong>Direct TV incluido</strong> y parrillero individual.
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                        <PriceTag>Socio: <strong>$1.500 / día</strong> &nbsp;|&nbsp; No Socio: <strong>$2.500 / día</strong></PriceTag>
                                        <PhoneLine>📞 Reservas: <strong>099 342 372</strong></PhoneLine>
                                    </div>
                                </div>

                                <div className="pf-benefit-block pf-mt-xs">
                                    <div className="pf-benefit-title">Salones de Fiestas y Eventos (Sede Central Ituzaingó 441)</div>
                                    <p className="pf-text">
                                        Espacios equipados y climatizados. Incluye <strong>freezer, uso de parrillas y limpieza final posterior</strong>.
                                    </p>
                                    <div className="pf-mt-xs d-flex gap-2">
                                        <PriceTag>Grande (60 p.): Socio <strong>$4.200</strong> / No Socio <strong>$7.000</strong></PriceTag>
                                        <PriceTag>Chico (25 p.): Socio <strong>$2.000</strong> / No Socio <strong>$3.800</strong></PriceTag>
                                    </div>
                                </div>

                                <div className="pf-benefit-block pf-mt-xs">
                                    <div className="pf-benefit-title">Canastas Navideñas Anuales</div>
                                    <p className="pf-text">
                                        Tradicional obsequio de fin de año con canasta navideña de excelente categoría para el 100% de los socios al día.
                                    </p>
                                </div>

                                <SectionTitle icon="🌟" className="pf-mt-xs">Compromiso y Apoyo Social</SectionTitle>
                                <div className="pf-benefit-block">
                                    <div className="pf-benefit-title">Convenio Hogar Estudiantil</div>
                                    <p className="pf-text">
                                        En acuerdo con la Intendencia de San José, alojamos y apoyamos a estudiantes del interior departamental.
                                    </p>
                                </div>
                            </div>

                            {/* Columna Derecha: Alianzas y Reciprocidad */}
                            <div className="pf-body-col pf-body-col--right">
                                <SectionTitle icon="🎓">Alianzas Educativas Directas</SectionTitle>
                                <div className="pf-benefit-block">
                                    <div className="pf-benefit-title">Convenio Directo UNI 3 UNAMA</div>
                                    <p className="pf-text">
                                        Alianza directa para desarrollo cultural y bienestar físico de nuestros afiliados:
                                    </p>
                                    <ul className="pf-list">
                                        <li><strong>Talleres Gratuitos en Sede:</strong> Danza y Baile en Línea (Lun 9:30), Yoga (Mar 14:00), Folklore (Vie 15:00).</li>
                                        <li><strong>10 Becas Completas de Estudio:</strong> 100% libres para 32 cursos oficiales (Gestión: <strong>099 342 372</strong>).</li>
                                    </ul>
                                </div>

                                <SectionTitle icon="👥" className="pf-mt-xs">Red de Reciprocidad (ARPP San José)</SectionTitle>
                                <p className="pf-text pf-text--muted pf-text--xs">
                                    Mediante alianza con la Asociación de Retirados y Pensionistas Policiales:
                                </p>
                                <div className="pf-benefit-block">
                                    <div className="pf-benefit-title">Asesorías Profesionales Gratuitas</div>
                                    <ul className="pf-list">
                                        <li><strong>Jurídica:</strong> Dr. Carlos Fajardo &nbsp;·&nbsp; <strong>Notarial:</strong> Esc. Juan M. Álvarez.</li>
                                        <li><strong>Arquitectura y Obras:</strong> Arq. Dayana Píriz.</li>
                                    </ul>
                                </div>

                                <div className="pf-benefit-block">
                                    <div className="pf-benefit-title">Cursos, Biblioteca y Alojamiento</div>
                                    <ul className="pf-list">
                                        <li><strong>Inglés y Apoyo Estudiantil:</strong> Prof. Romina De Brun (099 830 930).</li>
                                        <li><strong>Biblioteca Social:</strong> Préstamo gratuito de literatura general e infantil.</li>
                                        <li><strong>Alojamiento en Maldonado:</strong> Departamentos con beneficio <strong>3x2</strong>.</li>
                                    </ul>
                                </div>

                                <div className="pf-benefit-block">
                                    <div className="pf-benefit-title">Salud, Ópticas y Acompañantes</div>
                                    <p className="pf-text">
                                        <strong>20% OFF</strong> en Óptica Sena y Centro Óptico &nbsp;·&nbsp; <strong>DAME:</strong> 35% OFF (8 hrs x 10 días a $150/mes).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Convenios Comerciales en Grilla Compacta pero Legible */}
                        <div className="pf-convenios-section">
                            <SectionTitle icon="🛍️">Convenios Comerciales (Descuentos con Carné de Socio)</SectionTitle>
                            <div className="pf-convenios-grid">
                                {convenios.map(c => (
                                    <div key={c.id} className="pf-convenio-card">
                                        <div className="pf-convenio-logo">
                                            {c.logo_url ? (
                                                <img src={c.logo_url} alt={c.nombre} />
                                            ) : (
                                                <span>🛍️</span>
                                            )}
                                        </div>
                                        <div className="pf-convenio-info">
                                            <div className="pf-convenio-header">
                                                <span className="pf-convenio-name">{c.nombre}</span>
                                                <span className="pf-convenio-badge">{c.beneficio}</span>
                                            </div>
                                            <div className="pf-convenio-meta">
                                                {c.direccion && (
                                                    <span className="pf-meta-text">📍 {c.direccion}</span>
                                                )}
                                                {(c.telefono || c.whatsapp) && (
                                                    <span className="pf-meta-text">📞 {c.telefono || c.whatsapp}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pf-convenios-note">
                                🌐 Más detalles y convenios actualizados en: <strong>circulopolicialsj.org.uy/convenios</strong>
                            </div>
                        </div>

                        {/* Banner Carnet Físico */}
                        <div className="pf-carnet-banner">
                            <strong>¡Retirá tu Nuevo Carnet de Socio Físico!</strong> — Ya estamos entregando las credenciales oficiales plastificadas. Solicitalo a los miembros de la Directiva. Presentalo junto a tu C.I. para validar descuentos.
                        </div>

                        {/* Footer con CTA Afiliación y Comisión Directiva */}
                        <footer className="pf-footer">
                            <div className="pf-footer-grid">
                                <div className="pf-footer-cta-col">
                                    <AffiliationCTA size="compact" />
                                </div>
                                <div className="pf-footer-comision-col">
                                    <ComisionDirectiva layout="compact" />
                                </div>
                            </div>
                        </footer>
                    </div>
                )}

                {diseno === 'cuadernillo-plegable' && (
                    /* ============================================================== */
                    /*   MODO 2: CUADERNILLO 2 HOJAS A4 (4 CARILLAS HORIZONTALES)     */
                    /* ============================================================== */
                    <div className="pf-cuadernillo-canvas" id="cuadernillo-plegable">
                        {/* CARILLA 1: HOJA 1 FRENTE (Página 8 Contratapa a la izquierda + Página 1 Portada a la derecha) */}
                        <div className="pf-sheet pf-sheet--landscape pf-page-break">
                            <div className="pf-spread-row">
                                <div className="pf-spread-half pf-spread-half--border">
                                    <Page8Contratapa />
                                </div>
                                <div className="pf-spread-half">
                                    <Page1Portada />
                                </div>
                            </div>
                        </div>

                        {/* CARILLA 2: HOJA 1 REVERSO (Página 2 Cabañas a la izquierda + Página 7 Convenios 2 a la derecha) */}
                        <div className="pf-sheet pf-sheet--landscape pf-page-break">
                            <div className="pf-spread-row">
                                <div className="pf-spread-half pf-spread-half--border">
                                    <Page2Cabanas />
                                </div>
                                <div className="pf-spread-half">
                                    <Page7ConveniosParte2 />
                                </div>
                            </div>
                        </div>

                        {/* CARILLA 3: HOJA 2 FRENTE (Página 6 Convenios 1 a la izquierda + Página 3 Salones a la derecha) */}
                        <div className="pf-sheet pf-sheet--landscape pf-page-break">
                            <div className="pf-spread-row">
                                <div className="pf-spread-half pf-spread-half--border">
                                    <Page6ConveniosParte1 />
                                </div>
                                <div className="pf-spread-half">
                                    <Page3Salones />
                                </div>
                            </div>
                        </div>

                        {/* CARILLA 4: HOJA 2 REVERSO / CENTRO (Página 4 Educación a la izquierda + Página 5 Reciprocidad a la derecha) */}
                        <div className="pf-sheet pf-sheet--landscape">
                            <div className="pf-spread-row">
                                <div className="pf-spread-half pf-spread-half--border">
                                    <Page4Educacion />
                                </div>
                                <div className="pf-spread-half">
                                    <Page5Reciprocidad />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {diseno === 'cuadernillo-secuencial' && (
                    /* ============================================================== */
                    /*   MODO 3: FOLLETO SECUENCIAL 8 PÁGINAS CONTINUAS (A5)          */
                    /* ============================================================== */
                    <div className="pf-secuencial-canvas" id="cuadernillo-secuencial">
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page1Portada /></div>
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page2Cabanas /></div>
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page3Salones /></div>
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page4Educacion /></div>
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page5Reciprocidad /></div>
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page6ConveniosParte1 /></div>
                        <div className="pf-sheet pf-sheet--a5 pf-page-break"><Page7ConveniosParte2 /></div>
                        <div className="pf-sheet pf-sheet--a5"><Page8Contratapa /></div>
                    </div>
                )}
            </div>

            {/* ═══════════ CSS GLOBAL — Print-Friendly Redesign ═══════════ */}
            <style jsx global>{`
                /* ═══ CANVAS BASE ═══ */
                .pf-canvas {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-bottom: 3rem;
                }

                .pf-sheet {
                    box-sizing: border-box;
                    background: ${C.white};
                    font-family: var(--font-muli), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    color: ${C.body};
                    position: relative;
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09);
                    margin-bottom: 2.5rem;
                }

                /* Ficha A4 Vertical */
                .pf-sheet--portrait {
                    width: 210mm;
                    height: 296mm;
                    padding: 7mm 10mm 5mm 10mm;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                }

                /* Hoja A4 Horizontal para 2 Carillas A5 */
                .pf-sheet--landscape {
                    width: 297mm;
                    height: 210mm;
                    padding: 0;
                    overflow: hidden;
                }

                /* Hoja A5 individual continua */
                .pf-sheet--a5 {
                    width: 148.5mm;
                    height: 210mm;
                    padding: 6mm 8mm;
                    overflow: hidden;
                }

                /* Fila de 2 carillas en pliego A4 apaisado */
                .pf-spread-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
                    width: 100%;
                }

                .pf-spread-half {
                    padding: 7mm 10mm 6mm 10mm;
                    height: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .pf-spread-half--border {
                    border-right: 1px dashed ${C.border};
                }

                /* ═══ FICHA A4 VERTICAL ESTILOS ═══ */
                .pf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 5px;
                    border-bottom: 3px solid ${C.navy};
                    position: relative;
                }

                .pf-header::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    right: 0;
                    height: 1.5px;
                    background: ${C.goldLight};
                }

                .pf-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .pf-header-logo {
                    position: relative;
                    width: 50px;
                    height: 50px;
                    flex-shrink: 0;
                }

                .pf-header-title {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    line-height: 1.1;
                }

                .pf-header-subtitle {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: ${C.gold};
                    font-style: italic;
                }

                .pf-header-meta {
                    font-size: 0.68rem;
                    color: ${C.mutedLight};
                    font-weight: 500;
                }

                .pf-header-right {
                    text-align: right;
                }

                .pf-header-badge {
                    font-size: 1.15rem;
                    font-weight: 900;
                    color: ${C.accent};
                    letter-spacing: 0.5px;
                    line-height: 1.1;
                }

                .pf-header-year {
                    font-size: 0.78rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 1.5px;
                }

                .pf-body-2col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                    margin-top: 6px;
                }

                .pf-body-col--left {
                    padding-right: 12px;
                    border-right: 1px solid ${C.borderLight};
                }

                .pf-body-col--right {
                    padding-left: 2px;
                }

                .pf-section-title {
                    font-size: 0.86rem;
                    font-weight: 900;
                    color: ${C.navy};
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    border-bottom: 2px solid ${C.goldLight};
                    padding-bottom: 2px;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pf-benefit-block {
                    margin-bottom: 5px;
                }

                .pf-benefit-title {
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: ${C.navyLight};
                    line-height: 1.22;
                }

                .pf-text {
                    font-size: 0.72rem;
                    color: ${C.body};
                    margin: 1px 0;
                    line-height: 1.30;
                }

                .pf-text--muted {
                    color: ${C.muted};
                }

                .pf-text--xs {
                    font-size: 0.65rem;
                }

                .pf-list {
                    margin: 2px 0 0 0;
                    padding-left: 15px;
                    font-size: 0.70rem;
                    color: ${C.body};
                    line-height: 1.25;
                }

                .pf-list li {
                    margin-bottom: 1px;
                }

                .pf-phone {
                    font-size: 0.72rem;
                    color: ${C.navy};
                    font-weight: 800;
                }

                .pf-price {
                    font-size: 0.72rem;
                    color: ${C.accent};
                    font-weight: 800;
                    display: inline-block;
                    padding: 1px 8px;
                    background: ${C.accentSoft};
                    border: 1px solid ${C.accentBorder};
                    border-radius: 4px;
                    line-height: 1.25;
                }

                .pf-mt-xs { margin-top: 4px; }
                .pf-mt-sm { margin-top: 8px; }
                .pf-mt-md { margin-top: 12px; }

                /* Grilla de Convenios Ficha A4 */
                .pf-convenios-section {
                    border-top: 2px solid ${C.borderLight};
                    padding-top: 5px;
                    margin-top: 5px;
                }

                .pf-convenios-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 4px;
                    margin-top: 4px;
                }

                .pf-convenio-card {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 6px;
                    border: 1px solid ${C.borderLight};
                    border-radius: 4px;
                    background: #FFFFFF;
                    min-width: 0;
                    overflow: hidden;
                }

                .pf-convenio-logo {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${C.bgLight};
                    border-radius: 3px;
                    overflow: hidden;
                }

                .pf-convenio-logo img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .pf-convenio-info {
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                }

                .pf-convenio-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 3px;
                    min-width: 0;
                }

                .pf-convenio-name {
                    font-size: 0.66rem;
                    font-weight: 800;
                    color: ${C.navy};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-convenio-badge {
                    font-size: 0.55rem;
                    font-weight: 800;
                    color: ${C.accent};
                    background: ${C.accentSoft};
                    border: 0.5px solid ${C.accentBorder};
                    padding: 0px 4px;
                    border-radius: 3px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .pf-convenio-meta {
                    font-size: 0.56rem;
                    color: ${C.muted};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.15;
                }

                .pf-meta-text {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .pf-convenios-note {
                    text-align: center;
                    font-size: 0.62rem;
                    color: ${C.mutedLight};
                    margin-top: 3px;
                }

                .pf-carnet-banner {
                    padding: 5px 10px;
                    background: ${C.goldPale};
                    border: 1.5px solid ${C.goldBorder};
                    border-radius: 4px;
                    font-size: 0.70rem;
                    color: ${C.navyDark};
                    line-height: 1.25;
                    margin-top: 4px;
                }

                .pf-footer {
                    border-top: 2.5px solid ${C.navy};
                    padding-top: 5px;
                    margin-top: auto;
                }

                .pf-footer-grid {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 10px;
                    align-items: start;
                }

                /* CTA Afiliación */
                .pf-cta-box {
                    border: 1.5px solid ${C.navy};
                    border-radius: 4px;
                    padding: 6px;
                    background: #FFFFFF;
                }

                .pf-cta-box--lg {
                    padding: 10px 14px;
                    border: 2px solid ${C.navy};
                    border-radius: 6px;
                    background: linear-gradient(135deg, #FFFFFF 0%, ${C.bgLight} 100%);
                }

                .pf-cta-inner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pf-cta-box--lg .pf-cta-inner {
                    gap: 14px;
                }

                .pf-cta-qr {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-shrink: 0;
                }

                .pf-cta-box--sm .pf-qr-img {
                    width: 66px;
                    height: 66px;
                }

                .pf-cta-box--lg .pf-qr-img {
                    width: 76px;
                    height: 76px;
                }

                .pf-qr-label {
                    font-size: 0.46rem;
                    font-weight: 800;
                    color: ${C.accent};
                    letter-spacing: 0.3px;
                    margin-top: 2px;
                    text-align: center;
                }

                .pf-cta-text {
                    flex: 1;
                    min-width: 0;
                }

                .pf-cta-headline {
                    font-size: 0.72rem;
                    font-weight: 900;
                    color: ${C.navy};
                    line-height: 1.15;
                }

                .pf-cta-box--lg .pf-cta-headline {
                    font-size: 0.88rem;
                }

                .pf-cta-price-wrap {
                    display: flex;
                    align-items: baseline;
                    gap: 3px;
                    margin: 1px 0;
                }

                .pf-cta-amount {
                    font-size: 1.30rem;
                    font-weight: 900;
                    color: ${C.accent};
                    line-height: 1;
                }

                .pf-cta-box--lg .pf-cta-amount {
                    font-size: 1.50rem;
                }

                .pf-cta-period {
                    font-size: 0.62rem;
                    font-weight: 700;
                    color: ${C.muted};
                }

                .pf-cta-desc {
                    font-size: 0.58rem;
                    color: ${C.body};
                    line-height: 1.25;
                }

                .pf-cta-box--lg .pf-cta-desc {
                    font-size: 0.68rem;
                }

                .pf-cta-link {
                    font-size: 0.58rem;
                    color: ${C.navy};
                    margin-top: 2px;
                }

                /* Comisión Directiva */
                .pf-comision--compact .pf-comision-header {
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: ${C.navy};
                    border-bottom: 1.5px solid ${C.goldLight};
                    padding-bottom: 1px;
                    margin-bottom: 2px;
                }

                .pf-comision-grid-compact {
                    display: grid;
                    grid-template-columns: 1.35fr 1.65fr 0.95fr;
                    gap: 6px;
                }

                .pf-comision-col--border {
                    border-right: 1px solid ${C.borderLight};
                    padding-right: 4px;
                }

                .pf-comision-subtitle {
                    font-size: 0.50rem;
                    font-weight: 800;
                    color: ${C.gold};
                    text-transform: uppercase;
                    border-bottom: 1px solid ${C.borderLight};
                    margin-bottom: 2px;
                }

                .pf-mesa-row {
                    font-size: 0.50rem;
                    line-height: 1.28;
                    white-space: nowrap;
                }

                .pf-mesa-cargo {
                    color: ${C.muted};
                    display: inline-block;
                    width: 44px;
                }

                .pf-mesa-rango { color: ${C.mutedLight}; }
                .pf-mesa-nombre { font-weight: 700; color: ${C.navyDark}; }

                .pf-vocales-grid-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 4px;
                }

                .pf-vocal {
                    font-size: 0.48rem;
                    line-height: 1.28;
                    white-space: nowrap;
                }

                .pf-vocal-rango { color: ${C.mutedLight}; }
                .pf-vocal-nombre { font-weight: 700; color: ${C.navyDark}; }

                /* ═══════════════════════════════════════════════════════════════ */
                /*       ESTILOS DEL CUADERNILLO / FOLLETO 8 PÁGINAS A5           */
                /* ═══════════════════════════════════════════════════════════════ */
                .pf-page-panel {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-sizing: border-box;
                }

                .pf-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 5px;
                    border-bottom: 2px solid ${C.navy};
                    margin-bottom: 8px;
                }

                .pf-page-header-left {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                }

                .pf-page-header-inst {
                    font-size: 0.76rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                }

                .pf-page-number {
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: ${C.navy};
                    background: ${C.goldPale};
                    border: 1px solid ${C.goldBorder};
                    padding: 1px 7px;
                    border-radius: 3px;
                }

                .pf-page-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .pf-page-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid ${C.borderLight};
                    padding-top: 4px;
                    margin-top: 6px;
                    font-size: 0.60rem;
                    color: ${C.mutedLight};
                }

                /* Tarjetas amplias para llenar armónicamente el espacio A5 */
                .pf-card-large {
                    background: #FFFFFF;
                    border: 1.5px solid ${C.borderLight};
                    border-radius: 6px;
                    padding: 9px 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }

                .pf-card-large-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1.5px solid ${C.borderSubtle};
                    padding-bottom: 4px;
                    margin-bottom: 6px;
                }

                .pf-card-large-title {
                    font-size: 0.86rem;
                    font-weight: 900;
                    color: ${C.navy};
                }

                .pf-card-badge {
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: ${C.navyLight};
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    padding: 2px 7px;
                    border-radius: 12px;
                    white-space: nowrap;
                }

                .pf-text-p {
                    font-size: 0.74rem;
                    color: ${C.body};
                    line-height: 1.35;
                    margin-bottom: 6px;
                }

                .pf-text-p--muted {
                    color: ${C.muted};
                }

                .pf-feature-box {
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    border-radius: 5px;
                    padding: 8px 10px;
                    margin-top: 6px;
                }

                .pf-feature-box-title {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: ${C.navyDark};
                    margin-bottom: 4px;
                }

                .pf-list-spacious {
                    margin: 0;
                    padding-left: 15px;
                    font-size: 0.72rem;
                    color: ${C.body};
                    line-height: 1.35;
                }

                .pf-list-spacious li {
                    margin-bottom: 3px;
                }

                .pf-price-box {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    background: ${C.accentSoft};
                    border: 1.5px solid ${C.accentBorder};
                    border-radius: 6px;
                    padding: 6px 12px;
                }

                .pf-price-box-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pf-price-box-label {
                    font-size: 0.68rem;
                    font-weight: 800;
                    color: ${C.muted};
                }

                .pf-price-box-val {
                    font-size: 0.88rem;
                    font-weight: 900;
                    color: ${C.navyDark};
                }

                .pf-price-box-val--accent {
                    color: ${C.accent};
                }

                .pf-price-box-divider {
                    width: 1px;
                    height: 24px;
                    background: ${C.accentBorder};
                }

                .pf-booking-alert {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #FFFFFF;
                    border: 1.5px solid ${C.navy};
                    border-radius: 5px;
                    padding: 7px 12px;
                }

                .pf-booking-alert-icon { font-size: 1.2rem; }
                .pf-booking-alert-title { font-size: 0.72rem; color: ${C.muted}; }
                .pf-booking-alert-num { font-size: 0.82rem; color: ${C.navy}; }

                .pf-card-festive {
                    background: ${C.goldPale};
                    border: 1.5px solid ${C.goldBorder};
                    border-radius: 6px;
                    padding: 9px 12px;
                }

                .pf-card-festive-title {
                    font-size: 0.82rem;
                    font-weight: 900;
                    color: ${C.navyDark};
                    margin-bottom: 4px;
                }

                .pf-becas-box {
                    background: #FFFFFF;
                    border: 1.5px solid ${C.goldLight};
                    border-radius: 6px;
                    padding: 8px 12px;
                    text-align: center;
                }

                .pf-becas-badge {
                    font-size: 0.78rem;
                    font-weight: 900;
                    color: ${C.gold};
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }

                .pf-becas-desc {
                    font-size: 0.72rem;
                    color: ${C.body};
                    line-height: 1.25;
                }

                .pf-becas-phone {
                    font-size: 0.74rem;
                    color: ${C.navy};
                    font-weight: 800;
                    margin-top: 4px;
                }

                /* Red de Reciprocidad Cuadernillo */
                .pf-recip-grid-full {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }

                .pf-recip-card-full {
                    background: #FFFFFF;
                    border: 1px solid ${C.borderLight};
                    border-radius: 5px;
                    padding: 7px 11px;
                }

                .pf-recip-card-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-bottom: 1px solid ${C.borderSubtle};
                    padding-bottom: 3px;
                    margin-bottom: 4px;
                }

                .pf-recip-icon { font-size: 0.85rem; }
                .pf-recip-title {
                    font-size: 0.78rem;
                    font-weight: 800;
                    color: ${C.navy};
                }

                /* Listado de Convenios Comerciales Ampliado */
                .pf-conv-list-full {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                }

                .pf-conv-full-card {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid ${C.borderLight};
                    border-radius: 5px;
                    padding: 5px 8px;
                    background: #FFFFFF;
                }

                .pf-conv-full-left {
                    flex-shrink: 0;
                }

                .pf-conv-full-logo {
                    width: 32px;
                    height: 32px;
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .pf-conv-full-logo img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .pf-conv-full-body {
                    flex: 1;
                    min-width: 0;
                }

                .pf-conv-full-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 6px;
                }

                .pf-conv-full-name {
                    font-size: 0.74rem;
                    font-weight: 900;
                    color: ${C.navy};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-conv-full-badge {
                    font-size: 0.62rem;
                    font-weight: 900;
                    color: ${C.accent};
                    background: ${C.accentSoft};
                    border: 1px solid ${C.accentBorder};
                    padding: 1px 6px;
                    border-radius: 3px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .pf-conv-full-desc {
                    font-size: 0.62rem;
                    color: ${C.muted};
                    line-height: 1.2;
                    margin: 1px 0;
                }

                .pf-conv-full-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-size: 0.58rem;
                    color: ${C.navyLight};
                    font-weight: 600;
                }

                .pf-carnet-card-editorial {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: ${C.goldPale};
                    border: 1.5px solid ${C.goldBorder};
                    border-radius: 6px;
                    padding: 7px 11px;
                }

                .pf-carnet-icon-lg { font-size: 1.4rem; }
                .pf-carnet-title-lg { font-size: 0.76rem; font-weight: 800; color: ${C.navyDark}; }
                .pf-carnet-desc-lg { font-size: 0.64rem; color: ${C.body}; line-height: 1.25; }

                .pf-web-banner {
                    text-align: center;
                    font-size: 0.66rem;
                    color: ${C.navy};
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                /* PORTADA PÁGINA 1 */
                .pf-page-panel--portada {
                    padding: 0;
                }

                .pf-portada-border {
                    height: 100%;
                    border: 2px solid ${C.navy};
                    padding: 14px 18px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: #FFFFFF;
                    position: relative;
                }

                .pf-portada-border::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border: 1px solid ${C.goldLight};
                    pointer-events: none;
                }

                .pf-portada-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin: auto 0;
                }

                .pf-portada-logo {
                    position: relative;
                    width: 105px;
                    height: 105px;
                    filter: drop-shadow(0 4px 10px rgba(0, 43, 73, 0.15));
                    margin-bottom: 12px;
                }

                .pf-portada-title-1 {
                    font-size: 1.70rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    line-height: 1.05;
                    margin: 0;
                }

                .pf-portada-title-2 {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: ${C.navyLight};
                    letter-spacing: 2px;
                    line-height: 1.05;
                    margin: 2px 0 0 0;
                }

                .pf-portada-artigas {
                    font-size: 0.90rem;
                    font-weight: 700;
                    color: ${C.gold};
                    font-style: italic;
                    margin-top: 4px;
                }

                .pf-portada-divider {
                    width: 70px;
                    height: 2px;
                    background: ${C.goldLight};
                    margin: 16px auto 14px auto;
                    border-radius: 2px;
                }

                .pf-portada-badge-guia {
                    font-size: 0.76rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                }

                .pf-portada-badge-year {
                    font-size: 1.15rem;
                    font-weight: 900;
                    color: ${C.accent};
                    background: ${C.accentSoft};
                    border: 2px solid ${C.accent};
                    padding: 4px 22px;
                    border-radius: 24px;
                    letter-spacing: 1.5px;
                    margin-top: 10px;
                }

                .pf-portada-bottom {
                    border-top: 1px solid ${C.borderLight};
                    padding-top: 10px;
                    text-align: center;
                }

                .pf-portada-legal {
                    font-size: 0.65rem;
                    color: ${C.mutedLight};
                    font-weight: 600;
                    margin-bottom: 6px;
                }

                .pf-portada-contacts {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3px 10px;
                    font-size: 0.62rem;
                    color: ${C.navyDark};
                    text-align: left;
                }

                /* CONTRATAPA PÁGINA 8 */
                .pf-comision--editorial {
                    border: 1.5px solid ${C.navy};
                    border-radius: 6px;
                    padding: 7px 10px;
                    background: #FFFFFF;
                    overflow: hidden;
                }

                .pf-comision-header-editorial {
                    font-size: 0.70rem;
                    font-weight: 900;
                    color: ${C.navy};
                    text-align: center;
                    letter-spacing: 0.8px;
                    border-bottom: 1.5px solid ${C.goldLight};
                    padding-bottom: 3px;
                    margin-bottom: 5px;
                }

                .pf-comision-editorial-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .pf-comision-box-title {
                    font-size: 0.54rem;
                    font-weight: 800;
                    color: ${C.gold};
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid ${C.borderLight};
                    padding-bottom: 2px;
                    margin-bottom: 3px;
                }

                .pf-mesa-editorial-list .pf-mesa-row {
                    font-size: 0.50rem;
                    line-height: 1.25;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-mesa-editorial-list .pf-mesa-cargo {
                    width: 58px;
                }

                .pf-vocales-editorial-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 4px;
                }

                .pf-vocales-editorial-grid .pf-vocal {
                    font-size: 0.48rem;
                    line-height: 1.25;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-fiscal-editorial-list .pf-vocal {
                    font-size: 0.50rem;
                    line-height: 1.25;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-contact-channels {
                    border: 1px solid ${C.borderLight};
                    border-radius: 6px;
                    padding: 7px 11px;
                    background: #FFFFFF;
                }

                .pf-channels-title {
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid ${C.borderLight};
                    padding-bottom: 2px;
                    margin-bottom: 5px;
                    text-align: center;
                }

                .pf-channels-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px 12px;
                }

                .pf-channel-box {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pf-channel-icon { font-size: 0.80rem; }
                .pf-channel-lbl {
                    font-size: 0.50rem;
                    color: ${C.mutedLight};
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .pf-channel-val {
                    font-size: 0.62rem;
                    font-weight: 700;
                    color: ${C.navy};
                }

                .pf-page-footer--artiguista {
                    flex-direction: column;
                    gap: 4px;
                    border: none;
                    padding: 0;
                    margin-top: 8px;
                }

                .pf-artigas-stripe {
                    display: flex;
                    height: 4px;
                    width: 100%;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .pf-stripe-blue { flex: 1; background: ${C.navyLight}; }
                .pf-stripe-white { flex: 1; background: #FFFFFF; border-top: 1px solid ${C.borderLight}; border-bottom: 1px solid ${C.borderLight}; }
                .pf-stripe-red { flex: 1; background: ${C.accent}; }

                .pf-footer-copy {
                    font-size: 0.58rem;
                    color: ${C.mutedLight};
                    text-align: center;
                }

                /* ═══════════════════════════════════════════════════════════════ */
                /*                         @MEDIA PRINT                            */
                /* ═══════════════════════════════════════════════════════════════ */
                @media print {
                    nav,
                    .navbar,
                    header:not(.pf-header):not(.pf-page-header),
                    footer:not(.pf-footer):not(.pf-page-footer),
                    body > header,
                    body > nav,
                    body > footer,
                    .no-print,
                    .d-print-none {
                        display: none !important;
                    }

                    body, html {
                        background-color: #FFFFFF !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    }

                    .min-vh-100 { min-height: auto !important; }
                    .bg-light { background-color: transparent !important; }
                    .pf-print-wrapper { padding: 0 !important; margin: 0 !important; background: none !important; }
                    .pf-canvas { padding: 0 !important; margin: 0 !important; display: block !important; }

                    .pf-sheet {
                        box-shadow: none !important;
                        margin: 0 !important;
                        border: none !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* Ficha A4 Vertical */
                    .pf-sheet--portrait {
                        width: 210mm !important;
                        height: 296mm !important;
                        max-height: 296mm !important;
                        padding: 7mm 10mm 5mm 10mm !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    #ficha-a4 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    /* Cuadernillo 2 Hojas Horizontales (4 Carillas) */
                    .pf-cuadernillo-canvas .pf-sheet--landscape {
                        width: 297mm !important;
                        height: 209mm !important;
                        max-height: 209mm !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    .pf-spread-half {
                        padding: 6mm 9mm 5mm 9mm !important;
                    }

                    .pf-page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    @page {
                        size: ${diseno === 'cuadernillo-plegable' ? 'A4 landscape' : 'A4 portrait'};
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
