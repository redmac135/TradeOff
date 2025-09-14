import React, { useState, useRef, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { useOnboarding } from '../context/OnboardingContext';

const PositionControl = () => {
  // Use GameContext for real trading functionality
  const { cash, positions, handleTrade, handleSellAllPositions, totalPnL, currentMarketPrice, calculatePositionPnL } = useGameContext();
  const { isDemoMode, demoCash, demoPositions, showInitialPrompt } = useOnboarding();
  
  const [sliderValue, setSliderValue] = useState(50); // 0-100 range
  const [_isSliderActive, setIsSliderActive] = useState(false); // Track hover/active state
  const desktopSliderRef = useRef(null); // Reference to the desktop slider container
  const mobileSliderRef = useRef(null); // Reference to the mobile slider container
  const [_isDragging, setIsDragging] = useState(false); // Track drag state
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Clean up mounted ref on unmount
  useEffect(() => {
    console.log('PositionControl MOUNTED');
    return () => {
      console.log('PositionControl UNMOUNTED');
      isMountedRef.current = false;
    };
  }, []);
  
  // Always use real data for trading, but display demo data during onboarding if needed
  const displayCash = isDemoMode ? demoCash : cash;
  const displayPositions = isDemoMode ? demoPositions : positions;
  
  // Calculate current P&L for mobile display
  const currentPnL = totalPnL !== undefined ? totalPnL : positions.reduce((total, position) => {
    return total + calculatePositionPnL(position, currentMarketPrice);
  }, 0);
  
  // Check if there are open positions (use real positions for trading logic)
  const hasOpenPositions = positions.length > 0;

  console.log('🔍 NEW SLIDER - hasOpenPositions:', hasOpenPositions, 'sliderValue:', sliderValue);

  const handlePositionChange = (position) => {
    console.log('Position button clicked:', position);
    
    if (position === 'short' || position === 'long') {
      let success = false;
      
      // Always use real trading now, no more demo mode for trading
      console.log('Executing real trade using GameContext');
      success = handleTrade(position, sliderValue);
      
      if (success) {
        const tradeAmount = (cash * sliderValue) / 100; // Use real cash for calculations
        console.log(`Successfully executed ${position} trade with ${sliderValue}% allocation ($${tradeAmount.toLocaleString()})`);
      } else {
        console.log(`Failed to execute ${position} trade`);
      }
      
    } else if (position === 'sell') {
      // Always use real trading for sell operations
      const result = handleSellAllPositions();
      console.log('Sold all positions:', result);
    }
  };

  // ========================================
  // Slider handlers implemented separately for desktop and mobile below
  // ========================================

  // ========================================
  // NEW SEPARATE SLIDER IMPLEMENTATIONS
  // ========================================
  
  const handleDesktopSliderClick = (event) => {
    console.log('🟢 DESKTOP CLICK');
    if (hasOpenPositions) return;
    if (!desktopSliderRef.current) return;
    
    const rect = desktopSliderRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newValue = Math.max(0, Math.min(100, Math.round(percentage)));
    
    console.log('🟢 DESKTOP CLICK - Setting to:', newValue);
    setSliderValue(newValue);
  };
  
  const handleDesktopSliderMouseDown = (event) => {
    console.log('🟢 DESKTOP MOUSEDOWN');
    if (hasOpenPositions) return;
    
    event.preventDefault();
    setIsDragging(true);
    setIsSliderActive(true);
    
    handleDesktopSliderClick(event);
    
    const handleMove = (e) => {
      if (!desktopSliderRef.current) return;
      const rect = desktopSliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newValue = Math.max(0, Math.min(100, Math.round(percentage)));
      setSliderValue(newValue);
    };
    
    const handleUp = () => {
      setIsDragging(false);
      setIsSliderActive(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };
  
  const handleMobileSliderClick = (event) => {
    console.log('🟢 MOBILE CLICK');
    if (hasOpenPositions) return;
    if (!mobileSliderRef.current) return;
    
    const rect = mobileSliderRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    
    if (!clientX || isNaN(clientX)) {
      console.error('🟢 MOBILE CLICK - Invalid clientX:', clientX);
      return;
    }
    
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newValue = Math.max(0, Math.min(100, Math.round(percentage)));
    
    console.log('🟢 MOBILE CLICK - Setting to:', newValue);
    setSliderValue(newValue);
  };
  
  const handleMobileSliderTouchStart = (event) => {
    console.log('🟢 MOBILE TOUCHSTART');
    if (hasOpenPositions) return;
    
    event.preventDefault();
    setIsDragging(true);
    setIsSliderActive(true);
    
    handleMobileSliderClick(event);
    
    const handleMove = (e) => {
      if (!mobileSliderRef.current || !e.touches || !e.touches[0]) return;
      
      const rect = mobileSliderRef.current.getBoundingClientRect();
      const clientX = e.touches[0].clientX;
      
      if (!clientX || isNaN(clientX)) return;
      
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newValue = Math.max(0, Math.min(100, Math.round(percentage)));
      setSliderValue(newValue);
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setIsSliderActive(false);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  // Calculate the exact position for better gradient alignment
  const circlePosition = sliderValue;

  // Use real cash for trade amount calculations to ensure consistency
  const tradeAmount = (cash * sliderValue) / 100;

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] justify-start items-center gap-4 bg-white rounded-[10px] p-3">
        <div className="w-[360px] flex justify-start items-center gap-3 h-full" data-tour="trading-buttons trading-buttons-primary">
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
  <div className="flex-1 relative flex justify-center items-center px-4" data-tour="slider slider-primary">
          <div 
            ref={desktopSliderRef}
            className="flex-1 h-3 rounded-[20px] relative transition-all duration-150 ease-out cursor-pointer bg-gray-200"
            style={{
              background: `linear-gradient(to right, #005eaa 0%, #005eaa ${circlePosition}%, #f1f6f9 ${circlePosition}%, #f1f6f9 100%)`
            }}
            onMouseDown={handleDesktopSliderMouseDown}
            onClick={handleDesktopSliderClick}
          >
            {/* NEW SIMPLE SLIDER - No hidden inputs blocking events */}
            
            {/* Slider circle */}
            <div 
              className="w-6 h-6 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-600 transition-all duration-150 ease-out z-10 pointer-events-none"
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

      {/* Mobile Layout - Vertical stack: Cash/P&L (top), Text, Slider, Buttons (bottom) - Only show when not in initial prompt */}
      {!showInitialPrompt && (
        <div className="md:hidden w-full shadow-[4px_4px_20px_0px_rgba(0,0,0,0.10)] bg-white rounded-[10px] p-4 flex flex-col gap-4">
          
          {/* Cash Position and Total P&L Section - Top */}
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
  <div className="relative flex justify-center items-center px-4" data-tour="slider slider-primary">
          <div 
            ref={mobileSliderRef}
            className="w-full h-3 rounded-[20px] relative transition-all duration-150 ease-out cursor-pointer bg-gray-200"
            style={{
              background: `linear-gradient(to right, #005eaa 0%, #005eaa ${circlePosition}%, #f1f6f9 ${circlePosition}%, #f1f6f9 100%)`
            }}
            onMouseDown={handleDesktopSliderMouseDown}
            onClick={handleMobileSliderClick}
            onTouchStart={handleMobileSliderTouchStart}
          >
            {/* NEW SIMPLE SLIDER - No hidden inputs blocking events */}
            
            {/* Slider circle */}
            <div 
              className="w-6 h-6 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-600 transition-all duration-150 ease-out z-10 pointer-events-none"
              style={{ left: `${circlePosition}%` }}
            />
          </div>
        </div>

        {/* Buttons Section - Bottom */}
  <div className="flex justify-center items-center gap-3" data-tour="trading-buttons trading-buttons-primary">
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
      )}
    </>
  );
};

export default PositionControl;
