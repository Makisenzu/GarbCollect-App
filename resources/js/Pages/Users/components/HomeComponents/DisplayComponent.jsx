import React, { useState, useEffect } from "react";
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const DisplayComponents = ({
  title,
  description,
  subtitle,
  subDescription,
  buttonText,
  buttonAction,
  imageSrc,
  imageAlt,
  reverse = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Section */}
          <div className={`relative ${reverse ? "lg:order-2" : "lg:order-1"}`}>
            <div className={`relative transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-60 -z-10"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60 -z-10"></div>
            </div>
          </div>

          {/* Text Section */}
          <div className={`${reverse ? "lg:order-1" : "lg:order-2"}`}>
            <div className={`transform transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {subtitle}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {subDescription}
              </p>
              
              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                {[
                  'Real-time route optimization',
                  'Reduced collection time',
                  'Improved community service'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {buttonText && (
                <Link
                  href={route('barangay.routes')}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {buttonText}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisplayComponents;