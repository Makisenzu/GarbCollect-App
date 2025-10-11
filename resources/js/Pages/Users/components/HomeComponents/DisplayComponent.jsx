import React, { useState, useEffect } from "react";
import { Link } from '@inertiajs/react';

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
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 md:mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className={`flex justify-center ${reverse ? "lg:order-2" : "lg:order-1"}`}>
            <div className={`w-full max-w-lg transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-auto object-cover rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>

          <div className={`text-center lg:text-left ${reverse ? "lg:order-1" : "lg:order-2"}`}>
            <div className={`transform transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                {subtitle}
              </h3>
              <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10 leading-relaxed font-light">
                {subDescription}
              </p>
              {buttonText && (
                <Link
                  href={route('barangay.routes')}
                  className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2 mx-auto lg:mx-0 inline-block"
                >
                  {buttonText}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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