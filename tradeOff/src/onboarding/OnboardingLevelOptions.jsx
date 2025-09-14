import React, { useState } from 'react';
import OnboardingBackground from './OnboardingBackground';
import OnboardingHeader from './OnboardingHeader';
import { GraduationCap, Car, Home, ChevronUp } from 'lucide-react';

const OnboardingLevelOptions = ({ onNext }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    {
      id: 'easy',
      title: 'Pay for my tuition next year',
      icon: GraduationCap,
      startingAmount: '$1,000',
      targetAmount: '$10,000',
      description: 'and invest to reach $10,000 for your tuition.'
    },
    {
      id: 'medium',
      title: 'Purchase my first vehicle',
      icon: Car,
      startingAmount: '$5,000',
      targetAmount: '$20,000',
      description: 'and invest to reach $20,000 for your car.'
    },
    {
      id: 'hard',
      title: 'Pay the down payment on a home',
      icon: Home,
      startingAmount: '$15,000',
      targetAmount: '$50,000',
      description: 'and invest to reach $50,000 for your first home.'
    }
  ];

  const handleLevelSelect = (levelId) => {
    setSelectedLevel(selectedLevel === levelId ? null : levelId);
  };

  const handleLevelNext = (level) => {
    // Save the selected level and starting amount for the game
    localStorage.setItem('selectedLevel', level.id);
    localStorage.setItem('startingCash', level.startingAmount.replace('$', '').replace(',', ''));
    localStorage.setItem('targetAmount', level.targetAmount.replace('$', '').replace(',', ''));
    onNext();
  };

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
              Choose your goal and starting balance
            </div>
          </div>

          {/* Accordion Options */}
          <div className="w-96 inline-flex flex-col justify-start items-start gap-4">
            {levels.map((level) => {
              const IconComponent = level.icon;
              const isSelected = selectedLevel === level.id;
              
              return (
                <div
                  key={level.id}
                  className={`self-stretch p-4 relative rounded-[10px] shadow-[4px_4px_10px_0px_rgba(0,0,0,0.10)] flex flex-col justify-center items-start gap-3 cursor-pointer transition-all duration-300 ${
                    isSelected ? 'bg-Blue bg-opacity-5 border border-Blue' : 'bg-50'
                  }`}
                >
                  {/* Main Content Header */}
                  <div 
                    className="w-full flex items-center justify-between"
                    onClick={() => handleLevelSelect(level.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="size-6 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-Blue" />
                      </div>
                      {/* Title */}
                      <div className="justify-start text-800 text-lg font-semibold font-['Lato']">
                        {level.title}
                      </div>
                    </div>
                    
                    {/* Dropdown Arrow */}
                    <div className={`size-6 flex items-center justify-center transition-transform duration-300 ${
                      isSelected ? 'rotate-180' : ''
                    }`}>
                      <ChevronUp className="w-4 h-4 text-300" />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isSelected && (
                    <div className="w-full animate-slideDown">
                      {/* Description */}
                      <div className="mb-4">
                        <div className="text-600 text-base font-light font-['Lato']">
                          Start with <span className="text-Yellow font-semibold">{level.startingAmount}</span> {level.description}
                        </div>
                      </div>

                      {/* Next Button */}
                      <div 
                        onClick={() => handleLevelNext(level)}
                        className="w-full py-3 px-6 bg-Blue rounded-[10px] flex justify-center items-center cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      >
                        <div className="text-Light-Blue text-lg font-semibold font-['Lato']">
                          Next
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </OnboardingBackground>
  );
};

export default OnboardingLevelOptions;
