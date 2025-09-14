/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(true); // Always show prompt on visit
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  // Mock demo data for onboarding
  const [demoMarketData, setDemoMarketData] = useState([]);
  const [demoNewsItems, setDemoNewsItems] = useState([]);
  const [demoCash, setDemoCash] = useState(() => {
    const stored = Number(localStorage.getItem('startingCash'));
    return Number.isFinite(stored) && stored > 0 ? stored : 50000;
  });
  const [demoPositions, setDemoPositions] = useState([]);

  const initializeDemoMarketData = useCallback(() => {
    // Generate initial demo market data
    const data = [];
    let lastClose = 9000;

    for (let i = 0; i < 30; i++) {
      const open = +(lastClose + (Math.random() - 0.5) * 50).toFixed(2);
      const close = +(open + (Math.random() - 0.5) * 100).toFixed(2);
      const high = +(Math.max(open, close) + Math.random() * 25).toFixed(2);
      const low = +(Math.min(open, close) - Math.random() * 25).toFixed(2);

      data.push({
        x: i,
        o: open,
        h: high,
        l: low,
        c: close,
      });
      
      lastClose = close;
    }
    setDemoMarketData(data);
  }, []);

  const initializeDemoNews = useCallback(() => {
    const initialNews = [
      {
        title: "Demo: Tech sector showing strong growth potential",
        description: "This is a demo news item to show how market news affects stock prices during the onboarding.",
        priority: "high",
        timestamp: Date.now(),
        isDemoNews: true
      },
      {
        title: "Demo: Federal Reserve maintains current interest rates",
        description: "Simulated news showing how economic policy announcements can impact market sentiment.",
        priority: "medium", 
        timestamp: Date.now() - 60000,
        isDemoNews: true
      },
      {
        title: "Demo: Quarterly earnings reports exceed expectations",
        description: "Example of positive earnings news that typically drives stock prices higher.",
        priority: "medium",
        timestamp: Date.now() - 120000,
        isDemoNews: true
      }
    ];
    setDemoNewsItems(initialNews);
  }, []);

  const startOnboarding = useCallback(() => {
    setShowInitialPrompt(false);
    setIsOnboardingActive(true);
    setIsDemoMode(true);
    setCurrentOnboardingStep(0);
    
  // Initialize demo data - read starting cash from onboarding/localStorage
  const storedCash = (() => {
    const n = Number(localStorage.getItem('startingCash'));
    return Number.isFinite(n) && n > 0 ? n : 50000;
  })();
  setDemoCash(storedCash);
    setDemoPositions([]);
    initializeDemoMarketData();
    initializeDemoNews();
  }, [initializeDemoMarketData, initializeDemoNews]);

  const completeOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    setIsDemoMode(false);
    setCurrentOnboardingStep(0);
    // Removed localStorage setting - onboarding can be accessed every time
  }, []);

  const skipOnboarding = useCallback(() => {
    setShowInitialPrompt(false);
    // Removed localStorage setting - onboarding can be accessed every time
  }, []);

  const simulateMarketReaction = useCallback((newsType) => {
    if (!isDemoMode) return;

    // Simulate positive or negative market movement based on news
    setDemoMarketData(prevData => {
      const newData = [...prevData];
      const lastCandle = newData[newData.length - 1];
      
      if (!lastCandle) return prevData;

      const open = lastCandle.c;
      const multiplier = newsType === 'positive' ? 1.02 : 0.98; // 2% movement
      const close = +(open * multiplier).toFixed(2);
      const high = +(Math.max(open, close) + Math.random() * 20).toFixed(2);
      const low = +(Math.min(open, close) - Math.random() * 20).toFixed(2);

      const newCandle = {
        x: newData.length,
        o: open,
        h: high,
        l: low,
        c: close,
      };

      return [...newData, newCandle];
    });
  }, [isDemoMode]);

  const addDemoNews = useCallback((newsItem) => {
    if (!isDemoMode) return;

    const demoNews = {
      ...newsItem,
      timestamp: Date.now(),
      isDemoNews: true
    };

    setDemoNewsItems(prevNews => [demoNews, ...prevNews.slice(0, 4)]);
    
    // Simulate market reaction after a short delay
    setTimeout(() => {
      simulateMarketReaction(newsItem.marketImpact);
    }, 1000);
  }, [isDemoMode, simulateMarketReaction]);

  const executeDemoTrade = useCallback((tradeType, percentage) => {
    if (!isDemoMode) return false;

    const tradeAmount = (demoCash * percentage) / 100;
    
    if (tradeAmount > demoCash || tradeAmount < 100) {
      return false;
    }

    const currentMarketPrice = demoMarketData[demoMarketData.length - 1]?.c || 9000;

    const newPosition = {
      id: Date.now(),
      type: tradeType,
      entryPrice: currentMarketPrice,
      investment: tradeAmount,
      timestamp: Date.now(),
      isDemo: true
    };

    setDemoCash(prev => prev - tradeAmount);
    setDemoPositions(prev => [...prev, newPosition]);

    return true;
  }, [isDemoMode, demoCash, demoMarketData]);

  const resetDemo = useCallback(() => {
  const stored = Number(localStorage.getItem('startingCash'));
  setDemoCash(Number.isFinite(stored) && stored > 0 ? stored : 50000);
    setDemoPositions([]);
    initializeDemoMarketData();
    initializeDemoNews();
  }, [initializeDemoMarketData, initializeDemoNews]);

  // Function to manually trigger onboarding (e.g., from a help button)
  const triggerOnboarding = useCallback(() => {
    setShowInitialPrompt(true);
  }, []);

  // Function to reset the initial prompt state
  const resetPromptState = useCallback(() => {
    setShowInitialPrompt(true);
  }, []);

  const value = {
    // State
    isOnboardingActive,
    showInitialPrompt,
    isDemoMode,
    currentOnboardingStep,
    demoMarketData,
    demoNewsItems,
    demoCash,
    demoPositions,

    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    simulateMarketReaction,
    addDemoNews,
    executeDemoTrade,
    resetDemo,
    setCurrentOnboardingStep,
    triggerOnboarding,
    resetPromptState,

    // Getters
    getCurrentDemoPrice: () => demoMarketData[demoMarketData.length - 1]?.c || 9000,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
