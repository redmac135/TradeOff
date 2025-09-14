import React from 'react';
import FinancialChart from './FinancialChart_mobile';

// Test component to verify mobile chart functionality
const TestMobileChart = () => {
  // Create demo data with enough points to test scrolling (30 points)
  const testData = Array.from({ length: 30 }, (_, i) => ({
    x: Date.now() + i * 60000, // 1 minute intervals
    o: 9000 + Math.random() * 100,
    h: 9050 + Math.random() * 100, 
    l: 8950 + Math.random() * 100,
    c: 9000 + Math.random() * 100
  }));

  return (
    <div className="w-full h-96 p-4">
      <h2 className="text-lg font-bold mb-4">Mobile Chart Test (30 data points)</h2>
      <div className="border border-gray-300 rounded-lg h-80">
        <FinancialChart 
          useMockData={false} 
          demoData={testData}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        On mobile (width less than 768px): Shows last 12 candlesticks with horizontal scroll
        <br />
        On desktop: Shows all 30 candlesticks
      </p>
    </div>
  );
};

export default TestMobileChart;
