'use client';

import { Container, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Collapse } from 'reactstrap';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { artiguistaColors } from '@/styles/colors';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
        <Navbar
            color="white"
            light
            expand="lg"
            sticky="top"
            style={{
                backgroundColor: '#ffffff', // Blanco puro para ocultar borde JPG
                borderBottom: `3px solid ${artiguistaColors.azul}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)', // Sombra más suave
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                minHeight: '70px', // Altura reducida para ser más angosto en desktop
                position: 'relative', // Contexto para posicionamiento
            }}
        >
            <Container className="position-relative d-lg-flex align-items-lg-center justify-content-lg-between">
                {/* Botón de menú a la izquierda en móvil */}
                <NavbarToggler onClick={toggle} className="d-lg-none position-absolute start-0 top-50 translate-middle-y ms-3" style={{ zIndex: 10 }} />

                {/* Logo centrado ABSOLUTO en móvil para ignorar flexbox */}
                {/* Versión MÓVIL: Logo centrado absoluto - Se oculta cuando el menú está abierto */}
                <NavbarBrand
                    href="/"
                    tag={Link}
                    className="d-lg-none p-0 m-0"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%', // Centrado vertical
                        transform: 'translate(-50%, -50%)', // Ajuste fino X e Y
                        opacity: isOpen ? 0 : 1, // Oculta el logo cuando el menú está abierto
                        pointerEvents: isOpen ? 'none' : 'auto', // Desactiva clics cuando está oculto
                        transition: 'opacity 0.3s ease', // Transición suave
                    }}
                >
                    <Image
                        src="/images/logo circulo policial san jose.webp"
                        alt="Escudo Oficial Círculo Policial San José"
                        width={60}
                        height={60}
                        priority
                        style={{
                            width: 'auto',
                            height: '60px',
                        }}
                    />
                </NavbarBrand>

                {/* Versión DESKTOP: Logo + Texto alineado izquierda */}
                <NavbarBrand
                    href="/"
                    tag={Link}
                    className="d-none d-lg-flex align-items-center"
                >
                    <Image
                        src="/images/logo circulo policial san jose.webp"
                        alt="Escudo Oficial Círculo Policial San José"
                        width={60}
                        height={60}
                        priority
                        className="me-2"
                        style={{
                            width: 'auto',
                            height: '50px',
                        }}
                    />
                    <div className="text-start">
                        <div style={{
                            fontSize: '1rem', // Reducido de 1.1rem
                            fontWeight: 'bold',
                            color: artiguistaColors.azul,
                            lineHeight: '1.2',
                        }}>
                            Círculo Policial
                        </div>
                        <div style={{
                            fontSize: '0.75rem', // Reducido de 0.85rem
                            color: artiguistaColors.gris[700],
                        }}>
                            "Gral. José Artigas" - San José
                        </div>
                    </div>
                </NavbarBrand>

                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ms-auto align-items-center" navbar>
                        <NavItem>
                            <NavLink href="/" tag={Link}>
                                Inicio
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/nosotros" tag={Link}>
                                Nosotros
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/beneficios" tag={Link}>
                                Beneficios
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/galeria" tag={Link}>
                                Galería
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/contacto" tag={Link}>
                                Contacto
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                href="/asociarse"
                                tag={Link}
                                style={{
                                    backgroundColor: artiguistaColors.rojo,
                                    color: artiguistaColors.blanco,
                                    borderRadius: '4px',
                                    padding: '0.5rem 1rem',
                                    marginLeft: '0.5rem',
                                    fontWeight: 'bold',
                                }}
                            >
                                ¡Hacete Socio!
                            </NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Container>
        </Navbar>
    );
}
