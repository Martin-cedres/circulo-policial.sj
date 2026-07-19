'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button, Spinner, Alert } from 'reactstrap';
import { MapPin, Search } from 'lucide-react';
import { artiguistaColors } from '@/styles/colors';
import 'leaflet/dist/leaflet.css';

interface AdminMapaPickerProps {
    lat: string | number;
    lon: string | number;
    direccion: string;
    onChange: (lat: number, lon: number) => void;
}

// Icono personalizado para el administrador (dorado)
const adminIcon = L.divIcon({
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.4));">
            <path fill="${artiguistaColors.dorado}" stroke="#003366" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="4" fill="#ffffff"/>
            <circle cx="12" cy="9" r="2" fill="#003366"/>
        </svg>
    `,
    className: 'admin-leaflet-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
});

// Componente helper para centrar el mapa dinámicamente cuando cambian las coordenadas externas
function ActualizarCentroMap({ coords }: { coords: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (coords[0] !== 0 && coords[1] !== 0) {
            map.setView(coords, map.getZoom());
        }
    }, [coords, map]);
    return null;
}

export default function AdminMapaPicker({ lat, lon, direccion, onChange }: AdminMapaPickerProps) {
    const [cargando, setCargando] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Centro por defecto: Plaza Treinta y Tres, San José de Mayo, Uruguay
    const centroDefecto: [number, number] = [-34.3392, -56.7136];

    const currentLat = parseFloat(String(lat)) || 0;
    const currentLon = parseFloat(String(lon)) || 0;

    const coordenadasMap = useMemo<[number, number]>(() => {
        if (currentLat !== 0 && currentLon !== 0) {
            return [currentLat, currentLon];
        }
        return centroDefecto;
    }, [currentLat, currentLon]);

    const markerRef = useRef<any>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const position = marker.getLatLng();
                    onChange(position.lat, position.lng);
                }
            },
        }),
        [onChange]
    );

    // Limpia ruidos en la dirección y la formatea
    const limpiarDireccion = (dir: string) => {
        let clean = dir.trim();
        clean = clean.replace(/^(calle\s+)/i, '');
        clean = clean.replace(/(?:n[°ºo\.]\s*|nro\s*|#\s*|num\s*)/gi, '');
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

    const handleGeocodificar = async () => {
        if (!direccion || direccion.trim() === '') {
            setErrorMsg('Ingresá una dirección primero.');
            return;
        }

        setCargando(true);
        setErrorMsg(null);

        const direccionLimpia = limpiarDireccion(direccion);

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionLimpia)}&limit=1`;
            const res = await fetch(url, {
                headers: {
                    'Accept-Language': 'es',
                    'User-Agent': 'CirculoPolicialSanJoseAdmin/1.0'
                }
            });
            const data = await res.json();

            if (data && data.length > 0) {
                const newLat = parseFloat(data[0].lat);
                const newLon = parseFloat(data[0].lon);
                onChange(newLat, newLon);
            } else {
                setErrorMsg('No se pudo encontrar la dirección automáticamente. Podés ubicar el pin manualmente arrastrándolo en el mapa.');
                // Ubicamos por defecto en el centro de San José si no tenía coordenadas
                if (currentLat === 0 && currentLon === 0) {
                    onChange(centroDefecto[0], centroDefecto[1]);
                }
            }
        } catch (e) {
            setErrorMsg('Error de red al geolocalizar. Intentá ubicar el pin en el mapa.');
            if (currentLat === 0 && currentLon === 0) {
                onChange(centroDefecto[0], centroDefecto[1]);
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="admin-map-picker-container mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
                <Button 
                    type="button" 
                    color="primary" 
                    size="sm" 
                    className="d-flex align-items-center gap-1"
                    onClick={handleGeocodificar}
                    disabled={cargando}
                    style={{ backgroundColor: artiguistaColors.azul, borderColor: artiguistaColors.azul }}
                >
                    {cargando ? <Spinner size="sm" className="me-1" /> : <Search size={14} />}
                    Buscar dirección en el mapa
                </Button>
                <small className="text-muted">
                    Geolocaliza de forma automática o arrastra el marcador dorado.
                </small>
            </div>

            {errorMsg && (
                <Alert color="warning" className="py-2 px-3 small mb-2">
                    {errorMsg}
                </Alert>
            )}

            <div className="rounded-3 overflow-hidden border" style={{ height: '220px', zIndex: 1 }}>
                <MapContainer
                    center={coordenadasMap}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {currentLat !== 0 && currentLon !== 0 && (
                        <>
                            <Marker
                                position={[currentLat, currentLon]}
                                icon={adminIcon}
                                draggable={true}
                                eventHandlers={eventHandlers}
                                ref={markerRef}
                            />
                            <ActualizarCentroMap coords={[currentLat, currentLon]} />
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
