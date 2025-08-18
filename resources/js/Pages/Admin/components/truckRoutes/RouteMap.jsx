import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GrLocationPin } from "react-icons/gr";
import { ImLocation } from "react-icons/im";
import { GiControlTower } from "react-icons/gi";
import axios from 'axios';

export default function RouteMap({ mapboxKey, onLocationSelect}) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const siteMarkersRef = useRef([]);
    const [cssLoaded, setCssLoaded] = useState(false);
    const [siteLocations, setSiteLocations] = useState([]);
    const [mapInitialized, setMapInitialized] = useState(false);

    const [color, setColor] = useState(null);

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
        const fetchLocations = async () => {
            try {
                const response = await axios.get('/municipality/barangay/purok/sites');
                if (response.data.success) {
                    setSiteLocations(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching locations: ', error);
            }
        };
        fetchLocations();
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

        map.current.on('load', () => {
            setMapInitialized(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
            setMapInitialized(false);
        };
    }, [mapboxKey, cssLoaded]);

    useEffect(() => {
        if (mapInitialized && siteLocations.length > 0) {
            addSiteMarkers();
        }
    }, [mapInitialized, siteLocations]);

    const addSiteMarkers = () => {
        clearSiteMarkers();
        siteLocations.forEach(site => {
            if (site.longitude && site.latitude) {
                const marker = addMarker(
                    [parseFloat(site.longitude), parseFloat(site.latitude)],
                    'site',
                    site.site_name,
                    site
                );
                siteMarkersRef.current.push(marker);
            }
        });
    };

    const clearSiteMarkers = () => {
        siteMarkersRef.current.forEach(marker => {
            if (marker._root) {
                marker._root.unmount();
            }
            marker.remove();
        });
        siteMarkersRef.current = [];
    };

    const addMarker = (coordinates, type = 'manual', title = '', siteData = null) => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        const barangay_colors =  {
            'Alegria' : '#FC2622',
            'Barangay 1' : '#34A853',
            'Barangay 2' : '#4285F4',
            '_default' : '#4F262A'
        }

        let markerColor = '';

        const barangay_name = siteData.purok?.baranggay?.baranggay_name;
        const markerType = siteData?.type || 'site';

        markerColor = barangay_colors[barangay_name] || barangay_colors['_default'];
    
        const size = type === 'site' ? 30 : 15;
        
        const root = createRoot(el);
        
        if(type === 'manual') {
            root.render(<GrLocationPin size={15} color="#FC2622" />);
        } else {
            if (markerType === 'station') {
                root.render(<GiControlTower size={size} color={'#4F262A'} />);
            } else {
                root.render(<ImLocation size={size} color={markerColor} />);
            }
        }

        const marker = new mapboxgl.Marker({
            element: el,
            draggable: false
        })
        .setLngLat(coordinates)
        .addTo(map.current);
    
        if (type === 'site' && title) {
            const popupContent = `
                <div class="p-2">
                    <h3 class="font-bold">${title}</h3>
                    ${siteData ? `
                        <p><strong>Barangay:</strong> ${siteData.purok?.baranggay?.baranggay_name || 'N/A'}</p>
                        <p><strong>Purok:</strong> ${siteData.purok?.purok_name || 'N/A'}</p>
                        <p><strong>Type:</strong> ${siteData.type}</p>
                        <p><strong>Status:</strong> ${siteData.status}</p>
                        ${siteData.additional_notes ? `<p><strong>Notes:</strong> ${siteData.additional_notes}</p>` : '<p><strong>Notes:</strong> None</storn></p>'}
                    ` : ''}
                </div>
            `;
            const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(popupContent);
            marker.setPopup(popup);
        }
    
        if (type === 'manual') {
            markerRef.current = marker;
        }
    
        marker._root = root;
        return marker;
    };

    return (
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
    );
}