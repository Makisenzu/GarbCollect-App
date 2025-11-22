import React, { useEffect, useRef } from 'react';
import backgroundImage from '@/images/sanfrance.jpg';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Truck, ArrowLeft, Sparkles } from 'lucide-react';

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
          style: 'mapbox://styles/mapbox/streets-v12',
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
    <div className="relative text-white py-20 md:py-32 px-4 min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Enhanced Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-emerald-800/75 to-blue-900/85"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-emerald-300/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Head title='GarbCollect - Waste Collection Schedule'/>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Never Miss
              <span className="block bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                Collection Day
              </span>
              Again
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Real-time waste collection schedules for{' '}
              <span className="text-green-300 font-semibold">San Francisco</span>, 
              Agusan del Sur
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: 'Daily, Weekly & Monthly', color: 'bg-green-500/20 text-green-300' },
                { icon: Clock, label: 'Real-time Updates', color: 'bg-blue-500/20 text-blue-300' },
                { icon: MapPin, label: 'Barangay Specific', color: 'bg-amber-500/20 text-amber-300' },
                { icon: Truck, label: 'Live Route Tracking', color: 'bg-purple-500/20 text-purple-300' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className={`${feature.color} p-2 rounded-lg`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Map */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Service Coverage Area</h3>
                <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-lg text-sm border border-green-400/30">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, ADS</span>
                </div>
              </div>
              
              <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-xl" style={{ height: '400px' }}>
                <div 
                  ref={mapContainer} 
                  className="w-full h-full"
                />
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <div className="text-xs text-white/60 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Collection service area
                </div>
                <div className="text-xs text-white/60">
                  Zoom & pan to explore
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
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