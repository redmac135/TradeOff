import React, { useEffect, useState } from 'react';
import { AlarmClock } from 'lucide-react';
import './endgame.css';

const EndgameOverlay = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0: ripple, 1: clock yellow, 2: show subtitle

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200); // after ripple begins
    const t2 = setTimeout(() => setPhase(2), 2000); // show subtitle after clock turns
    const t3 = setTimeout(() => onComplete && onComplete(), 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center endgame-overlay">
      {/* Expanding circle from center */}
      <div className="endgame-ripple" aria-hidden />

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center text-center px-4">
        <div className="flex items-center gap-3">
          <AlarmClock
            className={`transition-colors duration-600 w-10 h-10 sm:w-12 sm:h-12 ${phase >= 1 ? '' : 'text-white'}`}
            style={phase >= 1 ? { color: '#FFD203' } : undefined}
          />
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-md">
            Time's Up
          </h1>
        </div>
        <div
          className={`mt-4 text-white/90 text-base sm:text-lg md:text-xl font-medium transition-opacity duration-600 ${
            phase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Let's see how you did
        </div>
      </div>
    </div>
  );
};

export default EndgameOverlay;
