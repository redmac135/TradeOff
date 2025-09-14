import React, { useState, useEffect } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useOnboarding } from '../context/OnboardingContext';

// Define comprehensive onboarding steps
const createOnboardingSteps = () => [
  {
    selector: '[data-tour="welcome"]',
    content: (
      <div className="max-w-sm">
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
      <div className="max-w-sm">
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
      <div className="max-w-sm">
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
      <div className="max-w-sm">
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
      <div className="max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          📋 Your Positions
        </h3>
        <p className="text-gray-700 mb-3">
          When you make trades, they'll appear here showing:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mb-3">
          <li>• Entry price and current profit/loss</li>
          <li>• Whether it's a LONG or SHORT position</li>
          <li>• A "Sell" button to close the position</li>
        </ul>
        <p className="text-gray-700">
          You can have multiple positions open at once!
        </p>
      </div>
    ),
    position: 'left',
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
    completeOnboarding, 
    addDemoNews, 
    executeDemoTrade,
    currentOnboardingStep,
    setCurrentOnboardingStep 
  } = useOnboarding();
  
  const { setIsOpen, setCurrentStep } = useTour();
  const [hasTriggeredDemo, setHasTriggeredDemo] = useState(false);

  const steps = createOnboardingSteps();

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
      padding={{ mask: 5, popover: [10, 15] }}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': '#2563eb',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }),
        maskArea: (base) => ({ 
          ...base, 
          rx: 8,
        }),
        badge: (base) => ({ 
          ...base, 
          backgroundColor: '#2563eb',
        }),
      }}
      prevButton={({ currentStep, setCurrentStep }) => {
        return currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Back
          </button>
        ) : null;
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
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
