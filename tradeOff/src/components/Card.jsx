import React from 'react';

const Card = ({ title, value, type = "cash", className = "" }) => {
  const formatValue = () => {
    if (!value) return null;
    
    switch (type) {
      case "cash":
        return `$${value.toLocaleString()}`;
      case "equity":
        return value;
      default:
        return value;
    }
  };

  return (
    <div className={`w-full shadow-lg ${className}`}>
      <div className="w-full px-14 py-7 bg-gray-50 rounded-[10px] flex justify-center items-center">
        <div className="text-gray-900 text-2xl font-normal font-['Roboto_Flex']">
          {title}
        </div>
        {value && (
          <div className="ml-4 text-gray-700 text-xl font-medium">
            {formatValue()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
