import React, { useEffect, useState } from 'react';
import OnboardingBackground from './OnboardingBackground';
import OnboardingHeader from './OnboardingHeader';
import { GraduationCap, Car, Home } from 'lucide-react';

const OnboardingConfirmation = ({ onLetsPlay }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    // Get the selected level from localStorage
    const levelId = localStorage.getItem('selectedLevel');
    const startingCash = localStorage.getItem('startingCash');
    const targetAmount = localStorage.getItem('targetAmount');

    const levels = {
      'easy': {
        id: 'easy',
        title: 'Pay for my tuition next year',
        icon: GraduationCap,
        startingAmount: `$${startingCash}`,
        targetAmount: `$${targetAmount}`,
        description: `and invest to reach $${targetAmount} for your tuition.`
      },
      'medium': {
        id: 'medium',
        title: 'Purchase my first vehicle',
        icon: Car,
        startingAmount: `$${startingCash}`,
        targetAmount: `$${targetAmount}`,
        description: `and invest to reach $${targetAmount} for your car.`
      },
      'hard': {
        id: 'hard',
        title: 'Pay the down payment on a home',
        icon: Home,
        startingAmount: `$${startingCash}`,
        targetAmount: `$${targetAmount}`,
        description: `and invest to reach $${targetAmount} for your first home.`
      }
    };

    setSelectedLevel(levels[levelId]);
  }, []);

  const handleLetsPlay = () => {
    // Add a smooth transition before starting the game
    const button = document.querySelector('.lets-play-button');
    button.style.transform = 'scale(0.95)';
    button.style.opacity = '0.8';
    
    setTimeout(() => {
      onLetsPlay();
    }, 150);
  };

  if (!selectedLevel) {
    return null; // Loading state
  }

  const IconComponent = selectedLevel.icon;

  return (
    <OnboardingBackground>
      <div className="w-96 inline-flex flex-col justify-start items-center gap-9">
        {/* Logo and Title Section */}
        <OnboardingHeader />

        {/* Level Options Section */}
        <div className="self-stretch flex flex-col justify-start items-center gap-6">
          <div className="self-stretch flex flex-col justify-start items-center gap-2">
            <div className="justify-start text-700 text-xl font-bold font-['Lato']">
              Level Options
            </div>
            <div className="justify-start text-600 text-base font-light font-['Lato']">
              Your selected goal and starting balance
            </div>
          </div>

          {/* Selected Level Display */}
          <div className="w-96 p-4 bg-50 rounded-[10px] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] flex flex-col justify-center items-start gap-3 animate-fadeIn">
            {/* Level Header */}
            <div className="w-full flex items-center gap-3">
              {/* Icon */}
              <div className="size-6 flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-Blue" />
              </div>
              {/* Title */}
              <div className="justify-start text-800 text-lg font-semibold font-['Lato']">
                {selectedLevel.title}
              </div>
            </div>

            {/* Description */}
            <div className="w-full">
              <div className="text-600 text-base font-light font-['Lato']">
                Start with <span className="text-amber-500 font-semibold">{selectedLevel.startingAmount}</span> {selectedLevel.description}
              </div>
            </div>
          </div>
        </div>

        {/* Let's Play Button */}
        <div 
          onClick={handleLetsPlay}
          className="lets-play-button w-96 px-16 py-4 rounded-[10px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all duration-200 transform hover:scale-105"
          style={{ backgroundColor: '#005DAA' }}
        >
          <div className="justify-start text-white text-2xl font-semibold font-['Lato']">
            Let's Play
          </div>
        </div>
      </div>
    </OnboardingBackground>
  );
};

export default OnboardingConfirmation;
