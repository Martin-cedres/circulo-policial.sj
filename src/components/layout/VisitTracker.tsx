'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Ignorar rutas del panel administrativo
        if (!pathname || pathname.startsWith('/admin')) {
            return;
        }

        const hoy = new Date().toISOString().split('T')[0];
        const storageKey = `cpsj_visit_logged_${hoy}`;

        // Verificar si la visita ya fue contada en esta sesión de navegador hoy
        if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, 'true');

            // Enviar registro de visita en segundo plano
            fetch('/api/visitas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).catch(err => {
                // Falla silenciosa para no interrumpir al usuario
                console.error('Error al registrar visita:', err);
            });
        }
    }, [pathname]);

    return null;
}
