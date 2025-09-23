import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GrLocationPin } from "react-icons/gr";
import { CiLocationOn } from "react-icons/ci";
import { ImLocation } from "react-icons/im";
import { GiControlTower } from "react-icons/gi";
import axios from 'axios';

export default function Map({ mapboxKey, onLocationSelect, refreshTrigger }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markerRef = useRef(null);
    const siteMarkersRef = useRef([]);
    const [cssLoaded, setCssLoaded] = useState(false);
    const [siteLocations, setSiteLocations] = useState([]);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [color, setColor] = useState(null);

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
            // {
            //     //Alegria Center [126.01045429538931, 8.506148297802667]
            //     type: "Feature",
            //     properties: {
            //         id: 2,
            //         barangay: "Barangay Alegria",
            //         area: "1.8 km²",
            //         description: "Barangay Alegria"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.99837144161182, 8.507586533411711], [125.99901091035099, 8.497409989136372], [126.0100646778181, 8.496561776899355],
            //             [126.02169138217351, 8.499149065256034], [126.0219820497818, 8.511740285924205], [126.01234978971047, 8.515026816627952],
            //             [126.00034895626129, 8.511586483479249]
            //         ]]
            //     }
            // },
            // {
            //     //Alegria Center [126.01045429538931, 8.506148297802667]
            //     type: "Feature",
            //     properties: {
            //         id: 2,
            //         barangay: "Barangay 1",
            //         area: "1.8 km²",
            //         description: "Barangay 1"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.99837144161182, 8.507586533411711], [125.99901091035099, 8.497409989136372], [126.0100646778181, 8.496561776899355],
            //             [126.02169138217351, 8.499149065256034], [126.0219820497818, 8.511740285924205], [126.01234978971047, 8.515026816627952],
            //             [126.00034895626129, 8.511586483479249]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 3,
            //         barangay: "Barangay 2",
            //         area: "2.2 km²",
            //         description: "Barangay 2"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.935, 8.495], [125.950, 8.500], [125.955, 8.510],
            //             [125.950, 8.520], [125.935, 8.525], [125.920, 8.520],
            //             [125.915, 8.510], [125.920, 8.500], [125.935, 8.495]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 4,
            //         barangay: "Barangay 3",
            //         area: "1.9 km²",
            //         description: "Barangay 3"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [126.000, 8.480], [126.015, 8.485], [126.020, 8.495],
            //             [126.015, 8.505], [126.000, 8.510], [125.985, 8.505],
            //             [125.980, 8.495], [125.985, 8.485], [126.000, 8.480]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 5,
            //         barangay: "Barangay 4",
            //         area: "2.1 km²",
            //         description: "Barangay 4"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.925, 8.530], [125.940, 8.535], [125.945, 8.545],
            //             [125.940, 8.555], [125.925, 8.560], [125.910, 8.555],
            //             [125.905, 8.545], [125.910, 8.535], [125.925, 8.530]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 6,
            //         barangay: "Barangay 5",
            //         area: "2.3 km²",
            //         description: "Barangay 5"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.985, 8.550], [126.000, 8.555], [126.005, 8.565],
            //             [126.000, 8.575], [125.985, 8.580], [125.970, 8.575],
            //             [125.965, 8.565], [125.970, 8.555], [125.985, 8.550]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 7,
            //         barangay: "Bayugan 2",
            //         area: "2.0 km²",
            //         description: "Barangay Bayugan 2"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.915, 8.465], [125.930, 8.470], [125.935, 8.480],
            //             [125.930, 8.490], [125.915, 8.495], [125.900, 8.490],
            //             [125.895, 8.480], [125.900, 8.470], [125.915, 8.465]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 8,
            //         barangay: "Bitan-agan",
            //         area: "2.4 km²",
            //         description: "Barangay Bitan-agan"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [126.005, 8.505], [126.020, 8.510], [126.025, 8.520],
            //             [126.020, 8.530], [126.005, 8.535], [125.990, 8.530],
            //             [125.985, 8.520], [125.990, 8.510], [126.005, 8.505]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 9,
            //         barangay: "Borbon",
            //         area: "1.7 km²",
            //         description: "Barangay Borbon"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.950, 8.460], [125.965, 8.465], [125.970, 8.475],
            //             [125.965, 8.485], [125.950, 8.490], [125.935, 8.485],
            //             [125.930, 8.475], [125.935, 8.465], [125.950, 8.460]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 10,
            //         barangay: "Buenasuerte",
            //         area: "2.6 km²",
            //         description: "Barangay Buenasuerte"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.905, 8.520], [125.920, 8.525], [125.925, 8.535],
            //             [125.920, 8.545], [125.905, 8.550], [125.890, 8.545],
            //             [125.885, 8.535], [125.890, 8.525], [125.905, 8.520]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 11,
            //         barangay: "Caimpugan",
            //         area: "2.7 km²",
            //         description: "Barangay Caimpugan"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.980, 8.460], [125.995, 8.465], [126.000, 8.475],
            //             [125.995, 8.485], [125.980, 8.490], [125.965, 8.485],
            //             [125.960, 8.475], [125.965, 8.465], [125.980, 8.460]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 12,
            //         barangay: "Das-agan",
            //         area: "1.6 km²",
            //         description: "Barangay Das-agan"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.930, 8.500], [125.945, 8.505], [125.950, 8.515],
            //             [125.945, 8.525], [125.930, 8.530], [125.915, 8.525],
            //             [125.910, 8.515], [125.915, 8.505], [125.930, 8.500]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 13,
            //         barangay: "Ebro",
            //         area: "2.8 km²",
            //         description: "Barangay Ebro"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.995, 8.490], [126.010, 8.495], [126.015, 8.505],
            //             [126.010, 8.515], [125.995, 8.520], [125.980, 8.515],
            //             [125.975, 8.505], [125.980, 8.495], [125.995, 8.490]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 14,
            //         barangay: "Hubang",
            //         area: "1.5 km²",
            //         description: "Barangay Hubang"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.910, 8.480], [125.925, 8.485], [125.930, 8.495],
            //             [125.925, 8.505], [125.910, 8.510], [125.895, 8.505],
            //             [125.890, 8.495], [125.895, 8.485], [125.910, 8.480]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 15,
            //         barangay: "Karaus",
            //         area: "2.9 km²",
            //         description: "Barangay Karaus"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.940, 8.440], [125.955, 8.445], [125.960, 8.455],
            //             [125.955, 8.465], [125.940, 8.470], [125.925, 8.465],
            //             [125.920, 8.455], [125.925, 8.445], [125.940, 8.440]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 16,
            //         barangay: "Ladgadan",
            //         area: "1.4 km²",
            //         description: "Barangay Ladgadan"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.970, 8.430], [125.985, 8.435], [125.990, 8.445],
            //             [125.985, 8.455], [125.970, 8.460], [125.955, 8.455],
            //             [125.950, 8.445], [125.955, 8.435], [125.970, 8.430]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 17,
            //         barangay: "Lapinigan",
            //         area: "3.0 km²",
            //         description: "Barangay Lapinigan"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.920, 8.430], [125.935, 8.435], [125.940, 8.445],
            //             [125.935, 8.455], [125.920, 8.460], [125.905, 8.455],
            //             [125.900, 8.445], [125.905, 8.435], [125.920, 8.430]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 18,
            //         barangay: "Lucac",
            //         area: "1.3 km²",
            //         description: "Barangay Lucac"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.960, 8.410], [125.975, 8.415], [125.980, 8.425],
            //             [125.975, 8.435], [125.960, 8.440], [125.945, 8.435],
            //             [125.940, 8.425], [125.945, 8.415], [125.960, 8.410]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 19,
            //         barangay: "Mate",
            //         area: "3.1 km²",
            //         description: "Barangay Mate"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.990, 8.420], [126.005, 8.425], [126.010, 8.435],
            //             [126.005, 8.445], [125.990, 8.450], [125.975, 8.445],
            //             [125.970, 8.435], [125.975, 8.425], [125.990, 8.420]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 20,
            //         barangay: "New Visayas",
            //         area: "1.2 km²",
            //         description: "Barangay New Visayas"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.930, 8.410], [125.945, 8.415], [125.950, 8.425],
            //             [125.945, 8.435], [125.930, 8.440], [125.915, 8.435],
            //             [125.910, 8.425], [125.915, 8.415], [125.930, 8.410]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 21,
            //         barangay: "Ormaca",
            //         area: "3.2 km²",
            //         description: "Barangay Ormaca"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [126.000, 8.400], [126.015, 8.405], [126.020, 8.415],
            //             [126.015, 8.425], [126.000, 8.430], [125.985, 8.425],
            //             [125.980, 8.415], [125.985, 8.405], [126.000, 8.400]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 22,
            //         barangay: "Pasta",
            //         area: "1.1 km²",
            //         description: "Barangay Pasta"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.950, 8.390], [125.965, 8.395], [125.970, 8.405],
            //             [125.965, 8.415], [125.950, 8.420], [125.935, 8.415],
            //             [125.930, 8.405], [125.935, 8.395], [125.950, 8.390]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 23,
            //         barangay: "Pisa-an",
            //         area: "3.3 km²",
            //         description: "Barangay Pisa-an"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.980, 8.380], [125.995, 8.385], [126.000, 8.395],
            //             [125.995, 8.405], [125.980, 8.410], [125.965, 8.405],
            //             [125.960, 8.395], [125.965, 8.385], [125.980, 8.380]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 24,
            //         barangay: "Rizal",
            //         area: "1.0 km²",
            //         description: "Barangay Rizal"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.920, 8.370], [125.935, 8.375], [125.940, 8.385],
            //             [125.935, 8.395], [125.920, 8.400], [125.905, 8.395],
            //             [125.900, 8.385], [125.905, 8.375], [125.920, 8.370]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 25,
            //         barangay: "San Isidro",
            //         area: "3.4 km²",
            //         description: "Barangay San Isidro"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [126.010, 8.360], [126.025, 8.365], [126.030, 8.375],
            //             [126.025, 8.385], [126.010, 8.390], [125.995, 8.385],
            //             [125.990, 8.375], [125.995, 8.365], [126.010, 8.360]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 26,
            //         barangay: "Santa Ana",
            //         area: "0.9 km²",
            //         description: "Barangay Santa Ana"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.940, 8.350], [125.955, 8.355], [125.960, 8.365],
            //             [125.955, 8.375], [125.940, 8.380], [125.925, 8.375],
            //             [125.920, 8.365], [125.925, 8.355], [125.940, 8.350]
            //         ]]
            //     }
            // },
            // {
            //     type: "Feature",
            //     properties: {
            //         id: 27,
            //         barangay: "Tagapua",
            //         area: "3.5 km²",
            //         description: "Barangay Tagapua"
            //     },
            //     geometry: {
            //         type: "Polygon",
            //         coordinates: [[
            //             [125.970, 8.340], [125.985, 8.345], [125.990, 8.355],
            //             [125.985, 8.365], [125.970, 8.370], [125.955, 8.365],
            //             [125.950, 8.355], [125.955, 8.345], [125.970, 8.340]
            //         ]]
            //     }
            // }
        ]
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
            // style: 'mapbox://styles/mapbox/streets-v11',
            style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
            // center: [125.97666490, 8.50410607],
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
            
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            console.log(lng, lat);

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
                    'Barangay Alegria', '#FF5733',
                    'Barangay 1', '#33FF57',
                    'Barangay 2', '#3357FF',
                    'Barangay 3', '#F033FF',
                    'Barangay 4', '#FF33F0',
                    'Barangay 5', '#33FFF0',
                    'Bayugan 2', '#8A2BE2',
                    'Bitan-agan', '#A52A2A',
                    'Borbon', '#DEB887',
                    'Buenasuerte', '#5F9EA0',
                    'Caimpugan', '#7FFF00',
                    'Das-agan', '#D2691E',
                    'Ebro', '#FF7F50',
                    'Hubang', '#6495ED',
                    'Karaus', '#DC143C',
                    'Ladgadan', '#00FFFF',
                    'Lapinigan', '#00008B',
                    'Lucac', '#008B8B',
                    'Mate', '#B8860B',
                    'New Visayas', '#006400',
                    'Ormaca', '#8B008B',
                    'Pasta', '#556B2F',
                    'Pisa-an', '#FF8C00',
                    'Rizal', '#9932CC',
                    'San Isidro', '#8FBC8F',
                    'Santa Ana', '#483D8B',
                    'Tagapua', '#2F4F4F',
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

        // map.current.on('click', 'polygons-fill', (e) => {
        //     if (e.features.length > 0) {
        //         const properties = e.features[0].properties;
        //         const coordinates = e.lngLat;
                
        //         new mapboxgl.Popup()
        //             .setLngLat(coordinates)
        //             .setHTML(`
        //                 <div class="p-2">
        //                     <h3 class="font-bold">${properties.barangay || 'Area'}</h3>
        //                     ${properties.area ? `<p><strong>Area:</strong> ${properties.area}</p>` : ''}
        //                     ${properties.description ? `<p><strong>Description:</strong> ${properties.description}</p>` : ''}
        //                 </div>
        //             `)
        //             .addTo(map.current);
        //     }
        // });

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

        const barangay_name = siteData?.purok?.baranggay?.baranggay_name;
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