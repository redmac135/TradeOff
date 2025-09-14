import React from 'react';
import { useGameContext } from '../context/GameContext';
import { useOnboarding } from '../context/OnboardingContext';

const PositionList = ({ demoData }) => {
  const { positions, currentMarketPrice, calculatePositionPnL, investEaseAmount } = useGameContext();
  const { isDemoMode, getCurrentDemoPrice } = useOnboarding();
  
  // Use demo data if provided, otherwise use real positions
  const displayPositions = demoData || positions;
  const displayPrice = isDemoMode ? getCurrentDemoPrice() : currentMarketPrice;
  
  // Calculate InvestEase profit (current amount - level amount)
  const getInitialAmount = () => {
    const level = localStorage.getItem('selectedLevel');
    switch(level) {
      case 'easy': return 1000;
      case 'medium': return 5000;
      case 'hard': return 15000;
      default: return 1000; // Default to easy level amount
    }
  };
  const initialAmount = getInitialAmount();
  const investEaseProfit = investEaseAmount - initialAmount;
  
  // Simple P&L calculation for demo mode
  const calculateDemoPnL = (position, currentPrice) => {
    const priceChange = currentPrice - position.entryPrice;
    const percentChange = priceChange / position.entryPrice;
    
    if (position.type === 'long') {
      return position.investment * percentChange;
    } else if (position.type === 'short') {
      return position.investment * (-percentChange);
    }
    return 0;
  };

  if (displayPositions.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Amount made by RBC InvestEase</div>
          <div className="text-lg font-bold text-gray-600">
            {investEaseProfit.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {displayPositions.map((position) => {
        const profitLoss = isDemoMode 
          ? calculateDemoPnL(position, displayPrice)
          : calculatePositionPnL(position, currentMarketPrice);
        const profitLossPercent = (profitLoss / position.investment) * 100;
        const isProfit = profitLoss >= 0;
        
        return (
          <div key={position.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  position.type === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {position.type.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">
                  Entry: ${position.entryPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  ${position.investment.toLocaleString()}
                </div>
                <div className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {isProfit ? '+' : ''}${profitLoss.toFixed(2)} ({profitLossPercent.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PositionList;
