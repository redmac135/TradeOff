import React from 'react';
import { useGameContext } from '../context/GameContext';

const PositionList = () => {
  const { positions, currentMarketPrice, calculatePositionPnL } = useGameContext();

  if (positions.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Amount made by RBC InvestEase</div>
          <div className="text-lg font-bold text-gray-600">
            $0.00
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {positions.map((position) => {
        const profitLoss = calculatePositionPnL(position, currentMarketPrice);
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
