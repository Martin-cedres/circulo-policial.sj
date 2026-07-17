'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Badge, Card, CardBody } from 'reactstrap';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { artiguistaColors } from '@/styles/colors';
import { 
    ShoppingBag, HeartPulse, GraduationCap, Utensils, 
    Wrench, Landmark, Plus, ArrowRight, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
}

const getCategoryIcon = (category: string, size = 24, colorClass?: string) => {
    const cls = colorClass || '';
    switch (category.toLowerCase()) {
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

export default function ConveniosSection() {
    const [convenios, setConvenios] = useState<Convenio[]>([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    // Estados del carrusel animado
    const [activeIndex, setActiveIndex] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    useEffect(() => {
        fetch('/api/convenios?destacado=true')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConvenios(data.convenios || []);
                }
            })
            .catch(err => console.error('Error fetching destacados:', err))
            .finally(() => setLoading(false));
    }, []);

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
                    <div className="mx-auto" style={{ width: '60px', height: '4px', backgroundColor: artiguistaColors.dorado, borderRadius: '2px' }}></div>
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
                                                     <img
                                                         src={convenio.logo_url}
                                                         alt={convenio.nombre}
                                                         style={{ 
                                                             width: '100%', 
                                                             height: '100%', 
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

                                            <CardBody className="p-4 d-flex flex-column">

                                                {/* Detalle */}
                                                <h3 className="h5 fw-bold mb-2 text-dark" style={{ minHeight: '1.5rem' }}>
                                                    {convenio.nombre}
                                                </h3>
                                                
                                                <div 
                                                    className="h6 fw-bold mb-3 d-inline-block px-2 py-1 rounded" 
                                                    style={{ 
                                                        color: artiguistaColors.rojo, 
                                                        backgroundColor: `${artiguistaColors.rojo}10`,
                                                        width: 'fit-content'
                                                    }}
                                                >
                                                    {convenio.beneficio}
                                                </div>

                                                <p className="text-muted small flex-grow-1 mb-0" style={{ lineHeight: '1.6' }}>
                                                    {convenio.descripcion || 'Sin descripción adicional disponible.'}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Ver todos */}
                <div className="text-center mb-5">
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

                {/* Banner de Marketing para Comercios (B2B) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-4 p-md-5 rounded-4 text-white shadow-lg overflow-hidden position-relative"
                    style={{
                        background: `linear-gradient(135deg, ${artiguistaColors.azulOscuro} 0%, ${artiguistaColors.azul} 100%)`,
                        borderRadius: '2rem'
                    }}
                >
                    {/* Patrón sutil de fondo */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.05,
                        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        pointerEvents: 'none'
                    }}></div>

                    <Row className="align-items-center position-relative g-4">
                        <Col lg={8} className="text-center text-lg-start">
                            <h3 className="h2 fw-bold mb-2">¿Querés que tu comercio o institución sea parte de nuestra red?</h3>
                            <p className="lead mb-0 opacity-90" style={{ fontSize: '1.1rem' }}>
                                Sumate a las alianzas del Círculo Policial San José. Dale visibilidad a tu marca y atraé a cientos de socios activos y sus familias.
                            </p>
                        </Col>
                        <Col lg={4} className="text-center text-lg-end">
                            <Link href="/convenios#sumarse" passHref legacyBehavior>
                                <Button 
                                    color="light" 
                                    size="lg" 
                                    className="fw-bold hover-scale"
                                    style={{ 
                                        color: artiguistaColors.azul, 
                                        borderRadius: '50px', 
                                        padding: '1rem 2rem',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    ¡Sumá tu Comercio! <Plus size={18} className="ms-1" />
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </motion.div>

            </Container>
        </section>
    );
}
