import React, { useEffect, useState } from 'react';
import backgroundImage from '@/images/sanfrance.jpg';
import { Head } from '@inertiajs/react';
import { Sparkles, Recycle, Truck, MapPin, ArrowRight } from 'lucide-react';

// Import your PNG images
import trashCan from '@/images/can.png';
import plasticBottle from '@/images/bottle.png';
import paper from '@/images/paper.png';
import can from '@/images/coke.png';

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative text-white py-20 md:py-32 px-4 min-h-[300px] md:min-h-[300px] flex items-center overflow-hidden">
      {/* Background with enhanced overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-emerald-800/80 to-blue-900/90"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/30 rounded-full animate-float1"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-300/40 rounded-full animate-float2"></div>
        <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-blue-300/30 rounded-full animate-float3"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-yellow-300/50 rounded-full animate-float4"></div>
        
        {/* Animated background shapes */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-400/10 rounded-full blur-3xl animate-pulseSlow"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulseSlow delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-emerald-300/5 rounded-full blur-2xl animate-pulseSlow delay-500"></div>
      </div>

      <Head title='GarbCollect - Smart Waste Management'/>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Main Heading with animation */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className={`block transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                Garb<span className={`text-green-300 transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                Collect
              </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl mb-8 text-white/90 leading-relaxed transform transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Your intelligent solution for efficient waste collection and community cleanliness in{' '}
              <span className="text-green-300 font-semibold">San Francisco, Agusan del Sur</span>
            </p>

            {/* Features */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 transform transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Recycle className="h-5 w-5 text-green-300" />
                </div>
                <span className="text-sm">Smart Recycling</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-300" />
                </div>
                <span className="text-sm">Efficient Collection</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-300" />
                </div>
                <span className="text-sm">Real-time Tracking</span>
              </div>
            </div>
          </div>

          {/* Right Content - Garbage Throwing Animation with PNGs */}
          <div className="hidden lg:block relative">
            {/* Animation Container */}
            <div className="relative h-96 flex items-end justify-center">
              {/* Trash Can PNG */}
              <div className="relative z-10">
                <img 
                  src={trashCan} 
                  alt="Trash Can"
                  className="w-48 h-60 object-contain drop-shadow-2xl"
                />
              </div>

              {/* Animated Garbage Items - All falling to center with instant disappearance */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-fall1">
                <img 
                  src={plasticBottle} 
                  alt="Plastic Bottle"
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
              </div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-fall2">
                <img 
                  src={paper} 
                  alt="Paper"
                  className="w-16 h-16 object-contain drop-shadow-lg"
                />
              </div>
              <div className="absolute top-8 left-1/2 -translate-x-1/2 animate-fall3">
                <img 
                  src={can} 
                  alt="Can"
                  className="w-14 h-14 object-contain drop-shadow-lg"
                />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-fall4">
                <img 
                  src={plasticBottle} 
                  alt="Plastic Bottle"
                  className="w-20 h-20 object-contain drop-shadow-lg rotate-45"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-300">27</div>
                <div className="text-xs text-white/70">Barangays</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-300">98%</div>
                <div className="text-xs text-white/70">Efficiency</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-300">24/7</div>
                <div className="text-xs text-white/70">Service</div>
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

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(10px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.1); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }
        @keyframes fall1 {
          0% { transform: translate(-50%, 0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; transform: translate(-50%, 280px) rotate(360deg) scale(1); }
          86% { opacity: 0; transform: translate(-50%, 280px) rotate(360deg) scale(0); }
          100% { opacity: 0; transform: translate(-50%, 280px) rotate(360deg) scale(0); }
        }
        @keyframes fall2 {
          0% { transform: translate(-50%, 0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; transform: translate(-50%, 260px) rotate(-180deg) scale(1); }
          86% { opacity: 0; transform: translate(-50%, 260px) rotate(-180deg) scale(0); }
          100% { opacity: 0; transform: translate(-50%, 260px) rotate(-180deg) scale(0); }
        }
        @keyframes fall3 {
          0% { transform: translate(-50%, 0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; transform: translate(-50%, 240px) rotate(90deg) scale(1); }
          86% { opacity: 0; transform: translate(-50%, 240px) rotate(90deg) scale(0); }
          100% { opacity: 0; transform: translate(-50%, 240px) rotate(90deg) scale(0); }
        }
        @keyframes fall4 {
          0% { transform: translate(-50%, 0) rotate(45deg) scale(1); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; transform: translate(-50%, 300px) rotate(-90deg) scale(1); }
          86% { opacity: 0; transform: translate(-50%, 300px) rotate(-90deg) scale(0); }
          100% { opacity: 0; transform: translate(-50%, 300px) rotate(-90deg) scale(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-float1 { animation: float1 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }
        .animate-float3 { animation: float3 10s ease-in-out infinite; }
        .animate-float4 { animation: float4 7s ease-in-out infinite; }
        .animate-fall1 { animation: fall1 3s ease-in infinite; }
        .animate-fall2 { animation: fall2 4s ease-in infinite 1s; }
        .animate-fall3 { animation: fall3 3.5s ease-in infinite 0.5s; }
        .animate-fall4 { animation: fall4 4.5s ease-in infinite 1.5s; }
        .animate-pulseSlow { animation: pulseSlow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Hero;