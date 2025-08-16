import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GrLocationPin } from "react-icons/gr";
import { ImLocation } from "react-icons/im";
import axios from 'axios';

export default function Map({ mapboxKey, onLocationSelect }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markerRef = useRef(null);
    const siteMarkersRef = useRef([]);
    const [cssLoaded, setCssLoaded] = useState(false);
    const [siteLocations, setSiteLocations] = useState([]);
    const [mapInitialized, setMapInitialized] = useState(false);

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

        map.current.on('click', async (e) => {
            const { lng, lat } = e.lngLat;
            
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            // addMarker([lng, lat], 'manual');

            const el = document.createElement('div');
            el.className = 'custom-marker';
            
            const root = createRoot(el);
            root.render(<GrLocationPin size={40} color="#FC2622" />);

            markerRef.current = new mapboxgl.Marker({
                element: el,
                draggable: false
            })
                .setLngLat([lng, lat])
                .addTo(map.current);

            markerRef.current._root = root;
            
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
        
        const color = type === 'site' ? '#34A853' : '#FC2622';
        const size = type === 'site' ? 30 : 40;
        
        const root = createRoot(el);
        root.render(<ImLocation size={size} color={color} />);

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
                        <p><strong>Purok:</strong> ${siteData.purok?.name || 'N/A'}</p>
                        <p><strong>Collection Time:</strong> ${siteData.collection_time}</p>
                        <p><strong>Status:</strong> ${siteData.status}</p>
                        ${siteData.additional_notes ? `<p><strong>Notes:</strong> ${siteData.additional_notes}</p>` : ''}
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

    const extractPhilippineAddress = (geocodeData) => {
        const features = geocodeData.features;
        
        let barangay = '';
        let purok = '';
        
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
    
        const neighborhoodFeature = features.find(f => 
            f.place_type.includes('neighborhood')
        );
        if (neighborhoodFeature) {
            purok = neighborhoodFeature.text;
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