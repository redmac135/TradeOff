import React from 'react';

const Card = ({ title, value, type = "cash", className = "" }) => {
  const formatValue = () => {
    if (!value && value !== 0) return null;
    
    switch (type) {
      case "cash": {
        const numValue = typeof value === 'number' ? value : 0;
        const isNegative = numValue < 0;
        const displayValue = Math.abs(numValue);
        const sign = isNegative ? '-' : '';
        return `${sign}$${displayValue.toLocaleString()}`;
      }
      case "equity":
        return value;
      case "time":
        return value;
      default:
        return value;
    }
  };

  const getValueColor = () => {
    if (type === "cash" && typeof value === 'number') {
      if (value < 0) return "text-red-600";
      if (value > 0) return "text-green-600";
    }
    return "text-gray-700";
  };

  return (
    <div className={`w-full shadow-lg ${className}`}>
      <div className="w-full px-14 py-7 bg-gray-50 rounded-[10px] flex justify-center items-center">
        <div className="text-gray-900 text-2xl font-normal font-['Roboto_Flex']">
          {title}
        </div>
        {(value || value === 0) && (
          <div className={`ml-4 text-xl font-medium ${getValueColor()}`}>
            {formatValue()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
