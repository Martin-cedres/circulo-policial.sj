
'use client';

import { Button } from 'reactstrap';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
    return (
        <Button
            size="sm"
            outline
            color="primary"
            onClick={() => {
                if (navigator.share) {
                    navigator.share({
                        title,
                        text,
                        url: window.location.href,
                    }).catch(console.error);
                } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Enlace copiado al portapapeles');
                }
            }}
        >
            <Share2 size={16} className="me-2" />
            Compartir
        </Button>
    );
}
