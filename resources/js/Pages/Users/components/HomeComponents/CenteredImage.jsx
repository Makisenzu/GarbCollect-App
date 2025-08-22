import React from "react";

const CenteredImage = ({ imageSrc, imageAlt, description }) => {
  return (
    <section className="py-2 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full max-w-6xl h-auto object-contain"
          />
        </div>

        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
};

export default CenteredImage;
