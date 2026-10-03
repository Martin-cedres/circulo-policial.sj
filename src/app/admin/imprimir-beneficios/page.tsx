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

/* Convenios por defecto para garantizar carga inmediata y sin errores */
const CONVENIOS_DEFAULT: Convenio[] = [
    {
        id: 1,
        nombre: 'CECATEC',
        categoria: 'Educación y Capacitación',
        beneficio: '10% OFF y 50% OFF',
        descripcion: '10% de dto. en todos los cursos presenciales. 50% de dto. a hijos de socios de 14 a 17 años de edad.',
        direccion: 'Eduardo Víctor Haedo 2146, Montevideo',
        telefono: '094 200 800',
    },
    {
        id: 2,
        nombre: 'Carnicería Colón',
        categoria: 'Alimentación',
        beneficio: '10% OFF',
        descripcion: '10% de descuento en compras para socios del Círculo Policial San José.',
        direccion: 'Ellauri casi Santiago Vázquez, San José de Mayo',
        telefono: '',
    },
    {
        id: 3,
        nombre: 'Carnicería Digui',
        categoria: 'Alimentación',
        beneficio: '10% OFF',
        descripcion: 'Presentando carné de socio del círculo policial, accede a un 10% de descuento en tus compras.',
        direccion: 'Av. Dr. Luis Alberto de Herrera y Acuña de Figueroa',
        telefono: '4342 3069',
        logo_url: '/images/convenio-digui.jpg',
    },
    {
        id: 4,
        nombre: 'Complejo El Abasto',
        categoria: 'Deportes y Recreación',
        beneficio: 'Cancha Fútbol 5 a $U 1.000',
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
        descripcion: '5% de descuento en artículos y productos chicos; 3% de descuento en herramientas y objetos de mayor tamaño.',
        direccion: 'Avda. Dr. Luis Alberto de Herrera y Colón',
        telefono: '4342 3890',
    },
    {
        id: 6,
        nombre: 'Inmobiliaria Montaño',
        categoria: 'Inmobiliaria',
        beneficio: '10% dto en nuevos alquileres',
        descripcion: '10% de descuento en nuevos contratos de alquiler para socios del Círculo Policial San José.',
        direccion: 'San José de Mayo',
        telefono: '092 776 715',
        logo_url: '/images/convenio-inmobiliaria-montano.jpg',
    },
    {
        id: 7,
        nombre: 'Kamapuso Papelería Personalizada',
        categoria: 'Comercio y Regalería',
        beneficio: '10% OFF',
        descripcion: '10% de descuento en papelería personalizada e impresiones.',
        direccion: 'Calle Ramón Massini N° 136, San José de Mayo',
        telefono: '098 615 074',
        logo_url: '/images/convenio-kamaluso.jpg',
    },
    {
        id: 8,
        nombre: 'La Lentería',
        categoria: 'Salud y Óptica',
        beneficio: '25% OFF',
        descripcion: 'La lentería otorga un 25% de descuento a los socios del Círculo Policial de San José.',
        direccion: 'Asamblea 582, San José de Mayo',
        telefono: '4343 5635',
        logo_url: '/images/convenio-lenteria.jpg',
    },
    {
        id: 9,
        nombre: 'Óptica Florida',
        categoria: 'Salud y Óptica',
        beneficio: '20% en armazón y cristales',
        descripcion: '20% en armazón y cristales (receta). 2x1 en recetas. 15% en lentes de contacto. 10% en sol.',
        direccion: 'Sarandí N° 515, San José de Mayo',
        telefono: '4346 3882',
    },
    {
        id: 10,
        nombre: 'Riogas San José',
        categoria: 'Hogar y Energía',
        beneficio: '25% OFF y 10% OFF',
        descripcion: '25% dto en envío dentro de San José de Mayo. 10% dto en accesorios y repuestos.',
        direccion: 'Atilio Pelossi N° 052, San José de Mayo',
        telefono: '4342 1710',
        logo_url: '/images/convenio-riogas.jpg',
    },
    {
        id: 11,
        nombre: 'VAL ORTOPEDIA',
        categoria: 'Salud y Bienestar',
        beneficio: '10% OFF',
        descripcion: '10% de descuento sobre precio de lista en productos de ortopedia e insumos médicos.',
        direccion: '25 de Mayo 704, San José de Mayo',
        telefono: '4343 7412',
        logo_url: '/images/convenio-val-ortopedia.jpg',
    },
    {
        id: 12,
        nombre: 'VCA STORE',
        categoria: 'Tecnología y Hogar',
        beneficio: '10% OFF y 5% OFF',
        descripcion: '10% dto en audio, TV, accesorios, movilidad eléctrica; 5% dto en celulares y accesorios.',
        direccion: '18 de Julio 573, San José de Mayo',
        telefono: '096 170 920',
    },
    {
        id: 13,
        nombre: 'Vidriería Barceló',
        categoria: 'Hogar y Construcción',
        beneficio: '10% OFF',
        descripcion: '10% de descuento en vidriería para socios del Círculo Policial San José.',
        direccion: 'Av. Gral. Manuel Oribe y Manuel D. Rodríguez',
        telefono: '098 460 344',
    },
];

export default function ImprimirBeneficiosPage() {
    const router = useRouter();
    const [convenios, setConvenios] = useState<Convenio[]>(CONVENIOS_DEFAULT);
    const [loading, setLoading] = useState(true);
    const [diseno, setDiseno] = useState<'vertical' | 'diptico' | 'diptico-plegable'>('vertical');

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

    const BenefitBlock = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
        <div className={`pf-benefit ${className}`}>
            <div className="pf-benefit-title">{title}</div>
            {children}
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
                        src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://circulopolicialsj.org.uy/asociarse"
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
                        Afiliación online inmediata. Abierto a policías en actividad, retiro y pensionistas.
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
                    <span className="pf-gold-star">★</span>
                    COMISIÓN DIRECTIVA — EJERCICIO 2026
                    <span className="pf-gold-star">★</span>
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

                    <div className="pf-comision-box">
                        <div className="pf-comision-box-title">COMISIÓN FISCAL</div>
                        <div className="pf-fiscal-editorial-list">
                            <VocalName rango="Comisario P.A. (R)" nombre="Raúl Castro" />
                            <VocalName rango="S.O.M. (R)" nombre="Walter Dotta" />
                            <VocalName rango="Cabo" nombre="Mariano Brum" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /* ─────────── Página 1 del Díptico: Portada de Alta Jerarquía ─────────── */
    const DipticoPortada = () => (
        <div className="pf-tapa-container">
            <div className="pf-tapa-frame">
                <div className="pf-tapa-topbar">
                    <div className="pf-tapa-artigas-colors">
                        <span className="pf-bar-blue"></span>
                        <span className="pf-bar-white"></span>
                        <span className="pf-bar-red"></span>
                    </div>
                </div>

                <div className="pf-tapa-main">
                    <div className="pf-tapa-logo-wrap">
                        <div className="pf-tapa-logo">
                            <Image
                                src="/images/logo-circulo-policial.png"
                                alt="Escudo Oficial Círculo Policial San José"
                                fill
                                priority
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <div className="pf-tapa-titles">
                        <h1 className="pf-tapa-inst-name">CÍRCULO POLICIAL</h1>
                        <h2 className="pf-tapa-inst-locality">DE SAN JOSÉ</h2>
                        <div className="pf-tapa-sub-artigas">&ldquo;General José Gervasio Artigas&rdquo;</div>
                    </div>

                    <div className="pf-tapa-ribbon">
                        <div className="pf-tapa-ribbon-line"></div>
                        <div className="pf-tapa-ribbon-text">GUÍA OFICIAL DE BENEFICIOS Y SERVICIOS</div>
                        <div className="pf-tapa-ribbon-line"></div>
                    </div>

                    <div className="pf-tapa-year-badge">
                        EJERCICIO 2026
                    </div>
                </div>

                <div className="pf-tapa-footer-block">
                    <div className="pf-tapa-legal">
                        Fundado el 15 de Abril de 1944 &nbsp;·&nbsp; Personería Jurídica otorgada el 24/12/1948
                    </div>
                    <div className="pf-tapa-contact-grid">
                        <div className="pf-tapa-contact-item">
                            📍 <strong>Sede Central:</strong> Ituzaingó N° 441, San José de Mayo
                        </div>
                        <div className="pf-tapa-contact-item">
                            📞 <strong>Directiva / Reservas:</strong> 099 342 372
                        </div>
                        <div className="pf-tapa-contact-item">
                            ✉ <strong>Email:</strong> sanjosecirculopolicial@gmail.com
                        </div>
                        <div className="pf-tapa-contact-item">
                            🌐 <strong>Sitio Oficial:</strong> circulopolicialsj.org.uy
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ─────────── Página 2 del Díptico: Servicios e Infraestructura ─────────── */
    const DipticoServicios = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <span className="pf-page-logo-sm">
                        <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={28} height={28} />
                    </span>
                    <div>
                        <div className="pf-page-header-title">CÍRCULO POLICIAL DE SAN JOSÉ</div>
                        <div className="pf-page-header-tagline">SERVICIOS PROPIOS E INFRAESTRUCTURA INSTITUCIONAL</div>
                    </div>
                </div>
                <div className="pf-page-badge-num">PÁG. 2</div>
            </header>

            <div className="pf-page-content">
                <SectionTitle icon="🏠">Servicios e Infraestructura Social</SectionTitle>

                <div className="pf-card-feature">
                    <div className="pf-card-feature-header">
                        <span className="pf-card-feature-title">Cabañas en Balneario Ordeig (Kiyú - Camino Mauricio)</span>
                        <span className="pf-feature-badge">Descanso &amp; Naturaleza</span>
                    </div>
                    <p className="pf-text">
                        Dos confortables cabañas totalmente equipadas para <strong>4 personas</strong>, en un entorno natural privilegiado frente a la costa.
                    </p>
                    <ul className="pf-list pf-list--features">
                        <li>Incluye <strong>Direct TV</strong>, parrillero individual, heladera con freezer y vajilla completa.</li>
                        <li>Exclusivo para socios y sus familias, con tarifa subsidiada y posibilidad de invitados.</li>
                    </ul>
                    <div className="pf-flex-between pf-mt-xs">
                        <PriceTag>Socio: <strong>$1.500 / día</strong> &nbsp;|&nbsp; No Socio: <strong>$2.500 / día</strong></PriceTag>
                        <PhoneLine>📞 Reservas directas: <strong>099 342 372</strong></PhoneLine>
                    </div>
                </div>

                <div className="pf-card-feature pf-mt-sm">
                    <div className="pf-card-feature-header">
                        <span className="pf-card-feature-title">Salones de Fiestas y Eventos (Sede Central Ituzaingó 441)</span>
                        <span className="pf-feature-badge">Eventos &amp; Celebraciones</span>
                    </div>
                    <p className="pf-text">
                        Espacios calefaccionados y climatizados con equipamiento integral para cumpleaños, reuniones sociales y celebraciones.
                    </p>
                    <div className="pf-subcard-grid pf-mt-xs">
                        <div className="pf-subcard">
                            <div className="pf-subcard-title">Salón Principal Grande (hasta 60 personas)</div>
                            <div className="pf-subcard-price">Socio: <strong>$4.200</strong> &nbsp;|&nbsp; No Socio: <strong>$7.000</strong></div>
                            <div className="pf-subcard-desc">Incluye freezer industrial, uso de parrillas, mesas, sillas, climatización y servicio de limpieza final posterior.</div>
                        </div>
                        <div className="pf-subcard">
                            <div className="pf-subcard-title">Salón Íntimo Chico (hasta 25 personas)</div>
                            <div className="pf-subcard-price">Socio: <strong>$2.000</strong> &nbsp;|&nbsp; No Socio: <strong>$3.800</strong></div>
                            <div className="pf-subcard-desc">Ideal para reuniones familiares y asados. Incluye vajilla base, freezer, parrillero y limpieza posterior.</div>
                        </div>
                    </div>
                    <div className="pf-subcard-phone pf-mt-xs">
                        📞 Consultas y disponibilidad: <strong>099 342 372</strong>
                    </div>
                </div>

                <div className="pf-card-feature pf-mt-sm">
                    <div className="pf-card-feature-header">
                        <span className="pf-card-feature-title">Tradicionales Canastas Navideñas Anuales</span>
                        <span className="pf-feature-badge">Beneficio de Fin de Año</span>
                    </div>
                    <p className="pf-text">
                        Cada fin de año, el Círculo Policial de San José retribuye la confianza de sus asociados con el obsequio de una <strong>canasta navideña de primera línea</strong> para el 100% del padrón social al día.
                    </p>
                </div>

                <SectionTitle icon="🎓" className="pf-mt-md">Educación y Compromiso Comunitario</SectionTitle>

                <div className="pf-card-feature">
                    <div className="pf-card-feature-header">
                        <span className="pf-card-feature-title">Convenio Directo UNI 3 UNAMA</span>
                        <span className="pf-feature-badge">Cultura &amp; Talleres</span>
                    </div>
                    <p className="pf-text">
                        Alianza estratégica orientada a la capacitación, desarrollo cultural y actividad física saludable de nuestros afiliados:
                    </p>
                    <ul className="pf-list pf-mt-xs">
                        <li><strong>Talleres 100% Gratuitos en la Sede Social:</strong> Danza y Baile en Línea (Lunes 9:30 a 11:00), Yoga y Meditación (Martes 14:00) y Expresión Folklórica (Viernes 15:00 a 16:45).</li>
                        <li><strong>10 Becas de Estudio Completas:</strong> Acceso libre y sin costo a los 32 cursos oficiales dictados por UNI 3 UNAMA en el departamento. Gestión: <strong>099 342 372</strong>.</li>
                    </ul>
                </div>

                <div className="pf-card-feature pf-mt-sm">
                    <div className="pf-card-feature-header">
                        <span className="pf-card-feature-title">Convenio Hogar Estudiantil (Apoyo a la Juventud y Familias)</span>
                        <span className="pf-feature-badge">Apoyo Comunitario</span>
                    </div>
                    <p className="pf-text">
                        En acuerdo institucional con la Intendencia Municipal de San José, nuestras instalaciones brindan alojamiento y contención a estudiantes del interior del departamento, fomentando su formación académica y futuro profesional.
                    </p>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Página 2 · Guía de Beneficios 2026</span>
            </footer>
        </div>
    );

    /* ─────────── Página 3 del Díptico: Reciprocidad y Convenios Comerciales ─────────── */
    const DipticoConvenios = () => (
        <div className="pf-page-panel">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <span className="pf-page-logo-sm">
                        <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={28} height={28} />
                    </span>
                    <div>
                        <div className="pf-page-header-title">CÍRCULO POLICIAL DE SAN JOSÉ</div>
                        <div className="pf-page-header-tagline">RED DE RECIPROCIDAD Y CONVENIOS COMERCIALES</div>
                    </div>
                </div>
                <div className="pf-page-badge-num">PÁG. 3</div>
            </header>

            <div className="pf-page-content">
                <SectionTitle icon="👥">Red de Reciprocidad (Alianza Estratégica con ARPP San José)</SectionTitle>
                <p className="pf-text pf-text--muted pf-text--sm mb-2">
                    Mediante este acuerdo de cooperación mutua con la Asociación de Retirados y Pensionistas Policiales, nuestros socios acceden directamente a:
                </p>

                <div className="pf-reciprocidad-grid">
                    <div className="pf-reciprocidad-card">
                        <div className="pf-reciprocidad-card-title">⚖ Asesorías Profesionales Gratuitas</div>
                        <ul className="pf-list-sm">
                            <li><strong>Jurídica:</strong> Dr. Carlos Fajardo.</li>
                            <li><strong>Notarial:</strong> Esc. Juan Martín Álvarez.</li>
                            <li><strong>Arquitectura:</strong> Arq. Dayana Píriz.</li>
                        </ul>
                    </div>

                    <div className="pf-reciprocidad-card">
                        <div className="pf-reciprocidad-card-title">📚 Educación y Biblioteca Social</div>
                        <ul className="pf-list-sm">
                            <li><strong>Inglés y Apoyo Escolar/Liceal:</strong> Prof. Romina De Brun (099 830 930).</li>
                            <li><strong>Biblioteca Social:</strong> Préstamo gratuito de literatura general e infantil.</li>
                        </ul>
                    </div>

                    <div className="pf-reciprocidad-card">
                        <div className="pf-reciprocidad-card-title">🏖 Alojamiento en Maldonado</div>
                        <p className="pf-text-sm">
                            Apartamentos totalmente equipados con beneficio especial de <strong>3 noches al precio de 2</strong>.
                        </p>
                    </div>

                    <div className="pf-reciprocidad-card">
                        <div className="pf-reciprocidad-card-title">👓 Ópticas y Acompañantes</div>
                        <ul className="pf-list-sm">
                            <li><strong>Ópticas (20% OFF):</strong> Óptica Sena (Asamblea 595) y Centro Óptico (Batlle y Ordóñez 595).</li>
                            <li><strong>Servicio DAME (35% OFF):</strong> Cobertura 8 hrs x 10 días/año por <strong>$150/mes</strong> (Tel: 4342 2850).</li>
                        </ul>
                    </div>
                </div>

                <SectionTitle icon="🛍️" className="pf-mt-md">Convenios Comerciales Locales (Descuentos con Carnet de Socio)</SectionTitle>
                <p className="pf-text pf-text--muted pf-text--sm mb-2">
                    Presentá tu Carnet de Socio junto a tu C.I. en los siguientes comercios amigos adheridos:
                </p>

                <div className="pf-convenios-diptico-grid">
                    {convenios.map(c => (
                        <div key={c.id} className="pf-conv-item">
                            <div className="pf-conv-item-top">
                                <div className="pf-conv-logo-box">
                                    {c.logo_url ? (
                                        <img src={c.logo_url} alt={c.nombre} className="pf-conv-logo-img" />
                                    ) : (
                                        <span className="pf-conv-logo-placeholder">🛍️</span>
                                    )}
                                </div>
                                <div className="pf-conv-meta">
                                    <div className="pf-conv-name">{c.nombre}</div>
                                    <span className="pf-conv-badge">{c.beneficio}</span>
                                </div>
                            </div>
                            {c.descripcion && (
                                <div className="pf-conv-desc">{c.descripcion}</div>
                            )}
                            <div className="pf-conv-contacts">
                                {c.direccion && <span>📍 {c.direccion}</span>}
                                {(c.telefono || c.whatsapp) && <span>📞 {c.telefono || c.whatsapp}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pf-web-banner pf-mt-sm">
                    🌐 <strong>Guía Digital Interactiva en Vivo:</strong> Consultá bases y nuevos convenios en <strong>circulopolicialsj.org.uy/convenios</strong>
                </div>
            </div>

            <footer className="pf-page-footer">
                <span>Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo</span>
                <span>Página 3 · Guía de Beneficios 2026</span>
            </footer>
        </div>
    );

    /* ─────────── Página 4 del Díptico: Contratapa y Afiliación ─────────── */
    const DipticoContratapa = () => (
        <div className="pf-page-panel pf-page-panel--contratapa">
            <header className="pf-page-header">
                <div className="pf-page-header-left">
                    <span className="pf-page-logo-sm">
                        <Image src="/images/logo-circulo-policial.png" alt="Escudo" width={28} height={28} />
                    </span>
                    <div>
                        <div className="pf-page-header-title">CÍRCULO POLICIAL DE SAN JOSÉ</div>
                        <div className="pf-page-header-tagline">AUTORIDADES, IDENTIFICACIÓN Y AFILIACIÓN</div>
                    </div>
                </div>
                <div className="pf-page-badge-num">PÁG. 4</div>
            </header>

            <div className="pf-page-content">
                {/* Bloque Comisión Directiva Editorial */}
                <ComisionDirectiva layout="editorial" />

                {/* Banner Carnet Físico */}
                <div className="pf-carnet-card pf-mt-md">
                    <div className="pf-carnet-card-icon">🪪</div>
                    <div className="pf-carnet-card-body">
                        <div className="pf-carnet-card-title">¡Nuevo Carnet de Socio Físico Oficial!</div>
                        <div className="pf-carnet-card-text">
                            Ya están disponibles las nuevas credenciales oficiales plastificadas. Retirá la tuya coordinando con cualquier miembro de la Comisión Directiva. Presentala junto a tu Cédula de Identidad en todos los comercios para validar beneficios y descuentos.
                        </div>
                    </div>
                </div>

                {/* Gran Módulo de Afiliación (CTA) */}
                <div className="pf-mt-md">
                    <AffiliationCTA size="large" />
                </div>

                {/* Datos de Contacto y Canales Oficiales */}
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
                                <div className="pf-channel-lbl">Teléfono / Consultas</div>
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
                                <div className="pf-channel-lbl">Portal Web Institucional</div>
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
                    © 2026 Círculo Policial &ldquo;Gral. José Artigas&rdquo; — San José de Mayo, Uruguay &nbsp;·&nbsp; Página 4
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
                            <FileText size={16} /> Ficha A4 (1 Pág.)
                        </Button>
                        <Button
                            color={diseno === 'diptico' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('diptico')}
                            style={diseno === 'diptico' ? { backgroundColor: C.navy, borderColor: C.navy, fontWeight: 700 } : {}}
                        >
                            <BookOpen size={16} /> Díptico Folleto (4 Págs.)
                        </Button>
                        <Button
                            color={diseno === 'diptico-plegable' ? 'primary' : 'light'}
                            size="sm"
                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => setDiseno('diptico-plegable')}
                            style={diseno === 'diptico-plegable' ? { backgroundColor: C.navy, borderColor: C.navy, fontWeight: 700 } : {}}
                        >
                            <Layout size={16} /> Doble Faz para Plegar (2 Hojas A4)
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
                        <span>💡 <strong>Ficha A4 (1 Página):</strong> Orientación <strong>Vertical</strong>, tamaño <strong>A4</strong>, márgenes <strong>Ninguno</strong> o <strong>Mínimos</strong>. Entra todo 100% en una sola hoja A4.</span>
                    )}
                    {diseno === 'diptico' && (
                        <span>💡 <strong>Díptico Editorial (4 Páginas):</strong> Orientación <strong>Vertical</strong>, tamaño <strong>A4</strong>. Genera un documento de <strong>4 páginas exactas</strong> (Portada, Servicios, Convenios y Contratapa).</span>
                    )}
                    {diseno === 'diptico-plegable' && (
                        <span>💡 <strong>Doble Faz para Plegar:</strong> Orientación <strong>Horizontal (Apaisada)</strong>, tamaño <strong>A4</strong>. Genera <strong>2 hojas</strong> para imprimir doble faz y doblar al medio (folleto A5).</span>
                    )}
                </div>
            </div>

            {/* ═══ Contenedor de Hojas para Visualización e Impresión ═══ */}
            <div className="pf-canvas">
                {diseno === 'vertical' && (
                    /* ============================================================== */
                    /*                   MODO 1: FICHA A4 VERTICAL (1 PÁGINA)        */
                    /* ============================================================== */
                    <div className="pf-sheet pf-sheet--portrait" id="ficha-a4">
                        {/* Cabecera */}
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
                                    <div className="pf-header-meta">Fundado el 15/04/1944 — Personería Jurídica desde el 24/12/1948</div>
                                </div>
                            </div>
                            <div className="pf-header-right">
                                <div className="pf-header-badge">GUÍA DE BENEFICIOS</div>
                                <div className="pf-header-year">EJERCICIO 2026</div>
                            </div>
                        </header>

                        {/* Cuerpo en 2 columnas */}
                        <div className="pf-body-2col">
                            {/* Columna Izquierda: Servicios e Infraestructura */}
                            <div className="pf-body-col pf-body-col--left">
                                <SectionTitle icon="🏠">Servicios e Infraestructura</SectionTitle>

                                <BenefitBlock title="Cabañas en Balneario Ordeig (Kiyú - Cno. Mauricio)">
                                    <p className="pf-text">
                                        Dos cabañas equipadas para <strong>4 personas</strong> con <strong>Direct TV incluido</strong>.
                                    </p>
                                    <PhoneLine>📞 Reservas: <strong>099 342 372</strong></PhoneLine>
                                    <PriceTag>Socio: <strong>$1.500 / día</strong> &nbsp;|&nbsp; No Socio: <strong>$2.500 / día</strong></PriceTag>
                                </BenefitBlock>

                                <BenefitBlock title="Salones de Fiestas y Eventos (Sede Central)">
                                    <p className="pf-text">
                                        Espacios equipados y climatizados. Incluye <strong>freezer, uso de parrillas y limpieza posterior</strong>.
                                    </p>
                                    <PhoneLine>📞 Reservas: <strong>099 342 372</strong></PhoneLine>
                                    <PriceTag>
                                        Grande (60 p.): Socio <strong>$4.200</strong> / No Socio <strong>$7.000</strong>
                                        <br />
                                        Chico (25 p.): Socio <strong>$2.000</strong> / No Socio <strong>$3.800</strong>
                                    </PriceTag>
                                </BenefitBlock>

                                <BenefitBlock title="Canastas Navideñas Anuales">
                                    <p className="pf-text">
                                        Tradicional obsequio de fin de año con canasta navideña de excelente categoría para todos nuestros socios.
                                    </p>
                                </BenefitBlock>

                                <SectionTitle icon="🌟" className="pf-mt-xs">Compromiso y Apoyo Social</SectionTitle>
                                <BenefitBlock title="Convenio Hogar Estudiantil">
                                    <p className="pf-text">
                                        En acuerdo con la Intendencia de San José, alojamos a jóvenes estudiantes del interior departamental.
                                    </p>
                                </BenefitBlock>
                            </div>

                            {/* Columna Derecha: Alianzas y Reciprocidad */}
                            <div className="pf-body-col pf-body-col--right">
                                <SectionTitle icon="🎓">Alianzas Educativas Directas</SectionTitle>
                                <BenefitBlock title="Convenio UNI 3 UNAMA">
                                    <p className="pf-text">
                                        Alianza directa para desarrollo cultural y físico de nuestros afiliados:
                                    </p>
                                    <ul className="pf-list">
                                        <li><strong>Talleres Gratuitos en Sede:</strong> Danza/Baile en Línea (Lun 9:30), Yoga (Mar 14:00), Folklore (Vie 15:00).</li>
                                        <li><strong>10 Becas Completas de Estudio:</strong> 100% libre para 32 cursos oficiales. Cel: <strong>099 342 372</strong>.</li>
                                    </ul>
                                </BenefitBlock>

                                <SectionTitle icon="👥" className="pf-mt-xs">Red de Reciprocidad (ARPP San José)</SectionTitle>
                                <p className="pf-text pf-text--muted pf-text--xs">
                                    Mediante alianza con la Asociación de Retirados y Pensionistas Policiales:
                                </p>
                                <BenefitBlock title="Asesorías Profesionales Gratuitas">
                                    <ul className="pf-list">
                                        <li><strong>Jurídica:</strong> Dr. Carlos Fajardo &nbsp;·&nbsp; <strong>Notarial:</strong> Esc. Juan M. Álvarez.</li>
                                        <li><strong>Arquitectura:</strong> Arq. Dayana Píriz.</li>
                                    </ul>
                                </BenefitBlock>

                                <BenefitBlock title="Cursos, Biblioteca y Alojamiento">
                                    <ul className="pf-list">
                                        <li><strong>Inglés y Apoyo Estudiantil:</strong> Prof. Romina De Brun (099 830 930).</li>
                                        <li><strong>Biblioteca Social:</strong> Préstamo gratuito de literatura general e infantil.</li>
                                        <li><strong>Alojamiento en Maldonado:</strong> Departamentos con promo <strong>3x2</strong>.</li>
                                    </ul>
                                </BenefitBlock>

                                <BenefitBlock title="Salud, Ópticas y Acompañantes">
                                    <p className="pf-text">
                                        <strong>20% OFF</strong> en Óptica Sena y Centro Óptico &nbsp;·&nbsp; <strong>DAME:</strong> 35% OFF (8 hrs x 10 días a $150/mes).
                                    </p>
                                </BenefitBlock>
                            </div>
                        </div>

                        {/* Convenios Comerciales en Grilla de 3 Columnas */}
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
                                🌐 Más detalles y consultas de convenios en: <strong>circulopolicialsj.org.uy/convenios</strong>
                            </div>
                        </div>

                        {/* Banner Carnet Físico */}
                        <div className="pf-carnet-banner">
                            <strong>¡Retirá tu Nuevo Carnet de Socio Físico!</strong> — Ya estamos entregando las credenciales oficiales plastificadas. Solicitalo a la Comisión Directiva. Presentalo junto a tu C.I. para validar descuentos.
                        </div>

                        {/* Footer: CTA Afiliación + Comisión Directiva */}
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

                {diseno === 'diptico' && (
                    /* ============================================================== */
                    /*           MODO 2: DÍPTICO EDITORIAL (UN TOTAL DE 4 PÁGINAS)   */
                    /* ============================================================== */
                    <div className="pf-diptico-4pages" id="diptico-editorial">
                        {/* PÁGINA 1: PORTADA */}
                        <div className="pf-sheet pf-sheet--portrait pf-diptico-page pf-diptico-page-1 pf-page-break">
                            <DipticoPortada />
                        </div>

                        {/* PÁGINA 2: SERVICIOS E INFRAESTRUCTURA + EDUCACIÓN */}
                        <div className="pf-sheet pf-sheet--portrait pf-diptico-page pf-diptico-page-2 pf-page-break">
                            <DipticoServicios />
                        </div>

                        {/* PÁGINA 3: RECIPROCIDAD Y CONVENIOS COMERCIALES */}
                        <div className="pf-sheet pf-sheet--portrait pf-diptico-page pf-diptico-page-3 pf-page-break">
                            <DipticoConvenios />
                        </div>

                        {/* PÁGINA 4: CONTRATAPA, AUTORIDADES Y AFILIACIÓN */}
                        <div className="pf-sheet pf-sheet--portrait pf-diptico-page pf-diptico-page-4">
                            <DipticoContratapa />
                        </div>
                    </div>
                )}

                {diseno === 'diptico-plegable' && (
                    /* ============================================================== */
                    /*      MODO 3: DÍPTICO EN 2 HOJAS A4 APAISADAS PARA PLEGAR       */
                    /* ============================================================== */
                    <div className="pf-plegable-container" id="diptico-plegable">
                        {/* HOJA 1: EXTERIOR (Contratapa Pág 4 a la izquierda + Portada Pág 1 a la derecha) */}
                        <div className="pf-sheet pf-sheet--landscape pf-page-break pf-plegable-sheet-1">
                            <div className="pf-plegable-row">
                                <div className="pf-plegable-panel pf-plegable-panel--border">
                                    <DipticoContratapa />
                                </div>
                                <div className="pf-plegable-panel">
                                    <DipticoPortada />
                                </div>
                            </div>
                        </div>

                        {/* HOJA 2: INTERIOR (Servicios Pág 2 a la izquierda + Convenios Pág 3 a la derecha) */}
                        <div className="pf-sheet pf-sheet--landscape pf-plegable-sheet-2">
                            <div className="pf-plegable-row">
                                <div className="pf-plegable-panel pf-plegable-panel--border">
                                    <DipticoServicios />
                                </div>
                                <div className="pf-plegable-panel">
                                    <DipticoConvenios />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════ CSS GLOBAL — Print-Friendly Redesign ═══════════ */}
            <style jsx global>{`
                /* ═══ RESET & CANVAS BASE ═══ */
                .pf-canvas {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-bottom: 2rem;
                }

                .pf-sheet {
                    box-sizing: border-box;
                    background: ${C.white};
                    font-family: var(--font-muli), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    color: ${C.body};
                    position: relative;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    margin-bottom: 2rem;
                }

                .pf-sheet--portrait {
                    width: 210mm;
                    height: 296mm;
                    padding: 6mm 8mm 5mm 8mm;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow: hidden;
                }

                .pf-sheet--landscape {
                    width: 297mm;
                    height: 210mm;
                    padding: 0;
                    overflow: hidden;
                }

                /* ═══ MODO 1: FICHA A4 VERTICAL ═══ */
                .pf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 4px;
                    border-bottom: 2.5px solid ${C.navy};
                    position: relative;
                }

                .pf-header::after {
                    content: '';
                    position: absolute;
                    bottom: -3.5px;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: ${C.goldLight};
                }

                .pf-header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pf-header-logo {
                    position: relative;
                    width: 44px;
                    height: 44px;
                    flex-shrink: 0;
                }

                .pf-header-title {
                    font-size: 1.15rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    line-height: 1.1;
                }

                .pf-header-subtitle {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: ${C.gold};
                    font-style: italic;
                }

                .pf-header-meta {
                    font-size: 0.65rem;
                    color: ${C.mutedLight};
                    font-weight: 500;
                }

                .pf-header-right {
                    text-align: right;
                }

                .pf-header-badge {
                    font-size: 1.05rem;
                    font-weight: 900;
                    color: ${C.accent};
                    letter-spacing: 0.5px;
                    line-height: 1.1;
                }

                .pf-header-year {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 1px;
                }

                .pf-body-2col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 5px;
                }

                .pf-body-col--left {
                    padding-right: 10px;
                    border-right: 1px solid ${C.borderLight};
                }

                .pf-body-col--right {
                    padding-left: 2px;
                }

                .pf-section-title {
                    font-size: 0.80rem;
                    font-weight: 800;
                    color: ${C.navy};
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    border-bottom: 1.5px solid ${C.goldLight};
                    padding-bottom: 2px;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .pf-benefit {
                    margin-bottom: 4px;
                }

                .pf-benefit-title {
                    font-size: 0.76rem;
                    font-weight: 800;
                    color: ${C.navyLight};
                    line-height: 1.2;
                }

                .pf-text {
                    font-size: 0.68rem;
                    color: ${C.body};
                    margin: 1px 0;
                    line-height: 1.25;
                }

                .pf-text--muted {
                    color: ${C.muted};
                }

                .pf-text--xs {
                    font-size: 0.62rem;
                }

                .pf-list {
                    margin: 1px 0 0 0;
                    padding-left: 14px;
                    font-size: 0.67rem;
                    color: ${C.body};
                    line-height: 1.22;
                }

                .pf-list li {
                    margin-bottom: 1px;
                }

                .pf-phone {
                    font-size: 0.68rem;
                    color: ${C.navy};
                    font-weight: 700;
                    margin: 1px 0;
                }

                .pf-price {
                    font-size: 0.67rem;
                    color: ${C.accent};
                    font-weight: 700;
                    display: inline-block;
                    padding: 1px 7px;
                    background: ${C.accentSoft};
                    border: 1px solid ${C.accentBorder};
                    border-radius: 3px;
                    line-height: 1.25;
                    margin-top: 1px;
                }

                .pf-mt-xs {
                    margin-top: 4px;
                }

                .pf-mt-sm {
                    margin-top: 6px;
                }

                .pf-mt-md {
                    margin-top: 10px;
                }

                /* Grilla de Convenios A4 */
                .pf-convenios-section {
                    border-top: 1.5px solid ${C.borderLight};
                    padding-top: 4px;
                    margin-top: 4px;
                }

                .pf-convenios-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 3px;
                    margin-top: 3px;
                }

                .pf-convenio-card {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 5px;
                    border: 1px solid ${C.borderLight};
                    border-radius: 4px;
                    background: #FFFFFF;
                    min-width: 0;
                    overflow: hidden;
                }

                .pf-convenio-logo {
                    width: 22px;
                    height: 22px;
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
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: ${C.navy};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-convenio-badge {
                    font-size: 0.52rem;
                    font-weight: 800;
                    color: ${C.accent};
                    background: ${C.accentSoft};
                    border: 0.5px solid ${C.accentBorder};
                    padding: 0px 3px;
                    border-radius: 2px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .pf-convenio-meta {
                    font-size: 0.53rem;
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
                    font-size: 0.58rem;
                    color: ${C.mutedLight};
                    margin-top: 3px;
                }

                .pf-carnet-banner {
                    padding: 4px 8px;
                    background: ${C.goldPale};
                    border: 1px solid ${C.goldBorder};
                    border-radius: 4px;
                    font-size: 0.65rem;
                    color: ${C.navyDark};
                    line-height: 1.25;
                    margin-top: 3px;
                }

                .pf-footer {
                    border-top: 2px solid ${C.navy};
                    padding-top: 4px;
                    margin-top: auto;
                }

                .pf-footer-grid {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 8px;
                    align-items: start;
                }

                /* CTA Afiliación */
                .pf-cta-box {
                    border: 1.5px solid ${C.navy};
                    border-radius: 4px;
                    padding: 5px;
                    background: #FFFFFF;
                }

                .pf-cta-box--lg {
                    padding: 12px 16px;
                    border: 2px solid ${C.navy};
                    border-radius: 6px;
                    background: linear-gradient(135deg, #FFFFFF 0%, ${C.bgLight} 100%);
                }

                .pf-cta-inner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pf-cta-box--lg .pf-cta-inner {
                    gap: 16px;
                }

                .pf-cta-qr {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-shrink: 0;
                }

                .pf-cta-box--sm .pf-qr-img {
                    width: 60px;
                    height: 60px;
                }

                .pf-cta-box--lg .pf-qr-img {
                    width: 82px;
                    height: 82px;
                }

                .pf-qr-label {
                    font-size: 0.44rem;
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
                    font-size: 0.66rem;
                    font-weight: 900;
                    color: ${C.navy};
                    line-height: 1.15;
                }

                .pf-cta-box--lg .pf-cta-headline {
                    font-size: 0.90rem;
                }

                .pf-cta-price-wrap {
                    display: flex;
                    align-items: baseline;
                    gap: 3px;
                    margin: 1px 0;
                }

                .pf-cta-amount {
                    font-size: 1.15rem;
                    font-weight: 900;
                    color: ${C.accent};
                    line-height: 1;
                }

                .pf-cta-box--lg .pf-cta-amount {
                    font-size: 1.50rem;
                }

                .pf-cta-period {
                    font-size: 0.58rem;
                    font-weight: 700;
                    color: ${C.muted};
                }

                .pf-cta-desc {
                    font-size: 0.53rem;
                    color: ${C.body};
                    line-height: 1.2;
                }

                .pf-cta-box--lg .pf-cta-desc {
                    font-size: 0.70rem;
                }

                .pf-cta-link {
                    font-size: 0.55rem;
                    color: ${C.navy};
                    margin-top: 2px;
                }

                /* Comisión Directiva Compacta */
                .pf-comision--compact .pf-comision-header {
                    font-size: 0.58rem;
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
                    font-size: 0.48rem;
                    font-weight: 800;
                    color: ${C.gold};
                    text-transform: uppercase;
                    border-bottom: 1px solid ${C.borderLight};
                    margin-bottom: 2px;
                }

                .pf-mesa-row {
                    font-size: 0.48rem;
                    line-height: 1.25;
                    white-space: nowrap;
                }

                .pf-mesa-cargo {
                    color: ${C.muted};
                    display: inline-block;
                    width: 44px;
                }

                .pf-mesa-rango {
                    color: ${C.mutedLight};
                }

                .pf-mesa-nombre {
                    font-weight: 700;
                    color: ${C.navyDark};
                }

                .pf-vocales-grid-compact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 4px;
                }

                .pf-vocal {
                    font-size: 0.46rem;
                    line-height: 1.25;
                    white-space: nowrap;
                }

                .pf-vocal-rango {
                    color: ${C.mutedLight};
                }

                .pf-vocal-nombre {
                    font-weight: 700;
                    color: ${C.navyDark};
                }

                /* ═══ MODO 2: DÍPTICO 4 PÁGINAS (EDITORIAL) ═══ */
                .pf-diptico-4pages {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                /* PORTADA DÍPTICO */
                .pf-tapa-container {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                }

                .pf-tapa-frame {
                    flex: 1;
                    border: 2px solid ${C.navy};
                    padding: 18px 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: #FFFFFF;
                    position: relative;
                }

                .pf-tapa-frame::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border: 1px solid ${C.goldLight};
                    pointer-events: none;
                }

                .pf-tapa-artigas-colors {
                    display: flex;
                    height: 5px;
                    width: 100%;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .pf-bar-blue, .pf-stripe-blue {
                    flex: 1;
                    background: ${C.navyLight};
                }

                .pf-bar-white, .pf-stripe-white {
                    flex: 1;
                    background: #FFFFFF;
                    border-top: 1px solid ${C.borderLight};
                    border-bottom: 1px solid ${C.borderLight};
                }

                .pf-bar-red, .pf-stripe-red {
                    flex: 1;
                    background: ${C.accent};
                }

                .pf-tapa-main {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin: auto 0;
                }

                .pf-tapa-logo-wrap {
                    margin-bottom: 18px;
                }

                .pf-tapa-logo {
                    position: relative;
                    width: 130px;
                    height: 130px;
                    filter: drop-shadow(0 4px 10px rgba(0, 43, 73, 0.15));
                }

                .pf-tapa-inst-name {
                    font-size: 2.10rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 1px;
                    line-height: 1.1;
                    margin: 0;
                }

                .pf-tapa-inst-locality {
                    font-size: 1.50rem;
                    font-weight: 900;
                    color: ${C.navyLight};
                    letter-spacing: 2px;
                    line-height: 1.1;
                    margin: 2px 0 0 0;
                }

                .pf-tapa-sub-artigas {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: ${C.gold};
                    font-style: italic;
                    letter-spacing: 0.5px;
                    margin-top: 6px;
                }

                .pf-tapa-ribbon {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 24px;
                    width: 90%;
                }

                .pf-tapa-ribbon-line {
                    flex: 1;
                    height: 1.5px;
                    background: ${C.goldLight};
                }

                .pf-tapa-ribbon-text {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .pf-tapa-year-badge {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: ${C.accent};
                    background: ${C.accentSoft};
                    border: 2px solid ${C.accent};
                    padding: 5px 26px;
                    border-radius: 30px;
                    letter-spacing: 1.5px;
                    margin-top: 14px;
                }

                .pf-tapa-motto {
                    font-size: 0.86rem;
                    color: ${C.muted};
                    font-style: italic;
                    max-width: 440px;
                    line-height: 1.45;
                    margin-top: 22px;
                    margin-bottom: 0;
                }

                .pf-tapa-footer-block {
                    border-top: 1px solid ${C.borderLight};
                    padding-top: 12px;
                    text-align: center;
                }

                .pf-tapa-legal {
                    font-size: 0.72rem;
                    color: ${C.mutedLight};
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .pf-tapa-contact-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px 16px;
                    font-size: 0.70rem;
                    color: ${C.navyDark};
                    text-align: left;
                }

                /* PÁGINAS INTERIORES DÍPTICO */
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
                    padding-bottom: 6px;
                    border-bottom: 2px solid ${C.navy};
                    margin-bottom: 10px;
                }

                .pf-page-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pf-page-header-title {
                    font-size: 0.82rem;
                    font-weight: 900;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    line-height: 1.1;
                }

                .pf-page-header-tagline {
                    font-size: 0.64rem;
                    font-weight: 700;
                    color: ${C.gold};
                    text-transform: uppercase;
                }

                .pf-page-badge-num {
                    font-size: 0.72rem;
                    font-weight: 900;
                    color: ${C.white};
                    background: ${C.navy};
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .pf-page-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .pf-card-feature {
                    background: #FFFFFF;
                    border: 1px solid ${C.borderLight};
                    border-radius: 6px;
                    padding: 8px 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }

                .pf-card-feature-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid ${C.borderSubtle};
                    padding-bottom: 3px;
                    margin-bottom: 4px;
                }

                .pf-card-feature-title {
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: ${C.navy};
                }

                .pf-feature-badge {
                    font-size: 0.60rem;
                    font-weight: 700;
                    color: ${C.navyLight};
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    padding: 1px 6px;
                    border-radius: 12px;
                }

                .pf-list--features {
                    margin-top: 4px;
                }

                .pf-flex-between {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pf-subcard-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .pf-subcard {
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    border-radius: 4px;
                    padding: 6px 8px;
                }

                .pf-subcard-title {
                    font-size: 0.74rem;
                    font-weight: 800;
                    color: ${C.navyDark};
                }

                .pf-subcard-price {
                    font-size: 0.72rem;
                    color: ${C.accent};
                    margin: 2px 0;
                }

                .pf-subcard-desc {
                    font-size: 0.62rem;
                    color: ${C.muted};
                    line-height: 1.25;
                }

                .pf-subcard-phone {
                    font-size: 0.72rem;
                    color: ${C.navy};
                    font-weight: 700;
                    text-align: right;
                }

                .pf-reciprocidad-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .pf-reciprocidad-card {
                    background: #FFFFFF;
                    border: 1px solid ${C.borderLight};
                    border-radius: 6px;
                    padding: 6px 10px;
                }

                .pf-reciprocidad-card-title {
                    font-size: 0.74rem;
                    font-weight: 800;
                    color: ${C.navy};
                    border-bottom: 1px solid ${C.borderSubtle};
                    padding-bottom: 2px;
                    margin-bottom: 3px;
                }

                .pf-list-sm {
                    margin: 0;
                    padding-left: 14px;
                    font-size: 0.65rem;
                    color: ${C.body};
                    line-height: 1.25;
                }

                .pf-list-sm li {
                    margin-bottom: 1px;
                }

                .pf-text-sm {
                    font-size: 0.66rem;
                    color: ${C.body};
                    margin: 0;
                    line-height: 1.25;
                }

                .pf-convenios-diptico-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                    flex: 1;
                }

                .pf-conv-item {
                    border: 1px solid ${C.borderLight};
                    border-radius: 5px;
                    padding: 4px 7px;
                    background: #FFFFFF;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .pf-conv-item-top {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pf-conv-logo-box {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${C.bgLight};
                    border-radius: 3px;
                }

                .pf-conv-logo-img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .pf-conv-logo-placeholder {
                    font-size: 0.75rem;
                }

                .pf-conv-meta {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 4px;
                    min-width: 0;
                }

                .pf-conv-name {
                    font-size: 0.68rem;
                    font-weight: 800;
                    color: ${C.navy};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pf-conv-badge {
                    font-size: 0.56rem;
                    font-weight: 800;
                    color: ${C.accent};
                    background: ${C.accentSoft};
                    border: 0.5px solid ${C.accentBorder};
                    padding: 1px 4px;
                    border-radius: 3px;
                    white-space: nowrap;
                }

                .pf-conv-desc {
                    font-size: 0.58rem;
                    color: ${C.muted};
                    line-height: 1.15;
                    margin-top: 2px;
                }

                .pf-conv-contacts {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    font-size: 0.54rem;
                    color: ${C.navyLight};
                    font-weight: 600;
                    margin-top: 2px;
                    padding-top: 1px;
                    border-top: 1px dashed ${C.borderLight};
                }

                .pf-web-banner {
                    text-align: center;
                    font-size: 0.66rem;
                    color: ${C.navy};
                    background: ${C.bgLight};
                    border: 1px solid ${C.borderLight};
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .pf-page-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid ${C.borderLight};
                    padding-top: 5px;
                    margin-top: 6px;
                    font-size: 0.62rem;
                    color: ${C.mutedLight};
                }

                /* CONTRATAPA DÍPTICO */
                .pf-comision--editorial {
                    border: 1.5px solid ${C.navy};
                    border-radius: 6px;
                    padding: 8px 12px;
                    background: #FFFFFF;
                }

                .pf-comision-header-editorial {
                    font-size: 0.74rem;
                    font-weight: 900;
                    color: ${C.navy};
                    text-align: center;
                    letter-spacing: 0.8px;
                    border-bottom: 1.5px solid ${C.goldLight};
                    padding-bottom: 4px;
                    margin-bottom: 6px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }

                .pf-gold-star {
                    color: ${C.gold};
                    font-size: 0.70rem;
                }

                .pf-comision-editorial-grid {
                    display: grid;
                    grid-template-columns: 1.25fr 1.45fr 1fr;
                    gap: 10px;
                }

                .pf-comision-box-title {
                    font-size: 0.58rem;
                    font-weight: 800;
                    color: ${C.gold};
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid ${C.borderLight};
                    padding-bottom: 2px;
                    margin-bottom: 3px;
                }

                .pf-mesa-editorial-list .pf-mesa-row {
                    font-size: 0.56rem;
                    line-height: 1.35;
                }

                .pf-mesa-editorial-list .pf-mesa-cargo {
                    width: 72px;
                }

                .pf-vocales-editorial-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 6px;
                }

                .pf-vocales-editorial-grid .pf-vocal {
                    font-size: 0.54rem;
                    line-height: 1.35;
                }

                .pf-fiscal-editorial-list .pf-vocal {
                    font-size: 0.56rem;
                    line-height: 1.35;
                }

                .pf-carnet-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: ${C.goldPale};
                    border: 1.5px solid ${C.goldBorder};
                    border-radius: 6px;
                    padding: 8px 12px;
                }

                .pf-carnet-card-icon {
                    font-size: 1.6rem;
                }

                .pf-carnet-card-title {
                    font-size: 0.74rem;
                    font-weight: 800;
                    color: ${C.navyDark};
                }

                .pf-carnet-card-text {
                    font-size: 0.62rem;
                    color: ${C.body};
                    line-height: 1.25;
                }

                .pf-contact-channels {
                    border: 1px solid ${C.borderLight};
                    border-radius: 6px;
                    padding: 8px 12px;
                    background: #FFFFFF;
                }

                .pf-channels-title {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: ${C.navy};
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid ${C.borderLight};
                    padding-bottom: 3px;
                    margin-bottom: 6px;
                    text-align: center;
                }

                .pf-channels-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px 14px;
                }

                .pf-channel-box {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pf-channel-icon {
                    font-size: 0.85rem;
                }

                .pf-channel-lbl {
                    font-size: 0.52rem;
                    color: ${C.mutedLight};
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .pf-channel-val {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: ${C.navy};
                }

                .pf-page-footer--artiguista {
                    flex-direction: column;
                    gap: 4px;
                    border: none;
                    padding: 0;
                    margin-top: 10px;
                }

                .pf-artigas-stripe {
                    display: flex;
                    height: 4px;
                    width: 100%;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .pf-footer-copy {
                    font-size: 0.60rem;
                    color: ${C.mutedLight};
                    text-align: center;
                }

                /* ═══ MODO 3: DÍPTICO EN 2 HOJAS APAISADAS ═══ */
                .pf-plegable-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .pf-plegable-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
                    width: 100%;
                }

                .pf-plegable-panel {
                    padding: 6mm 8mm;
                    height: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .pf-plegable-panel--border {
                    border-right: 1px solid ${C.borderLight};
                }

                /* ═══════════════════════════════════════════════════════════════ */
                /*                         @MEDIA PRINT                            */
                /* ═══════════════════════════════════════════════════════════════ */
                @media print {
                    /* Ocultar navegación global, pie de página del sitio y barras de control */
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

                    .min-vh-100 {
                        min-height: auto !important;
                    }

                    .bg-light {
                        background-color: transparent !important;
                    }

                    .pf-print-wrapper {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: none !important;
                    }

                    .pf-canvas {
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                    }

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
                        padding: 6mm 8mm 4mm 8mm !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    #ficha-a4 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    /* Díptico Editorial 4 Páginas */
                    .pf-diptico-4pages .pf-sheet--portrait {
                        width: 210mm !important;
                        height: 296mm !important;
                        max-height: 296mm !important;
                        padding: 7mm 9mm 5mm 9mm !important;
                    }

                    .pf-page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .pf-diptico-page-4 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    /* Díptico Plegable Apaisado (2 Hojas) */
                    .pf-sheet--landscape {
                        width: 297mm !important;
                        height: 209mm !important;
                        max-height: 209mm !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    .pf-plegable-sheet-1 {
                        page-break-after: always !important;
                        break-after: page !important;
                    }

                    .pf-plegable-sheet-2 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    @page {
                        size: ${diseno === 'diptico-plegable' ? 'A4 landscape' : 'A4 portrait'};
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
