import React, { useState, useEffect } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useOnboarding } from '../context/OnboardingContext';

// Define comprehensive onboarding steps
const createOnboardingSteps = () => [
  {
    selector: '[data-tour="welcome"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Welcome to TradeOff! 🎯
        </h3>
        <p className="text-gray-700 mb-4">
          You're about to learn how to trade in our stock market simulation game. 
          Your goal is to grow your starting $50,000 as much as possible in the time limit!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Don't worry!</strong> This is practice mode with fake money, so feel free to experiment.
          </p>
        </div>
      </div>
    ),
    position: 'center',
  },
  {
    selector: '[data-tour="chart"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📈 Market Chart
        </h3>
        <p className="text-gray-700 mb-3">
          This candlestick chart shows the stock price movement over time. Each candle represents:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• <strong>Green candles:</strong> Price went up</li>
          <li>• <strong>Red candles:</strong> Price went down</li>
          <li>• <strong>Wicks:</strong> Show highest and lowest prices</li>
        </ul>
        <p className="text-gray-700">
          Watch how the price reacts to news and market events!
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="trading-buttons"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🎯 Trading Buttons
        </h3>
        <p className="text-gray-700 mb-3">
          These are your main trading controls:
        </p>
        <div className="space-y-2 mb-3">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <strong className="text-green-800">LONG:</strong>
            <span className="text-gray-700"> Bet the price will go UP</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <strong className="text-red-800">SHORT:</strong>
            <span className="text-gray-700"> Bet the price will go DOWN</span>
          </div>
        </div>
        <p className="text-gray-700">
          Try clicking "Long" to make your first practice trade!
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '[data-tour="slider"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🎚️ Position Size Slider
        </h3>
        <p className="text-gray-700 mb-3">
          This slider controls how much of your cash to invest in each trade:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• <strong>Left (low %):</strong> Safer, smaller profits/losses</li>
          <li>• <strong>Right (high %):</strong> Riskier, bigger profits/losses</li>
        </ul>
        <p className="text-gray-700">
          Try moving the slider to see how it changes your trade amount!
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '[data-tour="news-feed"]',
    content: (
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📰 News Feed
        </h3>
        <p className="text-gray-700 mb-3">
          Real-time market news appears here. This is your crystal ball! 🔮
        </p>
        <div className="space-y-2 mb-3">
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <strong className="text-green-800">Good news:</strong>
            <span className="text-gray-700"> Usually pushes prices UP</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <strong className="text-red-800">Bad news:</strong>
            <span className="text-gray-700"> Usually pushes prices DOWN</span>
          </div>
        </div>
        <p className="text-gray-700">
          Watch for new news and trade accordingly!
        </p>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '[data-tour="cash"]',
    content: (
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          💰 Your Cash
        </h3>
        <p className="text-gray-700 mb-3">
          This shows your available cash for new trades. You started with $50,000.
        </p>
        <p className="text-gray-700">
          When you make a trade, this amount decreases. When you close a profitable position, it increases!
        </p>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '[data-tour="pnl"]',
    content: (
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📊 Profit & Loss (P&L)
        </h3>
        <p className="text-gray-700 mb-3">
          This is your scorecard! It shows:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• <strong className="text-green-600">Positive (+):</strong> You're making money! 🎉</li>
          <li>• <strong className="text-red-600">Negative (-):</strong> You're losing money 😔</li>
        </ul>
        <p className="text-gray-700">
          Your final P&L determines your rank at the end!
        </p>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '[data-tour="timer"]',
    content: (
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          ⏰ Game Timer
        </h3>
        <p className="text-gray-700 mb-3">
          You have a limited time to make your trades and maximize profits!
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-yellow-800">
            <strong>Strategy tip:</strong> Don't wait too long to make decisions, but also don't rush into bad trades!
          </p>
        </div>
        <p className="text-gray-700">
          The timer doesn't start until you finish this tutorial.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="positions"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          � Your Positions
        </h3>
        <p className="text-gray-700 mb-3">
          This panel shows all your active trades. For each position, you can see:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• <strong>Type:</strong> Long (🟢) or Short (🔴)</li>
          <li>• <strong>Amount:</strong> How much you invested</li>
          <li>• <strong>P&L:</strong> Your current profit or loss</li>
          <li>• <strong>Close button:</strong> Exit the trade</li>
        </ul>
        <p className="text-gray-700">
          Close positions anytime to lock in profits or cut losses!
        </p>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '[data-tour="news"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📰 Market News
        </h3>
        <p className="text-gray-700 mb-3">
          Breaking news affects stock prices! Watch for:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• <strong>Positive news:</strong> Often pushes prices UP</li>
          <li>• <strong>Negative news:</strong> Often pushes prices DOWN</li>
          <li>• <strong>Neutral news:</strong> May have mixed or no effect</li>
        </ul>
        <p className="text-gray-700">
          Read the news to predict which way the market might move!
        </p>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '[data-tour="portfolio"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          💰 Portfolio Overview
        </h3>
        <p className="text-gray-700 mb-3">
          Keep track of your trading performance:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• <strong>Total Value:</strong> Your cash + position values</li>
          <li>• <strong>Cash:</strong> Available money for new trades</li>
          <li>• <strong>P&L:</strong> Total profit/loss from your starting $50k</li>
        </ul>
        <p className="text-gray-700">
          Your goal is to maximize your total portfolio value!
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="timer"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          ⏰ Game Timer
        </h3>
        <p className="text-gray-700 mb-3">
          You have a limited time to make your trades and grow your portfolio.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-yellow-800">
            <strong>Pro Tip:</strong> Don't wait too long! Time moves fast in trading.
          </p>
        </div>
        <p className="text-gray-700">
          Make your moves quickly but thoughtfully!
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="tutorial-button"]',
    content: (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🎓 Tutorial Access
        </h3>
        <p className="text-gray-700 mb-3">
          Need a refresher? Click this button anytime to restart the tutorial and switch back to practice mode.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800">
            <strong>Remember:</strong> Practice makes perfect! Don't hesitate to run through the tutorial again.
          </p>
        </div>
        <p className="text-gray-700">
          You can always come back here if you need help!
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="demo-trade"]',
    content: (
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🎮 Let's Practice!
        </h3>
        <p className="text-gray-700 mb-3">
          Now let's try a practice trade! We'll simulate some good news that should make the price go up.
        </p>
        <p className="text-gray-700 mb-3">
          Click the <strong>"LONG"</strong> button to bet that the price will rise!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Remember: LONG = betting price goes UP
          </p>
        </div>
      </div>
    ),
    position: 'top',
    actionLabel: 'Make Practice Trade',
  },
  {
    selector: '[data-tour="final"]',
    content: (
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🎉 You're Ready to Trade!
        </h3>
        <p className="text-gray-700 mb-3">
          Congratulations! You now know:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-4">
          <li>✅ How to read the market chart</li>
          <li>✅ How to make LONG and SHORT trades</li>
          <li>✅ How to adjust position sizes</li>
          <li>✅ How to read news for trading signals</li>
          <li>✅ How to track your P&L and cash</li>
        </ul>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800">
            <strong>Pro tip:</strong> Start with smaller positions until you get comfortable with the game!
          </p>
        </div>
        <p className="text-gray-700 font-medium">
          Ready to start your real trading session?
        </p>
      </div>
    ),
    position: 'center',
    actionLabel: 'Start Trading!',
  },
];

const OnboardingTourContent = () => {
  const { 
    isOnboardingActive, 
    addDemoNews, 
    currentOnboardingStep
  } = useOnboarding();
  
  const { setIsOpen } = useTour();
  const [hasTriggeredDemo, setHasTriggeredDemo] = useState(false);

  useEffect(() => {
    if (isOnboardingActive) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isOnboardingActive, setIsOpen]);

  // Handle demo trade simulation
  useEffect(() => {
    if (currentOnboardingStep === 9 && !hasTriggeredDemo) {
      setHasTriggeredDemo(true);
      
      // Add demo good news that should drive price up
      setTimeout(() => {
        addDemoNews({
          title: "Breaking: Major tech breakthrough announced!",
          description: "A revolutionary AI breakthrough is expected to boost the entire tech sector significantly.",
          priority: "high",
          marketImpact: "positive"
        });
      }, 2000);
    }
  }, [currentOnboardingStep, hasTriggeredDemo, addDemoNews]);

  return null; // This component doesn't render anything directly
};

const OnboardingTour = () => {
  const { isOnboardingActive, completeOnboarding } = useOnboarding();

  // COMPREHENSIVE VIEWPORT-AWARE POSITIONING SYSTEM
  const smartPositioning = React.useCallback(() => {
    // Allow DOM to settle first
    requestAnimationFrame(() => {
      setTimeout(() => {
        const popover = document.querySelector('[data-tour-elem="popover"]');
        const badge = document.querySelector('[data-tour-elem="badge"]');
        
        if (!popover) return;

        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        // Get current popover dimensions
        const popoverRect = popover.getBoundingClientRect();
        
        // SMART POSITIONING ALGORITHM
        const SAFE_MARGIN = Math.max(10, Math.min(20, viewport.width * 0.02));
        const PREFERRED_MARGIN = Math.max(20, Math.min(40, viewport.width * 0.04));
        
        // Calculate optimal position based on viewport
        let optimalLeft, optimalTop;
        
        // Determine optimal horizontal position
        const availableWidth = viewport.width - (2 * SAFE_MARGIN);
        const popoverWidth = Math.min(
          Math.max(280, popoverRect.width), 
          availableWidth,
          viewport.width < 480 ? viewport.width - 16 : 480
        );
        
        // Center horizontally by default, but respect edges
        optimalLeft = Math.max(
          SAFE_MARGIN,
          Math.min(
            (viewport.width - popoverWidth) / 2,
            viewport.width - popoverWidth - SAFE_MARGIN
          )
        );
        
        // Determine optimal vertical position
        const availableHeight = viewport.height - (2 * SAFE_MARGIN);
        const maxPopoverHeight = Math.min(
          popoverRect.height,
          availableHeight,
          viewport.height < 600 ? viewport.height - 40 : viewport.height - 80
        );
        
        // Try to center vertically, but prioritize top visibility on small screens
        let preferredTop;
        if (viewport.height < 600) {
          // On small screens, position closer to top
          preferredTop = Math.max(SAFE_MARGIN, viewport.height * 0.1);
        } else {
          // On larger screens, center vertically
          preferredTop = Math.max(PREFERRED_MARGIN, (viewport.height - maxPopoverHeight) / 2);
        }
        
        optimalTop = Math.max(
          SAFE_MARGIN,
          Math.min(preferredTop, viewport.height - maxPopoverHeight - SAFE_MARGIN)
        );
        
        // APPLY POSITIONING WITH SMOOTH TRANSITIONS
        popover.style.position = 'fixed';
        popover.style.left = `${optimalLeft}px`;
        popover.style.top = `${optimalTop}px`;
        popover.style.transform = 'none';
        popover.style.transition = 'all 0.3s ease-out';
        
        // Ensure proper dimensions
        popover.style.width = `${popoverWidth}px`;
        popover.style.maxHeight = `${maxPopoverHeight}px`;
        popover.style.overflowY = maxPopoverHeight < popoverRect.height ? 'auto' : 'visible';
        
        // POSITION BADGE INTELLIGENTLY
        if (badge) {
          // Position badge in the optimal corner, ensuring visibility
          const badgeSize = viewport.width < 480 ? 20 : 24;
          const badgeOffset = badgeSize / 2;
          
          let badgeLeft = Math.max(badgeOffset, optimalLeft - badgeOffset);
          let badgeTop = Math.max(badgeOffset, optimalTop - badgeOffset);
          
          // Ensure badge doesn't go off edges
          badgeLeft = Math.min(badgeLeft, viewport.width - badgeSize - badgeOffset);
          badgeTop = Math.min(badgeTop, viewport.height - badgeSize - badgeOffset);
          
          badge.style.position = 'fixed';
          badge.style.left = `${badgeLeft}px`;
          badge.style.top = `${badgeTop}px`;
          badge.style.width = `${badgeSize}px`;
          badge.style.height = `${badgeSize}px`;
          badge.style.transition = 'all 0.3s ease-out';
        }
        
        // Add visual indicator that positioning is complete
        popover.classList.add('tour-positioned');
        
        console.log(`Smart positioning applied: ${Math.round(optimalLeft)}x${Math.round(optimalTop)} (${popoverWidth}x${maxPopoverHeight}) on viewport ${viewport.width}x${viewport.height}`);
        
      }, 150); // Increased delay for complex layouts
    });
  }, []);

  // COMPREHENSIVE EVENT HANDLING
  React.useEffect(() => {
    if (!isOnboardingActive) return;

    // Initial positioning
    smartPositioning();

    // Create debounced version for performance
    let resizeTimer;
    const debouncedPositioning = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(smartPositioning, 100);
    };

    // Listen to all possible layout-changing events
    window.addEventListener('resize', debouncedPositioning);
    window.addEventListener('orientationchange', debouncedPositioning);
    window.addEventListener('scroll', debouncedPositioning, { passive: true });
    
    // Handle browser zoom and mobile browser UI changes
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addListener(debouncedPositioning);
    
    // Observe DOM changes that might affect layout
    const observer = new MutationObserver(debouncedPositioning);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // ResizeObserver for accurate viewport detection
    const resizeObserver = new ResizeObserver(debouncedPositioning);
    resizeObserver.observe(document.documentElement);
    
    // Handle visibility changes (iOS Safari)
    document.addEventListener('visibilitychange', smartPositioning);
    
    // Cleanup
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedPositioning);
      window.removeEventListener('orientationchange', debouncedPositioning);
      window.removeEventListener('scroll', debouncedPositioning);
      mediaQuery.removeListener(debouncedPositioning);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', smartPositioning);
    };
  }, [isOnboardingActive, smartPositioning]);

  if (!isOnboardingActive) return null;

  const steps = createOnboardingSteps();

  return (
    <TourProvider
      steps={steps}
      isOpen={isOnboardingActive}
      onRequestClose={() => {}}
      showNavigation={true}
      showPrevNextButtons={true}
      showCloseButton={false}
      disableInteraction={false}
      scrollSmooth={true}
      padding={{ mask: 8, popover: [16, 20] }}
      inViewThreshold={{ x: 10, y: 10 }}
      className="tour-provider"
      afterOpen={smartPositioning}
      beforeClose={() => {}}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': '#2563eb',
          borderRadius: 12,
          // Let our positioning system handle all sizing and positioning
          position: 'fixed',
          minWidth: '280px',
          maxWidth: 'min(480px, calc(100vw - 40px))',
          maxHeight: 'calc(100vh - 80px)',
          boxSizing: 'border-box',
          zIndex: 99999,
        }),
        maskArea: (base) => ({ 
          ...base, 
          rx: 8,
        }),
        mask: (base) => ({
          ...base,
          zIndex: 99998,
        }),
        badge: (base) => ({ 
          ...base, 
          backgroundColor: '#2563eb',
          fontSize: '12px',
          fontWeight: '600',
          minWidth: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          border: '2px solid white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 100001,
          position: 'fixed',
        }),
        controls: (base) => ({
          ...base,
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          zIndex: 100000,
        }),
        navigation: (base) => ({
          ...base,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          margin: '0 auto',
          flex: '1',
        }),
        dot: (base, { current }) => ({
          ...base,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: current ? '#2563eb' : '#d1d5db',
          margin: '0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }),
      }}
      prevButton={({ currentStep, setCurrentStep }) => {
        return currentStep > 0 ? (
          <button
            onClick={() => {
              setCurrentStep(currentStep - 1);
              // Reposition after step change
              setTimeout(smartPositioning, 200);
            }}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
          >
            ← Back
          </button>
        ) : <div className="w-16"></div>; // Placeholder to maintain layout
      }}
      nextButton={({ currentStep, setCurrentStep, setIsOpen, steps }) => {
        const isLast = currentStep === steps.length - 1;
        return (
          <button
            onClick={() => {
              if (isLast) {
                // Complete onboarding
                completeOnboarding();
                setIsOpen(false);
              } else {
                setCurrentStep(currentStep + 1);
                // Reposition after step change
                setTimeout(smartPositioning, 200);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex-shrink-0"
          >
            {isLast ? 'Start Trading!' : 'Next →'}
          </button>
        );
      }}
    >
      <OnboardingTourContent />
    </TourProvider>
  );
};

export default OnboardingTour;
