import React, { useState, useEffect } from "react";
import { Leaf, Recycle, TreePine } from 'lucide-react';

const CenteredImage = ({ imageSrc, imageAlt, description }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eco Badge */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Leaf className="h-4 w-4" />
            Sustainable Future
          </div>
        </div>

        {/* Image Container */}
        <div className={`relative mb-12 transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-auto object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
        </div>

        {/* Description */}
        <div className={`text-center transform transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto mb-8">
            {description}
          </p>
          
          {/* Call to action icons */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-2">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Recycle</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-2">
                <Leaf className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Reduce</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-full mb-2">
                <TreePine className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Reuse</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CenteredImage;