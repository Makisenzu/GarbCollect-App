import React from 'react';
import backgroundImage from '@/images/sanfrance.jpg';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Sparkles, Recycle, Truck } from 'lucide-react';

const ScheduleHero = () => {
  return (
    <div className="relative text-white py-20 md:py-28 px-4 min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/70 to-blue-900/80"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-400/15 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <Head title='GarbCollect - Waste Collection Schedule'/>
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Never Miss
              <span className="block text-green-300">Collection Day</span>
              Again
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Real-time waste collection schedules for 
              <span className="text-green-300 font-semibold"> San Francisco</span>, 
              Agusan del Sur
            </p>

            {/* Features List */}
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

          {/* Right Content - Schedule Preview */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Today's Collection</h3>
                <p className="text-green-300 font-semibold">Barangay San Francisco</p>
              </div>
              
              {/* Schedule Cards */}
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">Biodegradable</span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-200 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>6:00 AM - 10:00 AM</span>
                  </div>
                </div>

                <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">Recyclable</span>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">UPCOMING</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-200 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>2:00 PM - 5:00 PM</span>
                  </div>
                </div>

                <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">Special Collection</span>
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">TOMORROW</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Wednesday, 8:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">27</div>
                  <div className="text-xs text-white/70">Barangays</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-300">98%</div>
                  <div className="text-xs text-white/70">On Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">24/7</div>
                  <div className="text-xs text-white/70">Updates</div>
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