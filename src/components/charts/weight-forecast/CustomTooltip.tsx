
import React from 'react';
import { TooltipProps } from 'recharts';
import { format } from 'date-fns';

interface CustomTooltipProps extends TooltipProps<number, string> {
  isImperial: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, isImperial }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const unit = isImperial ? 'lbs' : 'kg';
  const weightValue = data.weight.toFixed(1);
  const dateText = format(new Date(data.date), 'MMM dd, yyyy');
  const isForecast = data.isForecast;
  
  return (
    <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md text-sm">
      <p className="font-semibold mb-1">{dateText}</p>
      <p className="text-gray-700">
        {isForecast ? 'Forecast: ' : 'Weight: '}
        <span className="font-medium text-slate-900">{weightValue} {unit}</span>
      </p>
      {isForecast && (
        <p className="text-xs text-gray-500 mt-1">Projected value</p>
      )}
    </div>
  );
};

export default CustomTooltip;
