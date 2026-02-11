
'use client';

import { useState } from 'react';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Share2, Link, Facebook, Twitter, Check } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `${title}\n\n${text}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    };

    const WhatsAppIcon = () => (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    );

    const iconButtonStyle: React.CSSProperties = {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: 'none',
        textDecoration: 'none',
        color: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    return (
        <div className="d-flex align-items-center gap-3">
            <span className="text-muted small fw-bold me-1">Compartir:</span>

            <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                style={{ ...iconButtonStyle, backgroundColor: '#25D366' }}
                title="Compartir en WhatsApp"
            >
                <Share2 size={20} />
            </a>

            <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noreferrer"
                style={{ ...iconButtonStyle, backgroundColor: '#1877F2' }}
                title="Compartir en Facebook"
            >
                <Facebook size={20} />
            </a>

            <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noreferrer"
                style={{ ...iconButtonStyle, backgroundColor: '#1DA1F2' }}
                title="Compartir en Twitter"
            >
                <Twitter size={20} />
            </a>

            <button
                onClick={handleCopyLink}
                style={{
                    ...iconButtonStyle,
                    backgroundColor: copied ? '#28a745' : '#6c757d'
                }}
                title={copied ? "¡Enlace copiado!" : "Copiar enlace"}
            >
                {copied ? <Check size={20} /> : <Link size={20} />}
            </button>
        </div>
    );
}
