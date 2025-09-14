import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContext } from './context/GameContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import Navbar from './components/Navbar';
import FinancialChart from './components/FinancialChart';
import MarketNews from './components/MarketNews';
import Card from './components/Card';
import PositionControl from './components/PositionControl';
import PositionList from './components/PositionList';
import OnboardingPromptModal from './components/OnboardingPromptModal';
import OnboardingTour from './components/OnboardingTour';
import './App.css';

// Generate initial mock market data
const generateInitialMarketData = () => {
  const data = [];
  let lastClose = 9000;

  for (let i = 0; i < 30; i++) {
    const open = +(lastClose + (Math.random() - 0.5) * 100).toFixed(2);
    const close = +(open + (Math.random() - 0.5) * 200).toFixed(2);
    const high = +(Math.max(open, close) + Math.random() * 50).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * 50).toFixed(2);

    data.push({
      x: i, // Use sequential index instead of timestamp
      o: open,
      h: high,
      l: low,
      c: close,
    });
    
    lastClose = close;
  }
  return data;
};

// Initial news items
const initialNewsItems = [
  {
    title: "Housing prices in Toronto up by 5%.",
    description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
    priority: "high",
    timestamp: Date.now()
  },
  {
    title: "Tech stocks showing strong performance.",
    description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
    priority: "medium",
    timestamp: Date.now() - 60000
  },
  {
    title: "Bank of Canada announces interest rate decision.",
    description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
    priority: "medium",
    timestamp: Date.now() - 120000
  }
];

function GameApp() {
  // Get onboarding state to pause timer during onboarding
  const { isOnboardingActive } = useOnboarding();
  
  // Centralized State Management
  const [cash, setCash] = useState(50000); // Starting cash
  const [positions, setPositions] = useState([]); // Array of open trades
  const [marketData, setMarketData] = useState(generateInitialMarketData); // Chart data
  const [newsItems, setNewsItems] = useState(initialNewsItems); // News headlines
  const [gameTimer, setGameTimer] = useState(180); // 180 seconds countdown
  const [userGoal, setUserGoal] = useState({ name: 'First Car', amount: 15000 }); // User goal
  const [isPageVisible, setIsPageVisible] = useState(true); // Track page visibility
  const [realizedPnL, setRealizedPnL] = useState(0); // Track realized P&L from closed positions

  // Always use mock data for now (can be changed internally later)
  const useMockData = false;

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);
      console.log('Page visibility changed:', isVisible ? 'visible' : 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => setIsPageVisible(true));
    window.addEventListener('blur', () => setIsPageVisible(false));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => setIsPageVisible(true));
      window.removeEventListener('blur', () => setIsPageVisible(false));
    };
  }, []);

  // Current market price (latest close price)
  const currentMarketPrice = useMemo(() => {
    if (marketData.length === 0) return 0;
    return marketData[marketData.length - 1].c;
  }, [marketData]);

  // Calculate profit/loss for a position
  const calculatePositionPnL = useCallback((position, currentPrice) => {
    if (!position || !currentPrice) return 0;
    
    const priceChange = currentPrice - position.entryPrice;
    const percentChange = priceChange / position.entryPrice;
    
    if (position.type === 'long') {
      return position.investment * percentChange;
    } else if (position.type === 'short') {
      return position.investment * (-percentChange);
    }
    return 0;
  }, []);

  // Calculate total equity from positions
  const totalEquity = useMemo(() => {
    return positions.reduce((total, position) => {
      const currentValue = position.investment;
      const profitLoss = calculatePositionPnL(position, currentMarketPrice);
      return total + currentValue + profitLoss;
    }, 0);
  }, [positions, currentMarketPrice, calculatePositionPnL]);

  // Calculate pure P&L (profit/loss only, not including investments)
  const totalPnL = useMemo(() => {
    const unrealized = positions.reduce((total, position) => {
      const profitLoss = calculatePositionPnL(position, currentMarketPrice);
      return total + profitLoss;
    }, 0);

    return realizedPnL + unrealized;
  }, [positions, currentMarketPrice, calculatePositionPnL, realizedPnL]);

  // Handle trade execution
  const handleTrade = (tradeType, percentage) => {
    console.log('handleTrade called with:', { tradeType, percentage, cash, currentMarketPrice });
    
    try {
      const tradeAmount = (cash * percentage) / 100;
      
      // Check if user has enough cash
      if (tradeAmount > cash) {
        console.log('Insufficient funds');
        alert('Insufficient funds for this trade!');
        return false;
      }

      if (tradeAmount < 100) {
        console.log('Trade amount too small:', tradeAmount);
        alert('Minimum trade amount is $100');
        return false;
      }

      if (!currentMarketPrice || currentMarketPrice <= 0) {
        console.log('Invalid market price:', currentMarketPrice);
        alert('Market price not available. Please wait for data to load.');
        return false;
      }

      // Create new position
      const newPosition = {
        id: Date.now(), // Simple ID based on timestamp
        type: tradeType, // 'long' or 'short'
        entryPrice: currentMarketPrice,
        investment: tradeAmount,
        timestamp: Date.now()
      };

      console.log('Creating new position:', newPosition);

      // Update states
      setCash(prevCash => {
        const newCash = prevCash - tradeAmount;
        console.log('Updating cash from', prevCash, 'to', newCash);
        return newCash;
      });
      
      setPositions(prevPositions => {
        const newPositions = [...prevPositions, newPosition];
        console.log('Updating positions from', prevPositions.length, 'to', newPositions.length);
        return newPositions;
      });

      console.log('Trade executed successfully');
      return true;
      
    } catch (error) {
      console.error('Error in handleTrade:', error);
      alert('An error occurred while executing the trade: ' + error.message);
      return false;
    }
  };

  // Handle position closing (sell)
  const handleSellPosition = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return false;

    const profitLoss = calculatePositionPnL(position, currentMarketPrice);
    const totalReturn = position.investment + profitLoss;

    // Update cash with the return
    setCash(prevCash => prevCash + totalReturn);
    
  // Accumulate realized profit/loss
  setRealizedPnL(prev => prev + profitLoss);
    
    // Remove position from array
    setPositions(prevPositions => prevPositions.filter(p => p.id !== positionId));

    return { totalReturn, profitLoss };
  };

  // Handle selling all positions
  const handleSellAllPositions = () => {
    let totalReturn = 0;
    let totalProfitLoss = 0;

    positions.forEach(position => {
      const profitLoss = calculatePositionPnL(position, currentMarketPrice);
      totalReturn += position.investment + profitLoss;
      totalProfitLoss += profitLoss;
    });

    setCash(prevCash => prevCash + totalReturn);
    setPositions([]);

  // Accumulate all realized P&L
  setRealizedPnL(prev => prev + totalProfitLoss);

    return { totalReturn, totalProfitLoss };
  };

  // Update market data every 5 seconds (simulating real-time data)
  useEffect(() => {
    if (!useMockData) return;

    const interval = setInterval(() => {
      // Only update when page is visible to prevent issues when tab is inactive
      if (!isPageVisible) {
        console.log('Skipping market data update - page not visible');
        return;
      }

      setMarketData(prevData => {
        try {
          const newData = [...prevData];
          const lastCandle = newData[newData.length - 1];
          
          if (!lastCandle || typeof lastCandle.c !== 'number') {
            console.warn('Invalid last candle data, skipping update');
            return prevData;
          }
          
          // Generate new candlestick data with better constraints
          const open = Number(lastCandle.c);
          const volatility = Math.min(200, Math.max(50, Math.abs(open) * 0.02)); // 2% volatility
          const priceChange = (Math.random() - 0.5) * volatility;
          const close = Number((open + priceChange).toFixed(2));
          
          // Ensure valid high/low values
          const tempHigh = Math.max(open, close) + Math.random() * (volatility * 0.25);
          const tempLow = Math.min(open, close) - Math.random() * (volatility * 0.25);
          
          const high = Number(tempHigh.toFixed(2));
          const low = Number(tempLow.toFixed(2));

          // Validate the data before adding
          if (!isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close) ||
              high < Math.max(open, close) || low > Math.min(open, close)) {
            console.warn('Generated invalid candle data, skipping update');
            return prevData;
          }

          // Add new candle with sequential index
          const newCandle = {
            x: newData.length, // Use sequential index
            o: open,
            h: high,
            l: low,
            c: close,
          };

          newData.push(newCandle);

          // Keep only last 30 candles for performance and prevent memory issues
          const trimmedData = newData.slice(-30);
          
          // Re-index the trimmed data to maintain sequential order
          const reindexedData = trimmedData.map((item, index) => ({
            ...item,
            x: index
          }));
          
          return reindexedData;
        } catch (error) {
          console.error('Error updating market data:', error);
          return prevData;
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [useMockData, isPageVisible]);

  // Game timer countdown (pause when page is not visible or during onboarding)
  useEffect(() => {
    if (gameTimer <= 0) return;

    const timer = setInterval(() => {
      // Only countdown when page is visible and not in onboarding
      if (!isPageVisible || isOnboardingActive) {
        console.log('Timer paused - page not visible or onboarding active');
        return;
      }

      setGameTimer(prevTimer => {
        if (prevTimer <= 1) {
          // Game over logic can be added here
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameTimer, isPageVisible, isOnboardingActive]);

  // Simulate occasional news updates
  useEffect(() => {
    const newsInterval = setInterval(() => {
      // Random chance to add new news
      if (Math.random() < 0.3) {
        const newNewsItem = {
          title: `Market update: Price movement detected at $${currentMarketPrice.toFixed(2)}`,
          description: "Automated market analysis indicates significant price movement in the current trading session.",
          priority: "medium",
          timestamp: Date.now()
        };
        
        setNewsItems(prevNews => [newNewsItem, ...prevNews.slice(0, 5)]); // Keep only 6 most recent
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(newsInterval);
  }, [currentMarketPrice]);

  // Game context value
  const gameContextValue = {
    // State
    cash,
    positions,
    marketData,
    newsItems,
    gameTimer,
    userGoal,
    currentMarketPrice,
    totalEquity,
  totalPnL,
  realizedPnL,
    
    // Actions
    handleTrade,
    handleSellPosition,
    handleSellAllPositions,
    calculatePositionPnL,
    
    // Setters (for direct updates if needed)
    setCash,
    setPositions,
    setMarketData,
    setNewsItems,
    setGameTimer,
    setUserGoal
  };

  return (
    <GameContext.Provider value={gameContextValue}>
      <AppContent />
    </GameContext.Provider>
  );
}

// New component to handle the onboarding logic
const AppContent = () => {
  const { isDemoMode, demoMarketData, demoNewsItems, demoCash, demoPositions } = useOnboarding();
  const gameContext = React.useContext(GameContext);
  
  // Use demo data when in onboarding mode, otherwise use real game data
  const displayData = {
    cash: isDemoMode ? demoCash : gameContext.cash,
    positions: isDemoMode ? demoPositions : gameContext.positions,
    marketData: isDemoMode ? demoMarketData : gameContext.marketData,
    newsItems: isDemoMode ? demoNewsItems : gameContext.newsItems,
    currentMarketPrice: isDemoMode ? (demoMarketData[demoMarketData.length - 1]?.c || 9000) : gameContext.currentMarketPrice,
    totalPnL: isDemoMode ? calculateDemoPnL(demoPositions, demoMarketData) : gameContext.totalPnL,
  };

  return (
    <>
      <OnboardingPromptModal />
      <OnboardingTour />
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden" data-tour="welcome">
        <Navbar />
        
        {/* Hidden element for final tour step */}
        <div data-tour="final" className="sr-only">Final step marker</div>
        
        <main className="flex-1 px-4 py-6 overflow-hidden min-h-0">
          <div className="h-full flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Main Chart Area */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
              <div className="flex-1 overflow-hidden min-h-0" data-tour="chart">
                <FinancialChart 
                  useMockData={true} 
                  apiData={[]} 
                  demoData={isDemoMode ? demoMarketData : undefined}
                />
              </div>
              <div className="flex-shrink-0 h-24" data-tour="demo-trade">
                <PositionControl />
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 overflow-hidden" data-tour="news-feed">
                <MarketNews demoData={isDemoMode ? demoNewsItems : undefined} />
              </div>
              <div data-tour="positions">
                <PositionList demoData={isDemoMode ? demoPositions : undefined} />
              </div>
              <div data-tour="cash">
                <Card title="Your Cash" value={displayData.cash} type="cash" />
              </div>
              <div data-tour="pnl">
                <Card title="Your Total P&L" value={displayData.totalPnL} type="cash" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// Helper function to calculate demo P&L
const calculateDemoPnL = (positions, marketData) => {
  if (!positions.length || !marketData.length) return 0;
  
  const currentPrice = marketData[marketData.length - 1]?.c || 9000;
  
  return positions.reduce((total, position) => {
    const priceChange = currentPrice - position.entryPrice;
    const percentChange = priceChange / position.entryPrice;
    
    if (position.type === 'long') {
      return total + (position.investment * percentChange);
    } else if (position.type === 'short') {
      return total + (position.investment * (-percentChange));
    }
    return total;
  }, 0);
};

// Main App component with onboarding provider
const App = () => {
  return (
    <OnboardingProvider>
      <GameApp />
    </OnboardingProvider>
  );
};

export default App;