import React, { useState } from 'react';
import OnboardingBackground from './OnboardingBackground';
import OnboardingHeader from './OnboardingHeader';

const OnboardingPlayerName = ({ onNext }) => {
  const [playerName, setPlayerName] = useState('');

  const handleNext = () => {
    // Save the player name for later use
    localStorage.setItem('playerName', playerName);
    onNext();
  };

  return (
    <OnboardingBackground>
      <div className="w-96 inline-flex flex-col justify-start items-center gap-9">
        {/* Logo and Title Section */}
        <OnboardingHeader />

        {/* Player Name Input Section */}
        <div className="inline-flex flex-col justify-start items-start gap-3">
          <div className="justify-start text-700 text-lg font-bold font-['Lato']">
            Player Name
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="John Appleseed"
            className="w-96 p-4 bg-50 text-800 text-2xl font-light font-['Lato'] rounded-[10px] border-800 outline-none focus:border-Blue transition-colors duration-200"
            style={{ borderWidth: '1px' }}
          />
        </div>

        {/* Next Button */}
        <div 
          onClick={handleNext}
          className="w-96 px-16 py-4 rounded-[10px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          style={{ backgroundColor: 'var(--800, #202938)' }}
        >
          <div className="justify-start text-white text-2xl font-semibold font-['Lato']">
            Next
          </div>
        </div>
      </div>
    </OnboardingBackground>
  );
};

export default OnboardingPlayerName;
