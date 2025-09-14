import React, { useState } from 'react';
import OnboardingBackground from './OnboardingBackground';
import OnboardingHeader from './OnboardingHeader';

const OnboardingLevelOptions = ({ onNext }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    {
      id: 'easy',
      title: 'Pay for my tuition next year',
      difficulty: 'Easy',
      icon: '📚', // Temporary icon, will be replaced
      details: {
        startingBalance: '$10,000',
        targetAmount: '$15,000',
        timeLimit: '6 months'
      }
    },
    {
      id: 'medium',
      title: 'Purchase my first vehicle',
      difficulty: 'Medium',
      icon: '🚗', // Temporary icon, will be replaced
      details: {
        startingBalance: '$5,000',
        targetAmount: '$25,000',
        timeLimit: '1 year'
      }
    },
    {
      id: 'hard',
      title: 'Pay the down payment on a home',
      difficulty: 'Hard',
      icon: '🏠', // Temporary icon, will be replaced
      details: {
        startingBalance: '$2,000',
        targetAmount: '$50,000',
        timeLimit: '2 years'
      }
    }
  ];

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(selectedLevel === levelId ? null : levelId);
  };

  const handleNext = () => {
    if (selectedLevel) {
      // Save the selected level for later use
      localStorage.setItem('selectedLevel', selectedLevel);
      onNext();
    }
  };

  return (
    <OnboardingBackground>
      <div className="w-96 inline-flex flex-col justify-start items-center gap-9">
        {/* Logo and Title Section */}
        <OnboardingHeader />

        {/* Level Options Section */}
        <div className="self-stretch flex flex-col justify-start items-center gap-6">
          <div className="self-stretch flex flex-col justify-start items-center gap-2">
            <div className="justify-start text-700 text-2xl font-bold font-['Lato']">
              Level Options
            </div>
            <div className="justify-start text-600 text-lg font-light font-['Lato']">
              Choose your goal and starting balance
            </div>
          </div>

          {/* Accordion Options */}
          <div className="w-96 inline-flex flex-col justify-start items-start gap-6">
            {levels.map((level) => (
              <div
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={`self-stretch p-4 relative rounded-[10px] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] flex flex-col justify-center items-start gap-2.5 cursor-pointer transition-all duration-300 ${
                  selectedLevel === level.id ? 'bg-Blue bg-opacity-10 border-2 border-Blue' : 'bg-50'
                }`}
              >
                {/* Main Content */}
                <div className="w-full flex flex-col justify-start items-start gap-2.5">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {/* Icon placeholder */}
                      <div className="size-6 relative overflow-hidden flex items-center justify-center">
                        <div className="w-6 h-5 bg-400 rounded" />
                      </div>
                      {/* Title */}
                      <div className="justify-start text-800 text-2xl font-semibold font-['Lato']">
                        {level.title}
                      </div>
                    </div>
                    
                    {/* Dropdown Arrow */}
                    <div className={`size-6 overflow-hidden flex items-center justify-center transition-transform duration-300 ${
                      selectedLevel === level.id ? 'rotate-180' : ''
                    }`}>
                      <div className="w-3 h-2 bg-300 transform rotate-90" style={{
                        clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
                      }} />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {selectedLevel === level.id && (
                    <div className="w-full mt-4 p-4 bg-white bg-opacity-50 rounded-lg animate-slideDown">
                      <div className="flex flex-col gap-2">
                        <div className="text-700 text-lg font-medium font-['Lato']">
                          Difficulty: {level.difficulty}
                        </div>
                        <div className="text-600 text-base font-light font-['Lato']">
                          Starting Balance: {level.details.startingBalance}
                        </div>
                        <div className="text-600 text-base font-light font-['Lato']">
                          Target Amount: {level.details.targetAmount}
                        </div>
                        <div className="text-600 text-base font-light font-['Lato']">
                          Time Limit: {level.details.timeLimit}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        {selectedLevel && (
          <div 
            onClick={handleNext}
            className="w-96 px-16 py-4 bg-Blue rounded-[10px] inline-flex justify-center items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          >
            <div className="justify-start text-Light-Blue text-2xl font-semibold font-['Lato']">
              Start Game
            </div>
          </div>
        )}
      </div>
    </OnboardingBackground>
  );
};

export default OnboardingLevelOptions;
