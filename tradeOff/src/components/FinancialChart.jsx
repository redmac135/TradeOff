import React, { useMemo, useRef, useState, useEffect } from 'react';
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

// Generate initial mock data
const generateInitialData = () => {
  const data = [];
  let lastClose = 9000;
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - (30 - i) * 5000); // 5 seconds apart
    const open = +(lastClose + (Math.random() - 0.5) * 100).toFixed(2);
    const close = +(open + (Math.random() - 0.5) * 200).toFixed(2);
    const high = +(Math.max(open, close) + Math.random() * 50).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * 50).toFixed(2);

    data.push({
      x: date.getTime(),
      o: open,
      h: high,
      l: low,
      c: close,
    });
    
    lastClose = close;
  }
  return data;
};

const FinancialChart = ({ useMockData = true, apiData = [] }) => {
  const chartRef = useRef(null);
  const [mockData, setMockData] = useState(generateInitialData);

  // Update mock data every 5 seconds
  useEffect(() => {
    if (!useMockData) return;

    const interval = setInterval(() => {
      setMockData(prevData => {
        const newData = [...prevData];
        const lastCandle = newData[newData.length - 1];
        
        // Generate new candlestick data
        const open = lastCandle.c;
        const close = +(open + (Math.random() - 0.5) * 200).toFixed(2);
        const high = +(Math.max(open, close) + Math.random() * 50).toFixed(2);
        const low = +(Math.min(open, close) - Math.random() * 50).toFixed(2);

        // Add new candle
        newData.push({
          x: Date.now(),
          o: open,
          h: high,
          l: low,
          c: close,
        });

        // Keep only last 30 candles for performance
        return newData.slice(-30);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [useMockData]);

  const dataSource = useMemo(() => (useMockData ? mockData : apiData), [useMockData, mockData, apiData]);

  // Memoize chart data for candlestick chart
  const chartData = useMemo(() => ({
    datasets: [
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
      },
    ],
  }), [dataSource]);

  // Memoize options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 0,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: (context) => {
            const dataPoint = context[0].raw;
            return `Time: ${new Date(dataPoint.x).toLocaleTimeString()}`;
          },
          label: (context) => {
            const dataPoint = context.raw;
            return [
              `Open: $${dataPoint.o}`,
              `High: $${dataPoint.h}`,
              `Low: $${dataPoint.l}`,
              `Close: $${dataPoint.c}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'second',
          displayFormats: {
            second: 'HH:mm:ss',
          },
        },
        ticks: {
          color: '#949494',
          font: { size: 12, family: 'Roboto' },
        },
        grid: { color: '#e5e7eb', lineWidth: 1 },
      },
      y: {
        type: 'linear',
        position: 'left',
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
          color: '#949494',
          font: { size: 12, family: 'Roboto' },
        },
        grid: { color: '#e5e7eb', lineWidth: 1 },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
  }), []);

  return (
    <div className="w-full flex-1 bg-gray-50 rounded-[10px] shadow-lg p-6 flex flex-col overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Financial Chart - {useMockData ? 'Live Mock Data (5s updates)' : 'API Data'}
        </h3>
      </div>
      <div className="relative h-[700px] w-full">
        <Chart ref={chartRef} type="candlestick" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default React.memo(FinancialChart);
