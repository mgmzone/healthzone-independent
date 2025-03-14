
import React from 'react';
import { TooltipProps } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

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
    <div className={cn(
      "bg-white dark:bg-gray-800 p-3 border shadow-md rounded-md text-sm",
      "border-gray-200 dark:border-gray-700"
    )}>
      <p className="font-semibold mb-1 text-gray-800 dark:text-gray-200">{dateText}</p>
      <p className={cn(
        "flex items-center font-medium",
        isForecast 
          ? "text-orange-600 dark:text-orange-400" 
          : "text-blue-600 dark:text-blue-400"
      )}>
        <span className="mr-1">
          {isForecast ? 'Forecast:' : 'Weight:'}
        </span>
        <span>{weightValue} {unit}</span>
      </p>
      {isForecast && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
          Projected value
        </p>
      )}
    </div>
  );
};

export default CustomTooltip;
