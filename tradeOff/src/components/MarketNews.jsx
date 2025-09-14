import React, { useMemo } from 'react';
import { Newspaper } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useGameData } from '../hooks/useGameData';

const MarketNews = ({ demoData }) => {
  const { isDemoMode, showInitialPrompt } = useOnboarding();
  const liveEnabled = !isDemoMode && !showInitialPrompt;
  const { news } = useGameData(liveEnabled);

  const displayNewsItems = useMemo(() => {
    // Prefer provided demo data during onboarding, otherwise live news
    const source = (isDemoMode && Array.isArray(demoData)) ? demoData : news;
    const normalize = (item) => ({
      title: item?.title ?? item?.Headline ?? '',
      description: item?.description ?? item?.Summary ?? '',
      priority: item?.priority ?? item?.Priority ?? 'medium',
    });
    return Array.isArray(source) ? source.map(normalize) : [];
  }, [news, isDemoMode, demoData]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-gray-700';
      case 'medium': return 'text-gray-500';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
  {/* Desktop Layout */}
  <div className="hidden md:flex w-full h-full p-6 relative bg-gray-50 rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.05)] flex-col gap-2.5 overflow-hidden" data-tour="news-feed news-primary">
        <div className="text-blue-600 text-4xl font-normal font-['Lato'] flex-shrink-0 flex items-center gap-3">
          <Newspaper className="text-blue-600" size={36} />
          <span>News Feed</span>
        </div>
        <div className="w-full h-px bg-gray-300 flex-shrink-0"></div>
        
        <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto pr-2 min-h-0">
          {displayNewsItems.map((item, index) => (
            <div key={index} className="w-full flex flex-col justify-start items-start gap-2">
              <div className="w-full flex justify-start items-start gap-3">
                <div className={`text-lg font-medium font-['Roboto_Flex'] ${getPriorityColor(item.priority)}`}>
                  {item.title}
                </div>
              </div>
              <div className={`w-full text-sm font-normal font-['Roboto_Flex'] ${getPriorityColor(item.priority)}`}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
        
        {/* Gradient fade effect */}
        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
      </div>

  {/* Mobile Layout */}
  <div className="md:hidden w-96 h-40 relative" data-tour="news-feed news-primary">
        {/* Background cards for stacked effect - positioned to look like cards underneath */}
        <div className="w-96 h-28 p-4 left-[12px] top-[28px] absolute bg-gray-100 rounded-lg shadow-[2px_2px_12px_0px_rgba(0,0,0,0.08)] transform rotate-[1deg]" />
        <div className="w-96 h-28 p-4 left-[8px] top-[22px] absolute bg-gray-200 rounded-lg shadow-[3px_3px_15px_0px_rgba(0,0,0,0.12)] transform rotate-[-0.5deg]" />
        <div className="w-96 h-28 p-4 left-[4px] top-[16px] absolute bg-gray-300 rounded-lg shadow-[4px_4px_18px_0px_rgba(0,0,0,0.15)] transform rotate-[0.8deg]" />
        
        {/* Main card - top of the stack */}
        <div className="w-96 p-4 left-0 top-0 absolute bg-white rounded-[10px] shadow-[6px_6px_25px_0px_rgba(0,0,0,0.20)] inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden transform hover:scale-105 transition-transform duration-200">
          <div className="inline-flex justify-start items-center gap-[5px]">
            <div className="w-4 h-4 relative overflow-hidden">
              <Newspaper className="w-3.5 h-3.5 absolute left-[1.50px] top-[1.50px]" style={{ color: '#015FA9' }} />
            </div>
            <div className="justify-start text-lg font-normal font-['Lato']" style={{ color: '#015FA9' }}>News Feed</div>
          </div>
          <div className="self-stretch h-px bg-gray-300" />
          {displayNewsItems.length > 0 && (
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <div className="self-stretch inline-flex justify-start items-start gap-1.5">
                <div className="justify-start text-gray-700 text-sm font-semibold font-['Roboto_Flex']">{displayNewsItems[0].title}</div>
              </div>
              <div className="self-stretch justify-start text-gray-700 text-xs font-normal font-['Roboto_Flex']">{displayNewsItems[0].description}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MarketNews;
