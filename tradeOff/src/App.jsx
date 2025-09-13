import React from 'react';
import Navbar from './components/Navbar';
import FinancialChart from './components/FinancialChart';
import MarketNews from './components/MarketNews';
import Card from './components/Card';
import PositionControl from './components/PositionControl';
import './App.css';

function App() {
  // Always use mock data for now (can be changed internally later)
  const useMockData = true;
  const apiData = [];

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 px-4 py-6 overflow-hidden min-h-0">
        <div className="h-full flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Main Chart Area */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
            <div className="flex-1 overflow-hidden min-h-0">
              <FinancialChart useMockData={useMockData} apiData={apiData} />
            </div>
            <div className="flex-shrink-0 h-24">
              <PositionControl />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <MarketNews />
            </div>
            <Card title="Cash Position" value={50000} type="cash" />
            <Card title="Equity Position" value="15 positions" type="equity" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;