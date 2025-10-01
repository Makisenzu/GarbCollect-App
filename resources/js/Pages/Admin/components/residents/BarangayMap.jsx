import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export default function BarangayMap({ mapBoxKey, centerFocus, barangayName, zoomLevel = 13 }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [cssLoaded, setCssLoaded] = useState(false);

    const allBarangayPolygons = {
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
            {
                type: "Feature",
                properties: {
                    id: 2,
                    barangay: "Alegria",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [126.005, 8.510], [126.015, 8.510], [126.015, 8.502], [126.005, 8.502], [126.005, 8.510]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    id: 3,
                    barangay: "Barangay 1",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [125.970, 8.515], [125.980, 8.515], [125.980, 8.508], [125.970, 8.508], [125.970, 8.515]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    id: 4,
                    barangay: "Barangay 2",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [125.975, 8.512], [125.985, 8.512], [125.985, 8.505], [125.975, 8.505], [125.975, 8.512]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    id: 5,
                    barangay: "Barangay 3",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [125.966, 8.512], [125.976, 8.512], [125.976, 8.505], [125.966, 8.505], [125.966, 8.512]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    id: 6,
                    barangay: "Barangay 4",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [125.974, 8.510], [125.984, 8.510], [125.984, 8.503], [125.974, 8.503], [125.974, 8.510]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    id: 7,
                    barangay: "Barangay 5",
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [125.740, 8.720], [125.750, 8.720], [125.750, 8.710], [125.740, 8.710], [125.740, 8.720]
                    ]]
                }
            },
        ]
    };

    const getFilteredPolygonData = () => {
        if (!barangayName) {
            return allBarangayPolygons;
        }
        
        const filteredFeatures = allBarangayPolygons.features.filter(
            feature => feature.properties.barangay === barangayName
        );
        
        return {
            type: "FeatureCollection",
            features: filteredFeatures
        };
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
        if (!cssLoaded || !mapBoxKey || map.current || !mapContainer.current) return;

        mapboxgl.accessToken = mapBoxKey;

        const defaultCenter = centerFocus || [125.94849837776422, 8.483022468128098];
        const defaultZoom = centerFocus ? zoomLevel : 10.5;

        console.log('Initializing map with center:', defaultCenter, 'zoom:', defaultZoom, 'barangay:', barangayName);

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
            center: defaultCenter,
            attributionControl: false,
            zoom: defaultZoom,
        });

        map.current.on('load', () => {
            console.log('Map loaded, adding polygon layer for:', barangayName);
            const filteredData = getFilteredPolygonData();
            addPolygonLayer(filteredData);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [mapBoxKey, cssLoaded]);

    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        console.log('Barangay changed to:', barangayName);
        const filteredData = getFilteredPolygonData();
        updatePolygonLayer(filteredData);

    }, [barangayName]);

    useEffect(() => {
        if (!map.current || !centerFocus) return;

        console.log('Zooming to center:', centerFocus, 'Barangay:', barangayName, 'Zoom level:', zoomLevel);

        map.current.flyTo({
            center: centerFocus,
            zoom: zoomLevel,
            essential: true,
            duration: 1000,
        });

    }, [centerFocus, barangayName, zoomLevel]);

    const addPolygonLayer = (geoJsonData) => {
        if (!map.current) return;
        
        ['polygons-fill', 'polygons-outline'].forEach(layer => {
            if (map.current.getLayer(layer)) {
                map.current.removeLayer(layer);
            }
        });
        
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
                    'Alegria', '#FF5733',
                    'Barangay 1', '#33FF57',
                    'Barangay 2', '#3357FF',
                    'Barangay 3', '#F033FF',
                    'Barangay 4', '#FF33F0',
                    'Barangay 5', '#33FFF0',
                    '#4F262A'
                ],
                'fill-opacity': 0.7
            }
        });

        map.current.addLayer({
            id: 'polygons-outline',
            type: 'line',
            source: 'polygons',
            paint: {
                'line-color': '#000',
                'line-width': 3
            }
        });

        map.current.on('mouseenter', 'polygons-fill', () => {
            map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'polygons-fill', () => {
            map.current.getCanvas().style.cursor = '';
        });
    };

    const updatePolygonLayer = (geoJsonData) => {
        if (!map.current || !map.current.getSource('polygons')) return;
        
        const source = map.current.getSource('polygons');
        source.setData(geoJsonData);
    };

    return (
        <div ref={mapContainer} className="w-full h-full rounded-none" />
    );
}