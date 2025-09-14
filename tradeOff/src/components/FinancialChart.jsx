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

  // Use marketData from context, ensure it's always an array with valid data
  const dataSource = useMemo(() => {
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

    // Convert to sequential indexing to avoid gaps
    return mapped;
  }, [useMockData, marketData, apiData, demoData, candles]);

  // Calculate viewport for mobile scrolling
  const isMobile = window.innerWidth < 768;
  const visiblePoints = isMobile ? 15 : dataSource.length;
  const startIndex = isMobile ? Math.max(0, dataSource.length - visiblePoints) : 0;

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
    if (dataSource.length > 25 && now - lastResetTime > 60000 && isVisible) {
      console.log('Force updating chart due to data accumulation...');
      setChartKey(prev => prev + 1);
      setLastResetTime(now);
    }
  }, [dataSource.length, lastResetTime, isVisible]);

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

  // Calculate safe axis ranges
  const { yMin, yMax, xMin, xMax } = useMemo(() => {
    if (!dataSource || dataSource.length === 0) {
      return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30 };
    }

    try {
      // For mobile, only consider the visible range for Y-axis calculation
      const dataForYAxis = isMobile ? dataSource.slice(startIndex) : dataSource;
      
      // Get price ranges with safety checks
      const allHighs = dataForYAxis.map(d => Number(d.h)).filter(h => !isNaN(h));
      const allLows = dataForYAxis.map(d => Number(d.l)).filter(l => !isNaN(l));
      
      if (allHighs.length === 0 || allLows.length === 0) {
        return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30 };
      }

      const currentMin = Math.min(...allLows);
      const currentMax = Math.max(...allHighs);

      // Ensure valid ranges
      if (currentMin >= currentMax || !isFinite(currentMin) || !isFinite(currentMax)) {
        return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30 };
      }

      // Calculate padding (5% on each side, minimum $50)
      const range = currentMax - currentMin;
      const padding = Math.max(range * 0.05, 50);

      // Round to nice numbers for better visualization
      const yMin = Math.floor((currentMin - padding) / 10) * 10;
      const yMax = Math.ceil((currentMax + padding) / 10) * 10;
      
      // X-axis: For mobile, show viewport range; for desktop, show all data
      let xMin, xMax;
      if (isMobile) {
        xMin = startIndex - 0.5;
        xMax = startIndex + visiblePoints - 0.5;
      } else {
        xMin = -1;
        xMax = Math.max(dataSource.length, 30);
      }

      return { yMin, yMax, xMin, xMax };

    } catch (error) {
      console.error('Error calculating axis ranges:', error);
      return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30 };
    }
  }, [dataSource, isMobile, startIndex, visiblePoints]);

  // Stable chart data with error handling
  const chartData = useMemo(() => {
    try {
      const datasets = [
        {
          label: 'OHLC Data',
          data: dataSource,
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
        const xMin = dataSource.length > 0 ? Math.min(...dataSource.map(d => d.x)) : 0;
        const xMax = dataSource.length > 0 ? Math.max(...dataSource.map(d => d.x)) : 30;

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
  }, [dataSource, positions, currentMarketPrice, calculatePositionPnL]);

  // Enhanced options with better error handling and performance
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
            return [
              `Open: $${point.o.toFixed(2)}`,
              `High: $${point.h.toFixed(2)}`,
              `Low: $${point.l.toFixed(2)}`,
              `Close: $${point.c.toFixed(2)}`
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
            const dataLength = dataSource.length;
            
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
          maxTicksLimit: window.innerWidth < 768 ? 4 : 6,
          color: '#6b7280',
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
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
  }), [yMin, yMax, xMin, xMax, isMobile, dataSource.length]);

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

      if (!dataSource || dataSource.length === 0) {
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
  }, [chartKey, forceRerender, chartData, options, dataSource, isVisible, chartError]);

  return (
    <div ref={containerRef} className="w-full flex-1 bg-gray-50 rounded-[10px] shadow-lg flex flex-col overflow-hidden relative">
      
      {/* Scroll hint for mobile */}
      {isMobile && dataSource.length > visiblePoints && (
        <div className="absolute bottom-2 right-2 z-10">
          <div className="px-2 py-1 bg-black/50 rounded text-white text-xs">
            ← Swipe to scroll →
          </div>
        </div>
      )}
      
      {/* Chart Container */}
      <div className={`relative h-48 md:h-64 lg:h-80 xl:h-96 w-full p-2 md:p-4 ${isMobile ? 'overflow-x-auto overflow-y-hidden' : ''}`}>
        <div className={isMobile ? 'w-[200%] h-full' : 'w-full h-full'}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FinancialChart);
