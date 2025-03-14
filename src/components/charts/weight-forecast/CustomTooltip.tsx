
import React from 'react';
import { TooltipProps } from 'recharts';
import { format } from 'date-fns';

interface ChartData {
  date: Date;
  weight: number;
  isProjected: boolean;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  isImperial: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, isImperial }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload as ChartData;
  const unit = isImperial ? 'lbs' : 'kg';
  const weightValue = data.weight.toFixed(1);
  const dateText = format(data.date, 'MM/dd/yy');
  const isPrediction = data.isProjected;

  return (
    <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-xs">
      <p className="font-semibold mb-1">{dateText}</p>
      <p className="text-gray-700">
        {isPrediction ? 'Projected: ' : 'Actual: '}
        <span className="font-medium text-slate-900">{weightValue} {unit}</span>
      </p>
    </div>
  );
};

export default CustomTooltip;
