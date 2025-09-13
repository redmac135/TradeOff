import React from 'react';
import logo from '../assets/RBC.svg';

const Navbar = () => {
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

          <div className="w-full md:w-auto flex justify-end md:justify-end">
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
