import React from 'react';

const GarbageTruckSpinner = ({ 
  isLoading = false, 
  size = 'medium',
  message = 'Collecting garbage...' 
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
        {/* Animation Container */}
        <div className={`relative ${sizeClasses[size]} mb-4`}>
          {/* Road */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-600 rounded-full"></div>
          
          {/* Garbage Cans */}
          <div className="absolute bottom-3 left-4 w-3 h-4 bg-gray-400 rounded-sm">
            <div className="absolute -top-1 left-0.5 w-2 h-1 bg-gray-500 rounded-sm"></div>
          </div>
          <div className="absolute bottom-3 left-8 w-3 h-5 bg-gray-400 rounded-sm">
            <div className="absolute -top-1 left-0.5 w-2 h-1 bg-gray-500 rounded-sm"></div>
          </div>
          <div className="absolute bottom-3 left-12 w-3 h-4 bg-gray-400 rounded-sm">
            <div className="absolute -top-1 left-0.5 w-2 h-1 bg-gray-500 rounded-sm"></div>
          </div>
          
          {/* Garbage Truck */}
          <div className="absolute bottom-2 left-0 animate-collect-garbage">
            {/* Truck Body */}
            <div className="relative">
              {/* Cab */}
              <div className="w-6 h-4 bg-green-600 rounded-t-sm">
                {/* Window */}
                <div className="absolute top-0.5 left-1 w-3 h-1.5 bg-blue-300 rounded-sm"></div>
                {/* Headlights */}
                <div className="absolute bottom-0 left-1 w-1 h-0.5 bg-yellow-300 rounded-full"></div>
              </div>
              
              {/* Truck Bed */}
              <div className="absolute left-6 top-1 w-8 h-3 bg-green-700 rounded-sm">
                {/* Garbage Container */}
                <div className="absolute top-0.5 left-1 w-6 h-2 bg-gray-800 rounded">
                  {/* Garbage Pile Animation */}
                  <div className="absolute -top-1 left-0 right-0 h-1 bg-gray-700 rounded-t animate-garbage-fill"></div>
                </div>
              </div>
              
              {/* Wheels */}
              <div className="absolute -bottom-1 left-1 w-2 h-2 bg-black rounded-full">
                <div className="absolute inset-0.5 w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
              <div className="absolute -bottom-1 left-5 w-2 h-2 bg-black rounded-full">
                <div className="absolute inset-0.5 w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
              <div className="absolute -bottom-1 left-11 w-2 h-2 bg-black rounded-full">
                <div className="absolute inset-0.5 w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Dust/Smoke Effect */}
          <div className="absolute bottom-3 left-16 w-4 h-1 bg-gray-400 rounded-full animate-dust-cloud opacity-0"></div>
        </div>

        {/* Loading Message */}
        <div className={`text-center ${textSizes[size]} text-gray-700 font-semibold`}>
          {message}
        </div>
        
        {/* Progress Dots */}
        <div className="flex space-x-1 mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      {/* Custom CSS for animations - LONGER DURATIONS */}
      <style jsx>{`
        @keyframes collect-garbage {
          0% {
            transform: translateX(-20px);
          }
          20% {
            transform: translateX(40px);
          }
          40% {
            transform: translateX(80px);
          }
          60% {
            transform: translateX(120px);
          }
          80% {
            transform: translateX(160px);
          }
          100% {
            transform: translateX(200px);
          }
        }
        
        @keyframes garbage-fill {
          0%, 20% {
            height: 0px;
            opacity: 0;
          }
          25% {
            height: 1px;
            opacity: 1;
          }
          40% {
            height: 2px;
            opacity: 1;
          }
          60% {
            height: 3px;
            opacity: 1;
          }
          80% {
            height: 4px;
            opacity: 1;
          }
          100% {
            height: 4px;
            opacity: 0;
          }
        }
        
        @keyframes dust-cloud {
          0%, 60% {
            opacity: 0;
            transform: scale(0.5);
          }
          70% {
            opacity: 0.8;
            transform: scale(1);
          }
          80% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          90% {
            opacity: 0.4;
            transform: scale(1.4);
          }
          100% {
            opacity: 0;
            transform: scale(1.6);
          }
        }
        
        .animate-collect-garbage {
          animation: collect-garbage 4s ease-in-out infinite;
        }
        
        .animate-garbage-fill {
          animation: garbage-fill 4s ease-in-out infinite;
        }
        
        .animate-dust-cloud {
          animation: dust-cloud 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Alternative version with Tailwind CSS animations (if you prefer)
const GarbageTruckSpinnerTailwind = ({ 
  isLoading = false, 
  size = 'medium',
  message = 'Collecting garbage...',
  variant = 'default' 
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    small: 'w-16 h-16 scale-75',
    medium: 'w-24 h-24 scale-100',
    large: 'w-32 h-32 scale-125',
    xlarge: 'w-48 h-48 scale-150'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  const variants = {
    default: 'bg-white',
    dark: 'bg-gray-800 text-white',
    transparent: 'bg-transparent text-white'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className={`${variants[variant]} rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-gray-200`}>
        {/* Enhanced Animation Container */}
        <div className={`relative ${sizeClasses[size]} mb-6`}>
          {/* Road with markings */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gray-600 rounded-full">
            <div className="absolute top-1 left-1/4 w-2 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute top-1 left-2/4 w-2 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute top-1 left-3/4 w-2 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Garbage Cans with different styles */}
          <div className="absolute bottom-4 left-6 w-4 h-5 bg-blue-600 rounded-sm transform -rotate-3">
            <div className="absolute -top-1 left-1 w-2 h-1 bg-blue-700 rounded-sm"></div>
            <div className="absolute top-1 left-0.5 w-3 h-0.5 bg-blue-800"></div>
          </div>
          
          <div className="absolute bottom-4 left-12 w-4 h-6 bg-green-600 rounded-sm transform rotate-2">
            <div className="absolute -top-1 left-1 w-2 h-1 bg-green-700 rounded-sm"></div>
            <div className="absolute top-1.5 left-0.5 w-3 h-0.5 bg-green-800"></div>
          </div>
          
          <div className="absolute bottom-4 left-18 w-4 h-5 bg-yellow-600 rounded-sm transform -rotate-1">
            <div className="absolute -top-1 left-1 w-2 h-1 bg-yellow-700 rounded-sm"></div>
            <div className="absolute top-1 left-0.5 w-3 h-0.5 bg-yellow-800"></div>
          </div>
          
          {/* Animated Garbage Truck */}
          <div className="absolute bottom-3 left-0 animate-truck-drive">
            {/* Truck with more details */}
            <div className="relative">
              {/* Cab */}
              <div className="w-8 h-5 bg-red-600 rounded-t-lg relative">
                {/* Window */}
                <div className="absolute top-1 left-1 w-4 h-2 bg-blue-400 rounded-sm">
                  <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full"></div>
                </div>
                {/* Headlights */}
                <div className="absolute bottom-0 left-1 w-1.5 h-1 bg-yellow-300 rounded-full"></div>
                {/* Grill */}
                <div className="absolute bottom-0.5 left-3 w-3 h-0.5 bg-gray-700 rounded"></div>
              </div>
              
              {/* Truck Bed with hydraulic arm */}
              <div className="absolute left-8 top-1 w-10 h-4 bg-red-700 rounded-r-lg">
                {/* Garbage Container */}
                <div className="absolute top-1 left-1 w-8 h-2 bg-gray-900 rounded-sm overflow-hidden">
                  {/* Filling garbage animation */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-700 animate-garbage-rise origin-bottom"></div>
                </div>
                
                {/* Hydraulic Arm */}
                <div className="absolute -top-2 left-4 w-1 h-2 bg-gray-400 rounded-full transform -rotate-45 animate-arm-lift"></div>
              </div>
              
              {/* Wheels with rotation */}
              <div className="absolute -bottom-1 left-1 w-3 h-3 bg-black rounded-full border-2 border-gray-600 animate-wheel-spin">
                <div className="absolute inset-1 w-1 h-1 bg-gray-500 rounded-full"></div>
              </div>
              <div className="absolute -bottom-1 left-6 w-3 h-3 bg-black rounded-full border-2 border-gray-600 animate-wheel-spin">
                <div className="absolute inset-1 w-1 h-1 bg-gray-500 rounded-full"></div>
              </div>
              <div className="absolute -bottom-1 left-14 w-3 h-3 bg-black rounded-full border-2 border-gray-600 animate-wheel-spin">
                <div className="absolute inset-1 w-1 h-1 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Multiple Dust Clouds */}
          <div className="absolute bottom-4 left-20 w-6 h-2 bg-gray-500 rounded-full opacity-0 animate-dust-1"></div>
          <div className="absolute bottom-4 left-24 w-4 h-1 bg-gray-400 rounded-full opacity-0 animate-dust-2"></div>
        </div>

        {/* Loading Message with Typing Effect */}
        <div className={`${textSizes[size]} text-gray-700 font-semibold mb-4 text-center`}>
          <span className="inline-block animate-typing overflow-hidden whitespace-nowrap border-r-2 border-green-500 pr-1">
            {message}
          </span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-progress-bar"></div>
        </div>
      </div>
      
      {/* Enhanced CSS Animations - LONGER DURATIONS */}
      <style jsx>{`
        @keyframes truck-drive {
          0% {
            transform: translateX(-30px);
          }
          20% {
            transform: translateX(30px);
          }
          40% {
            transform: translateX(60px);
          }
          60% {
            transform: translateX(90px);
          }
          80% {
            transform: translateX(120px);
          }
          100% {
            transform: translateX(150px);
          }
        }
        
        @keyframes garbage-rise {
          0%, 20% {
            height: 0%;
          }
          30% {
            height: 20%;
          }
          50% {
            height: 50%;
          }
          70% {
            height: 80%;
          }
          90%, 100% {
            height: 100%;
          }
        }
        
        @keyframes arm-lift {
          0%, 30% {
            transform: rotate(-45deg);
          }
          40%, 60% {
            transform: rotate(-90deg);
          }
          70%, 100% {
            transform: rotate(-45deg);
          }
        }
        
        @keyframes wheel-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes dust-1 {
          0%, 50% {
            opacity: 0;
            transform: scale(0.5) translateX(0);
          }
          60% {
            opacity: 0.7;
            transform: scale(1) translateX(-5px);
          }
          70% {
            opacity: 0.5;
            transform: scale(1.2) translateX(-10px);
          }
          80% {
            opacity: 0.3;
            transform: scale(1.4) translateX(-15px);
          }
          100% {
            opacity: 0;
            transform: scale(1.6) translateX(-20px);
          }
        }
        
        @keyframes dust-2 {
          0%, 55% {
            opacity: 0;
            transform: scale(0.5) translateX(0);
          }
          65% {
            opacity: 0.5;
            transform: scale(1) translateX(-3px);
          }
          75% {
            opacity: 0.3;
            transform: scale(1.1) translateX(-6px);
          }
          85% {
            opacity: 0.1;
            transform: scale(1.2) translateX(-9px);
          }
          100% {
            opacity: 0;
            transform: scale(1.3) translateX(-12px);
          }
        }
        
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        
        @keyframes progress-bar {
          0% {
            width: 0%;
          }
          30% {
            width: 30%;
          }
          60% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-truck-drive {
          animation: truck-drive 5s ease-in-out infinite;
        }
        
        .animate-garbage-rise {
          animation: garbage-rise 5s ease-in-out infinite;
        }
        
        .animate-arm-lift {
          animation: arm-lift 5s ease-in-out infinite;
        }
        
        .animate-wheel-spin {
          animation: wheel-spin 2s linear infinite;
        }
        
        .animate-dust-1 {
          animation: dust-1 5s ease-in-out infinite;
        }
        
        .animate-dust-2 {
          animation: dust-2 5s ease-in-out infinite;
        }
        
        .animate-typing {
          animation: typing 3s steps(30) infinite;
        }
        
        .animate-progress-bar {
          animation: progress-bar 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Hook for using the spinner
export const useGarbageTruckSpinner = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const startLoading = (duration = 51000) => {
    setIsLoading(true);
    if (duration) {
      setTimeout(() => setIsLoading(false), duration);
    }
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const Spinner = ({ message, size, variant }) => (
    <GarbageTruckSpinnerTailwind 
      isLoading={isLoading}
      message={message}
      size={size}
      variant={variant}
    />
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    Spinner
  };
};

export default GarbageTruckSpinner;