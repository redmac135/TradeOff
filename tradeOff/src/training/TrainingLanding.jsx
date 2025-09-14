import React from 'react';
import RBCWhite from '../assets/RBC White.svg';
import { useOnboarding } from '../context/OnboardingContext';

// Full-screen overlay shown on top of the dashboard until the user starts the tour or skips
const TrainingLanding = () => {
  const { showInitialPrompt, startOnboarding, skipOnboarding } = useOnboarding();

  if (!showInitialPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-[#005eaa]/80 backdrop-blur-[10px]" />

      {/* Center card */}
      <div className="relative w-full max-w-[32rem] md:max-w-[42rem] flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <img
          src={RBCWhite}
          alt="RBC Logo"
          className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        />

        {/* Title */}
        <h1 className="px-2 leading-tight">
          <span className="block text-white/90 text-3xl md:text-5xl font-normal font-['Lato']">Welcome to</span>
          <span className="block text-white text-3xl md:text-5xl font-bold font-['Lato']">TradeOff Interactive Tour</span>
        </h1>

        {/* Actions */}
        <div className="w-full flex flex-col items-center gap-5">
          <button
            onClick={startOnboarding}
            className="w-full max-w-64 px-10 py-4 bg-white text-[#015FA9] rounded-[10px] shadow hover:opacity-95 active:scale-[0.98] transition transform text-xl md:text-2xl font-['Roboto_Flex']"
          >
            Start Tour
          </button>
          <button
            onClick={skipOnboarding}
            className="text-white/90 hover:text-white text-lg md:text-2xl font-light font-['Lato']"
          >
            Skip to the Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingLanding;
