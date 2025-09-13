import React from 'react';
import { useGameContext } from '../context/GameContext';
import logo from '../assets/RBC.svg';

const Navbar = () => {
  const { gameTimer } = useGameContext();
  
  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full">
      <div className="w-full bg-white shadow-sm">
        <div className="w-full px-4 py-4 md:py-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <img src={logo} alt="TradeOff logo" className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0" />
            <div className="leading-tight">
              <div className="text-lg md:text-3xl text-gray-900 font-bold">TradeOff <span className="font-light italic text-base md:text-2xl">Stock Market Simulator Game</span></div>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center justify-end md:justify-end gap-4">
            {/* Time Remaining Component - Left of profile picture, vertically centered */}
            <div className="flex items-center gap-2">
              <div className="text-gray-500 text-lg font-normal font-['Lato']">Time Remaining</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-gray-500 text-lg font-normal font-['Lato']">{formatTime(gameTimer)}</div>
            </div>
            
            <button aria-label="Profile" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#fff" />
                <path d="M2 22c0-4 4-6 10-6s10 2 10 6v0H2z" fill="#fff" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
