// components/FakeLocationTestPanel.jsx
import { useState } from 'react';
import { IoPlay, IoStop, IoNavigate, IoCodeSlash } from "react-icons/io5";

const FakeLocationTestPanel = ({ 
  startFakeLocationTest, 
  stopFakeLocationTest, 
  sendTestLocation,
  isFakeLocationActive,
  isMobile 
}) => {
  const [testLat, setTestLat] = useState('8.50679937');
  const [testLng, setTestLng] = useState('126.00992222');
  const [isOpen, setIsOpen] = useState(false);

  const handleSendTestLocation = () => {
    const lat = parseFloat(testLat);
    const lng = parseFloat(testLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      sendTestLocation(lat, lng);
    } else {
      alert('Please enter valid coordinates');
    }
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-20 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-purple-500 text-white p-3 rounded-full shadow-lg"
        >
          <IoCodeSlash className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className="absolute bottom-12 left-0 bg-white p-4 rounded-lg shadow-xl border min-w-64">
            <h3 className="font-semibold mb-3 text-gray-800">📍 Location Test</h3>
            
            <div className="space-y-2 mb-3">
              <input
                type="text"
                value={testLat}
                onChange={(e) => setTestLat(e.target.value)}
                placeholder="Latitude"
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                value={testLng}
                onChange={(e) => setTestLng(e.target.value)}
                placeholder="Longitude"
                className="w-full p-2 border rounded text-sm"
              />
              <button
                onClick={handleSendTestLocation}
                className="w-full bg-blue-500 text-white py-2 rounded text-sm"
              >
                Send Test Location
              </button>
            </div>

            <div className="flex gap-2">
              {!isFakeLocationActive ? (
                <button
                  onClick={startFakeLocationTest}
                  className="flex-1 bg-green-500 text-white py-2 rounded text-sm flex items-center justify-center gap-1"
                >
                  <IoPlay className="w-4 h-4" />
                  Start Sim
                </button>
              ) : (
                <button
                  onClick={stopFakeLocationTest}
                  className="flex-1 bg-red-500 text-white py-2 rounded text-sm flex items-center justify-center gap-1"
                >
                  <IoStop className="w-4 h-4" />
                  Stop Sim
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-4 z-30 bg-white p-4 rounded-lg shadow-lg border min-w-64">
      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        <IoCodeSlash className="w-5 h-5 text-purple-500" />
        Location Test Panel
      </h3>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={testLat}
              onChange={(e) => setTestLat(e.target.value)}
              placeholder="Latitude"
              className="flex-1 p-2 border rounded text-sm"
            />
            <input
              type="text"
              value={testLng}
              onChange={(e) => setTestLng(e.target.value)}
              placeholder="Longitude"
              className="flex-1 p-2 border rounded text-sm"
            />
          </div>
          <button
            onClick={handleSendTestLocation}
            className="w-full bg-blue-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
          >
            <IoNavigate className="w-4 h-4" />
            Send Test Location
          </button>
        </div>

        <div className="border-t pt-3">
          <div className="flex gap-2">
            {!isFakeLocationActive ? (
              <button
                onClick={() => startFakeLocationTest(5000)}
                className="flex-1 bg-green-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
              >
                <IoPlay className="w-4 h-4" />
                Start Simulation
              </button>
            ) : (
              <button
                onClick={stopFakeLocationTest}
                className="flex-1 bg-red-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
              >
                <IoStop className="w-4 h-4" />
                Stop Simulation
              </button>
            )}
          </div>
          {isFakeLocationActive && (
            <p className="text-xs text-green-600 mt-2 text-center">
              🔴 Simulation Active - Sending locations every 5s
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FakeLocationTestPanel;