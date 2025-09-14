import React, { useRef, useMemo } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';
import { useGameContext } from '../context/GameContext';

// Register Chart.js components
ChartJS.register(...registerables, CandlestickController, CandlestickElement);

const FinancialChart = ({ useMockData = true, apiData = [], demoData }) => {
  const { marketData, positions, currentMarketPrice, calculatePositionPnL, totalPnL } = useGameContext();
  const chartRef = useRef(null);

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

  // Simple data processing
  const processedData = useMemo(() => {
    const data = demoData || (useMockData ? marketData : apiData);
    if (!Array.isArray(data) || data.length === 0) return [];
    
    return data.filter(item => 
      item && 
      typeof item.x === 'number' && 
      typeof item.o === 'number' && 
      typeof item.h === 'number' && 
      typeof item.l === 'number' && 
      typeof item.c === 'number' &&
      !isNaN(item.x) && !isNaN(item.o) && !isNaN(item.h) && !isNaN(item.l) && !isNaN(item.c)
    ).map((item, index) => ({
      ...item,
      x: index
    }));
  }, [useMockData, marketData, apiData, demoData]);

  // Mobile data windowing - show last 12 candlesticks for better mobile experience
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const mobileDisplayData = useMemo(() => {
    if (isMobile && processedData.length > 12) {
      return processedData.slice(-12);
    }
    return processedData;
  }, [processedData, isMobile]);

  const chartData = useMemo(() => {
    const displayData = isMobile ? mobileDisplayData : processedData;
    
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
  }, [mobileDisplayData, processedData, positions, currentMarketPrice, calculatePositionPnL, isMobile]);

  // Calculate Y axis range - round to nearest 100
  const yAxisRange = useMemo(() => {
    const displayData = isMobile ? mobileDisplayData : processedData;
    if (displayData.length === 0) return { min: 8000, max: 10000 };

    const allHighs = displayData.map(d => d.h);
    const allLows = displayData.map(d => d.l);
    const min = Math.min(...allLows);
    const max = Math.max(...allHighs);
    const padding = (max - min) * 0.1;

    // Round to nearest 100 for better spacing
    const roundedMin = Math.floor((min - padding) / 100) * 100;
    const roundedMax = Math.ceil((max + padding) / 100) * 100;

    return {
      min: roundedMin,
      max: roundedMax
    };
  }, [mobileDisplayData, processedData, isMobile]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
            return [
              `Open: $${point.o.toFixed(2)}`,
              `High: $${point.h.toFixed(2)}`,
              `Low: $${point.l.toFixed(2)}`,
              `Close: $${point.c.toFixed(2)}`
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
          font: { size: isMobile ? 10 : 12 },
          maxTicksLimit: isMobile ? 6 : 8,
          stepSize: 100, // Force 100-unit steps
          callback: function(value) {
            return '$' + Math.round(value / 100) * 100; // Round to nearest 100
          }
        },
        border: { display: false }
      }
    },
    elements: {
      point: { radius: 0 }
    }
  }), [yAxisRange, isMobile]);

  return (
    <div className="relative w-full h-full">
      {/* P&L Display - Only show on mobile, positioned above chart */}
      {isMobile && (
        <div className={`absolute -top-12 left-0 z-10 px-2 py-1 ${pnlDisplay.bgColor} rounded-[10px] inline-flex justify-start items-center gap-1`}>
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
                {/* Generate Y-axis labels manually */}
                {Array.from({ length: 6 }, (_, i) => {
                  const value = yAxisRange.min + (yAxisRange.max - yAxisRange.min) * (5 - i) / 5;
                  const roundedValue = Math.round(value / 100) * 100;
                  return (
                    <div key={i} className="text-right text-xs text-gray-400 font-['Lato']">
                      ${roundedValue}
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
