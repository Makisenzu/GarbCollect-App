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
    const barangayColors = {
        'Alegria': '#FF5733',
        'Barangay 1': '#33FF57',
        'Barangay 2': '#3357FF',
        'Barangay 3': '#F033FF',
        'Barangay 4': '#FF33F0',
        'Barangay 5': '#33FFF0',
        'Bayugan 2': '#8A2BE2',
        'Bitan-agan': '#A52A2A',
        'Borbon': '#DEB887',
        'Buenasuerte': '#5F9EA0',
        'Caimpugan': '#7FFF00',
        'Das-agan': '#D2691E',
        'Ebro': '#FF7F50',
        'Hubang': '#6495ED',
        'Karaus': '#DC143C',
        'Ladgadan': '#00FFFF',
        'Lapinigan': '#00008B',
        'Lucac': '#008B8B',
        'Mate': '#B8860B',
        'New Visayas': '#006400',
        'Ormaca': '#8B008B',
        'Pasta': '#556B2F',
        'Pisa-an': '#FF8C00',
        'Rizal': '#9932CC',
        'San Isidro': '#8FBC8F',
        'Santa Ana': '#483D8B',
        'Tagapua': '#2F4F4F',
        '_default': '#4F262A'
      };
    const barangays = Object.keys(barangayColors).filter(key => key !== '_default');

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
            style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
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
        'Alegria': '#FF5733',
        'Barangay 1': '#33FF57',
        'Barangay 2': '#3357FF',
        'Barangay 3': '#F033FF',
        'Barangay 4': '#FF33F0',
        'Barangay 5': '#33FFF0',
        'Bayugan 2': '#8A2BE2',
        'Bitan-agan': '#A52A2A',
        'Borbon': '#DEB887',
        'Buenasuerte': '#5F9EA0',
        'Caimpugan': '#7FFF00',
        'Das-agan': '#D2691E',
        'Ebro': '#FF7F50',
        'Hubang': '#6495ED',
        'Karaus': '#DC143C',
        'Ladgadan': '#00FFFF',
        'Lapinigan': '#00008B',
        'Lucac': '#008B8B',
        'Mate': '#B8860B',
        'New Visayas': '#006400',
        'Ormaca': '#8B008B',
        'Pasta': '#556B2F',
        'Pisa-an': '#FF8C00',
        'Rizal': '#9932CC',
        'San Isidro': '#8FBC8F',
        'Santa Ana': '#483D8B',
        'Tagapua': '#2F4F4F',
        '_default': '#4F262A'
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
                        <p><strong>Site #: </strong>${siteData.id}</p>
                        <p><strong>Barangay:</strong> ${siteData.purok?.baranggay?.baranggay_name || 'N/A'}</p>
                        <p><strong>Purok:</strong> ${siteData.purok?.purok_name || 'N/A'}</p>
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
        <div className="relative w-full h-full rounded-lg">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
          
          <div className="absolute bottom-4 right-4 bg-white p-2 sm:p-4 rounded-lg shadow-md z-40 
                          max-h-[100px] sm:max-h-[150px] w-[160px] sm:w-[220px] overflow-y-auto
                          text-xs sm:text-sm">
            <h3 className="font-bold mb-2 sticky top-0 bg-white pb-2">Map Legend</h3>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center">
                <GiControlTower className="w-4 h-4 sm:w-5 sm:h-5" color="#4F262A" />
                <span className="ml-2">Station</span>
              </div>
              
              {barangays.map(barangay => (
                <div key={barangay} className="flex items-center">
                  <ImLocation className="w-4 h-4 sm:w-5 sm:h-5" color={barangayColors[barangay]} />
                  <span className="ml-2 truncate">{barangay}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
}