import React, { useState, useEffect } from "react";

const CenteredImage = ({ imageSrc, imageAlt, description }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className={`flex justify-center mb-8 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full max-w-4xl h-auto object-contain rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
          />
        </div>

        <p className={`text-xl md:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-light transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {description}
        </p>
      </div>
    </section>
  );
};

export default CenteredImage;