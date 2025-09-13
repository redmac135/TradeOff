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

const FinancialChart = ({ useMockData = true, apiData = [] }) => {
  const { marketData, positions, currentMarketPrice, calculatePositionPnL } = useGameContext();
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [chartKey, setChartKey] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [forceRerender, setForceRerender] = useState(0);

  // Use marketData from context, ensure it's always an array with valid data
  const dataSource = useMemo(() => {
    const data = useMockData ? marketData : apiData;
    if (!Array.isArray(data)) return [];
    
    // Validate and clean data, and convert to sequential index instead of time-based
    const validData = data.filter(item => 
      item && 
      typeof item.x === 'number' && 
      typeof item.o === 'number' && 
      typeof item.h === 'number' && 
      typeof item.l === 'number' && 
      typeof item.c === 'number' &&
      !isNaN(item.x) && !isNaN(item.o) && !isNaN(item.h) && !isNaN(item.l) && !isNaN(item.c) &&
      item.h >= item.l && // High should be >= Low
      item.h >= Math.max(item.o, item.c) && // High should be >= Open and Close
      item.l <= Math.min(item.o, item.c) // Low should be <= Open and Close
    ).slice(-30); // Keep only last 30 for performance

    // Convert to sequential indexing to avoid gaps
    return validData.map((item, index) => ({
      ...item,
      x: index // Use sequential index instead of timestamp
    }));
  }, [useMockData, marketData, apiData]);

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
      // Get price ranges with safety checks
      const allHighs = dataSource.map(d => Number(d.h)).filter(h => !isNaN(h));
      const allLows = dataSource.map(d => Number(d.l)).filter(l => !isNaN(l));
      
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
      
      // X-axis: use sequential indexing (0 to length-1) with small buffer
      const xMin = -1;
      const xMax = Math.max(dataSource.length, 30);

      return { yMin, yMax, xMin, xMax };
      
    } catch (error) {
      console.error('Error calculating axis ranges:', error);
      return { yMin: 8000, yMax: 10000, xMin: 0, xMax: 30 };
    }
  }, [dataSource]);

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
        display: positions.length > 0,
        position: 'top',
        labels: {
          filter: (legendItem) => {
            // Only show position lines in legend, not OHLC data
            return legendItem.text && legendItem.text.includes('Entry');
          },
          usePointStyle: true,
          pointStyle: 'line',
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            return labels.map(label => {
              if (label.text && label.text.includes('Entry')) {
                // Customize position line labels
                const position = positions.find(p => 
                  label.text.includes(p.type.toUpperCase()) && 
                  label.text.includes(p.entryPrice.toFixed(2))
                );
                if (position) {
                  const profitLoss = calculatePositionPnL(position, currentMarketPrice);
                  const status = profitLoss >= 0 ? '📈' : '📉';
                  label.text = `${status} ${position.type.toUpperCase()} @ $${position.entryPrice.toFixed(2)}`;
                }
              }
              return label;
            });
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        filter: (tooltipItem) => {
          // Allow both OHLC data and position lines
          return tooltipItem && (
            (tooltipItem.raw && typeof tooltipItem.raw === 'object') || // OHLC data
            (tooltipItem.parsed && typeof tooltipItem.parsed.y === 'number') // Position lines
          );
        },
        callbacks: {
          title: (context) => {
            try {
              if (!context || !context[0]) return 'No data';
              const dataset = context[0].dataset;
              
              // Check if this is a position line
              if (dataset.label && dataset.label.includes('Entry')) {
                return dataset.label;
              }
              
              // Regular OHLC data
              if (!context[0].raw) return 'No data';
              const dataPoint = context[0].raw;
              return `Data Point: ${Math.floor(dataPoint.x) + 1}`;
            } catch {
              return 'Invalid data point';
            }
          },
          label: (context) => {
            try {
              const dataset = context.dataset;
              
              // Check if this is a position line
              if (dataset.label && dataset.label.includes('Entry')) {
                const price = context.parsed.y;
                const position = positions.find(p => Math.abs(p.entryPrice - price) < 0.01);
                if (position) {
                  const profitLoss = calculatePositionPnL(position, currentMarketPrice);
                  const profitLossPercent = (profitLoss / position.investment) * 100;
                  return [
                    `Entry Price: $${position.entryPrice.toFixed(2)}`,
                    `Investment: $${position.investment.toLocaleString()}`,
                    `Current P&L: ${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${profitLossPercent.toFixed(1)}%)`,
                    `Type: ${position.type.toUpperCase()}`
                  ];
                }
                return `Entry Price: $${price.toFixed(2)}`;
              }
              
              // Regular OHLC data
              if (!context || !context.raw) return 'No data';
              const dataPoint = context.raw;
              return [
                `Open: $${Number(dataPoint.o).toFixed(2)}`,
                `High: $${Number(dataPoint.h).toFixed(2)}`,
                `Low: $${Number(dataPoint.l).toFixed(2)}`,
                `Close: $${Number(dataPoint.c).toFixed(2)}`,
              ];
            } catch {
              return 'Invalid data';
            }
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear', // Changed from 'time' to 'linear'
        min: xMin,
        max: xMax,
        ticks: {
          color: '#949494',
          font: { size: 12, family: 'Roboto' },
          maxTicksLimit: 10,
          autoSkip: true,
          callback: function(value) {
            // Show cleaner tick labels (every few points)
            return Math.floor(value) % 5 === 0 ? `${Math.floor(value)}` : '';
          }
        },
        grid: { 
          color: '#e5e7eb', 
          lineWidth: 1,
          display: true,
        },
        title: {
          display: true,
          text: 'Data Points',
          color: '#666',
          font: { size: 10 }
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        min: yMin,
        max: yMax,
        ticks: {
          callback: (value) => {
            try {
              return `$${Number(value).toLocaleString()}`;
            } catch {
              return `$${value}`;
            }
          },
          color: '#949494',
          font: { size: 12, family: 'Roboto' },
          maxTicksLimit: 8,
          precision: 0,
        },
        grid: { 
          color: '#e5e7eb', 
          lineWidth: 1,
          display: true,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    onHover: (event, elements) => {
      if (event && event.native && event.native.target) {
        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
  }), [yMin, yMax, xMin, xMax, positions, currentMarketPrice, calculatePositionPnL]);

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
    <div ref={containerRef} className="w-full flex-1 bg-gray-50 rounded-[10px] shadow-lg p-6 flex flex-col overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Financial Chart - {useMockData ? 'Live Mock Data (Sequential Updates)' : 'API Data'}
          {!isVisible && ' - PAUSED'}
        </h3>
        <p className="text-sm text-gray-600">
          Real-time price data with automatic scaling ({dataSource.length} data points)
          {chartError && <span className="text-red-500 ml-2">- Error: {chartError}</span>}
        </p>
      </div>
      <div className="relative h-[700px] w-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default React.memo(FinancialChart);
