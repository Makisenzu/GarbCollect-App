import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const TestingMap = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFraXNlbnBhaSIsImEiOiJjbTkza3F0NzMwb21tMmxwdzRzYWFncTRoIn0.tRpH1NPUfzt9cvv4IOpxJA';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-24, 42],
      zoom: 1
    });

    mapRef.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
    );

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <div
      id="map"
      ref={mapContainerRef}
      style={{ width: '100%', height: '100vh' }}
    ></div>
  );
};

export default TestingMap;