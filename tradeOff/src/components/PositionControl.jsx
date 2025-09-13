import React, { useState } from 'react';

const PositionControl = () => {
  const [selectedPosition, setSelectedPosition] = useState('long'); // 'short' or 'long'
  const [sliderValue, setSliderValue] = useState(50); // 0-100 range

  const handlePositionChange = (position) => {
    setSelectedPosition(position);
  };

  const handleSliderChange = (event) => {
    setSliderValue(parseInt(event.target.value));
  };

  return (
    <div className="w-full h-full shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] flex justify-start items-center gap-4 bg-white rounded-[10px] p-3">
      <div className="w-[360px] flex justify-start items-center gap-3 h-full">
        <button 
          onClick={() => handlePositionChange('short')}
          className={`flex-1 px-6 py-3 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95 ${
            selectedPosition === 'short' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <div className={`text-lg font-bold font-['Roboto_Flex'] ${
            selectedPosition === 'short' ? 'text-white' : 'text-blue-300'
          }`}>
            Short
          </div>
        </button>
        <button 
          onClick={() => handlePositionChange('long')}
          className={`flex-1 px-6 py-3 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95 ${
            selectedPosition === 'long' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <div className={`text-lg font-bold font-['Roboto_Flex'] ${
            selectedPosition === 'long' ? 'text-white' : 'text-blue-300'
          }`}>
            Long
          </div>
        </button>
      </div>
      <div className="flex-1 relative flex justify-center items-center px-4">
        <div className="flex-1 h-3 bg-gradient-to-r from-[#005eaa] from-20% to-[#f1f6f9] to-50% rounded-[20px] relative">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="w-10 h-10 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-[#72a6cf]/50 rounded-full backdrop-blur-[5px] pointer-events-none transition-all duration-150"
            style={{ left: `${sliderValue}%` }}
          />
          <div 
            className="w-6 h-6 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-[#72a6cf] rounded-full pointer-events-none transition-all duration-150"
            style={{ left: `${sliderValue}%` }}
          />
        </div>
        <div className="ml-4 text-sm font-medium text-gray-600 min-w-[50px]">
          {sliderValue}%
        </div>
      </div>
    </div>
  );
};

export default PositionControl;
