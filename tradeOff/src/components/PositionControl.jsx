import React, { useState, useRef } from 'react';
import { useGameContext } from '../context/GameContext';

const PositionControl = () => {
  // Use GameContext for real trading functionality
  const { cash, positions, handleTrade, handleSellAllPositions } = useGameContext();
  const [sliderValue, setSliderValue] = useState(50); // 0-100 range
  const [isSliderActive, setIsSliderActive] = useState(false); // Track hover/active state
  const sliderRef = useRef(null); // Reference to the slider container
  
  // Check if there are open positions
  const hasOpenPositions = positions.length > 0;

  const handlePositionChange = (position) => {
    console.log('Position button clicked:', position);
    
    if (position === 'short' || position === 'long') {
      // Execute real trade using the GameContext
      const success = handleTrade(position, sliderValue);
      
      if (success) {
        const tradeAmount = (cash * sliderValue) / 100;
        console.log(`Successfully executed ${position} trade with ${sliderValue}% allocation ($${tradeAmount.toLocaleString()})`);
      } else {
        console.log(`Failed to execute ${position} trade`);
      }
      
    } else if (position === 'sell') {
      // Sell all positions using GameContext
      const result = handleSellAllPositions();
      console.log('Sold all positions:', result);
    }
  };

  const handleSliderMouseEnter = () => {
    if (!hasOpenPositions) {
      setIsSliderActive(true);
    }
  };

  const handleSliderMouseLeave = () => {
    setIsSliderActive(false);
  };

    const handleSliderMouseDown = (event) => {
    if (hasOpenPositions) return; // Don't allow interaction when disabled
    
    setIsSliderActive(true);
    
    // Handle dragging
    const handleMouseMove = (moveEvent) => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
        setSliderValue(Math.round(percentage));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsSliderActive(false); // Remove active state when dragging ends
    };

    // Prevent default to avoid any unwanted behavior
    event.preventDefault();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSliderMouseUp = () => {
    // Keep active state on mouse up, will be removed on mouse leave
  };

  // Calculate the exact position for better gradient alignment
  const circlePosition = sliderValue;

  const tradeAmount = (cash * sliderValue) / 100;

  return (
    <div className="w-full h-full shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] flex justify-start items-center gap-4 bg-white rounded-[10px] p-3">
      <div className="w-[360px] flex justify-start items-center gap-3 h-full">
        {hasOpenPositions ? (
          <button 
            onClick={() => handlePositionChange('sell')}
            className="flex-1 px-6 py-3 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700"
          >
            <div className="text-white text-lg font-bold font-['Roboto_Flex']">
              Sell All
            </div>
          </button>
        ) : (
          <>
            <button 
              onClick={() => handlePositionChange('short')}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="text-blue-300 text-lg font-bold font-['Roboto_Flex']">
                Short
              </div>
            </button>
            <button 
              onClick={() => handlePositionChange('long')}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="text-blue-300 text-lg font-bold font-['Roboto_Flex']">
                Long
              </div>
            </button>
          </>
        )}
      </div>
      <div className="flex-1 relative flex justify-center items-center px-4">
        <div 
          ref={sliderRef}
          className="flex-1 h-3 rounded-[20px] relative transition-all duration-150 ease-out"
          style={{
            background: `linear-gradient(to right, #005eaa 0%, #005eaa ${circlePosition}%, #f1f6f9 ${circlePosition}%, #f1f6f9 100%)`
          }}
        >
          {/* Disabled range input - only for structure, not interactive */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            readOnly
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            disabled={true}
            style={{
              background: 'transparent'
            }}
          />
          {/* Outer circle - only show on hover/active */}
          {isSliderActive && (
            <div 
              className="w-10 h-10 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-[#72a6cf]/50 rounded-full backdrop-blur-[5px] pointer-events-none transition-all duration-150 ease-out"
              style={{ left: `${circlePosition}%` }}
            />
          )}
          {/* Inner circle - always visible with hover detection */}
          <div 
            className={`w-6 h-6 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-150 ease-out z-20 ${
              hasOpenPositions 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#72a6cf] cursor-pointer'
            }`}
            style={{ left: `${circlePosition}%` }}
            onMouseEnter={handleSliderMouseEnter}
            onMouseLeave={handleSliderMouseLeave}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
          />
        </div>
        <div className="ml-4 text-sm font-medium text-gray-600 min-w-[100px] text-right">
          {hasOpenPositions ? (
            <span className="text-green-600">
              {positions.length} position{positions.length !== 1 ? 's' : ''} open
            </span>
          ) : (
            <>
              <div>{sliderValue}%</div>
              <div className="text-xs text-gray-500">
                ${tradeAmount.toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionControl;
