import React, { useState } from 'react';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingPlayerName from './OnboardingPlayerName';
import OnboardingLevelOptions from './OnboardingLevelOptions';

const OnboardingContainer = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');

  const handleGetStarted = () => {
    setCurrentStep('playerName');
  };

  const handlePlayerNameNext = () => {
    setCurrentStep('levelOptions');
  };

  const handleLevelOptionsNext = () => {
    // Complete the onboarding after level selection
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
