import React from 'react';
import { useGameContext } from '../context/GameContext';
import { useOnboarding } from '../context/OnboardingContext';
import MarketNews from './MarketNews';
import FinancialChart from './FinancialChart_mobile';
import PositionControl from './PositionControl';
import logo from '../assets/RBC.svg';

const Navbar = ({ demoData, demoMarketData }) => {
  const { gameTimer } = useGameContext();
  const { triggerOnboarding } = useOnboarding();
  
  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full">
      <div className="w-full bg-white shadow-sm">
        {/* Desktop Layout */}
        <div className="hidden md:flex w-full px-8 py-6 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradeOff logo" className="w-12 h-12 object-contain flex-shrink-0" />
            <div className="leading-tight">
              <div className="text-3xl text-gray-900 font-bold">TradeOff <span className="font-light italic text-2xl">Stock Market Simulator Game</span></div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            {/* Help/Tutorial Button */}
            <button
              onClick={triggerOnboarding}
              aria-label="Start Tutorial"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tutorial</span>
            </button>
            
            {/* Time Remaining Component - Left of profile picture, vertically centered */}
            <div className="flex items-center gap-2" data-tour="timer">
              <div className="text-gray-500 text-lg font-normal font-['Lato']">Time Remaining</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-gray-500 text-lg font-normal font-['Lato']">{formatTime(gameTimer)}</div>
            </div>
            
            <button aria-label="Profile" className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#fff" />
                <path d="M2 22c0-4 4-6 10-6s10 2 10 6v0H2z" fill="#fff" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden w-full px-4 pt-8 pb-8 flex flex-col items-center gap-4">
          {/* Centered Logo and Title */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradeOff logo" className="w-10 h-10 object-contain flex-shrink-0" />
            <div className="leading-tight">
              <div className="text-lg text-gray-900 font-bold">TradeOff <span className="font-light italic text-base">Stock Market Simulator Game</span></div>
            </div>
          </div>

          {/* Timer Component - New Line, Centered */}
          <div className="px-3 py-2.5 bg-sky-50 rounded-[10px] inline-flex justify-start items-center gap-3" data-tour="timer">
            <div className="flex justify-start items-center gap-1">
              <div className="justify-start text-gray-500 text-base font-normal font-['Lato']">Time Remaining</div>
              <div className="flex justify-start items-center gap-1">
                <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="justify-start text-gray-500 text-base font-normal font-['Lato']">{formatTime(gameTimer)}</div>
              </div>
            </div>
          </div>

          {/* News Feed - Right below timer on mobile */}
          <div className="w-full flex justify-center" data-tour="news-feed">
            <MarketNews demoData={demoData} />
          </div>

          {/* Financial Chart - Below news feed on mobile with space for P&L */}
          <div className="w-full px-2 mt-6" data-tour="chart">
            <FinancialChart 
              useMockData={true} 
              apiData={[]} 
              demoData={demoMarketData}
            />
          </div>

          {/* Position Control - Below chart on mobile */}
          <div className="w-full px-2" data-tour="demo-trade">
            <PositionControl />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
