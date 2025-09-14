import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';
import { useGameContext } from '../context/GameContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useGameData } from '../hooks/useGameData';

// Register Chart.js components
ChartJS.register(...registerables, CandlestickController, CandlestickElement);

const FinancialChart = ({ useMockData = true, apiData = [], demoData }) => {
  const { marketData, positions, currentMarketPrice, calculatePositionPnL, totalPnL } = useGameContext();
  const { isDemoMode, showInitialPrompt } = useOnboarding();
  const chartRef = useRef(null);
  
  // Use the same live data source as the web version, but gate until landing dismissed
  const liveEnabled = !isDemoMode && !showInitialPrompt;
  const { candles } = useGameData(liveEnabled);

  // Add state for smooth data transitions
  const [cachedData, setCachedData] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate current P&L for display
  const currentPnL = useMemo(() => {
    if (totalPnL !== undefined) return totalPnL;
    
    return positions.reduce((total, position) => {
      return total + calculatePositionPnL(position, currentMarketPrice);
    }, 0);
  }, [totalPnL, positions, calculatePositionPnL, currentMarketPrice]);

  const pnlDisplay = useMemo(() => {
    const isProfit = currentPnL >= 0;
    const absValue = Math.abs(currentPnL);
    
    return {
      value: absValue.toFixed(2),
      isProfit,
      color: isProfit ? '#4ba03a' : '#dc2626',
      bgColor: isProfit ? 'bg-[#4ba03a]/10' : 'bg-red-600/10',
      textColor: isProfit ? 'text-[#4ba03a]' : 'text-red-600'
    };
  }, [currentPnL]);

  // Use the same data source logic as the web version, but prioritize demoData for onboarding
  const dataSource = useMemo(() => {
    // If demoData is provided (onboarding mode), use it
    if (demoData && Array.isArray(demoData) && demoData.length > 0) {
      return demoData.slice(-30).map((item, index) => ({
        x: index,
        h: item.h ?? item.High,
        l: item.l ?? item.Low,
        o: item.o ?? item.Open,
        c: item.c ?? item.Close,
      }));
    }

    // Otherwise, use the same logic as web version
    const data = useMockData ? candles : (useMockData ? marketData : apiData);
    if (!Array.isArray(data)) return [];

    // Validate and clean data, and convert to sequential index instead of time-based
    const mapped = data.slice(-30).map((item, index) => ({
      x: index,
      h: item.h ?? item.High,
      l: item.l ?? item.Low,
      o: item.o ?? item.Open,
      c: item.c ?? item.Close,
    }));

    return mapped;
  }, [useMockData, marketData, apiData, candles, demoData]);

  // Smooth data updates with debouncing and intelligent caching
  const smoothDataSource = useMemo(() => {
    // Check if only the last candle has changed (common case for live updates)
    if (cachedData.length > 0 && dataSource.length > 0) {
      const lastCachedCandle = cachedData[cachedData.length - 1];
      const lastNewCandle = dataSource[dataSource.length - 1];
      
      // If only the last candle values changed, smoothly update just that candle
      if (cachedData.length === dataSource.length && 
          lastCachedCandle && lastNewCandle &&
          lastCachedCandle.x === lastNewCandle.x) {
        
        // Create smooth transition for the last candle only
        const smoothedData = [...cachedData];
        smoothedData[smoothedData.length - 1] = {
          ...lastNewCandle,
          // Optionally add some smoothing to the values
          h: lastNewCandle.h,
          l: lastNewCandle.l,
          o: lastNewCandle.o,
          c: lastNewCandle.c
        };
        
        // Update cached data for next comparison
        setCachedData(dataSource);
        return smoothedData;
      }
    }
    
    // For major data changes or initial load, update normally but cache for future comparisons
    setCachedData(dataSource);
    return dataSource;
  }, [dataSource, cachedData, setCachedData]);

  // Throttle updates to prevent excessive re-renders
  const [throttledData, setThrottledData] = useState(smoothDataSource);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setThrottledData(smoothDataSource);
      setIsUpdating(false);
    }, 100); // 100ms throttle for smooth updates

    setIsUpdating(true);
    return () => clearTimeout(timer);
  }, [smoothDataSource, setIsUpdating]);

  // Mobile data windowing - show last 12 candlesticks for better mobile experience
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mobileDisplayData = useMemo(() => {
    const sourceData = throttledData; // Use throttled data for smooth updates
    if (isMobile && sourceData.length > 12) {
      return sourceData.slice(-12);
    }
    return sourceData;
  }, [throttledData, isMobile]);

  const chartData = useMemo(() => {
    const displayData = isMobile ? mobileDisplayData : throttledData; // Use throttled data for both mobile and desktop
    
    const datasets = [{
      label: 'OHLC Data',
      data: displayData,
      backgroundColors: {
        up: '#4ba03a',
        down: '#b91a0e',
        unchanged: '#999',
      },
      borderColors: {
        up: '#4ba03a',
        down: '#b91a0e',
        unchanged: '#999',
      },
      borderWidth: 1,
    }];

    // Add position lines
    positions.forEach((position) => {
      const profitLoss = calculatePositionPnL(position, currentMarketPrice);
      const isProfit = profitLoss >= 0;
      const lineColor = isProfit ? '#22c55e' : '#ef4444';

      const xMin = displayData.length > 0 ? Math.min(...displayData.map(d => d.x)) : 0;
      const xMax = displayData.length > 0 ? Math.max(...displayData.map(d => d.x)) : 10;
      
      datasets.push({
        label: `${position.type.toUpperCase()} Entry - $${position.entryPrice.toFixed(2)}`,
        type: 'line',
        data: [
          { x: xMin - 1, y: position.entryPrice },
          { x: xMax + 1, y: position.entryPrice }
        ],
        borderColor: lineColor,
        backgroundColor: lineColor + '20',
        borderWidth: 2,
        borderDash: position.type === 'short' ? [5, 3] : [],
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    });

    return { datasets };
  }, [mobileDisplayData, throttledData, positions, currentMarketPrice, calculatePositionPnL, isMobile]);

  // Calculate Y axis range with intelligent zoom - much tighter bounds
  const yAxisRange = useMemo(() => {
    const displayData = isMobile ? mobileDisplayData : throttledData; // Use throttled data for smooth Y-axis updates
    if (displayData.length === 0) return { min: 8000, max: 10000, stepSize: 100 };

    const allHighs = displayData.map(d => d.h);
    const allLows = displayData.map(d => d.l);
    const min = Math.min(...allLows);
    const max = Math.max(...allHighs);
    const range = max - min;

    // Intelligent padding based on range size
    let paddingPercent = 0.05; // Start with 5% padding
    if (range < 10) paddingPercent = 0.15; // 15% for very small ranges
    else if (range < 50) paddingPercent = 0.10; // 10% for small ranges
    else if (range < 200) paddingPercent = 0.08; // 8% for medium ranges

    const padding = range * paddingPercent;
    const paddedMin = min - padding;
    const paddedMax = max + padding;

    // Intelligent step size calculation
    let stepSize;
    if (range < 5) stepSize = 0.5;     // $0.50 steps for very small ranges
    else if (range < 10) stepSize = 1;  // $1 steps for small ranges
    else if (range < 25) stepSize = 2;  // $2 steps for small-medium ranges
    else if (range < 50) stepSize = 5;  // $5 steps for medium ranges
    else if (range < 100) stepSize = 10; // $10 steps for larger ranges
    else if (range < 500) stepSize = 25; // $25 steps for large ranges
    else stepSize = 50;                  // $50 steps for very large ranges

    // Round bounds to nice numbers based on step size
    const roundedMin = Math.floor(paddedMin / stepSize) * stepSize;
    const roundedMax = Math.ceil(paddedMax / stepSize) * stepSize;

    // Reduce console logging for smoother performance
    if (Math.random() < 0.1) { // Only log 10% of the time
      console.log(`Chart zoom info - Range: $${range.toFixed(2)}, Step: $${stepSize}, Min: $${roundedMin.toFixed(2)}, Max: $${roundedMax.toFixed(2)}`);
    }

    return {
      min: roundedMin,
      max: roundedMax,
      stepSize: stepSize,
      range: range
    };
  }, [mobileDisplayData, throttledData, isMobile]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isUpdating ? 150 : 0, // Smooth but fast animation when updating
      easing: 'easeOutQuart',
    },
    transitions: {
      active: {
        animation: {
          duration: 100
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `Candle ${context[0].dataIndex + 1}`;
          },
          label: function(context) {
            const point = context.raw;
            // More precise formatting based on the data range
            const precision = yAxisRange.stepSize < 1 ? 3 : (yAxisRange.stepSize < 10 ? 2 : 2);
            return [
              `Open: $${point.o.toFixed(precision)}`,
              `High: $${point.h.toFixed(precision)}`,
              `Low: $${point.l.toFixed(precision)}`,
              `Close: $${point.c.toFixed(precision)}`,
              `Range: $${(point.h - point.l).toFixed(precision)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        display: false,
        grid: { display: false },
        ticks: { display: false }
      },
      y: {
        type: 'linear',
        position: isMobile ? 'right' : 'left', // Right on mobile, left on desktop
        min: yAxisRange.min,
        max: yAxisRange.max,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: isMobile ? 11 : 12, weight: '500' },
          maxTicksLimit: isMobile ? 8 : 10, // More ticks for better granularity
          stepSize: yAxisRange.stepSize, // Use intelligent step size
          callback: function(value) {
            // Format based on step size for better readability
            if (yAxisRange.stepSize < 1) {
              return '$' + value.toFixed(2); // Show cents for very small steps
            } else if (yAxisRange.stepSize < 10) {
              return '$' + value.toFixed(1); // Show one decimal for small steps
            } else {
              return '$' + Math.round(value); // Show whole numbers for larger steps
            }
          }
        },
        border: { display: false }
      }
    },
    elements: {
      point: { radius: 0 }
    }
  }), [yAxisRange, isMobile, isUpdating]);

  return (
    <div className={`relative w-full h-full min-h-[300px] transition-opacity duration-150 ${isUpdating ? 'opacity-95' : 'opacity-100'}`} data-tour="chart-canvas">
      {/* P&L Display - Only show on mobile, positioned above chart */}
      {isMobile && (
  <div className={`absolute top-2 md:-top-10 left-0 z-10 px-2 py-1 ${pnlDisplay.bgColor} rounded-[10px] inline-flex justify-start items-center gap-1`} data-tour="pnl-mobile">
          <div className={`justify-start ${pnlDisplay.textColor} text-lg font-normal font-['Lato']`}>P&L</div>
          <div className="flex justify-start items-center">
            <div className="size-6 relative overflow-hidden flex items-center justify-center">
              {pnlDisplay.isProfit ? (
                // Green up arrow
                <div className="w-3 h-1.5 bg-[#4ba03a] transform rotate-0" style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                }} />
              ) : (
                // Red down arrow  
                <div className="w-3 h-1.5 bg-[#dc2626] transform rotate-180" style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                }} />
              )}
            </div>
            <div className={`justify-center ${pnlDisplay.textColor} text-sm font-bold font-['Lato']`}>
              {pnlDisplay.value}
            </div>
          </div>
        </div>
      )}

      {/* Chart Container with horizontal scroll for mobile and sticky Y-axis */}
      <div className={`w-full h-full ${isMobile ? 'relative' : ''}`}>
        {isMobile ? (
          // Mobile layout with sticky Y-axis
          <div className="flex w-full h-full">
            {/* Scrollable chart area */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[200%] h-full relative">
                <Chart
                  ref={chartRef}
                  type="candlestick"
                  data={chartData}
                  options={{
                    ...options,
                    scales: {
                      ...options.scales,
                      y: {
                        ...options.scales.y,
                        display: false // Hide Y-axis in scrollable area
                      }
                    }
                  }}
                />
              </div>
            </div>
            {/* Sticky Y-axis on the right */}
            <div className="w-16 bg-transparent flex-shrink-0 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {/* Generate Y-axis labels manually with intelligent spacing */}
                {Array.from({ length: 6 }, (_, i) => {
                  const value = yAxisRange.min + (yAxisRange.max - yAxisRange.min) * (5 - i) / 5;
                  // Round to appropriate precision based on step size
                  let displayValue;
                  if (yAxisRange.stepSize < 1) {
                    displayValue = value.toFixed(2);
                  } else if (yAxisRange.stepSize < 10) {
                    displayValue = value.toFixed(1);
                  } else {
                    displayValue = Math.round(value).toString();
                  }
                  return (
                    <div key={i} className="text-right text-xs text-gray-400 font-['Lato']">
                      ${displayValue}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Desktop layout - normal chart
          <div className="w-full h-full">
            <Chart
              ref={chartRef}
              type="candlestick"
              data={chartData}
              options={options}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialChart;
