import React, { useEffect } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useOnboarding } from '../context/OnboardingContext';

// Reusable blue card for tour content
const BlueTourCard = ({ title, description, nextLabel = 'Next', onNext, onBack, showBack }) => (
  <div
    className="w-[360px] sm:w-[420px] md:w-[498px] max-w-[88vw] sm:max-w-[90vw] md:max-w-[92vw] px-4 py-4 md:px-6 md:py-7 relative rounded-[10px] inline-flex flex-col justify-start items-stretch gap-4 md:gap-6"
    style={{ backgroundColor: '#005DAA' }}
  >
    <div className="text-white text-lg sm:text-xl md:text-3xl font-semibold font-['Lato']">{title}</div>
    <div className="text-white text-base sm:text-lg md:text-2xl font-light font-['Roboto_Flex'] leading-6 sm:leading-7 md:leading-9">{description}</div>
    <div className="flex items-center justify-end gap-2 md:gap-3">
      {showBack && (
        <button
          onClick={onBack}
          className="w-24 md:w-28 px-3 py-2 rounded-[10px] inline-flex justify-center items-center bg-white/10 text-white hover:bg-white/20 transition text-sm md:text-base font-['Roboto_Flex']"
        >
          Back
        </button>
      )}
      <button
        onClick={onNext}
        className="w-28 md:w-32 px-3 py-2 rounded-[10px] inline-flex justify-center items-center bg-white text-[#015FA9] hover:opacity-95 active:scale-[0.98] transition text-base md:text-lg font-['Roboto_Flex']"
      >
        {nextLabel}
      </button>
    </div>
  </div>
);

// Step content that can advance the tour
const BlueCardStep = ({ title, description, nextLabel = 'Next', isFinal = false, onComplete }) => {
  const { setCurrentStep, currentStep, setIsOpen } = useTour();
  const handleNext = () => {
    if (isFinal) {
      onComplete?.();
      setIsOpen(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  return (
    <BlueTourCard
      title={title}
      description={description}
      nextLabel={nextLabel}
      onNext={handleNext}
      onBack={handleBack}
      showBack={currentStep > 0 && !isFinal}
    />
  );
};

// Define requested onboarding steps in order
const createOnboardingSteps = ({ getStartingCash, complete }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return [
    {
      selector: '[data-tour="timer"]',
      position: isMobile ? 'bottom' : 'right',
      content: (
        <BlueCardStep
          title="The Clock is Ticking"
          description="You only have 3 minutes to grow your balance through investing and every decision matters."
        />
      ),
    },
    {
      selector: '[data-tour="cash"]',
      position: isMobile ? 'top' : 'left',
      content: (
        <BlueCardStep
          title="Your Starting Balance"
          description={`Each round begins with a financial goal (like tuition or a car) and a starting amount of money to invest. You start with $${getStartingCash().toLocaleString()}.`}
        />
      ),
    },
    {
      selector: '[data-tour="chart-canvas"], [data-tour="chart"]',
      position: 'right',
      content: (
        <BlueCardStep
          title="The Market Moves"
          description="The stock chart shows prices changing over time, influenced by the market news."
        />
      ),
    },
    {
      selector: '[data-tour~="news-primary"], [data-tour="news-feed"]',
      position: 'left',
      content: (
        <BlueCardStep
          title="News Shapes Prices"
          description="Watch for the latest headlines that will indicate whether the stock goes up or down."
        />
      ),
    },
    {
      selector: '[data-tour~="trading-buttons-primary"], [data-tour="trading-buttons"]',
      position: 'top',
      content: (
        <BlueCardStep
          title="Your Decisions"
          description='You can go "long" if you think the stock will rise, or "short" if you think it will fall.'
        />
      ),
    },
    {
      selector: '[data-tour~="slider-primary"], [data-tour="slider"]',
      position: 'top',
      content: (
        <BlueCardStep
          title="Risk & Reward"
          description="Use the slider to choose how much of your balance to put into each trade."
        />
      ),
    },
    {
  selector: '[data-tour="pnl-mobile"], [data-tour="pnl"]',
  position: isMobile ? 'top' : 'left',
      content: (
        <BlueCardStep
          title="Track Your Performance"
          description="Keep an eye on your profits and losses as you play along."
        />
      ),
    },
    {
      selector: '[data-tour="final"]',
      position: 'center',
      content: (
        <BlueCardStep
          title="Ready to Play"
          description="The game starts when you press Start!"
          nextLabel="Start"
          isFinal
          onComplete={complete}
        />
      ),
    },
  ];
};

const OnboardingTourContent = () => {
  const { isOnboardingActive } = useOnboarding();
  const { setIsOpen } = useTour();

  useEffect(() => {
    setIsOpen(!!isOnboardingActive);
  }, [isOnboardingActive, setIsOpen]);

  return null;
};

const OnboardingTour = () => {
  const { isOnboardingActive, completeOnboarding, demoCash } = useOnboarding();

  // We rely on Reactour's anchored placement (left/right/top/bottom) with flip/fallbacks.

  // COMPREHENSIVE EVENT HANDLING
  // No manual positioning listeners needed; Reactour handles viewport flips.

  if (!isOnboardingActive) return null;

  const steps = createOnboardingSteps({
    getStartingCash: () => Number(localStorage.getItem('startingCash')) || demoCash || 50000,
    complete: () => completeOnboarding(),
  });

  return (
    <TourProvider
      steps={steps}
      isOpen={isOnboardingActive}
      onRequestClose={() => {}}
  showNavigation={false}
  showPrevNextButtons={false}
      showCloseButton={false}
      disableInteraction={false}
      scrollSmooth={true}
      padding={{ mask: 8, popover: [16, 20] }}
      inViewThreshold={{ x: 10, y: 10 }}
      className="tour-provider"
      afterOpen={() => {}}
      beforeClose={() => {}}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': '#2563eb',
          borderRadius: 12,
          // Center the card on screen regardless of anchor
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '280px',
          maxWidth: 'min(520px, calc(100vw - 24px))',
          maxHeight: 'calc(100vh - 24px)',
          padding: 0, // remove white padding
          background: 'transparent', // our card provides background
          boxShadow: 'none',
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
        badge: () => ({ display: 'none' }), // remove step number badge
        controls: (base) => ({
          ...base,
          display: 'none', // remove default controls area
        }),
        navigation: () => ({ display: 'none' }),
        dot: () => ({ display: 'none' }),
      }}
  // Hide default prev/next; content cards drive navigation
  prevButton={() => <div />}
  nextButton={() => <div />}
    >
      <OnboardingTourContent />
    </TourProvider>
  );
};

export default OnboardingTour;
