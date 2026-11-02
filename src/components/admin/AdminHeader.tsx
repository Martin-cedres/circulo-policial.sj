'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Badge, Button, Collapse } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

interface AdminHeaderProps {
    titulo?: string;
    subtitulo?: string;
    acciones?: React.ReactNode;
}

export default function AdminHeader({ titulo, subtitulo, acciones }: AdminHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [pendientesPagos, setPendientesPagos] = useState<number>(0);
    const [pendientesSolicitudes, setPendientesSolicitudes] = useState<number>(0);

    // Cargar alertas pendientes en segundo plano
    useEffect(() => {
        const cargarAlertas = async () => {
            try {
                const [resPagos, resSols] = await Promise.all([
                    fetch('/api/admin/pagos').then(r => r.json()).catch(() => null),
                    fetch('/api/admin/socios/solicitudes?filtro=pendientes').then(r => r.json()).catch(() => null),
                ]);

                if (resPagos?.success && resPagos.resumen?.pendientesConfirmar !== undefined) {
                    setPendientesPagos(resPagos.resumen.pendientesConfirmar);
                }
                if (resSols?.success && Array.isArray(resSols.solicitudes)) {
                    setPendientesSolicitudes(resSols.solicitudes.length);
                }
            } catch {
                // Silencioso en caso de error de red
            }
        };

        cargarAlertas();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin-token');
        router.push('/admin');
    };

    const navItems = [
        {
            href: '/admin/dashboard',
            label: 'Inicio',
            icon: '🏠',
            active: pathname === '/admin/dashboard',
            badge: 0,
        },
        {
            href: '/admin/socios',
            label: 'Socios',
            icon: '👥',
            active: pathname.startsWith('/admin/socios'),
            badge: pendientesSolicitudes,
            badgeColor: 'warning',
            badgeTitle: `${pendientesSolicitudes} solicitudes web pendientes`,
        },
        {
            href: '/admin/pagos',
            label: 'Pagos BROU',
            icon: '🏦',
            active: pathname.startsWith('/admin/pagos'),
            badge: pendientesPagos,
            badgeColor: 'danger',
            badgeTitle: `${pendientesPagos} pagos BROU pendientes de confirmación`,
        },
        {
            href: '/admin/descuentos',
            label: 'Jefatura (514)',
            icon: '🏛️',
            active: pathname.startsWith('/admin/descuentos'),
            badge: 0,
        },
        {
            href: '/admin/convenios',
            label: 'Convenios',
            icon: '🤝',
            active: pathname.startsWith('/admin/convenios'),
            badge: 0,
        },
        {
            href: '/admin/noticias',
            label: 'Noticias',
            icon: '📰',
            active: pathname.startsWith('/admin/noticias'),
            badge: 0,
        },
    ];

    return (
        <header className="admin-header shadow-sm sticky-top" style={{ zIndex: 1020 }}>
            {/* Barra Principal de Navegación */}
            <div
                style={{
                    backgroundColor: '#002B49',
                    borderBottom: '3px solid #D4AF37',
                    color: '#ffffff',
                }}
            >
                <Container fluid="xl" className="px-3 px-md-4">
                    <div className="d-flex justify-content-between align-items-center py-2">
                        {/* Logo e Identidad */}
                        <div className="d-flex align-items-center gap-2">
                            <Link href="/admin/dashboard" className="d-flex align-items-center gap-2 text-decoration-none text-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/logo-circulo-policial.png"
                                    alt="Círculo Policial San José"
                                    style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                                />
                                <div>
                                    <span className="fw-bold fs-6 d-block text-white line-height-1">
                                        Círculo Policial
                                    </span>
                                    <span className="small text-warning" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                        Panel de Gestión
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Pestañas de Navegación en Escritorio (Desktop) */}
                        <nav className="d-none d-lg-flex align-items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-3 text-decoration-none small fw-bold d-flex align-items-center gap-2 transition-all ${
                                        item.active
                                            ? 'bg-white text-dark shadow-sm'
                                            : 'text-white-50 hover-text-white'
                                    }`}
                                    style={{
                                        backgroundColor: item.active ? '#ffffff' : 'transparent',
                                        color: item.active ? '#002B49' : '#E2E8F0',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge > 0 && (
                                        <Badge
                                            color={item.badgeColor || 'danger'}
                                            pill
                                            className="px-2 py-1 shadow-sm animate-pulse"
                                            title={item.badgeTitle}
                                            style={{ fontSize: '10px' }}
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Botones de Utilidad a la derecha */}
                        <div className="d-flex align-items-center gap-2">
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-light d-none d-md-inline-flex align-items-center gap-1"
                                style={{ fontSize: '12px', borderColor: 'rgba(255,255,255,0.3)' }}
                                title="Abrir el sitio web público en una pestaña nueva"
                            >
                                <span>🌐</span>
                                <span>Ver Web</span>
                            </a>

                            <Button
                                color="outline-danger"
                                size="sm"
                                onClick={handleLogout}
                                className="text-white border-0 bg-danger bg-opacity-25 hover-bg-opacity-50"
                                style={{ fontSize: '12px' }}
                                title="Cerrar sesión administrativa"
                            >
                                🚪 Salir
                            </Button>

                            {/* Botón Hamburguesa para Celulares */}
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-light d-lg-none"
                                onClick={() => setMenuAbierto(!menuAbierto)}
                                aria-label="Abrir menú"
                            >
                                ☰
                            </button>
                        </div>
                    </div>

                    {/* Menú Desplegable en Móvil */}
                    <Collapse isOpen={menuAbierto} className="d-lg-none pb-3 border-top border-secondary pt-2">
                        <div className="d-flex flex-column gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuAbierto(false)}
                                    className={`px-3 py-2 rounded-3 text-decoration-none small fw-bold d-flex justify-content-between align-items-center ${
                                        item.active
                                            ? 'bg-white text-dark'
                                            : 'text-white'
                                    }`}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge > 0 && (
                                        <Badge color={item.badgeColor || 'danger'} pill>
                                            {item.badge} pendientes
                                        </Badge>
                                    )}
                                </Link>
                            ))}
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 text-decoration-none small text-white-50 d-flex align-items-center gap-2"
                            >
                                <span>🌐</span>
                                <span>Visitar sitio público</span>
                            </a>
                        </div>
                    </Collapse>
                </Container>
            </div>

            {/* Barra secundaria contextual de título y acciones de página (opcional) */}
            {titulo && (
                <div style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }} className="py-3">
                    <Container fluid="xl" className="px-3 px-md-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div>
                                <h1 className="h5 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                                    {titulo}
                                </h1>
                                {subtitulo && (
                                    <p className="small text-muted mb-0">{subtitulo}</p>
                                )}
                            </div>
                            {acciones && (
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                    {acciones}
                                </div>
                            )}
                        </div>
                    </Container>
                </div>
            )}
        </header>
    );
}
