import React from 'react';
import { Newspaper } from 'lucide-react';

const NewsFeed = () => {
  const newsItems = [
    {
      title: "Housing prices in Toronto up by 5%.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "high",
      time: "2 hours ago"
    },
    {
      title: "Tech stocks showing strong performance.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "medium",
      time: "4 hours ago"
    },
    {
      title: "Bank of Canada announces interest rate decision.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "high",
      time: "6 hours ago"
    },
    {
      title: "Energy sector sees modest gains.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "low",
      time: "8 hours ago"
    },
    {
      title: "Market volatility expected to continue.",
      description: "Lorem ipsum is a placeholder text used in graphic design, publishing, and web development.",
      priority: "medium",
      time: "10 hours ago"
    }
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-[10px] shadow-md p-6 h-72 relative">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
        <Newspaper className="text-gray-800" size={20} />
        <span>Market News</span>
      </h3>
      <div className="space-y-3 h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {newsItems.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
            <div className="text-sm font-medium text-gray-900 mb-1">{item.title}</div>
            <div className="text-xs text-gray-600 mb-1">{item.time}</div>
            <div 
              className={`inline-block px-2 py-1 rounded text-xs ${priorityColors[item.priority]}`}
            >
              {item.priority} priority
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </div>
  );
};

export default NewsFeed;
