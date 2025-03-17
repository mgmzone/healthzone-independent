
import React from 'react';
import { format } from 'date-fns';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  isImperial: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isImperial }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const value = payload[0].value;
  
  // Make sure label is properly converted to a Date
  let date;
  if (typeof label === 'number') {
    date = new Date(label);
  } else if (label instanceof Date) {
    date = label;
  } else if (typeof label === 'string') {
    date = new Date(label);
  } else if (label?._type === 'Date' && label?.value?.value) {
    date = new Date(label.value.value);
  } else {
    date = new Date(); // fallback
  }
  
  const formattedDate = format(date, 'MMM d, yyyy');
  const weightUnit = isImperial ? 'lbs' : 'kg';
  
  // Determine if this is an actual or forecasted value
  const isActual = data.isActual;
  const isForecast = data.isForecast;
  
  // Set classNames based on point type
  const bgClass = isActual ? 'bg-blue-50 border-blue-200' : isForecast ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200';
  const textClass = isActual ? 'text-blue-800' : isForecast ? 'text-orange-800' : 'text-gray-800';
  
  return (
    <div className={`px-3 py-2 rounded-md shadow-sm border ${bgClass}`}>
      <p className="text-sm font-medium">{formattedDate}</p>
      <p className={`text-lg font-bold ${textClass}`}>{value.toFixed(1)} {weightUnit}</p>
      <p className="text-xs opacity-75">
        {isActual ? 'Actual Weight' : isForecast ? 'Projected Weight' : 'Weight'}
      </p>
    </div>
  );
};

export default CustomTooltip;
