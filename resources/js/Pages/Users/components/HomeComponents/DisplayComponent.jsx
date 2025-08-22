import React from "react";

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
  return (
    <section className="py-4 md:py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div
            className={`flex justify-center ${
              reverse ? "order-1 md:order-2" : "order-1 md:order-1"
            }`}
          >
            <div className="w-full sm:max-w-sm md:max-w-md">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>

          <div
            className={`text-center md:text-left ${
              reverse ? "order-2 md:order-1" : "order-2 md:order-2"
            }`}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 mb-3 md:mb-4">
              {subtitle}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              {subDescription}
            </p>
            {buttonText && (
              <button
                onClick={buttonAction}
                className="bg-gray-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded text-sm sm:text-md font-medium hover:bg-green-700 transition duration-300 w-full sm:w-auto"
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisplayComponents;
