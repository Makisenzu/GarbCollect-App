import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GrLocationPin } from "react-icons/gr";
import { CiLocationOn } from "react-icons/ci";
import { GiControlTower } from "react-icons/gi";
import axios from 'axios';
import can from "@/images/can.png";

export default function Map({ mapboxKey, onLocationSelect, refreshTrigger, onEditSite, onDeleteSite }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markerRef = useRef(null);
    const siteMarkersRef = useRef([]);
    const [cssLoaded, setCssLoaded] = useState(false);
    const [siteLocations, setSiteLocations] = useState([]);
    const [mapInitialized, setMapInitialized] = useState(false);

    const staticPolygonData = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    id: 1,
                    barangay: "San Francisco",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [125.99912782475212 ,8.575510286263182], [126.00025443311193, 8.571458743014418], [126.02485768210255 ,8.565939354188075],
                        [126.04450490232114, 8.466818846605392], [126.1103129490703, 8.46664901562528], [126.06009804976281 ,8.415887696221361],
                        [126.07054556119789, 8.402939305491458], [126.02793797928399, 8.40460170458961], [126.02527178904438, 8.408548502194648],
                        [126.02427353120135 ,8.409252626098564], [126.02385934340657 ,8.40926067897989] , [126.0212174711134, 8.407984558278983],
                        [126.02055643141244, 8.408178587487853], [126.01856794991, 8.409294302964668], [126.01662892223891, 8.4046902116812],
                        [126.01474001557193, 8.406036008364552], [126.01358506617925, 8.404625448531675], [126.00952801076892, 8.405454403475574],
                        [126.00777831277611, 8.404925515942836], [126.00658549599319, 8.403966025428687], [126.00485033177199, 8.403227717091895],
                        [126.00509998136846, 8.401577514556351], [126.00574801766186, 8.400888351042127], [125.97641093552602, 8.391757550629634],
                        [125.97390880231916, 8.39080800207968],  [125.97081543981409, 8.39161874461628], [125.96745822964954, 8.39014796167777],
                        [125.96303628490449,  8.389036768089781], [125.95862571497344, 8.38720153395198], [125.96318041276902, 8.371729751905093],
                        [125.95503341347933, 8.369405592514127], [125.95860757814717, 8.355388169154793], [125.92791631975041, 8.347929528410077],
                        [125.89113139787435, 8.393374892862454], [125.88334005008488, 8.417552308867386], [125.79651821810683, 8.548921445742934],
                        [125.93730538303595, 8.548744057251142], [125.9349976967647, 8.577733038602531], [125.99912782475212 ,8.575510286263182]
                    ]]
                }
            },
        ]
    };

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
        'San Francisco': '#FFE659',
        '_default': '#4F262A'
    };

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
    }, [refreshTrigger]);

    useEffect(() => {
        if (!cssLoaded || !mapboxKey || map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxKey;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
            center: [125.94849837776422, 8.483022468128098],
            attributionControl: false,
            zoom: 10.5,
        });

        map.current.on('load', () => {
            setMapInitialized(true);
            addPolygonLayer(staticPolygonData);
        });

        map.current.on('click', async (e) => {
            const { lng, lat } = e.lngLat;

            // console.log(lng, lat);
            
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }

            const el = document.createElement('div');
            el.className = 'custom-marker';
            
            const root = createRoot(el);
            root.render(<CiLocationOn size={30} color="#FC2622" />);

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
    }, [mapboxKey, cssLoaded, refreshTrigger]);

    useEffect(() => {
        if (mapInitialized && siteLocations.length > 0) {
            addSiteMarkers();
        }
    }, [mapInitialized, siteLocations]);

    const addPolygonLayer = (geoJsonData) => {
        if (!map.current) return;
        
        if (map.current.getLayer('polygons-fill')) {
            map.current.removeLayer('polygons-fill');
        }
        if (map.current.getLayer('polygons-outline')) {
            map.current.removeLayer('polygons-outline');
        }
        if (map.current.getSource('polygons')) {
            map.current.removeSource('polygons');
        }

        map.current.addSource('polygons', {
            type: 'geojson',
            data: geoJsonData
        });

        map.current.addLayer({
            id: 'polygons-fill',
            type: 'fill',
            source: 'polygons',
            paint: {
                'fill-color': [
                    'match',
                    ['get', 'barangay'],
                    'San Francisco', '#FFE659',
                    '#4F262A'
                ],
                'fill-opacity': 0.5
            }
        });

        map.current.addLayer({
            id: 'polygons-outline',
            type: 'line',
            source: 'polygons',
            paint: {
                'line-color': '#000',
                'line-width': 2
            }
        });

        map.current.on('mouseenter', 'polygons-fill', () => {
            map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'polygons-fill', () => {
            map.current.getCanvas().style.cursor = '';
        });
    };

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
                setTimeout(() => marker._root.unmount(), 0);
            }
            marker.remove();
        });
        siteMarkersRef.current = [];
    };

    const createActionButtonsPopup = (siteData) => {
        const popupElement = document.createElement('div');
        popupElement.className = 'p-3 min-w-[200px]';
        
        popupElement.innerHTML = `
            <div class="text-center mb-3">
                <h3 class="font-bold text-lg text-gray-900">${siteData.site_name}</h3>
                <p class="text-sm text-gray-600">${siteData.purok?.baranggay?.baranggay_name || 'N/A'} - ${siteData.purok?.purok_name || 'N/A'}</p>
            </div>
            <div class="flex gap-2 justify-center">
                <button id="edit-site-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit
                </button>
                <button id="delete-site-btn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                </button>
            </div>
        `;

        setTimeout(() => {
            const editBtn = popupElement.querySelector('#edit-site-btn');
            const deleteBtn = popupElement.querySelector('#delete-site-btn');

            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (onEditSite) onEditSite(siteData);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (onDeleteSite) onDeleteSite(siteData);
                });
            }
        }, 0);

        return popupElement;
    };

    const createImageMarker = (siteData) => {
        const barangayName = siteData?.purok?.baranggay?.baranggay_name;
        const borderColor = barangayColors[barangayName] || barangayColors['_default'];

        const markerElement = document.createElement('div');
        markerElement.className = 'custom-image-marker';
        markerElement.innerHTML = `
            <div class="relative">
                <div class="w-10 h-10 rounded-full border-10 flex items-center justify-center overflow-hidden" 
                     style="border-color: ${borderColor}; background-color: ${borderColor}20;">
                    <img src="${can}" 
                         alt="${siteData.site_name}" 
                         class="w-8 h-8 object-cover rounded-full"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold\\' style=\\'background-color: ${borderColor}\\'>${siteData.site_name?.charAt(0) || 'S'}</div>'">
                </div>
            </div>
        `;

        return markerElement;
    };

    const createStationIcon = () => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        const root = createRoot(el);
        root.render(<GiControlTower size={30} color={'#4F262A'} />);
        return { element: el, root };
    };

    const addMarker = (coordinates, type = 'manual', title = '', siteData = null) => {
        let markerElement;
        let root = null;
        
        if (type === 'manual') {
            markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            root = createRoot(markerElement);
            root.render(<GrLocationPin size={15} color="#FC2622" />);
        } else if (siteData?.type === 'station') {
            const stationIcon = createStationIcon();
            markerElement = stationIcon.element;
            root = stationIcon.root;
        } else {
            markerElement = createImageMarker(siteData);
        }

        const marker = new mapboxgl.Marker({
            element: markerElement,
            draggable: false
        })
        .setLngLat(coordinates)
        .addTo(map.current);
    
        if (type === 'site' && title) {
            const popup = new mapboxgl.Popup({ 
                offset: 25,
                closeOnClick: true,
                closeButton: true
            }).setDOMContent(createActionButtonsPopup(siteData));
            
            marker.setPopup(popup);
        }
    
        if (type === 'manual') {
            markerRef.current = marker;
        }
    
        if (root) {
            marker._root = root;
        }
    
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