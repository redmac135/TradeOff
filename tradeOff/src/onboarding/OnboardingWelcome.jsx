import React from 'react';
import OnboardingBackground from './OnboardingBackground';
import OnboardingHeader from './OnboardingHeader';

const OnboardingWelcome = ({ onGetStarted }) => {
  return (
    <OnboardingBackground>
      <div className="w-full max-w-[1464px] inline-flex flex-col justify-start items-center gap-9 px-4">
        {/* Logo and Title Section */}
        <OnboardingHeader />

        {/* Get Started Button */}
        <div 
          onClick={onGetStarted}
          className="px-16 py-4 rounded-[10px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          style={{ backgroundColor: 'var(--800, #202938)' }}
        >
          <div className="justify-start text-white text-2xl font-semibold font-['Lato']">
            Get Started
          </div>
        </div>
      </div>
    </OnboardingBackground>
  );
};

export default OnboardingWelcome;
