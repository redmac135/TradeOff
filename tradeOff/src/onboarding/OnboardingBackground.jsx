import React from 'react';
import CoolBackground from '../assets/Cool Background RBC.svg';

const OnboardingBackground = ({ children }) => {
  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Cool Background SVG */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${CoolBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Content container - centered on screen */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

export default OnboardingBackground;
