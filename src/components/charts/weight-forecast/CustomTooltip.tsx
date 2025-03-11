
import React from 'react';
import { format } from 'date-fns';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isImperial: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label,
  isImperial 
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-medium">{`${payload[0].value.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`}</p>
        <p className="text-xs text-gray-500">{format(new Date(data.date), 'MMM d, yyyy')}</p>
        {data.isProjected && (
          <p className="text-xs text-blue-500">Projected</p>
        )}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
