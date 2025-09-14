import React, { useState } from 'react';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingPlayerName from './OnboardingPlayerName';
import OnboardingLevelOptions from './OnboardingLevelOptions';
import OnboardingConfirmation from './OnboardingConfirmation';

const OnboardingContainer = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');

  const handleGetStarted = () => {
    setCurrentStep('playerName');
  };

  const handlePlayerNameNext = () => {
    setCurrentStep('levelOptions');
  };

  const handleLevelOptionsNext = () => {
    setCurrentStep('confirmation');
  };

  const handleLetsPlay = () => {
    // Complete the onboarding after confirmation
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome 
            onGetStarted={handleGetStarted}
          />
        );
      case 'playerName':
        return (
          <OnboardingPlayerName 
            onNext={handlePlayerNameNext}
          />
        );
      case 'levelOptions':
        return (
          <OnboardingLevelOptions 
            onNext={handleLevelOptionsNext}
          />
        );
      case 'confirmation':
        return (
          <OnboardingConfirmation 
            onLetsPlay={handleLetsPlay}
          />
        );
      default:
        return (
          <OnboardingWelcome 
            onGetStarted={handleGetStarted}
          />
        );
    }
  };

  return renderCurrentStep();
};

export default OnboardingContainer;
