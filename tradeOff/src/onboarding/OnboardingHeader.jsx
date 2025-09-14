import React from 'react';
import RBCLogo from '../assets/RBC.svg';

const OnboardingHeader = () => {
  return (
    <div className="self-stretch inline-flex flex-col justify-start items-center gap-6">
      {/* RBC Logo */}
      <div className="w-20 h-24 relative overflow-hidden">
        <img 
          src={RBCLogo} 
          alt="RBC Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Title and Subtitle */}
      <div className="self-stretch flex flex-col justify-start items-center gap-1">
        <div className="text-center justify-start text-900 text-5xl font-bold font-['Lato']">
          TradeOff
        </div>
        <div className="self-stretch text-center justify-start text-800 text-3xl font-light font-['Lato']">
          Stock Market Simulator Game
        </div>
      </div>
    </div>
  );
};

export default OnboardingHeader;
