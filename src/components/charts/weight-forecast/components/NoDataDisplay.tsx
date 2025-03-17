
import React from 'react';

const NoDataDisplay: React.FC = () => {
  return (
    <div className="text-center text-gray-500 h-64 flex items-center justify-center">
      <p>Not enough data to create a weight chart. Please add at least one weight entry.</p>
    </div>
  );
};

export default NoDataDisplay;
