
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  // Ensure we have a valid display value
  const displayValue = value !== undefined && value !== null ? value : '0';
  
  return (
    <div className="bg-slate-800 rounded-md p-4 flex-1 flex flex-col justify-center">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-2xl font-bold mt-1">{displayValue}</div>
    </div>
  );
};

export default StatsCard;
