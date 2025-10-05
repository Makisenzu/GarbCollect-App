import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GiControlTower } from "react-icons/gi";
import { IoClose, IoCheckmark, IoNavigate } from "react-icons/io5";
import axios from 'axios';
import can from "@/images/can.png";

export default function TaskMap({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const siteMarkersRef = useRef([]);
    const [cssLoaded, setCssLoaded] = useState(false);
    const [siteLocations, setSiteLocations] = useState([]);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [activeSchedule, setActiveSchedule] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [mapError, setMapError] = useState(null);
    const [customStyleLoaded, setCustomStyleLoaded] = useState(false);

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
        link.onload = () => {
            console.log('Mapbox CSS loaded successfully');
            setCssLoaded(true);
        };
        link.onerror = () => {
            console.error('Failed to load Mapbox CSS');
            setMapError('Failed to load map styles');
        };
        
        document.head.appendChild(link);

        return () => {
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, []);

    useEffect(() => {
        const fetchScheduleAndSites = async () => {
            if (!scheduleId) return;
            
            setLoading(true);
            try {
                const scheduleResponse = await axios.get(`/schedules/${scheduleId}`);
                if (scheduleResponse.data.success && scheduleResponse.data.data) {
                    const schedule = scheduleResponse.data.data;
                    setActiveSchedule(schedule);

                    const sitesResponse = await axios.get(`/barangay/${schedule.barangay_id}/sites?status=active`);
                    if (sitesResponse.data.success) {
                        const activeSites = sitesResponse.data.data;
                        setSiteLocations(activeSites);
                        
                        if (activeSites.length >= 2) {
                            await calculateOptimalRoute(activeSites, schedule.barangay_id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching schedule and sites: ', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchScheduleAndSites();
    }, [scheduleId]);

    useEffect(() => {
        if (!cssLoaded || !mapboxKey || map.current || !mapContainer.current) {
            console.log('Prerequisites not met:', {
                cssLoaded, 
                mapboxKey: !!mapboxKey, 
                mapCurrent: !!map.current, 
                container: !!mapContainer.current
            });
            return;
        }

        console.log('Initializing map...');
        
        try {
            mapboxgl.accessToken = mapboxKey;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
                center: [125.94849837776422, 8.483022468128098],
                zoom: 10.5,
                attributionControl: false,
                interactive: true,
                scrollZoom: true,
                dragPan: true,
                dragRotate: false,
                keyboard: false,
                doubleClickZoom: true,
                touchZoomRotate: true,
            });

            map.current.on('load', () => {
                console.log('Map loaded successfully');
                setMapInitialized(true);
                setCustomStyleLoaded(true);
            });

            map.current.on('error', (e) => {
                console.error('Map error:', e);
                setMapError('Failed to load map: ' + e.error?.message);
            });

            map.current.on('idle', () => {
                console.log('Map is fully loaded and rendered');
            });

        } catch (error) {
            console.error('Error creating map:', error);
            setMapError('Failed to initialize map: ' + error.message);
        }

        return () => {
            if (map.current) {
                console.log('Cleaning up map');
                map.current.remove();
                map.current = null;
                setMapInitialized(false);
                setCustomStyleLoaded(false);
            }
        };
    }, [mapboxKey, cssLoaded]);

    useEffect(() => {
        if (mapInitialized && customStyleLoaded && siteLocations.length > 0 && routeCoordinates.length > 0) {
            console.log('All conditions met for adding route and markers');
            
            clearSiteMarkers();
            
            addSiteMarkers();
            
            setTimeout(() => {
                addRouteLayer();
            }, 300);
        }
    }, [mapInitialized, customStyleLoaded, siteLocations, routeCoordinates]);

    const calculateOptimalRoute = async (sites, barangayId) => {
        if (!mapboxKey || sites.length < 2) return;

        try {
            const optimizedSites = optimizeSiteOrder(sites);
            
            const coordinates = optimizedSites.map(site => 
                `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`
            ).join(';');

            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
                `access_token=${mapboxKey}` +
                `&geometries=geojson` +
                `&overview=full` +
                `&steps=true` +
                `&alternatives=false` +
                `&continue_straight=false`
            );

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const fastestRoute = data.routes.reduce((fastest, current) => 
                    current.duration < fastest.duration ? current : fastest
                );
                
                setRouteCoordinates(fastestRoute.geometry.coordinates);
                setRouteInfo({
                    duration: Math.round(fastestRoute.duration / 60),
                    distance: (fastestRoute.distance / 1000).toFixed(1)
                });
                
                console.log('Route calculated:', {
                    duration: Math.round(fastestRoute.duration / 60) + 'min',
                    distance: (fastestRoute.distance / 1000).toFixed(1) + 'km'
                });
            }
        } catch (error) {
            console.error('Error calculating route:', error);
            const fallbackRoute = sites.map(site => 
                [parseFloat(site.longitude), parseFloat(site.latitude)]
            );
            setRouteCoordinates(fallbackRoute);
        }
    };

    const optimizeSiteOrder = (sites) => {
        if (sites.length <= 2) return sites;
        
        const visited = new Set();
        const optimized = [];
        
        let currentSite = sites[0];
        optimized.push(currentSite);
        visited.add(0);

        while (optimized.length < sites.length) {
            let nearestIndex = -1;
            let minDistance = Infinity;

            for (let i = 0; i < sites.length; i++) {
                if (!visited.has(i)) {
                    const distance = calculateDistance(
                        currentSite.latitude, currentSite.longitude,
                        sites[i].latitude, sites[i].longitude
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestIndex = i;
                    }
                }
            }

            if (nearestIndex !== -1) {
                currentSite = sites[nearestIndex];
                optimized.push(currentSite);
                visited.add(nearestIndex);
            }
        }

        return optimized;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const calculateRouteFromCurrentLocation = async (currentPos, sites) => {
        if (!currentPos || sites.length === 0) return;
    
        try {
            const coordinates = `${currentPos[0]},${currentPos[1]};` + 
                               sites.map(site => 
                                   `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`
                               ).join(';');
    
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
                `access_token=${mapboxKey}&geometries=geojson&overview=full&steps=true`
            );
    
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                
                // Update the route coordinates which will trigger the useEffect
                setRouteCoordinates(route.geometry.coordinates);
                setRouteInfo({
                    duration: Math.round(route.duration / 60),
                    distance: (route.distance / 1000).toFixed(1)
                });
                
                console.log('Route from current location calculated:', {
                    duration: Math.round(route.duration / 60) + 'min',
                    distance: (route.distance / 1000).toFixed(1) + 'km'
                });
                
                // Force update the route layer after a short delay
                setTimeout(() => {
                    if (map.current && route.geometry.coordinates.length > 0) {
                        addRouteLayer();
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error calculating route from current location:', error);
        }
    };

    const addRouteLayer = () => {
        if (!map.current || routeCoordinates.length === 0) {
            console.log('Cannot add route: missing map or coordinates');
            return;
        }

        if (!map.current.isStyleLoaded()) {
            console.log('Map style not loaded yet, waiting...');
            map.current.once('styledata', () => {
                setTimeout(addRouteLayer, 100);
            });
            return;
        }

        console.log('Adding route layer with', routeCoordinates.length, 'coordinates');

        ['route', 'route-glow', 'route-direction'].forEach(layerId => {
            if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
            }
        });
        
        if (map.current.getSource('route')) {
            map.current.removeSource('route');
        }

        try {
            map.current.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: routeCoordinates
                    }
                }
            });

            const barangayName = activeSchedule?.barangay_name || 'San Francisco';
            const routeColor = barangayColors[barangayName] || barangayColors['_default'];

            const isMobile = window.innerWidth < 768;
            const lineWidth = isMobile ? 5 : 6;
            const glowWidth = isMobile ? 10 : 12;

            map.current.addLayer({
                id: 'route-glow',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': routeColor,
                    'line-width': glowWidth,
                    'line-opacity': 0.4,
                    'line-blur': 8
                }
            });

            map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': routeColor,
                    'line-width': lineWidth,
                    'line-opacity': 0.9
                }
            });

            console.log('Route layers added successfully');

            setTimeout(() => {
                fitMapToRoute();
            }, 200);

        } catch (error) {
            console.error('Error adding route layer:', error);
            
            setTimeout(() => {
                addRouteLayer();
            }, 500);
        }
    };

    const fitMapToRoute = () => {
        if (!map.current || routeCoordinates.length === 0 || siteLocations.length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        
        siteLocations.forEach(site => {
            if (site.longitude && site.latitude) {
                bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
            }
        });

        routeCoordinates.forEach(coord => {
            bounds.extend(coord);
        });

        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 30 : 50;

        try {
            map.current.fitBounds(bounds, {
                padding: padding,
                duration: 1000,
                essential: true,
                maxZoom: 15
            });
        } catch (error) {
            console.error('Error fitting map to bounds:', error);
        }
    };

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
    };

    const addSiteMarkers = () => {
        clearSiteMarkers();
        siteLocations.forEach((site, index) => {
            if (site.longitude && site.latitude) {
                const marker = addMarker(
                    [parseFloat(site.longitude), parseFloat(site.latitude)],
                    'site',
                    site.site_name,
                    site,
                    index
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

    const createImageMarker = (siteData, sequence) => {
        const barangayName = siteData?.purok?.baranggay?.baranggay_name;
        const borderColor = barangayColors[barangayName] || barangayColors['_default'];

        const markerElement = document.createElement('div');
        markerElement.className = 'custom-image-marker';
        
        let sequenceBadge = '';
        if (activeSchedule) {
            sequenceBadge = `
                <div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                    ${sequence + 1}
                </div>
            `;
        }

        markerElement.innerHTML = `
            <div class="relative">
                ${sequenceBadge}
                <div class="w-10 h-10 rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg" 
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

    const createStationIcon = (sequence) => {
        const el = document.createElement('div');
        el.className = 'custom-marker relative';
        
        let sequenceBadge = '';
        if (activeSchedule) {
            sequenceBadge = `
                <div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    ${sequence + 1}
                </div>
            `;
        }

        el.innerHTML = sequenceBadge;
        const root = createRoot(el);
        root.render(<GiControlTower size={30} color={'#4F262A'} />);
        return { element: el, root };
    };

    const addMarker = (coordinates, type = 'manual', title = '', siteData = null, sequence = 0) => {
        let markerElement;
        let root = null;
        
        if (type === 'manual') {
            markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
        } else if (siteData?.type === 'station') {
            const stationIcon = createStationIcon(sequence);
            markerElement = stationIcon.element;
            root = stationIcon.root;
        } else {
            markerElement = createImageMarker(siteData, sequence);
        }

        const marker = new mapboxgl.Marker({
            element: markerElement,
            draggable: false
        })
        .setLngLat(coordinates)
        .addTo(map.current);

        if (root) {
            marker._root = root;
        }

        return marker;
    };
    const refreshRouteLayer = () => {
        if (map.current && routeCoordinates.length > 0) {
            addRouteLayer();
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            
            // Add accuracy debugging
            console.log('Requesting high accuracy location...');
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    const currentPos = [longitude, latitude];
                    
                    console.log('Location obtained:', {
                        latitude,
                        longitude,
                        accuracy: accuracy + ' meters',
                        url: `https://www.google.com/maps?q=${latitude},${longitude}`
                    });
                    
                    setCurrentLocation(currentPos);
                    
                    // Clear existing current location marker first
                    const existingMarker = document.querySelector('.current-location-marker');
                    if (existingMarker) existingMarker.remove();
                    
                    addCurrentLocationMarker(currentPos);
    
                    if (siteLocations.length > 0) {
                        await calculateRouteFromCurrentLocation(currentPos, siteLocations);
                    }
                    
                    if (map.current) {
                        map.current.flyTo({
                            center: currentPos,
                            zoom: 14,
                            essential: true,
                            duration: 1500
                        });
                    }
                    
                    setLoading(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLoading(false);
                    
                    let errorMessage = 'Unable to get your location. ';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out. Try moving to an area with better signal.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                            break;
                    }
                    
                    alert(errorMessage);
                },
                {
                    enableHighAccuracy: true,    // Use GPS if available
                    timeout: 30000,              // Increased timeout to 30 seconds
                    maximumAge: 0                // Don't use cached position
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const addCurrentLocationMarker = (coordinates) => {
        const existingMarker = document.querySelector('.current-location-marker');
        if (existingMarker) existingMarker.remove();

        const markerElement = document.createElement('div');
        markerElement.className = 'current-location-marker';
        markerElement.innerHTML = `
            <div class="relative">
                <div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
                <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
            </div>
        `;

        new mapboxgl.Marker({
            element: markerElement,
            draggable: false
        })
        .setLngLat(coordinates)
        .addTo(map.current);
    };

    return (
        <div className="relative w-full h-full bg-white">
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading route...</p>
                    </div>
                </div>
            )}

            {mapError && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-30">
                    <div className="text-center p-4">
                        <div className="text-red-500 text-lg mb-2">Map Error</div>
                        <div className="text-gray-600 mb-4">{mapError}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!cssLoaded && !mapError && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                </div>
            )}

            {/* {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-4 left-4 z-30 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
                    <div>CSS: {cssLoaded ? '✅' : '❌'}</div>
                    <div>Map: {mapInitialized ? '✅' : '❌'}</div>
                    <div>Style: {customStyleLoaded ? '✅' : '❌'}</div>
                    <div>Sites: {siteLocations.length}</div>
                    <div>Route: {routeCoordinates.length > 0 ? '✅' : '❌'}</div>
                    <div>Mobile: {window.innerWidth < 768 ? '✅' : '❌'}</div>
                </div>
            )} */}

<div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
    <div className="flex flex-col items-center">
        <button
            onClick={getCurrentLocation}
            className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
            title="Current Location & Route"
        >
            <IoNavigate className="w-6 h-6 text-blue-600" />
        </button>
        {/* Optional: Add a small refresh indicator */}
        {currentLocation && (
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></div>
        )}
    </div>

    <button
        onClick={() => onTaskComplete && onTaskComplete({ scheduleId })}
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-green-600 flex items-center justify-center"
        title="Complete Task"
    >
        <IoCheckmark className="w-6 h-6" />
    </button>

    <button
        onClick={onTaskCancel}
        className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-red-600 flex items-center justify-center"
        title="Cancel Task"
    >
        <IoClose className="w-6 h-6" />
    </button>
</div>
    
            {activeSchedule && (
                <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                    <div className="text-sm font-medium text-gray-900">
                        <span className="text-blue-600 font-bold">{siteLocations.length}</span> sites to collect
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                        Barangay: <span className="font-medium">{activeSchedule.baranggay_name}</span>
                    </div>
                    {routeInfo && (
                        <div className="text-xs text-gray-600 mt-1">
                            Est: <span className="font-medium">{routeInfo.duration} min</span> • 
                            <span className="font-medium"> {routeInfo.distance} km</span>
                        </div>
                    )}
                </div>
            )}
            
            <div 
                ref={mapContainer} 
                className="w-full h-full absolute inset-0"
                style={{ 
                    width: '100%', 
                    height: '100%',
                    minHeight: '400px'
                }}
            />
        </div>
    );
}