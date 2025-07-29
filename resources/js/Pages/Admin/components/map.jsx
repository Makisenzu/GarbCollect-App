import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export default function Map({ mapboxKey, onLocationSelect }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markerRef = useRef(null);
    const [cssLoaded, setCssLoaded] = useState(false);

    useEffect(() => {

        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        setCssLoaded(true);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        if (!cssLoaded || !mapboxKey || map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxKey;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [125.97666490, 8.50410607],
            attributionControl: false,
            zoom: 13
        });

        map.current.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }

            markerRef.current = new mapboxgl.Marker({
                draggable: false
            })
                .setLngLat([lng, lat])
                .addTo(map.current);
            
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` + 
                    `access_token=${mapboxKey}&country=PH&types=region,district,locality,neighborhood,place`
                );
                const data = await response.json();
                
                const address = {
                    coordinates: { lng, lat },
                    full_address: data.features[0]?.place_name || '',
                    ...extractPhilippineAddress(data)
                };
                
                if (onLocationSelect) onLocationSelect(address);
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        });

        return () => {
            if (markerRef.current) markerRef.current.remove();
            if (map.current) map.current.remove();
        };
    }, [mapboxKey, cssLoaded]);

    const extractPhilippineAddress = (geocodeData) => {
        const features = geocodeData.features;
        
        let barangay = '';
        const barangayFeature = features.find(f => 
            f.place_type.includes('locality') || 
            f.place_type.includes('place') ||
            (f.context && f.context.some(ctx => ctx.id.includes('locality')))
        );
        
        if (barangayFeature) {
            barangay = barangayFeature.text || 
                      barangayFeature.context?.find(ctx => ctx.id.includes('locality'))?.text ||
                      '';
        }

        return { 
            barangay: barangay || 'Not specified',
            purok: purok || 'Not specified'
        };
    };

    return (
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
    );
}