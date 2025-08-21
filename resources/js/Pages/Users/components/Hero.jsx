import React from 'react';
import backgroundImage from '@/images/sanfrance.jpg';
import { Head } from '@inertiajs/react';
const Hero = () => {
  return (
    <div 
      className="relative text-white py-16 px-4 bg-cover bg-center bg-no-repeat min-h-[400px] flex items-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >

        <Head title='GarbCollect'/>
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          GarbCollect
        </h1>
        <p className="text-xl mb-8">
        Your smart solution for efficient waste collection and community cleanliness
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-green-700 font-semibold py-3 px-6 rounded-lg hover:bg-green-100 transition duration-300">
            Track Your Pickup
          </button>
          <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/10 transition duration-300">
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;