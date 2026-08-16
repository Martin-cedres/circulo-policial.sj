'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Badge, Card, CardBody, Modal, ModalBody } from 'reactstrap';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { artiguistaColors } from '@/styles/colors';
import { 
    ShoppingBag, HeartPulse, GraduationCap, Utensils, 
    Wrench, Landmark, Plus, ArrowRight, ChevronLeft, ChevronRight,
    Globe, Instagram as InstagramIcon, MessageCircle, MapPin, Phone, Trophy
} from 'lucide-react';

interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
    sitio_web?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    telefono?: string | null;
    direccion?: string | null;
}

const getCategoryIcon = (category: string, size = 24, colorClass?: string) => {
    const cls = colorClass || '';
    switch (category.toLowerCase()) {
        case 'deporte':
        case 'deportes':
            return <Trophy className={cls || "text-success"} size={size} />;
        case 'salud':
        case 'médico':
        case 'odontología':
        case 'farmacia':
            return <HeartPulse className={cls || "text-danger"} size={size} />;
        case 'gastronomía':
        case 'restaurante':
        case 'comida':
            return <Utensils className={cls || "text-warning"} size={size} />;
        case 'educación':
        case 'cursos':
        case 'colegio':
            return <GraduationCap className={cls || "text-primary"} size={size} />;
        case 'servicios':
        case 'hogar':
        case 'profesionales':
            return <Wrench className={cls || "text-secondary"} size={size} />;
        case 'financiero':
        case 'banco':
        case 'seguro':
            return <Landmark className={cls || "text-success"} size={size} />;
        case 'comercio':
        case 'tienda':
        case 'indumentaria':
        default:
            return <ShoppingBag className={cls || "text-info"} size={size} />;
    }
};

interface ConveniosSectionProps {
    initialConvenios?: Convenio[];
}

export default function ConveniosSection({ initialConvenios }: ConveniosSectionProps = {}) {
    const [convenios, setConvenios] = useState<Convenio[]>(initialConvenios || []);
    const [loading, setLoading] = useState(!initialConvenios);
    const [convenioSeleccionado, setConvenioSeleccionado] = useState<Convenio | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    // Estados del carrusel animado
    const [activeIndex, setActiveIndex] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    useEffect(() => {
        if (!initialConvenios || initialConvenios.length === 0) {
            fetch('/api/convenios?destacado=true')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setConvenios(data.convenios || []);
                    }
                })
                .catch(err => console.error('Error fetching destacados:', err))
                .finally(() => setLoading(false));
        }
    }, [initialConvenios]);

    // Placeholders estéticos
    const displayedConvenios = convenios.length > 0 ? convenios : [
        {
            id: 1,
            nombre: 'Óptica San José',
            categoria: 'Salud',
            beneficio: '20% de Descuento',
            descripcion: 'Beneficio exclusivo en cristales y armazones para socios y su núcleo familiar directo.',
            logo_url: null
        },
        {
            id: 2,
            nombre: 'Tienda Deportiva El Campeón',
            categoria: 'Comercio',
            beneficio: '15% OFF los miércoles',
            descripcion: 'Descuento especial en calzado y vestimenta deportiva abonando en efectivo o tarjeta de débito.',
            logo_url: null
        },
        {
            id: 3,
            nombre: 'Instituto de Idiomas Oxford',
            categoria: 'Educación',
            beneficio: 'Matrícula gratis + 10% mensual',
            descripcion: 'Cursos de inglés presenciales y virtuales para todas las edades.',
            logo_url: null
        },
        {
            id: 4,
            nombre: 'Odontología Integral Mayo',
            categoria: 'Salud',
            beneficio: 'Limpieza dental sin costo',
            descripcion: 'Descuentos del 30% en tratamientos de ortodoncia e implantes dentales.',
            logo_url: null
        },
        {
            id: 5,
            nombre: 'Gimnasio Atenas',
            categoria: 'Servicios',
            beneficio: '25% de Descuento en pase libre',
            descripcion: 'Acceso a sala de musculación y clases dirigidas de lunes a sábado.',
            logo_url: null
        }
    ];

    // Configuración para el arrastre táctil (drag) en móviles
    const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

    // Actualizar restricciones de arrastre en base al ancho del slider
    useEffect(() => {
        if (sliderRef.current) {
            const sliderWidth = sliderRef.current.scrollWidth;
            const containerWidth = sliderRef.current.offsetWidth;
            setDragConstraints({
                left: -Math.max(0, sliderWidth - containerWidth - 10),
                right: 10
            });
        }
    }, [displayedConvenios, loading, cardWidth, itemsPerPage]);

    // Detectar tamaño de pantalla y calcular el ancho de tarjeta y elementos visibles
    useEffect(() => {
        const updateLayout = () => {
            if (typeof window === 'undefined') return;

            let visibleItems = 4;
            if (window.innerWidth < 768) {
                visibleItems = 1;
            } else if (window.innerWidth < 992) {
                visibleItems = 2;
            } else if (window.innerWidth < 1200) {
                visibleItems = 3;
            }
            setItemsPerPage(visibleItems);

            if (sliderRef.current) {
                const firstChild = sliderRef.current.children[0] as HTMLElement;
                if (firstChild) {
                    // Calculamos el ancho de la tarjeta en base a offsetWidth + gap (24px por gap-4 / 1.5rem)
                    setCardWidth(firstChild.offsetWidth + 24);
                }
            }
        };

        // Un pequeño delay para asegurar que los elementos estén renderizados
        const timer = setTimeout(updateLayout, 100);

        window.addEventListener('resize', updateLayout);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateLayout);
        };
    }, [displayedConvenios, loading]);

    const maxIndex = Math.max(0, displayedConvenios.length - itemsPerPage);

    // Auto-scroll automático suave de derecha a izquierda
    useEffect(() => {
        if (!isAutoScrolling || maxIndex === 0) return;

        const interval = setInterval(() => {
            setActiveIndex(prev => {
                if (prev >= maxIndex) {
                    return 0; // Vuelve al inicio
                }
                return prev + 1;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [maxIndex, isAutoScrolling]);

    const handlePrev = () => {
        setIsAutoScrolling(false);
        setActiveIndex(prev => (prev === 0 ? maxIndex : prev - 1));
        // Reactiva auto-scroll tras 10 segundos de inactividad
        setTimeout(() => setIsAutoScrolling(true), 10000);
    };

    const handleNext = () => {
        setIsAutoScrolling(false);
        setActiveIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
        setTimeout(() => setIsAutoScrolling(true), 10000);
    };

    return (
        <section
            className="section-padding position-relative overflow-hidden"
            style={{
                backgroundColor: '#ffffff',
                borderTop: `1px solid ${artiguistaColors.gris[200]}`
            }}
        >
            <Container>
                {/* Cabecera Sección */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-4"
                >
                    <h2 className="display-6 fw-bold mb-2" style={{ color: artiguistaColors.azul }}>
                        Nuestros Convenios
                    </h2>
                    <div className="mx-auto" style={{ width: '120px', height: '3px', backgroundColor: artiguistaColors.dorado, borderRadius: '2px' }}></div>
                </motion.div>

                {/* Slider Animado de Framer Motion */}
                <div className="position-relative px-md-4 mb-5">
                    
                    {/* Botones de navegación flotantes (Visibles solo en desktop/tablet con suficientes elementos) */}
                    {/* Botones de navegación flotantes (Visibles solo en desktop/tablet con suficientes elementos cuando no está cargando) */}
                    {!loading && maxIndex > 0 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="d-none d-md-flex position-absolute start-0 top-50 translate-middle-y z-3 shadow-lg border-0 rounded-circle align-items-center justify-content-center hover-scale"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#ffffff',
                                    color: artiguistaColors.azul,
                                    left: '-10px',
                                    transition: 'all 0.2s ease',
                                    border: `1px solid ${artiguistaColors.gris[200]}`
                                }}
                                aria-label="Anterior"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={handleNext}
                                className="d-none d-md-flex position-absolute end-0 top-50 translate-middle-y z-3 shadow-lg border-0 rounded-circle align-items-center justify-content-center hover-scale"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: '#ffffff',
                                    color: artiguistaColors.azul,
                                    right: '-10px',
                                    transition: 'all 0.2s ease',
                                    border: `1px solid ${artiguistaColors.gris[200]}`
                                }}
                                aria-label="Siguiente"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Ventana de recortes (overflow-hidden) */}
                    <div 
                        className="overflow-hidden py-3 px-1"
                        style={{ width: '100%' }}
                    >
                        {loading ? (
                            <Row className="g-4 px-1">
                                {[1, 2, 3].map((n) => (
                                    <Col key={n} xs={12} md={6} lg={4}>
                                        <Card 
                                            className="border-0 shadow-sm overflow-hidden"
                                            style={{
                                                borderRadius: '1.25rem',
                                                border: `1px solid ${artiguistaColors.gris[200]}`,
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            <div 
                                                className="w-100 placeholder-glow"
                                                style={{ 
                                                    aspectRatio: '1/1', 
                                                    backgroundColor: artiguistaColors.gris[100],
                                                    borderTopLeftRadius: '1.25rem',
                                                    borderTopRightRadius: '1.25rem'
                                                }}
                                            >
                                                <div className="placeholder w-100 h-100" />
                                            </div>
                                            <CardBody className="p-4 d-flex flex-column gap-3">
                                                <div className="placeholder-glow">
                                                    <span className="placeholder col-8 rounded" style={{ height: '1.5rem', display: 'block' }} />
                                                </div>
                                                <div className="placeholder-glow">
                                                    <span className="placeholder col-5 rounded" style={{ height: '1.2rem', display: 'block' }} />
                                                </div>
                                                <div className="placeholder-glow">
                                                    <span className="placeholder col-12 rounded mb-1" style={{ height: '0.9rem', display: 'block' }} />
                                                    <span className="placeholder col-10 rounded" style={{ height: '0.9rem', display: 'block' }} />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            /* Pista animada con Framer Motion (Con soporte para arrastre táctil / drag) */
                            <motion.div
                                ref={sliderRef}
                                className="d-flex gap-4"
                                drag="x"
                                dragConstraints={dragConstraints}
                                dragElastic={0.15}
                                onDragStart={() => setIsAutoScrolling(false)}
                                onDragEnd={(event, info) => {
                                    setIsAutoScrolling(false);
                                    // Reactiva auto-scroll tras 15 segundos de inactividad
                                    const timer = setTimeout(() => setIsAutoScrolling(true), 15000);
                                    
                                    const swipe = info.offset.x;
                                    const swipeThreshold = 50; // Umbral en píxeles para cambiar de tarjeta

                                    if (swipe < -swipeThreshold) {
                                        setActiveIndex(prev => Math.min(maxIndex, prev + 1));
                                    } else if (swipe > swipeThreshold) {
                                        setActiveIndex(prev => Math.max(0, prev - 1));
                                    }
                                }}
                                animate={{ x: -activeIndex * cardWidth }}
                                transition={{ 
                                    type: 'spring', 
                                    stiffness: 70, 
                                    damping: 16,   
                                    mass: 0.6
                                }}
                                style={{
                                    width: '100%',
                                    cursor: 'grab'
                                }}
                                whileTap={{ cursor: 'grabbing' }}
                            >
                                {displayedConvenios.map((convenio) => (
                                    <div
                                        key={convenio.id}
                                        className="slider-card-width"
                                        style={{
                                            height: 'auto'
                                        }}
                                    >
                                        <Card 
                                            className="h-100 border-0 shadow-sm overflow-hidden hover-elevate position-relative"
                                            style={{
                                                borderRadius: '1.25rem',
                                                backgroundColor: '#ffffff',
                                                border: `1px solid ${artiguistaColors.gris[200]}`,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {/* Foto / Banner del Comercio (Protagonista) */}
                                            <div 
                                                 className="position-relative w-100 overflow-hidden" 
                                                 style={{ 
                                                     aspectRatio: '1/1', 
                                                     backgroundColor: '#ffffff',
                                                     borderBottom: `1px solid ${artiguistaColors.gris[200]}`,
                                                     borderTopLeftRadius: '1.25rem',
                                                     borderTopRightRadius: '1.25rem'
                                                 }}
                                             >
                                                 {convenio.logo_url ? (
                                                     <Image
                                                         src={convenio.logo_url}
                                                         alt={convenio.nombre}
                                                         fill
                                                         unoptimized
                                                         style={{ 
                                                             objectFit: 'contain',
                                                             padding: '1.25rem',
                                                             borderTopLeftRadius: '1.25rem',
                                                             borderTopRightRadius: '1.25rem'
                                                         }}
                                                     />
                                                 ) : (
                                                     <div 
                                                         className="w-100 h-100 d-flex align-items-center justify-content-center"
                                                         style={{
                                                             background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                                                             borderTopLeftRadius: '1.25rem',
                                                             borderTopRightRadius: '1.25rem'
                                                         }}
                                                     >
                                                         {getCategoryIcon(convenio.categoria, 48, 'text-white')}
                                                     </div>
                                                 )}
                                             </div>

                                            <CardBody className="p-4 d-flex flex-column" style={{ minHeight: '340px' }}>
                                                 {/* Detalle */}
                                                 <h3 
                                                     className="h5 fw-bold mb-2 text-dark" 
                                                     style={{ 
                                                         minHeight: '2.8rem',
                                                         display: '-webkit-box',
                                                         WebkitLineClamp: 2,
                                                         WebkitBoxOrient: 'vertical',
                                                         overflow: 'hidden'
                                                     }}
                                                     title={convenio.nombre}
                                                 >
                                                     {convenio.nombre}
                                                 </h3>
                                                 
                                                 <div 
                                                     className="h6 fw-bold mb-3 d-inline-block px-2 py-1 rounded text-truncate" 
                                                     style={{ 
                                                         color: artiguistaColors.rojo, 
                                                         backgroundColor: `${artiguistaColors.rojo}10`,
                                                         width: 'fit-content',
                                                         maxWidth: '100%'
                                                     }}
                                                     title={convenio.beneficio}
                                                 >
                                                     {convenio.beneficio}
                                                 </div>

                                                 <p 
                                                     className="text-muted small mb-3 flex-grow-1" 
                                                     style={{ 
                                                         lineHeight: '1.6',
                                                         display: '-webkit-box',
                                                         WebkitLineClamp: 3,
                                                         WebkitBoxOrient: 'vertical',
                                                         overflow: 'hidden'
                                                     }}
                                                 >
                                                     {convenio.descripcion || 'Sin descripción adicional disponible.'}
                                                 </p>

                                                 {/* Dirección */}
                                                 {convenio.direccion && (
                                                     <div className="d-flex align-items-start gap-1 text-muted mb-3 mt-auto" style={{ fontSize: '0.8rem' }}>
                                                         <MapPin size={13} className="mt-0.5 text-danger flex-shrink-0" />
                                                         <span className="text-truncate" title={convenio.direccion}>{convenio.direccion}</span>
                                                     </div>
                                                 )}

                                                 {/* Botón único para abrir el detalle */}
                                                 <div className="pt-2 border-top w-100">
                                                     <Button 
                                                         className="btn-sm text-white d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm hover-scale w-100 border-0"
                                                         style={{ 
                                                             backgroundColor: artiguistaColors.azul, 
                                                             fontSize: '0.8rem', 
                                                             borderRadius: '8px', 
                                                             color: '#ffffff',
                                                             fontWeight: 'bold'
                                                         }}
                                                         onClick={() => {
                                                             setConvenioSeleccionado(convenio);
                                                             setModalAbierto(true);
                                                         }}
                                                     >
                                                         <span>Ver Convenio</span>
                                                     </Button>
                                                 </div>
                                             </CardBody>
                                        </Card>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Ver todos */}
                <div className="text-center">
                    <Link href="/convenios" passHref legacyBehavior>
                        <Button 
                            size="lg" 
                            className="shadow-sm hover-elevate border-0"
                            style={{ 
                                backgroundColor: artiguistaColors.azul, 
                                color: '#fff',
                                borderRadius: '50px',
                                padding: '0.8rem 2.5rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Ver Todos los Convenios <ArrowRight size={18} className="ms-2" />
                        </Button>
                    </Link>
                </div>

            </Container>

            {/* Modal de Detalle de Convenio */}
            {convenioSeleccionado && (
                <Modal 
                    isOpen={modalAbierto} 
                    toggle={() => setModalAbierto(false)} 
                    centered 
                    size="md"
                    className="border-0 shadow-lg"
                    contentClassName="rounded-4 overflow-hidden border-0"
                >
                    <div 
                        className="p-4 text-white d-flex align-items-center justify-content-between position-relative border-0"
                        style={{
                            background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                        }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div 
                                className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm position-relative"
                                style={{ width: '56px', height: '56px', flexShrink: 0, overflow: 'hidden', position: 'relative' }}
                            >
                                {convenioSeleccionado.logo_url ? (
                                    <Image 
                                        src={convenioSeleccionado.logo_url} 
                                        alt={convenioSeleccionado.nombre} 
                                        fill
                                        unoptimized
                                        style={{ objectFit: 'contain', padding: '6px' }}
                                    />
                                ) : (
                                    getCategoryIcon(convenioSeleccionado.categoria, 28, 'text-primary')
                                )}
                            </div>
                            <div>
                                <span className="small text-white-50 text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.7rem' }}>
                                    Convenio / {convenioSeleccionado.categoria}
                                </span>
                                <h4 className="m-0 fw-bold text-white lh-sm" style={{ fontSize: '1.25rem' }}>{convenioSeleccionado.nombre}</h4>
                            </div>
                        </div>
                        <button 
                            onClick={() => setModalAbierto(false)}
                            className="btn border-0 text-white p-2 hover-scale bg-white bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '36px', height: '36px' }}
                            aria-label="Cerrar"
                        >
                            <span style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '0' }}>&times;</span>
                        </button>
                    </div>

                    <ModalBody className="p-4 bg-white">
                        {/* Beneficio destacado */}
                        <div className="mb-4">
                            <span className="small text-muted d-block mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Beneficio Especial:</span>
                            <div 
                                className="h5 fw-bold px-3 py-2 rounded-3 text-center" 
                                style={{ 
                                    color: artiguistaColors.rojo, 
                                    backgroundColor: `${artiguistaColors.rojo}10`,
                                    border: `1px solid ${artiguistaColors.rojo}20`,
                                    letterSpacing: '0.3px'
                                }}
                            >
                                {convenioSeleccionado.beneficio}
                            </div>
                        </div>

                        {/* Descripción completa */}
                        {convenioSeleccionado.descripcion && (
                            <div className="mb-4">
                                <span className="small text-muted d-block mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Detalles del Convenio:</span>
                                <p className="text-dark m-0" style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {convenioSeleccionado.descripcion}
                                </p>
                            </div>
                        )}

                        {/* Dirección */}
                        {convenioSeleccionado.direccion && (
                            <div className="mb-4 p-3 bg-light rounded-3 d-flex align-items-start gap-2">
                                <MapPin size={18} className="text-danger flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="small text-muted d-block fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>Ubicación / Dirección:</span>
                                    <span className="text-dark small fw-medium">{convenioSeleccionado.direccion}</span>
                                </div>
                            </div>
                        )}

                        {/* Botones de contacto */}
                        <div className="d-flex flex-column gap-2 pt-3 border-top w-100">
                            <span className="small text-muted d-block mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Opciones de contacto:</span>
                            
                            {convenioSeleccionado.whatsapp && (
                                <a 
                                    href={`https://wa.me/${convenioSeleccionado.whatsapp.replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-success text-white d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm hover-scale w-100"
                                    style={{ 
                                        backgroundColor: '#25D366', 
                                        borderColor: '#25D366', 
                                        fontSize: '0.9rem', 
                                        borderRadius: '8px', 
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <MessageCircle size={16} style={{ stroke: '#ffffff' }} />
                                    <span>Contactar por WhatsApp</span>
                                </a>
                            )}

                            {convenioSeleccionado.sitio_web && (
                                <a 
                                    href={convenioSeleccionado.sitio_web.startsWith('http') ? convenioSeleccionado.sitio_web : `https://${convenioSeleccionado.sitio_web}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn text-white d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm hover-scale w-100"
                                    style={{ 
                                        backgroundColor: artiguistaColors.azul, 
                                        borderColor: artiguistaColors.azul, 
                                        fontSize: '0.9rem', 
                                        borderRadius: '8px', 
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <Globe size={16} style={{ stroke: '#ffffff' }} />
                                    <span>Visitar Sitio Web</span>
                                </a>
                            )}

                            {convenioSeleccionado.instagram && (
                                <a 
                                    href={convenioSeleccionado.instagram.startsWith('http') ? convenioSeleccionado.instagram : `https://instagram.com/${convenioSeleccionado.instagram.replace('@', '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn text-white d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm hover-scale w-100"
                                    style={{ 
                                        backgroundColor: '#E1306C', 
                                        borderColor: '#E1306C', 
                                        fontSize: '0.9rem', 
                                        borderRadius: '8px', 
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <InstagramIcon size={16} style={{ stroke: '#ffffff' }} />
                                    <span>Seguir en Instagram</span>
                                </a>
                            )}

                            {convenioSeleccionado.telefono && (
                                <a 
                                    href={`tel:${convenioSeleccionado.telefono.replace(/[^0-9+]/g, '')}`} 
                                    className="btn text-white d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm hover-scale w-100"
                                    style={{ 
                                        backgroundColor: artiguistaColors.azulOscuro, 
                                        borderColor: artiguistaColors.azulOscuro, 
                                        fontSize: '0.9rem', 
                                        borderRadius: '8px', 
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <Phone size={16} style={{ stroke: '#ffffff' }} />
                                    <span>Llamar al {convenioSeleccionado.telefono}</span>
                                </a>
                            )}
                        </div>
                    </ModalBody>
                </Modal>
            )}
        </section>
    );
}
