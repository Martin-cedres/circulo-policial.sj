'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardBody, Badge, Button, Spinner } from 'reactstrap';
import { Phone, Instagram, Globe, MessageCircle, MapPin, Gift, Loader } from 'lucide-react';
import { artiguistaColors } from '@/styles/colors';
import 'leaflet/dist/leaflet.css';

interface Convenio {
    id: number;
    nombre: string;
    categoria: string;
    beneficio: string;
    descripcion: string;
    logo_url: string | null;
    sitio_web: string | null;
    whatsapp: string | null;
    instagram: string | null;
    telefono: string | null;
    direccion: string | null;
    latitud?: string | number | null;
    longitud?: string | number | null;
}

interface ConvenioUbicado extends Convenio {
    coords: [number, number];
}

interface ConveniosMapaProps {
    convenios: Convenio[];
}

// Icono personalizado SVG para los pines del mapa (dorado y azul)
const createCustomIcon = (categoria: string) => {
    // Definir colores según categoría para mayor dinamismo
    let iconBg: string = artiguistaColors.azul;
    if (categoria.toLowerCase() === 'salud') iconBg = '#dc3545'; // Rojo
    if (categoria.toLowerCase() === 'gastronomía') iconBg = '#ffc107'; // Amarillo
    if (categoria.toLowerCase() === 'educación') iconBg = '#0d6efd'; // Azul
    if (categoria.toLowerCase() === 'financiero') iconBg = '#198754'; // Verde

    const svgHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.3));">
            <path fill="${iconBg}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="4" fill="#ffffff"/>
            <path fill="${artiguistaColors.dorado}" d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" transform="scale(0.8) translate(3, 2.25)"/>
        </svg>
    `;

    return L.divIcon({
        html: svgHtml,
        className: 'custom-leaflet-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

// Limpia ruidos en la dirección y la formatea para OpenStreetMap
const limpiarDireccion = (dir: string) => {
    let clean = dir.trim();
    // 1. Eliminar "Calle " al inicio
    clean = clean.replace(/^(calle\s+)/i, '');
    // 2. Eliminar "N°", "Nº", "#", "Nro", "No."
    clean = clean.replace(/(?:n[°ºo\.]\s*|nro\s*|#\s*|num\s*)/gi, '');
    // 3. Normalizar espacios
    clean = clean.replace(/\s+/g, ' ');
    
    let query = clean;
    const lowerQuery = query.toLowerCase();
    
    if (!lowerQuery.includes('san josé') && !lowerQuery.includes('san jose')) {
        query += ', San José de Mayo';
    }
    if (!lowerQuery.includes('uruguay')) {
        query += ', Uruguay';
    }
    return query;
};

export default function ConveniosMapa({ convenios }: ConveniosMapaProps) {
    const [conveniosConCoordenadas, setConveniosConCoordenadas] = useState<ConvenioUbicado[]>([]);
    const [geocodificando, setGeocodificando] = useState(true);

    // Centro por defecto: Plaza Treinta y Tres, San José de Mayo, Uruguay
    const centroSanJose: [number, number] = [-34.3392, -56.7136];

    useEffect(() => {
        const geolocalizarConvenios = async () => {
            setGeocodificando(true);
            const resultados: ConvenioUbicado[] = [];
            
            // Caché en memoria para evitar re-consultar Nominatim para la misma dirección
            const cacheCoords: { [key: string]: [number, number] } = {};

            // Para evitar rate limits estrictos de Nominatim, geolocalizaremos secuencialmente con un leve retraso
            for (let i = 0; i < convenios.length; i++) {
                const c = convenios[i];
                
                // Si el convenio ya tiene coordenadas persistidas en la BD, las usamos directamente (cero delay)
                if (c.latitud !== undefined && c.latitud !== null && c.longitud !== undefined && c.longitud !== null) {
                    const lat = typeof c.latitud === 'string' ? parseFloat(c.latitud) : c.latitud;
                    const lon = typeof c.longitud === 'string' ? parseFloat(c.longitud) : c.longitud;
                    if (!isNaN(lat) && !isNaN(lon)) {
                        resultados.push({ ...c, coords: [lat, lon] });
                        continue;
                    }
                }

                if (!c.direccion) continue;

                // Dirección completa formateada y limpia para evitar ruidos en Nominatim (caso Kamaluso)
                const direccionCompleta = limpiarDireccion(c.direccion);

                if (cacheCoords[direccionCompleta]) {
                    resultados.push({ ...c, coords: cacheCoords[direccionCompleta] });
                    continue;
                }

                try {
                    // Petición a Nominatim API
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}&limit=1`;
                    const res = await fetch(url, {
                        headers: {
                            'Accept-Language': 'es',
                            'User-Agent': 'CirculoPolicialSanJoseApp/1.0'
                        }
                    });
                    
                    const data = await res.json();
                    
                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        const coords: [number, number] = [lat, lon];
                        
                        cacheCoords[direccionCompleta] = coords;
                        resultados.push({ ...c, coords });
                    } else {
                        // Si no lo encuentra, probamos una búsqueda más general (ej. solo calle y altura si es posible, o centro con dispersión para evitar solapamientos)
                        const dispersion = (i * 0.0003); // Leve dispersión para que no queden todos uno arriba de otro en la plaza
                        const fallbackCoords: [number, number] = [
                            centroSanJose[0] + dispersion,
                            centroSanJose[1] - dispersion
                        ];
                        resultados.push({ ...c, coords: fallbackCoords });
                    }
                } catch (error) {
                    console.error(`Error geocodificando dirección para ${c.nombre}:`, error);
                    // Fallback en caso de error de red o de API
                    const dispersion = (i * 0.0003);
                    const fallbackCoords: [number, number] = [
                        centroSanJose[0] + dispersion,
                        centroSanJose[1] - dispersion
                    ];
                    resultados.push({ ...c, coords: fallbackCoords });
                }

                // Pequeño delay de 250ms entre consultas para respetar los términos de uso de Nominatim
                await new Promise(resolve => setTimeout(resolve, 250));
            }

            setConveniosConCoordenadas(resultados);
            setGeocodificando(false);
        };

        if (convenios.length > 0) {
            geolocalizarConvenios();
        } else {
            setGeocodificando(false);
        }
    }, [convenios]);

    if (geocodificando) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-light rounded-4 shadow-inner" style={{ minHeight: '450px' }}>
                <Spinner color="primary" className="mb-3" />
                <h4 className="fw-bold text-muted">Geolocalizando convenios...</h4>
                <p className="text-muted small px-3 text-center">Traduciendo las direcciones de los comercios a coordenadas del mapa</p>
            </div>
        );
    }

    return (
        <div className="rounded-4 overflow-hidden border shadow-lg position-relative" style={{ height: '550px', zIndex: 1 }}>
            {/* Mapa Leaflet */}
            <MapContainer 
                center={centroSanJose} 
                zoom={14} 
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {conveniosConCoordenadas.map((c) => (
                    <Marker 
                        key={c.id} 
                        position={c.coords} 
                        icon={createCustomIcon(c.categoria)}
                    >
                        <Popup maxWidth={320} className="custom-leaflet-popup">
                            <div className="p-1">
                                <div className="d-flex align-items-center gap-3 mb-2 pb-2 border-bottom">
                                    {c.logo_url ? (
                                        <img 
                                            src={c.logo_url} 
                                            alt={c.nombre} 
                                            style={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '0.5rem', backgroundColor: '#f8f9fa', padding: '3px' }}
                                        />
                                    ) : (
                                        <div 
                                            className="d-flex align-items-center justify-content-center text-white fw-bold" 
                                            style={{ width: '45px', height: '45px', borderRadius: '0.5rem', backgroundColor: artiguistaColors.azul, fontSize: '1.2rem' }}
                                        >
                                            {c.nombre.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{c.nombre}</h5>
                                        <Badge 
                                            className="text-uppercase font-monospace mt-1"
                                            style={{ backgroundColor: artiguistaColors.dorado, color: artiguistaColors.azulOscuro, fontSize: '0.65rem', fontWeight: 'bold' }}
                                        >
                                            {c.categoria}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center gap-1 text-success fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                                        <Gift size={15} />
                                        <span>{c.beneficio}</span>
                                    </div>
                                    {c.descripcion && (
                                        <p className="text-muted mb-0 small text-truncate-2" style={{ lineHeight: '1.3' }}>
                                            {c.descripcion}
                                        </p>
                                    )}
                                    {c.direccion && (
                                        <div className="d-flex align-items-start gap-1 text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                                            <MapPin size={13} className="mt-0.5 text-danger flex-shrink-0" />
                                            <span>{c.direccion}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Botones de contacto rápidos - Alineados verticalmente para máxima legibilidad y contraste */}
                                <div className="d-flex flex-column gap-2 pt-2 border-top mt-2">
                                    {c.whatsapp && (
                                        <a 
                                            href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-success d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm hover-scale"
                                            style={{ 
                                                fontSize: '0.8rem', 
                                                borderRadius: '8px', 
                                                backgroundColor: '#25D366', 
                                                borderColor: '#25D366', 
                                                color: '#ffffff',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <MessageCircle size={14} style={{ stroke: '#ffffff' }} />
                                            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>WhatsApp</span>
                                        </a>
                                    )}
                                    {c.instagram && (
                                        <a 
                                            href={c.instagram.startsWith('http') ? c.instagram : `https://instagram.com/${c.instagram.replace('@', '')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm hover-scale"
                                            style={{ 
                                                backgroundColor: '#E1306C', 
                                                borderColor: '#E1306C', 
                                                fontSize: '0.8rem', 
                                                borderRadius: '8px', 
                                                color: '#ffffff',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Instagram size={14} style={{ stroke: '#ffffff' }} />
                                            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Instagram</span>
                                        </a>
                                    )}
                                    {c.sitio_web && (
                                        <a 
                                            href={c.sitio_web.startsWith('http') ? c.sitio_web : `https://${c.sitio_web}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-primary d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm hover-scale"
                                            style={{ 
                                                backgroundColor: artiguistaColors.azul, 
                                                borderColor: artiguistaColors.azul, 
                                                fontSize: '0.8rem', 
                                                borderRadius: '8px', 
                                                color: '#ffffff',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Globe size={14} style={{ stroke: '#ffffff' }} />
                                            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Web</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
