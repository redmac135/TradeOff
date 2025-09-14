import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameContext } from './context/GameContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { useGameData } from './hooks/useGameData'; // Import the live data hook
import { TrainingLanding } from './training';
import Navbar from './components/Navbar';
import FinancialChart from './components/FinancialChart';
import MarketNews from './components/MarketNews';
import Card from './components/Card';
import PositionControl from './components/PositionControl';
import PositionList from './components/PositionList';
import OnboardingTour from './components/OnboardingTour';
import { OnboardingContainer } from './onboarding';
import EndgameOverlay from './endgame/EndgameOverlay';
import EndgameResults from './endgame/EndgameResults';
import './App.css';

function GameApp() {
  // Get onboarding state to pause timer during onboarding
  const { isOnboardingActive, showInitialPrompt, isDemoMode } = useOnboarding();
  
  // Track initial onboarding completion
  const [hasCompletedInitialOnboarding, setHasCompletedInitialOnboarding] = useState(false);
  
  // Connect to live data from DynamoDB
  // Disable live polling until: tutorial is running (demo mode) or user skipped
  const liveDataEnabled = !showInitialPrompt && !isDemoMode; // Only fetch live when landing is dismissed and not in demo
  const { candles, news: liveNewsItems } = useGameData(liveDataEnabled);
  
  // Centralized State Management
  const [cash, setCash] = useState(() => {
    const stored = Number(localStorage.getItem('startingCash'));
    return Number.isFinite(stored) && stored > 0 ? stored : 50000;
  }); // Starting cash from onboarding
  const [positions, setPositions] = useState([]); // Array of open trades
  const [marketData, setMarketData] = useState([]); // Chart data
  const [newsItems, setNewsItems] = useState([]); // News headlines
  const [gameTimer, setGameTimer] = useState(180); // 180 seconds = 3 minutes countdown
  const [userGoal, setUserGoal] = useState({ name: 'First Car', amount: 15000 }); // User goal
  const [isPageVisible, setIsPageVisible] = useState(true); // Track page visibility
  const [realizedPnL, setRealizedPnL] = useState(0); // Track realized P&L from closed positions
  const [showEndgame, setShowEndgame] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // Risk tolerance (0-100) - initialized from localStorage if available
  const [riskTolerance, setRiskTolerance] = useState(() => {
    const stored = localStorage.getItem('riskTolerance');
    return stored ? Number(stored) : 50;
  });

  // Sync live data from DynamoDB to local state for trading
  useEffect(() => {
    if (candles && candles.length > 0) {
      console.log('Updating marketData with live candles:', candles.length, 'items');
      console.log('Sample candle structure:', candles[0]);
      console.log('Sample candle keys:', Object.keys(candles[0]));
      setMarketData(candles);
    } else {
      console.log('No candles data available from useGameData hook');
      
      // Fallback: create some initial mock data if no live data is available
      if (marketData.length === 0) {
        console.log('Creating fallback market data...');
        const fallbackData = [{
          EntityType: "OHLCV",
          EntityID: "fallback",
          Open: 9000,
          High: 9050,
          Low: 8950,
          Close: 9000,
          Volume: 1000
        }];
        setMarketData(fallbackData);
      }
    }
  }, [candles, marketData.length]);

  useEffect(() => {
    if (liveNewsItems && liveNewsItems.length > 0) {
      console.log('Updating newsItems with live news:', liveNewsItems.length, 'items');
      setNewsItems(liveNewsItems);
    }
  }, [liveNewsItems]);

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
    if (marketData.length === 0) {
      console.log('No market data available for pricing');
      return 0;
    }
    
    const lastCandle = marketData[marketData.length - 1];
    // Handle both lowercase (chart format) and uppercase (DynamoDB format) fields
    const price = lastCandle.c || lastCandle.Close || lastCandle.close;
    
    console.log('Current market price calculated:', price, 'from', marketData.length, 'candles');
    console.log('Last candle fields:', Object.keys(lastCandle));
    return Number(price) || 0;
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

  // Remove mock data generation - using live data from DynamoDB now
  // (Mock data generation code removed since useMockData = false)

  // Game timer countdown (pause when page is not visible or during onboarding)
  useEffect(() => {
    // Do not start the timer at all until the initial onboarding prompt is dismissed
    // and any tutorial is finished (user either completed onboarding or skipped it).
    if (gameTimer <= 0) return;
    if (showInitialPrompt || isOnboardingActive) {
      // No interval created while onboarding prompt is visible or tutorial active
      return;
    }

    const timer = setInterval(() => {
      // Only countdown when page is visible
      if (!isPageVisible) {
        console.log('Timer paused - page not visible');
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
  }, [gameTimer, isPageVisible, isOnboardingActive, showInitialPrompt]);
  // Trigger endgame overlay when timer hits 0
  useEffect(() => {
    if (gameTimer === 0) {
      setShowEndgame(true);
    }
  }, [gameTimer]);

  // When the endgame overlay is shown, automatically switch to results after 5 seconds
  useEffect(() => {
    if (!showEndgame) return;
    const t = setTimeout(() => {
      setShowEndgame(false);
      setShowResults(true);
    }, 5000);
    return () => clearTimeout(t);
  }, [showEndgame]);

  // When tutorial (onboarding tour) ends, reset timer back to 3 minutes
  useEffect(() => {
    if (!isOnboardingActive) {
  setGameTimer(180);
    }
  }, [isOnboardingActive]);

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
  ,
  // Risk tolerance accessors
  riskTolerance,
  setRiskTolerance
  };

  const handleCompleteOnboarding = (onboardRiskTolerance) => {
    // Apply the onboarding-selected starting cash to the live game
    const stored = Number(localStorage.getItem('startingCash'));
    if (Number.isFinite(stored) && stored > 0) {
      setCash(stored);
    }

    // If onboarding passed a risk tolerance, use it and persist it
    if (typeof onboardRiskTolerance === 'number') {
      setRiskTolerance(onboardRiskTolerance);
      try {
        localStorage.setItem('riskTolerance', String(onboardRiskTolerance));
      } catch {
        // ignore storage errors
      }
    } else {
      // Otherwise fallback to any stored value
      const storedRisk = localStorage.getItem('riskTolerance');
      if (storedRisk) {
        setRiskTolerance(Number(storedRisk));
      }
    }

    setHasCompletedInitialOnboarding(true);
  };

  // If initial onboarding is not completed, show onboarding screen
  if (!hasCompletedInitialOnboarding) {
    return <OnboardingContainer onComplete={handleCompleteOnboarding} />;
  }

  return (
    <GameContext.Provider value={gameContextValue}>
      {/* Landing overlay that blocks interaction and live data until dismissed */}
      {!showResults && <TrainingLanding />}
      {!showResults && <AppContent />}
  {showEndgame && <EndgameOverlay />}
      {showResults && <EndgameResults />}
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
      <OnboardingTour />
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden" data-tour="welcome">
        <Navbar 
          demoData={isDemoMode ? demoNewsItems : undefined} 
          demoMarketData={isDemoMode ? demoMarketData : undefined}
        />
        
        {/* Hidden element for final tour step */}
        <div data-tour="final" className="sr-only">Final step marker</div>
        
        <main className="flex-1 px-4 py-6 overflow-hidden min-h-0">
          <div className="h-full flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Main Chart Area - Show during demo mode even on mobile */}
            <div className={`${isDemoMode ? 'flex' : 'hidden md:flex'} flex-1 flex-col gap-4 overflow-hidden min-h-0`}>
              <div className="flex-1 overflow-hidden min-h-0" data-tour="chart">
                <FinancialChart 
                  useMockData={true} 
                  apiData={[]} 
                  demoData={isDemoMode ? demoMarketData : undefined}
                />
              </div>
              <div className={`${isDemoMode ? 'block' : 'hidden md:block'} flex-shrink-0 h-24`} data-tour="demo-trade">
                <PositionControl />
              </div>
            </div>

            {/* Sidebar - Show during demo mode even on mobile */}
            <div className={`${isDemoMode ? 'flex' : 'hidden lg:flex'} w-full lg:w-96 flex-col gap-4 overflow-hidden`}>
              <div className={`${isDemoMode ? 'block' : 'hidden md:block'} flex-1 overflow-hidden`} data-tour="news-feed">
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