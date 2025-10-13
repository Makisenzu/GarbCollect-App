import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import can from "@/images/can.png";

const MyLocation = ({ mapboxToken, sites }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearestSite, setNearestSite] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);


    //mobile responsiveness
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // format duration
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


    //map
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
                cooperativeGestures: false
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

            map.current.on('load', () => {
                setMapLoaded(true);
                setLoading(false);
            });

            map.current.on('error', (e) => {
                setError('Failed to load map: ' + e.error?.message);
                setLoading(false);
            });

        } catch (error) {
            setError('Failed to initialize map: ' + error.message);
            setLoading(false);
        }

        return () => {
            clearMarkers();
            clearRoute();
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapboxToken]);

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
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

    // route layer
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


    //fastest route
    const calculateFastestRoute = async (userLat, userLng, siteLat, siteLng) => {
        if (!mapboxToken) return;

        try {
            const coordinates = [
                `${userLng.toFixed(6)},${userLat.toFixed(6)}`,
                `${parseFloat(siteLng).toFixed(6)},${parseFloat(siteLat).toFixed(6)}`
            ];

            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.join(';')}?` +
                `access_token=${mapboxToken}` +
                `&geometries=geojson` +
                `&overview=full` +
                `&steps=true` +
                `&alternatives=false`
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                
                if (route.geometry && route.geometry.coordinates) {
                    const durationMinutes = Math.round(route.duration / 60);
                    const distanceKm = (route.distance / 1000).toFixed(1);
                    
                    addRouteLayer(route.geometry.coordinates);
                    
                    setRouteInfo({
                        duration: durationMinutes,
                        formattedDuration: formatDuration(durationMinutes),
                        distance: distanceKm
                    });
                    
                    updateSitePopupWithRouteInfo(durationMinutes, distanceKm);
                    
                    fitMapToRoute(userLng, userLat, parseFloat(siteLng), parseFloat(siteLat));
                }
            }
        } catch (error) {
            console.error('Error calculating route:', error);
            setRouteInfo({
                duration: 0,
                formattedDuration: 'Unavailable',
                distance: '0',
                isFallback: true
            });
        }
    };

const updateSitePopupWithRouteInfo = (duration, distance) => {
    const siteMarker = markersRef.current.find(marker => 
        marker.getElement().querySelector('.bg-green-500')
    );
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

    const addMarkersToMap = (userLat, userLng, nearestSite) => {
        if (!map.current) return;

        clearMarkers();

        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'custom-marker animate-pulse';
        userMarkerEl.innerHTML = `
            <div class="hover:scale-110 transition-transform duration-200 cursor-pointer">
                <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white relative">
                    <span class="text-white text-sm">You</span>
                    <div class="absolute -inset-2 rounded-full border-2 border-red-500 border-opacity-50 animate-ping"></div>
                </div>
            </div>
        `;

        const userMarker = new mapboxgl.Marker({
            element: userMarkerEl,
            anchor: 'bottom'
        })
            .setLngLat([userLng, userLat])
            .addTo(map.current);

        markersRef.current.push(userMarker);

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

            setTimeout(() => siteMarker.togglePopup(), 1500);
        }
    };

    // haversine formula
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

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                setUserLocation({ lat, lng });
                const closest = findNearestSite(lat, lng);
                setNearestSite(closest);
                
                if (map.current && mapLoaded && closest) {
                    addMarkersToMap(lat, lng, closest);
                    await calculateFastestRoute(lat, lng, closest.latitude, closest.longitude);
                }
                
                setLoading(false);
            },
            (error) => {
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
                timeout: 15000,
                maximumAge: 60000
            }
        );
    };

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h2>
                    <p className="text-gray-600 mb-4 text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Find Nearest Garbage Site" />

            <div className="w-full h-screen relative bg-gray-100">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Finding your location and calculating route...</p>
                        </div>
                    </div>
                )}
                <Link
                    href="/"
                    className="absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
                    title="Back to Dashboard"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className={`
                    absolute z-40 bg-white rounded-lg shadow-lg p-4
                    ${isMobile ? 
                        'bottom-4 left-4 right-4' : 
                        'top-4 left-20 w-80'
                    }
                `}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Find Nearest Site</h2>
                        {userLocation && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                Located
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={getUserLocation}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Finding Route...</span>
                            </>
                        ) : (
                            <>
                                <span>Get Route to Nearest Site</span>
                            </>
                        )}
                    </button>
                    
                    {userLocation && nearestSite && routeInfo && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 text-sm mb-2">Route Information</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <div className="flex justify-between">
                                    <span>Barangay:</span>
                                    <span className="font-semibold">{nearestSite.purok?.baranggay?.baranggay_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Travel Time:</span>
                                    <span className="font-semibold">{routeInfo.formattedDuration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Route Distance:</span>
                                    <span className="font-semibold">{routeInfo.distance} km</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div 
                    ref={mapContainer} 
                    className="w-full h-full absolute inset-0"
                />
            </div>
        </>
    );
};

export default MyLocation;