import React from 'react';

const PositionCard = ({ title, value, type = "cash" }) => {
  return (
    <div className="w-full shadow-lg">
      <div className="w-full px-14 py-7 bg-gray-50 rounded-[10px] flex justify-center items-center">
        <div className="text-gray-900 text-2xl font-normal font-['Roboto_Flex']">
          {title}
        </div>
        {value && (
          <div className="ml-4 text-gray-700 text-xl font-medium">
            {type === "cash" ? `$${value.toLocaleString()}` : value}
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionCard;
