'use client';

import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { artiguistaColors } from '@/styles/colors';

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShowBanner(false);

        // Activar Google Analytics u otras analíticas aquí
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
        }
    };

    const rejectCookies = () => {
        localStorage.setItem('cookie-consent', 'rejected');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: artiguistaColors.negro,
                color: artiguistaColors.blanco,
                padding: '1.5rem',
                zIndex: 9999,
                boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
            }}
        >
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8 mb-3 mb-md-0">
                        <p className="mb-0">
                            Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Al continuar navegando, usted acepta nuestra{' '}
                            <a
                                href="/privacidad"
                                style={{ color: artiguistaColors.dorado, textDecoration: 'underline' }}
                            >
                                Política de Privacidad
                            </a>.
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Button
                            color="light"
                            outline
                            onClick={rejectCookies}
                            className="me-2"
                            size="sm"
                        >
                            Rechazar
                        </Button>
                        <Button
                            style={{
                                backgroundColor: artiguistaColors.azul,
                                borderColor: artiguistaColors.azul,
                            }}
                            onClick={acceptCookies}
                            size="sm"
                        >
                            Aceptar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
