import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import can from "@/images/can.png";

const useLocation = (mapboxToken, sites) => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearestSite, setNearestSite] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineMode, setOfflineMode] = useState(false);
    
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);
    const siteMarkerRef = useRef(null);
    const watchIdRef = useRef(null);
    const cachedRouteRef = useRef(null);
    const lastKnownLocationRef = useRef(null);

    // Add these new refs for real-time tracking
    const userLocationSourceRef = useRef(null);
    const userLocationLayerRef = useRef(null);
    const animationFrameRef = useRef(null);

    const CACHE_KEYS = {
        ROUTE: 'cached_route',
        SITE: 'cached_site',
        LOCATION: 'cached_location',
        MAP_STYLE: 'cached_map_style'
    };

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        const handleOnline = () => {
            setIsOnline(true);
            setOfflineMode(false);
        };
        
        const handleOffline = () => {
            setIsOnline(false);
            setOfflineMode(true);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadCachedData();

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const setCache = (key, data, ttl = 24 * 60 * 60 * 1000) => {
        try {
            const cacheData = {
                data,
                timestamp: Date.now(),
                ttl
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    };

    const getCache = (key) => {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;

            if (isExpired) {
                localStorage.removeItem(key);
                return null;
            }

            return cacheData.data;
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            return null;
        }
    };

    const clearCache = (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    };

    const loadCachedData = () => {
        const cachedRoute = getCache(CACHE_KEYS.ROUTE);
        const cachedSite = getCache(CACHE_KEYS.SITE);
        const cachedLocation = getCache(CACHE_KEYS.LOCATION);

        if (cachedRoute) {
            cachedRouteRef.current = cachedRoute;
        }

        if (cachedSite) {
            setNearestSite(cachedSite);
        }

        if (cachedLocation) {
            setUserLocation(cachedLocation);
            lastKnownLocationRef.current = cachedLocation;
        }
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) {
                return `${hours}h`;
            } else {
                return `${hours}h ${mins}min`;
            }
        }
    };

    useEffect(() => {
        if (!mapboxToken) {
            setError('Mapbox API key is missing');
            setLoading(false);
            return;
        }

        if (!mapContainer.current) return;

        try {
            mapboxgl.accessToken = mapboxToken;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
                center: [125.94849837776422, 8.483022468128098],
                zoom: 11,
                attributionControl: false,
                interactive: true,
                scrollZoom: true,
                dragPan: true,
                dragRotate: false,
                keyboard: true,
                doubleClickZoom: true,
                touchZoomRotate: true,
                touchPitch: true,
                cooperativeGestures: false,
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: true
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

            map.current.on('load', () => {
                setMapLoaded(true);
                setLoading(false);
                preCacheMapArea();
            });

            map.current.on('error', (e) => {
                console.warn('Map loading error, attempting to use cached data:', e.error?.message);
                setMapLoaded(true);
                setLoading(false);
            });

            map.current.on('sourcedata', (e) => {
                if (e.sourceId === 'route' && e.isSourceLoaded) {
                    const source = map.current.getSource('route');
                    if (source && source.serialize) {
                        const routeData = source.serialize();
                        setCache(CACHE_KEYS.ROUTE, routeData);
                    }
                }
            });

        } catch (error) {
            console.error('Failed to initialize map:', error);
            setError('Failed to initialize map: ' + error.message);
            setLoading(false);
        }

        return () => {
            stopTracking();
            clearMarkers();
            clearRoute();
            clearUserLocationLayers();
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapboxToken]);

    const preCacheMapArea = () => {
        if (!map.current) return;

        const bounds = map.current.getBounds();
        const zoom = map.current.getZoom();
        
        const mapView = {
            bounds: bounds.toArray(),
            zoom,
            center: map.current.getCenter().toArray()
        };
        
        setCache(CACHE_KEYS.MAP_STYLE, mapView);
    };

    const stopTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        
        // Stop animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        
        setIsTracking(false);
    };

    const startTracking = (userLat, userLng, nearestSite) => {
        if (!navigator.geolocation) return;

        stopTracking();

        setCache(CACHE_KEYS.SITE, nearestSite);
        setCache(CACHE_KEYS.LOCATION, { lat: userLat, lng: userLng });

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                
                setUserLocation({ lat: newLat, lng: newLng });
                lastKnownLocationRef.current = { lat: newLat, lng: newLng };
                
                setCache(CACHE_KEYS.LOCATION, { lat: newLat, lng: newLng }, 5 * 60 * 1000);
                
                if (map.current && mapLoaded && nearestSite) {
                    // Smoothly update user location on map
                    smoothUpdateUserLocation(newLat, newLng);
                    
                    if (isOnline) {
                        calculateFastestRoute(newLat, newLng, nearestSite.latitude, nearestSite.longitude);
                    } else {
                        useCachedRoute(newLat, newLng, nearestSite);
                    }
                }
            },
            (error) => {
                console.error('Error tracking location:', error);
                
                if (lastKnownLocationRef.current) {
                    setUserLocation(lastKnownLocationRef.current);
                    if (map.current && mapLoaded && nearestSite) {
                        smoothUpdateUserLocation(lastKnownLocationRef.current.lat, lastKnownLocationRef.current.lng);
                        useCachedRoute(lastKnownLocationRef.current.lat, lastKnownLocationRef.current.lng, nearestSite);
                    }
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000
            }
        );
        
        setIsTracking(true);
    };

    const smoothUpdateUserLocation = (lat, lng) => {
        if (!map.current) return;

        // Update the GeoJSON source for smooth transitions
        updateUserLocationSource(lng, lat);

        // Also update the marker position
        const userMarker = markersRef.current.find(marker => 
            marker.getElement().querySelector('.bg-red-500')
        );
        
        if (userMarker) {
            userMarker.setLngLat([lng, lat]);
        }

        // Smoothly move the map to follow user (optional)
        if (isTracking && map.current) {
            map.current.flyTo({
                center: [lng, lat],
                speed: 0.8, // Slower speed for smoother transition
                curve: 1, // Linear movement
                essential: true
            });
        }
    };

    const updateUserLocationSource = (lng, lat) => {
        if (!map.current) return;

        const geojson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    properties: {
                        description: 'Your current location'
                    }
                }
            ]
        };

        // Check if source already exists
        if (!map.current.getSource('user-location')) {
            map.current.addSource('user-location', {
                type: 'geojson',
                data: geojson
            });

            // Add layer for the user location
            map.current.addLayer({
                id: 'user-location-layer',
                type: 'circle',
                source: 'user-location',
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#ff0000',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-opacity': 0.8
                }
            });

            // Add pulsing effect layer
            map.current.addLayer({
                id: 'user-location-pulse',
                type: 'circle',
                source: 'user-location',
                paint: {
                    'circle-radius': {
                        'base': 8,
                        'stops': [
                            [0, 8],
                            [20, 20]
                        ]
                    },
                    'circle-color': '#ff0000',
                    'circle-opacity': {
                        'base': 0.4,
                        'stops': [
                            [0, 0.4],
                            [1, 0]
                        ]
                    },
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ff0000'
                }
            });

            userLocationSourceRef.current = map.current.getSource('user-location');
            userLocationLayerRef.current = 'user-location-layer';
        } else {
            // Smoothly update the existing source
            const source = map.current.getSource('user-location');
            if (source) {
                source.setData(geojson);
            }
        }

        // Animate the pulse effect
        animatePulse();
    };

    const animatePulse = () => {
        if (!map.current || !map.current.getLayer('user-location-pulse')) return;

        // Cancel any existing animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        const startTime = Date.now();
        const duration = 2000; // 2 seconds per pulse

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;

            // Update circle radius based on progress
            const pulseRadius = 8 + (progress * 12); // 8 to 20

            map.current.setPaintProperty('user-location-pulse', 'circle-radius', pulseRadius);
            map.current.setPaintProperty('user-location-pulse', 'circle-opacity', 0.4 * (1 - progress));

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    const clearUserLocationLayers = () => {
        if (!map.current) return;

        // Remove user location layers
        ['user-location-layer', 'user-location-pulse'].forEach(layerId => {
            if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
            }
        });

        // Remove user location source
        if (map.current.getSource('user-location')) {
            map.current.removeSource('user-location');
        }

        userLocationSourceRef.current = null;
        userLocationLayerRef.current = null;
    };

    const useCachedRoute = (userLat, userLng, nearestSite) => {
        const cachedRoute = getCache(CACHE_KEYS.ROUTE);
        
        if (cachedRoute && cachedRoute.data && cachedRoute.data.geometry) {
            addRouteLayer(cachedRoute.data.geometry.coordinates);
            
            const straightLineDistance = calculateDistance(
                userLat, userLng, 
                parseFloat(nearestSite.latitude), 
                parseFloat(nearestSite.longitude)
            );
            
            const estimatedDuration = Math.round(straightLineDistance * 2);
            
            setRouteInfo({
                duration: estimatedDuration,
                formattedDuration: formatDuration(estimatedDuration),
                distance: straightLineDistance.toFixed(1),
                isCached: true,
                isOffline: true
            });
            
            fitMapToRoute(userLng, userLat, parseFloat(nearestSite.longitude), parseFloat(nearestSite.latitude));
        } else {
            showFallbackRoute(userLat, userLng, nearestSite);
        }
    };

    const showFallbackRoute = (userLat, userLng, nearestSite) => {
        const siteLat = parseFloat(nearestSite.latitude);
        const siteLng = parseFloat(nearestSite.longitude);
        
        const straightLineCoords = [
            [userLng, userLat],
            [siteLng, siteLat]
        ];
        
        addRouteLayer(straightLineCoords);
        
        const distance = calculateDistance(userLat, userLng, siteLat, siteLng);
        const estimatedDuration = Math.round(distance * 2);
        
        setRouteInfo({
            duration: estimatedDuration,
            formattedDuration: formatDuration(estimatedDuration),
            distance: distance.toFixed(1),
            isFallback: true,
            isOffline: !isOnline
        });
        
        fitMapToRoute(userLng, userLat, siteLng, siteLat);
    };

    const updateUserMarker = (lat, lng) => {
        if (!map.current) return;

        clearMarkers();

        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'custom-marker animate-pulse';
        userMarkerEl.innerHTML = `
            <div class="hover:scale-110 transition-transform duration-200 cursor-pointer">
                <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white relative">
                    <span class="text-white text-sm">You</span>
                    <div class="absolute -inset-2 rounded-full border-2 border-red-500 border-opacity-50 animate-ping"></div>
                    ${!isOnline ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>' : ''}
                </div>
            </div>
        `;

        const userMarker = new mapboxgl.Marker({
            element: userMarkerEl,
            anchor: 'bottom'
        })
            .setLngLat([lng, lat])
            .addTo(map.current);

        markersRef.current.push(userMarker);

        // Update or create GeoJSON source for smooth animations
        updateUserLocationSource(lng, lat);

        if (nearestSite && nearestSite.latitude && nearestSite.longitude) {
            const borderColor = '#3b82f6';
            const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
            const imageSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';

            const siteMarkerEl = document.createElement('div');
            siteMarkerEl.className = 'custom-marker';
            siteMarkerEl.innerHTML = `
                <div class="hover:scale-110 transition-transform duration-200 cursor-pointer relative">
                    <div class="${markerSize} rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white relative ring-4 ring-green-500 ring-opacity-70" style="border-color: ${borderColor};">
                        <div class="absolute -inset-3 rounded-full border-4 border-green-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
                        <img src="${can}" 
                             alt="${nearestSite.site_name}" 
                             class="${imageSize} object-cover rounded-full z-0"
                             onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'${imageSize} rounded-full flex items-center justify-center text-white text-xs font-bold bg-white\\' style=\\'border: 2px solid ${borderColor}; color: ${borderColor}\\'>${nearestSite.site_name?.charAt(0) || 'S'}</div>'">
                        ${!isOnline ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>' : ''}
                    </div>
                </div>
            `;

            const siteMarker = new mapboxgl.Marker({
                element: siteMarkerEl,
                anchor: 'bottom'
            })
                .setLngLat([parseFloat(nearestSite.longitude), parseFloat(nearestSite.latitude)])
                .addTo(map.current);

            markersRef.current.push(siteMarker);
            siteMarkerRef.current = siteMarker;
        }
    };

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        siteMarkerRef.current = null;
        clearUserLocationLayers();
    };

    const clearRoute = () => {
        if (!map.current) return;

        ['route', 'route-glow', 'route-direction', 'route-start', 'route-end'].forEach(layerId => {
            if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
            }
        });

        ['route', 'route-start-marker', 'route-end-marker'].forEach(sourceId => {
            if (map.current.getSource(sourceId)) {
                map.current.removeSource(sourceId);
            }
        });
    };

    const addRouteLayer = (routeCoordinates) => {
        if (!map.current || routeCoordinates.length === 0) return;

        if (!map.current.isStyleLoaded()) {
            map.current.once('styledata', () => {
                setTimeout(() => addRouteLayer(routeCoordinates), 100);
            });
            return;
        }

        clearRoute();

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
                    'line-color': '#3b82f6',
                    'line-width': glowWidth,
                    'line-opacity': 0.3,
                    'line-blur': 10
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
                    'line-color': '#3b82f6',
                    'line-width': lineWidth,
                    'line-opacity': 0.9
                }
            });

            map.current.addLayer({
                id: 'route-direction',
                type: 'symbol',
                source: 'route',
                layout: {
                    'symbol-placement': 'line',
                    'text-field': '▶',
                    'text-size': isMobile ? 14 : 12,
                    'symbol-spacing': 100
                },
                paint: {
                    'text-color': '#3b82f6'
                }
            });

            if (routeCoordinates.length >= 2) {
                map.current.addSource('route-start-marker', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: routeCoordinates[0]
                        },
                        properties: { description: 'Start' }
                    }
                });

                map.current.addSource('route-end-marker', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: routeCoordinates[routeCoordinates.length - 1]
                        },
                        properties: { description: 'End' }
                    }
                });

                map.current.addLayer({
                    id: 'route-start',
                    type: 'circle',
                    source: 'route-start-marker',
                    paint: {
                        'circle-radius': isMobile ? 8 : 6,
                        'circle-color': '#22c55e',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                map.current.addLayer({
                    id: 'route-end',
                    type: 'circle',
                    source: 'route-end-marker',
                    paint: {
                        'circle-radius': isMobile ? 8 : 6,
                        'circle-color': '#ef4444',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });
            }

        } catch (error) {
            console.error('Error adding route layer:', error);
        }
    };

    const calculateFastestRoute = async (userLat, userLng, siteLat, siteLng) => {
        if (!mapboxToken || !isOnline) {
            useCachedRoute(userLat, userLng, nearestSite);
            return;
        }

        try {
            const coordinates = [
                `${userLng.toFixed(6)},${userLat.toFixed(6)}`,
                `${parseFloat(siteLng).toFixed(6)},${parseFloat(siteLat).toFixed(6)}`
            ];

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.join(';')}?` +
                `access_token=${mapboxToken}` +
                `&geometries=geojson` +
                `&overview=full` +
                `&steps=true` +
                `&alternatives=false`,
                {
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                
                if (route.geometry && route.geometry.coordinates) {
                    const durationMinutes = Math.round(route.duration / 60);
                    const distanceKm = (route.distance / 1000).toFixed(1);
                    
                    addRouteLayer(route.geometry.coordinates);
                    
                    setCache(CACHE_KEYS.ROUTE, {
                        data: route,
                        geometry: route.geometry
                    });
                    
                    setRouteInfo({
                        duration: durationMinutes,
                        formattedDuration: formatDuration(durationMinutes),
                        distance: distanceKm,
                        isOnline: true
                    });
                    
                    fitMapToRoute(userLng, userLat, parseFloat(siteLng), parseFloat(siteLat));
                }
            }
        } catch (error) {
            console.error('Error calculating route, using cached data:', error);
            useCachedRoute(userLat, userLng, nearestSite);
        }
    };

    const fitMapToRoute = (userLng, userLat, siteLng, siteLat) => {
        if (!map.current) return;

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLng, userLat]);
        bounds.extend([siteLng, siteLat]);

        const padding = isMobile ? 40 : 80;

        try {
            map.current.fitBounds(bounds, {
                padding: padding,
                duration: 1500,
                essential: true,
                maxZoom: isMobile ? 16 : 15
            });
        } catch (error) {
            console.error('Error fitting map to route:', error);
        }
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const earthRadius = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return earthRadius * c;
    };

    const findNearestSite = (userLat, userLng) => {
        let minDistance = Infinity;
        let closestSite = null;

        sites.forEach(site => {
            const distance = calculateDistance(
                userLat, 
                userLng, 
                parseFloat(site.latitude), 
                parseFloat(site.longitude)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSite = { ...site, distance: Math.round(distance * 100) / 100 };
            }
        });

        return closestSite;
    };

    const getUserLocation = () => {
        setLoading(true);
        setError(null);
        clearRoute();
        setRouteInfo(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        if (!isOnline) {
            const cachedLocation = getCache(CACHE_KEYS.LOCATION);
            const cachedSite = getCache(CACHE_KEYS.SITE);
            
            if (cachedLocation && cachedSite) {
                setUserLocation(cachedLocation);
                setNearestSite(cachedSite);
                
                if (map.current && mapLoaded) {
                    updateUserMarker(cachedLocation.lat, cachedLocation.lng, cachedSite);
                    useCachedRoute(cachedLocation.lat, cachedLocation.lng, cachedSite);
                }
                
                setLoading(false);
                setOfflineMode(true);
                return;
            }
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                setUserLocation({ lat, lng });
                lastKnownLocationRef.current = { lat, lng };
                const closest = findNearestSite(lat, lng);
                setNearestSite(closest);
                
                setCache(CACHE_KEYS.LOCATION, { lat, lng });
                setCache(CACHE_KEYS.SITE, closest);
                
                if (map.current && mapLoaded && closest) {
                    updateUserMarker(lat, lng, closest);
                    await calculateFastestRoute(lat, lng, closest.latitude, closest.longitude);
                    startTracking(lat, lng, closest);
                }
                
                setLoading(false);
            },
            (error) => {
                console.error('Location error:', error);
                
                const cachedLocation = getCache(CACHE_KEYS.LOCATION);
                const cachedSite = getCache(CACHE_KEYS.SITE);
                
                if (cachedLocation && cachedSite) {
                    setUserLocation(cachedLocation);
                    setNearestSite(cachedSite);
                    
                    if (map.current && mapLoaded) {
                        updateUserMarker(cachedLocation.lat, cachedLocation.lng, cachedSite);
                        useCachedRoute(cachedLocation.lat, cachedLocation.lng, cachedSite);
                    }
                    setLoading(false);
                    return;
                }
                
                let errorMessage = 'Unable to retrieve your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location permissions.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Please ensure location permissions are enabled.';
                }
                setError(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                trackUserLocation: true,
                showUserHeading: true,
                timeout: 20000,
                maximumAge: 60000
            }
        );
    };

    return {
        userLocation,
        nearestSite,
        loading,
        error,
        mapLoaded,
        isMobile,
        routeInfo,
        isTracking,
        isOnline,
        offlineMode,
        
        mapContainer,

        getUserLocation,
        clearRoute,
        clearMarkers,
        stopTracking
    };
};

export default useLocation;