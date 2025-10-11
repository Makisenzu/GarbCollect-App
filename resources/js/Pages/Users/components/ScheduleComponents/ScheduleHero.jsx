import React, { useEffect, useRef } from 'react';
import backgroundImage from '@/images/sanfrance.jpg';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Truck } from 'lucide-react';

const ScheduleHero = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
          center: [126.00318418, 8.48822700],
          zoom: 10,
          pitch: 0,
          bearing: 0,
          antialias: true,
          attributionControl: false
        });

        map.current.addControl(new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
          visualizePitch: false
        }), 'top-right');

        map.current.addControl(new mapboxgl.AttributionControl({
          compact: true
        }));

        // map.current.on('load', () => {
        //   map.current.setPaintProperty('background', 'background-color', '#f8fafc');
          
        //   map.current.setPaintProperty('water', 'fill-color', '#e0f2fe');
        // });

      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative text-white py-20 md:py-28 px-4 min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/30 transition-all duration-200 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/70 to-blue-900/80"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-400/15 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <Head title='GarbCollect - Waste Collection Schedule'/>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Never Miss
              <span className="block text-green-300">Collection Day</span>
              Again
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Real-time waste collection schedules for 
              <span className="text-green-300 font-semibold"> San Francisco</span>, 
              Agusan del Sur
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-300" />
                </div>
                <span>Daily, Weekly & Monthly Schedules</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-300" />
                </div>
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-yellow-300" />
                </div>
                <span>Barangay Specific</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-purple-300" />
                </div>
                <span>Routes Tracking</span>
              </div>
            </div>

          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl h-[400px] flex flex-col">

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Service Coverage Area</h3>
                <div className="flex items-center gap-2 text-green-300 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, ADS</span>
                </div>
              </div>
              
              <div className="flex-1 rounded-xl overflow-hidden border border-white/20">
                <div 
                  ref={mapContainer} 
                  className="w-full h-full"
                />
              </div>
              

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-white/60">
                  Collection service area
                </div>
                <div className="text-xs text-white/60">
                  Zoom & pan to explore
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHero;