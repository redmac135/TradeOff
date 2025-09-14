import React, { useMemo } from 'react';
import { useGameContext } from '../context/GameContext';
import RbcWhite from '../assets/RBC White.svg';

// Full-screen results view shown after the endgame overlay
const EndgameResults = () => {
  const { totalPnL } = useGameContext();

  const { isLoss, label, amountAbs } = useMemo(() => {
    const isLossVal = (Number(totalPnL) || 0) < 0;
    const amt = Number(totalPnL) || 0;
    return {
      isLoss: isLossVal,
      label: isLossVal ? 'loss' : 'profit',
      amountAbs: Math.abs(amt),
    };
  }, [totalPnL]);

  // Placeholder for InvestEase number until API integration
  const investEaseAmount = null; // TODO: Replace with API result when available

  return (
    <div className= "min-h-screen w-full flex flex-col lg:flex-row" style={{ backgroundColor: '#015FA9' }}>
      {/* Left content panel */}
      <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 py-10 lg:py-16 inline-flex flex-col justify-center items-start gap-8 lg:gap-16">
        <div className="w-full flex flex-col justify-start items-start gap-3">
          <div className="w-full inline-flex justify-start items-center gap-4">
            <img src={RbcWhite} alt="RBC" className="w-10 h-12 object-contain" />
            <div className="flex-1">
              <div className="text-white text-3xl sm:text-4xl font-bold font-['Lato']">TradeOff Results</div>
            </div>
          </div>
        </div>

        <div className="w-full inline-flex flex-col sm:flex-row justify-start items-start gap-8 lg:gap-16">
          <div className="inline-flex flex-col justify-start items-start gap-2 min-w-[220px]">
            <div className="text-white text-lg sm:text-xl font-light font-['Roboto_Flex']">
              You ended with a {label} of...
            </div>
            <div className={`text-white text-3xl sm:text-5xl font-bold font-['Lato'] ${isLoss ? 'text-red-200' : 'text-green-200'}`}>
              {amountAbs.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex-1 inline-flex flex-col justify-start items-start gap-2 min-w-[220px]">
            <div className="text-white text-lg sm:text-xl font-light font-['Roboto_Flex']">
              InvestEase portfolio earned...
            </div>
            <div className="text-white text-3xl sm:text-5xl font-bold font-['Lato']">
              {investEaseAmount == null ? 'Coming soon' : investEaseAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col justify-start items-start gap-4 lg:gap-9">
          <div className="text-white text-2xl sm:text-4xl font-bold font-['Lato']">
            <span>Start Building Your Future </span>
            <span>Today</span>
          </div>
          <div className="text-white text-lg sm:text-2xl font-light font-['Roboto_Flex']">
            With an RBC student account, you can unlock the tools and resources that help you invest toward your real goals.
          </div>
          <div className="text-white text-base sm:text-2xl font-light font-['Roboto_Flex']">
            <div className="mb-2">You’ll unlock:</div>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2">
              <li>Student perks and rewards</li>
              <li>Goal-based saving and investing tools</li>
              <li>A seamless RBC InvestEase setup</li>
            </ul>
          </div>
        </div>

        <div className="w-full inline-flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 sm:gap-6">
          <a
            href="https://www.rbcdirectinvesting.com/learn/investing-for-beginners.html"
            target="_blank"
            rel="noreferrer"
            className="px-6 sm:px-9 py-3 sm:py-4 bg-white rounded-lg flex justify-center items-center gap-2 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          >
            <div className="text-[#015FA9] text-base sm:text-lg font-normal font-['Roboto_Flex']">Learn about Investing</div>
          </a>
          <a
            href="https://www.rbcroyalbank.com/bank-accounts/#new-to-rbc"
            target="_blank"
            rel="noreferrer"
            className="px-6 sm:px-9 py-3 sm:py-4 bg-white rounded-lg flex justify-center items-center gap-2 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          >
            <div className="text-[#015FA9] text-base sm:text-lg font-normal font-['Roboto_Flex']">Open an RBC Account</div>
          </a>
          {/* Intentionally omitting "Play Again" as requested */}
        </div>
      </div>

  {/* Right image panel - hidden on mobile */}
  <div className="hidden lg:block w-full lg:w-1/2 min-h-[280px] lg:min-h-screen relative">
        <img
          src="https://www.rbc.com/our-company/_assets-custom/images/corporate_profile_banner2.jpg"
          alt="RBC corporate profile banner"
          className="h-full w-full object-cover object-right"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default EndgameResults;
