import React from 'react';

const MarketNews = () => {
  const newsItems = [
    {
      title: "Housing prices in Toronto up by 5%.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "high"
    },
    {
      title: "Tech stocks showing strong performance.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "medium"
    },
    {
      title: "Bank of Canada announces interest rate decision.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "medium"
    },
    {
      title: "Energy sector sees modest gains.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "medium"
    },
    {
      title: "Market volatility expected to continue.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "medium"
    },
    {
      title: "Commodity prices fluctuate amid global uncertainty.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-gray-700';
      case 'medium': return 'text-gray-500';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full h-full p-6 relative bg-gray-50 rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-2.5 overflow-hidden">
      <div className="text-blue-600 text-4xl font-normal font-['Lato'] flex-shrink-0">News Feed</div>
      <div className="w-full h-px bg-gray-300 flex-shrink-0"></div>
      
      <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto pr-2 min-h-0">
        {newsItems.map((item, index) => (
          <div key={index} className="w-full flex flex-col justify-start items-start gap-2">
            <div className="w-full flex justify-start items-start gap-2">
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
  );
};

export default MarketNews;
