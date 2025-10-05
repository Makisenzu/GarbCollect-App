import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GiControlTower } from "react-icons/gi";
import { IoClose, IoCheckmark, IoNavigate, IoSparkles, IoChevronDown, IoChevronUp } from "react-icons/io5";
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
    const [aiOptimizedRoute, setAiOptimizedRoute] = useState(null);
    const [nearestSite, setNearestSite] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setShowAIPanel(false);
                setShowControls(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                zoom: isMobile ? 11 : 10.5,
                attributionControl: false,
                interactive: true,
                scrollZoom: !isMobile, // Disable scroll zoom on mobile for better touch
                dragPan: true,
                dragRotate: false,
                keyboard: false,
                doubleClickZoom: !isMobile,
                touchZoomRotate: true,
                touchPitch: false,
                cooperativeGestures: isMobile, // Better for mobile
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
    }, [mapboxKey, cssLoaded, isMobile]);

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

    // AI-powered route optimization
    const analyzeAndOptimizeRoute = async (driverLocation, sites) => {
        if (!driverLocation || sites.length === 0) return null;

        try {
            console.log('🤖 AI analyzing optimal route...');
            
            // Calculate distances to all sites
            const sitesWithDistances = sites.map(site => {
                const distance = calculateDistance(
                    driverLocation[1], driverLocation[0],
                    parseFloat(site.latitude), parseFloat(site.longitude)
                );
                return {
                    ...site,
                    distance,
                    coordinates: [parseFloat(site.longitude), parseFloat(site.latitude)]
                };
            });

            // Sort by distance
            const sortedSites = sitesWithDistances.sort((a, b) => a.distance - b.distance);
            const nearest = sortedSites[0];
            setNearestSite(nearest);

            console.log('📍 Nearest site:', {
                name: nearest.site_name,
                distance: nearest.distance.toFixed(2) + ' km',
                coordinates: nearest.coordinates
            });

            // Get real-time route from driver to nearest site
            const routeResponse = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/` +
                `${driverLocation[0]},${driverLocation[1]};` +
                `${nearest.coordinates[0]},${nearest.coordinates[1]}?` +
                `access_token=${mapboxKey}&geometries=geojson&overview=full&steps=true`
            );

            const routeData = await routeResponse.json();

            if (routeData.routes && routeData.routes.length > 0) {
                const optimalRoute = routeData.routes[0];
                
                const aiResult = {
                    nearestSite: nearest,
                    route: optimalRoute.geometry.coordinates,
                    duration: Math.round(optimalRoute.duration / 60),
                    distance: (optimalRoute.distance / 1000).toFixed(1),
                    trafficConditions: analyzeTrafficConditions(optimalRoute),
                    recommendation: generateRecommendation(optimalRoute, nearest)
                };

                console.log('🚀 AI Route Analysis:', aiResult);
                setAiOptimizedRoute(aiResult);
                
                // Auto-show AI panel on mobile when route is calculated
                if (isMobile) {
                    setShowAIPanel(true);
                }
                
                return aiResult;
            }
        } catch (error) {
            console.error('AI route analysis failed:', error);
        }
        return null;
    };

    // Analyze traffic conditions based on route data
    const analyzeTrafficConditions = (route) => {
        const duration = route.duration / 60; // minutes
        const distance = route.distance / 1000; // km
        
        // Calculate average speed (km/h)
        const avgSpeed = distance / (duration / 60);
        
        let conditions = 'good';
        let congestionLevel = 'low';
        
        if (avgSpeed < 20) {
            conditions = 'heavy';
            congestionLevel = 'high';
        } else if (avgSpeed < 40) {
            conditions = 'moderate';
            congestionLevel = 'medium';
        }
        
        return {
            conditions,
            congestionLevel,
            averageSpeed: avgSpeed.toFixed(1),
            estimatedDelay: avgSpeed < 40 ? '5-15 minutes' : '0-5 minutes'
        };
    };

    // Generate AI recommendations
    const generateRecommendation = (route, nearestSite) => {
        const duration = route.duration / 60;
        const traffic = analyzeTrafficConditions(route);
        
        let recommendation = '';
        let urgency = 'low';
        
        if (duration < 10) {
            recommendation = `🚗 Very close! You'll reach ${nearestSite.site_name} in ${duration} minutes.`;
            urgency = 'low';
        } else if (duration < 30) {
            recommendation = `📍 Head to ${nearestSite.site_name} - ${duration} minutes away. ${traffic.conditions === 'heavy' ? 'Heavy traffic expected.' : 'Good road conditions.'}`;
            urgency = 'medium';
        } else {
            recommendation = `⏰ Long route to ${nearestSite.site_name} (${duration} minutes). Consider taking breaks. ${traffic.conditions === 'heavy' ? 'Significant delays expected.' : ''}`;
            urgency = 'high';
        }
        
        return {
            text: recommendation,
            urgency,
            suggestedAction: getSuggestedAction(duration, traffic.conditions)
        };
    };

    const getSuggestedAction = (duration, traffic) => {
        if (duration > 45) return 'Consider alternative routes';
        if (traffic === 'heavy') return 'Leave early to avoid peak hours';
        if (duration < 15) return 'Proceed directly';
        return 'Normal driving conditions';
    };

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

                setRouteCoordinates(route.geometry.coordinates);
                setRouteInfo({
                    duration: Math.round(route.duration / 60),
                    distance: (route.distance / 1000).toFixed(1)
                });
                
                console.log('Route from current location calculated:', {
                    duration: Math.round(route.duration / 60) + 'min',
                    distance: (route.distance / 1000).toFixed(1) + 'km'
                });

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

    // Enhanced getCurrentLocation with AI analysis
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    const currentPos = [longitude, latitude];
                    
                    console.log('📍 Driver location obtained:', {
                        latitude,
                        longitude,
                        accuracy: accuracy + ' meters'
                    });
                    
                    setCurrentLocation(currentPos);
                    
                    // Clear existing markers
                    const existingMarker = document.querySelector('.current-location-marker');
                    if (existingMarker) existingMarker.remove();
                    
                    addCurrentLocationMarker(currentPos);

                    if (siteLocations.length > 0) {
                        // AI-powered route analysis
                        const aiResult = await analyzeAndOptimizeRoute(currentPos, siteLocations);
                        
                        if (aiResult) {
                            // Display AI-optimized route
                            setRouteCoordinates(aiResult.route);
                            setRouteInfo({
                                duration: aiResult.duration,
                                distance: aiResult.distance
                            });
                            
                            // Update the route layer
                            setTimeout(() => {
                                if (map.current && aiResult.route.length > 0) {
                                    addRouteLayer();
                                }
                            }, 500);
                        }
                    }
                    
                    if (map.current) {
                        map.current.flyTo({
                            center: currentPos,
                            zoom: isMobile ? 15 : 14,
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
                    enableHighAccuracy: true,
                    timeout: 30000,
                    maximumAge: 0
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    // AI Smart Route button
    const getAIOptimizedRoute = () => {
        if (!currentLocation) {
            alert('Please get your current location first.');
            return;
        }
        
        if (siteLocations.length === 0) {
            alert('No sites available for optimization.');
            return;
        }
        
        analyzeAndOptimizeRoute(currentLocation, siteLocations);
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

            const lineWidth = isMobile ? 6 : 5;
            const glowWidth = isMobile ? 14 : 12;

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

        const padding = isMobile ? 20 : 50;

        try {
            map.current.fitBounds(bounds, {
                padding: padding,
                duration: 1000,
                essential: true,
                maxZoom: isMobile ? 16 : 15
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

    // Update the marker creation to highlight nearest site
    const createImageMarker = (siteData, sequence) => {
        const barangayName = siteData?.purok?.baranggay?.baranggay_name;
        const borderColor = barangayColors[barangayName] || barangayColors['_default'];
        
        // Check if this is the nearest site
        const isNearest = nearestSite && nearestSite.id === siteData.id;
        const highlightStyle = isNearest ? 'animate-pulse ring-4 ring-green-400' : '';
        const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
        const imageSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';

        const markerElement = document.createElement('div');
        markerElement.className = 'custom-image-marker';
        
        let sequenceBadge = '';
        if (activeSchedule) {
            const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
            sequenceBadge = `
                <div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white">
                    ${sequence + 1}
                </div>
            `;
        }

        markerElement.innerHTML = `
            <div class="relative ${highlightStyle}">
                ${sequenceBadge}
                ${isNearest ? `
                    <div class="absolute -top-3 -left-3 bg-green-500 text-white rounded-full ${isMobile ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white animate-bounce">
                        🏁
                    </div>
                ` : ''}
                <div class="${markerSize} rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white" 
                     style="border-color: ${borderColor};">
                    <img src="${can}" 
                         alt="${siteData.site_name}" 
                         class="${imageSize} object-cover rounded-full"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'${imageSize} rounded-full flex items-center justify-center text-white text-xs font-bold bg-white\\' style=\\'border: 2px solid ${borderColor}; color: ${borderColor}\\'>${siteData.site_name?.charAt(0) || 'S'}</div>'">
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
            const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
            sequenceBadge = `
                <div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg">
                    ${sequence + 1}
                </div>
            `;
        }

        el.innerHTML = sequenceBadge;
        const root = createRoot(el);
        root.render(<GiControlTower size={isMobile ? 36 : 30} color={'#4F262A'} />);
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

    const addCurrentLocationMarker = (coordinates) => {
        const existingMarker = document.querySelector('.current-location-marker');
        if (existingMarker) existingMarker.remove();

        const markerElement = document.createElement('div');
        markerElement.className = 'current-location-marker';
        const markerSize = isMobile ? 'w-8 h-8' : 'w-6 h-6';
        markerElement.innerHTML = `
            <div class="relative">
                <div class="${markerSize} bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
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
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 font-medium">AI analyzing optimal route...</p>
                        <p className="text-xs text-gray-500 mt-1">Finding fastest path to nearest site</p>
                    </div>
                </div>
            )}

            {mapError && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-50 p-4">
                    <div className="text-center p-6 bg-white rounded-lg shadow-xl max-w-sm">
                        <div className="text-red-500 text-lg font-semibold mb-2">Map Error</div>
                        <div className="text-gray-600 mb-4 text-sm">{mapError}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!cssLoaded && !mapError && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-40">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600 font-medium">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Mobile Header Bar */}
            {isMobile && (
                <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowControls(!showControls)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                {showControls ? <IoChevronUp className="w-5 h-5" /> : <IoChevronDown className="w-5 h-5" />}
                            </button>
                            <div>
                                <h1 className="font-semibold text-gray-900 text-sm">Collection Route</h1>
                                <p className="text-xs text-gray-600">{siteLocations.length} sites to collect</p>
                            </div>
                        </div>
                        {currentLocation && (
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Optimization Panel - Mobile Bottom Sheet */}
            {isMobile && aiOptimizedRoute && (
                <div className={`absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
                    showAIPanel ? 'transform translate-y-0' : 'transform translate-y-full'
                }`}>
                    {/* Drag Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    
                    {/* Close Button */}
                    <button
                        onClick={() => setShowAIPanel(false)}
                        className="absolute top-3 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <IoClose className="w-4 h-4 text-gray-600" />
                    </button>

                    <div className="p-4 max-h-64 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <IoSparkles className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-green-800 text-base">AI Route Optimized</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Nearest Site</p>
                                <p className="font-semibold text-sm truncate">{aiOptimizedRoute.nearestSite.site_name}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Distance</p>
                                <p className="font-semibold text-sm">{aiOptimizedRoute.distance} km</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Est. Time</p>
                                <p className="font-semibold text-sm">{aiOptimizedRoute.duration} min</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Traffic</p>
                                <p className={`font-semibold text-sm ${
                                    aiOptimizedRoute.trafficConditions.conditions === 'heavy' ? 'text-red-600' :
                                    aiOptimizedRoute.trafficConditions.conditions === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                    {aiOptimizedRoute.trafficConditions.conditions}
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-gray-700 mb-2">
                                {aiOptimizedRoute.recommendation.text}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                                💡 {aiOptimizedRoute.recommendation.suggestedAction}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Optimization Panel - Desktop */}
            {!isMobile && aiOptimizedRoute && (
                <div className="absolute top-4 left-4 z-20 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <IoSparkles className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">AI Route Optimized</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Nearest Site:</span>
                            <span className="font-semibold">{aiOptimizedRoute.nearestSite.site_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Distance:</span>
                            <span className="font-semibold">{aiOptimizedRoute.distance} km</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Est. Time:</span>
                            <span className="font-semibold">{aiOptimizedRoute.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Traffic:</span>
                            <span className={`font-semibold ${
                                aiOptimizedRoute.trafficConditions.conditions === 'heavy' ? 'text-red-600' :
                                aiOptimizedRoute.trafficConditions.conditions === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                                {aiOptimizedRoute.trafficConditions.conditions}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-white rounded border">
                        <p className="text-xs text-gray-700">
                            {aiOptimizedRoute.recommendation.text}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            💡 {aiOptimizedRoute.recommendation.suggestedAction}
                        </p>
                    </div>
                </div>
            )}

            {/* Control Buttons */}
            <div className={`absolute ${isMobile ? 'top-16' : 'top-4'} right-4 z-10 flex flex-col gap-3 transition-all duration-300 ${
                isMobile && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
                {/* AI Smart Route Button */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={getAIOptimizedRoute}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:from-purple-600 hover:to-pink-600"
                        title="AI Smart Route Optimization"
                    >
                        <IoSparkles className="w-6 h-6" />
                    </button>
                    {!isMobile && <span className="text-xs text-gray-600 mt-1">AI Route</span>}
                </div>

                {/* Current Location Button */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={getCurrentLocation}
                        className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
                        title="Current Location & Route"
                    >
                        <IoNavigate className="w-6 h-6 text-blue-600" />
                    </button>
                    {!isMobile && currentLocation && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></div>
                    )}
                </div>

                {/* Complete Task Button */}
                <button
                    onClick={() => onTaskComplete && onTaskComplete({ scheduleId })}
                    className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-green-600 flex items-center justify-center"
                    title="Complete Task"
                >
                    <IoCheckmark className="w-6 h-6" />
                </button>

                {/* Cancel Task Button */}
                <button
                    onClick={onTaskCancel}
                    className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-red-600 flex items-center justify-center"
                    title="Cancel Task"
                >
                    <IoClose className="w-6 h-6" />
                </button>
            </div>
    
            {/* Schedule Info Panel */}
            {activeSchedule && (
                <div className={`absolute ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-4 left-4'} z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg ${
                    isMobile ? 'max-w-full' : 'max-w-xs'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                <span className="text-blue-600 font-bold">{siteLocations.length}</span> sites to collect
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                Barangay: <span className="font-medium">{activeSchedule.baranggay_name}</span>
                            </div>
                        </div>
                        {routeInfo && (
                            <div className="text-right">
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">{routeInfo.duration} min</span> • 
                                    <span className="font-medium"> {routeInfo.distance} km</span>
                                </div>
                                {isMobile && aiOptimizedRoute && (
                                    <button
                                        onClick={() => setShowAIPanel(true)}
                                        className="text-xs text-blue-600 font-medium mt-1"
                                    >
                                        View AI Route
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
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