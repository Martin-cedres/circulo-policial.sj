'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function CarnetSocioDigital() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    // Valores para el efecto 3D Tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Amortiguación de spring para movimientos ultra suaves
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);

    // Brillo holográfico interactivo
    const shineX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
    const shineY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        // Coordenadas normalizadas de -0.5 a 0.5
        const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        const mouseY = (event.clientY - rect.top) / rect.height - 0.5;
        
        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseLeave = () => {
        setHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <div 
            style={{ 
                perspective: 1200,
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
                containerType: 'inline-size' // Habilita Container Queries para escala proporcional
            }}
        >
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={handleMouseLeave}
                animate={{
                    scale: hovered ? 1.02 : 1
                }}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                    aspectRatio: '1.586 / 1', // Proporción de tarjeta física
                    width: '100%',
                    borderRadius: '2.5cqw',
                    boxShadow: hovered 
                        ? '0 25px 50px rgba(0, 36, 79, 0.3)' 
                        : '0 10px 25px rgba(0, 36, 79, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'box-shadow 0.3s ease'
                }}
            >
                {/* Imagen Oficial del Carnet (Sin modificaciones) */}
                <img 
                    src="/images/carnet-socio.jpg" 
                    alt="Carnet de Socio Oficial Círculo Policial San José" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />

                {/* Reflejo Holográfico Metálico interactivo sobre la imagen oficial */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 5,
                        pointerEvents: 'none',
                        mixBlendMode: 'color-dodge',
                        opacity: hovered ? 0.35 : 0.05,
                        background: `radial-gradient(circle at ${hovered ? 'var(--shine-x)' : '50%'} ${hovered ? 'var(--shine-y)' : '50%'}, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 40%, transparent 80%)`,
                        transform: 'translateZ(1px)',
                        transition: 'opacity 0.3s ease'
                    }}
                    className="shine-effect"
                />

                {/* Sombreado de borde para realismo físico */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '2.5cqw',
                        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15)',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}
                />
            </motion.div>

            {/* Variables CSS Reactivas en línea de Framer Motion */}
            <style jsx global>{`
                .shine-effect {
                    --shine-x: ${shineX};
                    --shine-y: ${shineY};
                }
            `}</style>
        </div>
    );
}
