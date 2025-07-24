import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map({ mapboxKey }) {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (!mapboxKey || map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxKey;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [125.97666490, 8.50410607],
            zoom: 13
        });

        map.current.addControl(new mapboxgl.NavigationControl());

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapboxKey]);

    return (
        <div 
            ref={mapContainer} 
            className="w-full h-[500px] rounded-lg"
        />
    );
}