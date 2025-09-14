import React, { useState, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { useOnboarding } from '../context/OnboardingContext';

const PositionControl = () => {
  // Use GameContext for real trading functionality
  const { cash, positions, handleTrade, handleSellAllPositions, totalPnL, currentMarketPrice, calculatePositionPnL } = useGameContext();
  const { isDemoMode, demoCash, demoPositions, executeDemoTrade, showInitialPrompt } = useOnboarding();
  
  const [sliderValue, setSliderValue] = useState(50); // 0-100 range
  const [isSliderActive, setIsSliderActive] = useState(false); // Track hover/active state
  const sliderRef = useRef(null); // Reference to the slider container
  
  // Use demo data when in demo mode, otherwise use real data
  const displayCash = isDemoMode ? demoCash : cash;
  const displayPositions = isDemoMode ? demoPositions : positions;
  
  // Calculate current P&L for mobile display
  const currentPnL = totalPnL !== undefined ? totalPnL : positions.reduce((total, position) => {
    return total + calculatePositionPnL(position, currentMarketPrice);
  }, 0);
  
  // Check if there are open positions
  const hasOpenPositions = displayPositions.length > 0;

  const handlePositionChange = (position) => {
    console.log('Position button clicked:', position);
    
    if (position === 'short' || position === 'long') {
      let success = false;
      
      if (isDemoMode) {
        // Execute demo trade
        success = executeDemoTrade(position, sliderValue);
      } else {
        // Execute real trade using the GameContext
        success = handleTrade(position, sliderValue);
      }
      
      if (success) {
        const tradeAmount = (displayCash * sliderValue) / 100;
        console.log(`Successfully executed ${position} trade with ${sliderValue}% allocation ($${tradeAmount.toLocaleString()})`);
      } else {
        console.log(`Failed to execute ${position} trade`);
      }
      
    } else if (position === 'sell') {
      if (!isDemoMode) {
        // Sell all positions using GameContext (only in real mode)
        const result = handleSellAllPositions();
        console.log('Sold all positions:', result);
      }
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

  // Calculate the exact position for better gradient alignment
  const circlePosition = sliderValue;

  const tradeAmount = (displayCash * sliderValue) / 100;

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] justify-start items-center gap-4 bg-white rounded-[10px] p-3">
        <div className="w-[360px] flex justify-start items-center gap-3 h-full" data-tour="trading-buttons">
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
        <div className="flex-1 relative flex justify-center items-center px-4" data-tour="slider">
          <div 
            ref={sliderRef}
            className="flex-1 h-3 rounded-[20px] relative transition-all duration-150 ease-out cursor-pointer"
            style={{
              background: `linear-gradient(to right, #005eaa 0%, #005eaa ${circlePosition}%, #f1f6f9 ${circlePosition}%, #f1f6f9 100%)`
            }}
            onMouseDown={handleSliderMouseDown}
            onMouseEnter={handleSliderMouseEnter}
            onMouseLeave={handleSliderMouseLeave}
          >
            {/* Interactive range input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={hasOpenPositions}
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
              className={`w-6 h-6 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-150 ease-out z-20 pointer-events-none ${
                hasOpenPositions 
                  ? 'bg-gray-400' 
                  : 'bg-[#72a6cf]'
              }`}
              style={{ left: `${circlePosition}%` }}
            />
          </div>
          <div className="ml-4 text-sm font-medium text-gray-600 min-w-[100px] text-right">
            {hasOpenPositions ? (
              <span className="text-green-600">
                {displayPositions.length} position{displayPositions.length !== 1 ? 's' : ''} open
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

      {/* Mobile Layout - Vertical stack: Cash/P&L (top), Text, Slider, Buttons (bottom) */}
      <div className="md:hidden w-full shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] bg-white rounded-[10px] p-4 flex flex-col gap-4">
        
        {/* Cash Position and Total P&L Section - Top - Only show when not in initial prompt */}
        {!showInitialPrompt && (
          <div className="self-stretch inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="justify-start text-blue-600 text-lg font-normal font-['Lato']">Cash Position</div>
              <div className="justify-center text-gray-800 text-2xl font-bold font-['Lato']">${displayCash.toLocaleString()}</div>
            </div>
            <div className="self-stretch h-0 border-t border-gray-300" />
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="justify-start text-blue-600 text-lg font-normal font-['Lato']">Total Profit & Loss (P&L)</div>
              <div className="inline-flex flex-col justify-center items-end gap-1">
                <div className={`justify-center text-2xl font-bold font-['Lato'] ${currentPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentPnL >= 0 ? '+' : ''}${Math.abs(currentPnL).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Section */}
        <div className="flex justify-center items-center">
          <div className="text-sm font-medium text-gray-600 text-center">
            {hasOpenPositions ? (
              <span className="text-green-600">
                {displayPositions.length} position{displayPositions.length !== 1 ? 's' : ''} open
              </span>
            ) : (
              <>
                <div className="text-lg font-semibold">{sliderValue}%</div>
                <div className="text-xs text-gray-500">
                  ${tradeAmount.toLocaleString()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Slider Section - Middle */}
        <div className="relative flex justify-center items-center px-4" data-tour="slider">
          <div 
            ref={sliderRef}
            className="w-full h-3 rounded-[20px] relative transition-all duration-150 ease-out cursor-pointer"
            style={{
              background: `linear-gradient(to right, #005eaa 0%, #005eaa ${circlePosition}%, #f1f6f9 ${circlePosition}%, #f1f6f9 100%)`
            }}
            onMouseDown={handleSliderMouseDown}
            onMouseEnter={handleSliderMouseEnter}
            onMouseLeave={handleSliderMouseLeave}
          >
            {/* Interactive range input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={hasOpenPositions}
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
              className={`w-6 h-6 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-150 ease-out z-20 pointer-events-none ${
                hasOpenPositions 
                  ? 'bg-gray-400' 
                  : 'bg-[#72a6cf]'
              }`}
              style={{ left: `${circlePosition}%` }}
            />
          </div>
        </div>

        {/* Buttons Section - Bottom */}
        <div className="flex justify-center items-center gap-3" data-tour="trading-buttons">
          {hasOpenPositions ? (
            <button 
              onClick={() => handlePositionChange('sell')}
              className="flex-1 px-6 py-3 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700 max-w-[200px]"
            >
              <div className="text-white text-lg font-bold font-['Roboto_Flex']">
                Sell All
              </div>
            </button>
          ) : (
            <>
              <button 
                onClick={() => handlePositionChange('short')}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95 max-w-[140px]"
              >
                <div className="text-blue-300 text-lg font-bold font-['Roboto_Flex']">
                  Short
                </div>
              </button>
              <button 
                onClick={() => handlePositionChange('long')}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-[10px] flex justify-center items-center transition-all duration-200 hover:scale-105 active:scale-95 max-w-[140px]"
              >
                <div className="text-blue-300 text-lg font-bold font-['Roboto_Flex']">
                  Long
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PositionControl;
