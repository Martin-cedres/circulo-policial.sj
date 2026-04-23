'use client';

import { Container, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Collapse } from 'reactstrap';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { artiguistaColors } from '@/styles/colors';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const toggle = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) {
                closeMenu();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);


    return (
        <Navbar
            color="white"
            light
            expand="lg"
            sticky="top"
            style={{
                backgroundColor: '#ffffff',
                borderTop: `5px solid ${artiguistaColors.azul}`,
                borderBottom: `2px solid ${artiguistaColors.dorado}`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                minHeight: '85px',
                position: 'relative',
            }}
        >
            <Container className="d-flex justify-content-between align-items-center flex-wrap">
                {/* Logo Principal */}
                <NavbarBrand
                    href="/"
                    tag={Link}
                    onClick={closeMenu}
                    className="d-flex align-items-center p-0 m-0"
                    style={{
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <Image
                        src="/images/logo-circulo-policial.png"
                        alt="Logo Círculo Policial San José"
                        width={60}
                        height={60}
                        priority
                        className="me-2"
                        style={{ width: 'auto', height: '55px' }}
                    />
                    <div className="d-none d-sm-block text-start">
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: artiguistaColors.azul,
                            lineHeight: '1.2',
                            letterSpacing: '0.5px'
                        }}>
                            Círculo Policial San José
                        </div>
                    </div>
                </NavbarBrand>

                {/* Botón de móvil */}
                <NavbarToggler onClick={toggle} className="ms-auto border-0 shadow-none" />

                <Collapse isOpen={isOpen} navbar>
                    <Nav className="mx-auto" navbar style={{ gap: '1rem' }}>
                        {[
                            { name: 'Inicio', href: '/' },
                            { name: 'Nosotros', href: '/nosotros' },
                            { name: 'Beneficios', href: '/beneficios' },
                            { name: 'Galería', href: '/galeria' },
                            { name: 'Noticias', href: '/noticias' },
                            { name: 'Contacto', href: '/contacto' },
                        ].map((item) => (
                            <NavItem key={item.href}>
                                <NavLink
                                    href={item.href}
                                    tag={Link}
                                    onClick={closeMenu}
                                    active={pathname === item.href}
                                    style={{
                                        color: pathname === item.href ? artiguistaColors.azul : artiguistaColors.negro,
                                        fontWeight: pathname === item.href ? 'bold' : '500',
                                        position: 'relative',
                                        padding: '10px 5px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="nav-link-custom"
                                >
                                    {item.name}
                                    {pathname === item.href && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '10%',
                                            width: '80%',
                                            height: '3px',
                                            backgroundColor: artiguistaColors.dorado,
                                            borderRadius: '2px'
                                        }} />
                                    )}
                                </NavLink>
                            </NavItem>
                        ))}
                    </Nav>

                    {/* Botón en menú móvil (solo visible en colapso móvil) */}
                    <div className="d-lg-none mt-3 mb-2 px-3">
                        <Link
                            href="/asociarse"
                            className="btn w-100 py-2 text-white"
                            onClick={closeMenu}
                            style={{
                                backgroundColor: artiguistaColors.rojo,
                                borderRadius: '50px',
                                fontWeight: 'bold'
                            }}
                        >
                            Hacete Socio
                        </Link>
                    </div>
                </Collapse>

                {/* Botón Desktop (fuera del collapse, a la derecha) */}
                <div className="d-none d-lg-block">
                    <Link
                        href="/asociarse"
                        className="btn shadow-sm px-4 py-2"
                        onClick={closeMenu}
                        style={{
                            backgroundColor: artiguistaColors.rojo,
                            color: 'white',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            border: 'none',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = artiguistaColors.rojoOscuro;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = artiguistaColors.rojo;
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Hacete Socio
                    </Link>
                </div>
            </Container>

            <style jsx>{`
                :global(.nav-link-custom):hover {
                    color: ${artiguistaColors.azul} !important;
                }
            `}</style>
        </Navbar>
    );
}
