import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useGameData } from '../hooks/useGameData';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
);

const FinancialChart = ({ useMockData = true, apiData = [], demoData }) => {
  const { marketData, positions, currentMarketPrice, calculatePositionPnL } = useGameContext();
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [chartKey, setChartKey] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [forceRerender, setForceRerender] = useState(0);

  const { candles } = useGameData();
  // set data source based on mode

  // Add smooth transition states
  const [cachedData, setCachedData] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use marketData from context, ensure it's always an array with valid data
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

    // Otherwise, use the same logic as before
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

  // Smooth data updates with throttling
  const smoothDataSource = useMemo(() => {
    // Check if only the last candle has changed (common case for live updates)
    if (cachedData.length > 0 && dataSource.length > 0) {
      const lastCachedCandle = cachedData[cachedData.length - 1];
      const lastNewCandle = dataSource[dataSource.length - 1];
      
      // If only the last candle values changed, smoothly update just that candle
      if (cachedData.length === dataSource.length && 
          lastCachedCandle && lastNewCandle &&
          lastCachedCandle.x === lastNewCandle.x) {
        
        const smoothedData = [...cachedData];
        smoothedData[smoothedData.length - 1] = { ...lastNewCandle };
        
        setCachedData(dataSource);
        return smoothedData;
      }
    }
    
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

  // Calculate viewport for mobile scrolling
  const isMobile = window.innerWidth < 768;
  const visiblePoints = isMobile ? 15 : throttledData.length;
  const startIndex = isMobile ? Math.max(0, throttledData.length - visiblePoints) : 0;

  // Handle page visibility changes (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isPageVisible = !document.hidden;
      setIsVisible(isPageVisible);

      if (isPageVisible) {
        console.log('Page became visible, refreshing chart...');
        // Small delay to ensure the page is fully active
        setTimeout(() => {
          setChartError(null);
          setChartKey(prev => prev + 1);
          setForceRerender(prev => prev + 1);
        }, 100);
      } else {
        console.log('Page became hidden');
      }
    };

    // Add event listeners for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', () => setIsVisible(false));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', () => setIsVisible(false));
    };
  }, []);

  // Reset chart periodically and when page becomes visible again
  useEffect(() => {
    const resetInterval = setInterval(() => {
      if (isVisible) {
        console.log('Periodic chart reset...');
        setChartError(null);
        setChartKey(prev => prev + 1);
        setLastResetTime(Date.now());

        // Clean up old chart instance
        if (chartRef.current) {
          try {
            chartRef.current.destroy();
          } catch (error) {
            console.warn('Error destroying chart during reset:', error);
          }
        }
      }
    }, 120000); // Reset every 2 minutes when page is visible

    return () => clearInterval(resetInterval);
  }, [isVisible]);

  // Force chart recreation when data changes significantly or after becoming visible
  useEffect(() => {
    const now = Date.now();
    if (throttledData.length > 25 && now - lastResetTime > 60000 && isVisible) {
      console.log('Force updating chart due to data accumulation...');
      setChartKey(prev => prev + 1);
      setLastResetTime(now);
    }
  }, [throttledData.length, lastResetTime, isVisible]);

  // Monitor chart health and recreate if needed
  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (isVisible && chartRef.current) {
        try {
          // Check if chart instance is healthy
          const chart = chartRef.current;
          if (!chart.canvas || !chart.canvas.getContext || !chart.ctx) {
            console.warn('Chart canvas context lost, recreating...');
            setChartError('Canvas context lost');
            setChartKey(prev => prev + 1);
          }
        } catch (error) {
          console.warn('Chart health check failed:', error);
          setChartError('Chart instance corrupted');
          setChartKey(prev => prev + 1);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheck);
  }, [isVisible]);

  // Calculate intelligent Y-axis range with smart zoom (same as mobile)
  const { yMin, yMax, xMin, xMax, stepSize } = useMemo(() => {
    if (!throttledData || throttledData.length === 0) {
      return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30, stepSize: 100 };
    }

    try {
      // For mobile, only consider the visible range for Y-axis calculation
      const dataForYAxis = isMobile ? throttledData.slice(startIndex) : throttledData;
      
      // Get price ranges with safety checks
      const allHighs = dataForYAxis.map(d => Number(d.h)).filter(h => !isNaN(h));
      const allLows = dataForYAxis.map(d => Number(d.l)).filter(l => !isNaN(l));
      
      if (allHighs.length === 0 || allLows.length === 0) {
        return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30, stepSize: 100 };
      }

      const min = Math.min(...allLows);
      const max = Math.max(...allHighs);
      const range = max - min;

      // Ensure valid ranges
      if (min >= max || !isFinite(min) || !isFinite(max)) {
        return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30, stepSize: 100 };
      }

      // Intelligent padding based on range size (same as mobile)
      let paddingPercent = 0.05; // Start with 5% padding
      if (range < 10) paddingPercent = 0.15; // 15% for very small ranges
      else if (range < 50) paddingPercent = 0.10; // 10% for small ranges
      else if (range < 200) paddingPercent = 0.08; // 8% for medium ranges

      const padding = range * paddingPercent;
      const paddedMin = min - padding;
      const paddedMax = max + padding;

      // Intelligent step size calculation (same as mobile)
      let stepSize;
      if (range < 5) stepSize = 0.5;     // $0.50 steps for very small ranges
      else if (range < 10) stepSize = 1;  // $1 steps for small ranges
      else if (range < 25) stepSize = 2;  // $2 steps for small-medium ranges
      else if (range < 50) stepSize = 5;  // $5 steps for medium ranges
      else if (range < 100) stepSize = 10; // $10 steps for larger ranges
      else if (range < 500) stepSize = 25; // $25 steps for large ranges
      else stepSize = 50;                  // $50 steps for very large ranges

      // Round bounds to nice numbers based on step size
      const yMin = Math.floor(paddedMin / stepSize) * stepSize;
      const yMax = Math.ceil(paddedMax / stepSize) * stepSize;
      
      // Reduce console logging for smoother performance
      if (Math.random() < 0.1) { // Only log 10% of the time
        console.log(`Desktop chart zoom info - Range: $${range.toFixed(2)}, Step: $${stepSize}, Min: $${yMin.toFixed(2)}, Max: $${yMax.toFixed(2)}`);
      }
      
      // X-axis: For mobile, show viewport range; for desktop, show all data
      let xMin, xMax;
      if (isMobile) {
        xMin = startIndex - 0.5;
        xMax = startIndex + visiblePoints - 0.5;
      } else {
        xMin = -1;
        xMax = Math.max(throttledData.length, 30);
      }

      return { yMin, yMax, xMin, xMax, stepSize };

    } catch (error) {
      console.error('Error calculating axis ranges:', error);
      return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30, stepSize: 100 };
    }
  }, [throttledData, isMobile, startIndex, visiblePoints]);

  // Stable chart data with error handling
  const chartData = useMemo(() => {
    try {
      const datasets = [
        {
          label: 'OHLC Data',
          data: throttledData, // Use throttled data for smooth updates
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
          order: 2, // Render candlesticks behind position lines
        },
      ];

      // Add horizontal lines for each position
      positions.forEach((position) => {
        const profitLoss = calculatePositionPnL(position, currentMarketPrice);
        const isProfit = profitLoss >= 0;

        // Determine color based on position type and current profit/loss
        let lineColor;
        if (position.type === 'long') {
          lineColor = isProfit ? '#22c55e' : '#ef4444'; // Green if profit, red if loss
        } else {
          lineColor = isProfit ? '#22c55e' : '#ef4444'; // Green if profit, red if loss
        }

        // Create horizontal line data across the entire chart width
        const xMin = throttledData.length > 0 ? Math.min(...throttledData.map(d => d.x)) : 0;
        const xMax = throttledData.length > 0 ? Math.max(...throttledData.map(d => d.x)) : 30;

        datasets.push({
          label: `${position.type.toUpperCase()} Entry - $${position.entryPrice.toFixed(2)}`,
          type: 'line',
          data: [
            { x: xMin - 1, y: position.entryPrice },
            { x: xMax + 1, y: position.entryPrice }
          ],
          borderColor: lineColor,
          backgroundColor: lineColor + '20', // Add transparency
          borderWidth: 3, // Make lines more prominent
          borderDash: position.type === 'short' ? [8, 4] : [], // Dashed line for short positions
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: false,
          tension: 0,
          spanGaps: true,
          clip: false, // Allow line to extend beyond data area
          order: 1, // Render position lines above candlesticks
        });
      });

      return { datasets };
    } catch (error) {
      console.error('Error creating chart data:', error);
      setChartError('Failed to create chart data');
      return { datasets: [] };
    }
  }, [throttledData, positions, currentMarketPrice, calculatePositionPnL]);

  // Enhanced options with better error handling and performance
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
    resizeDelay: 0,
    parsing: false,
    normalized: true,
    spanGaps: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    plugins: {
      legend: { 
        display: false, // Hide legend for cleaner look
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: function(context) {
            const point = context[0];
            return `Candle ${point.dataIndex + 1}`;
          },
          label: function(context) {
            const point = context.raw;
            // More precise formatting based on the data range (same as mobile)
            const precision = stepSize < 1 ? 3 : (stepSize < 10 ? 2 : 2);
            return [
              `Open: $${point.o.toFixed(precision)}`,
              `High: $${point.h.toFixed(precision)}`,
              `Low: $${point.l.toFixed(precision)}`,
              `Close: $${point.c.toFixed(precision)}`,
              `Range: $${(point.h - point.l).toFixed(precision)}`
            ];
          }
        }
      },
      // Add zoom plugin for mobile scrolling
      zoom: isMobile ? {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: null, // Allow panning without modifier key
          onPanComplete: ({ chart }) => {
            // Ensure we don't pan beyond data bounds
            const xScale = chart.scales.x;
            const dataLength = throttledData.length;
            
            if (xScale.min < -1) {
              xScale.options.min = -1;
              chart.update('none');
            }
            if (xScale.max > dataLength) {
              xScale.options.max = dataLength;
              chart.update('none');
            }
          }
        },
        zoom: {
          wheel: {
            enabled: false, // Disable zoom to prevent accidental zooming
          },
          pinch: {
            enabled: false, // Disable pinch zoom
          }
        }
      } : undefined,
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: xMin,
        max: xMax,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1,
        },
        ticks: {
          display: isMobile ? true : false, // Show x-axis labels on mobile for reference
          maxTicksLimit: isMobile ? 8 : 6,
          color: '#6b7280',
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          callback: function(value) {
            // Show every few ticks for readability
            return Math.floor(value) % (isMobile ? 2 : 5) === 0 ? Math.floor(value) : '';
          }
        },
        border: {
          display: false,
        }
      },
      y: {
        type: 'linear',
        position: 'right',
        min: yMin,
        max: yMax,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 8 : 10, // More ticks for better granularity
          color: '#6b7280',
          font: {
            size: window.innerWidth < 768 ? 11 : 12,
            weight: '500'
          },
          stepSize: stepSize, // Use intelligent step size
          callback: function(value) {
            // Format based on step size for better readability (same as mobile)
            if (stepSize < 1) {
              return '$' + value.toFixed(2); // Show cents for very small steps
            } else if (stepSize < 10) {
              return '$' + value.toFixed(1); // Show one decimal for small steps
            } else {
              return '$' + Math.round(value); // Show whole numbers for larger steps
            }
          }
        },
        border: {
          display: false,
        }
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    onHover: (event, elements) => {
      if (event && event.native && event.native.target) {
        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
  }), [yMin, yMax, xMin, xMax, isMobile, throttledData.length, stepSize, isUpdating]);

  // Enhanced error boundary for chart rendering
  const renderChart = useCallback(() => {
    try {
      if (chartError) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
            <div>Chart Error: {chartError}</div>
            <button
              onClick={() => {
                setChartError(null);
                setChartKey(prev => prev + 1);
                setForceRerender(prev => prev + 1);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        );
      }

      if (!throttledData || throttledData.length === 0) {
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading chart data...
          </div>
        );
      }

      if (!isVisible) {
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Chart paused (tab not active)
          </div>
        );
      }

      return (
        <Chart
          key={`${chartKey}-${forceRerender}`}
          ref={chartRef}
          type="candlestick"
          data={chartData}
          options={options}
          fallbackContent={
            <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
              <div>Chart failed to load</div>
              <button
                onClick={() => {
                  setChartError(null);
                  setChartKey(prev => prev + 1);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Refresh Chart
              </button>
            </div>
          }
        />
      );
    } catch (error) {
      console.error('Chart rendering error:', error);
      setChartError(error.message || 'Unknown chart error');
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
          <div>Chart rendering failed</div>
          <button
            onClick={() => {
              setChartError(null);
              setChartKey(prev => prev + 1);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      );
    }
  }, [chartKey, forceRerender, chartData, options, throttledData, isVisible, chartError]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50 rounded-[10px] shadow-lg flex flex-col overflow-hidden relative">
      
      {/* Scroll hint for mobile */}
      {isMobile && throttledData.length > visiblePoints && (
        <div className="absolute bottom-2 right-2 z-10">
          <div className="px-2 py-1 bg-black/50 rounded text-white text-xs">
            ← Swipe to scroll →
          </div>
        </div>
      )}
      
      {/* Chart Container - Adaptive height that fills available space */}
      <div className={`relative flex-1 w-full p-2 md:p-4 min-h-0 ${isMobile ? 'overflow-x-auto overflow-y-hidden' : ''}`}>
        <div className={isMobile ? 'w-[200%] h-full' : 'w-full h-full'}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FinancialChart);
