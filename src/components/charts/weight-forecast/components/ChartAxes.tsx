
import React from 'react';
import { XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface ChartAxesProps {
  formatDateForAxis: (date: Date) => string;
  minWeight: number;
  maxWeight: number;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({ 
  formatDateForAxis, 
  minWeight, 
  maxWeight 
}) => {
  return (
    <>
      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
      <XAxis 
        dataKey="date"
        tickFormatter={(date) => formatDateForAxis(date)}
        angle={0}
        textAnchor="middle"
        height={50}
        interval="preserveStartEnd"
        tick={{ fontSize: 12, fill: '#666' }}
        axisLine={{ stroke: '#E0E0E0' }}
        tickLine={{ stroke: '#E0E0E0' }}
      />
      <YAxis 
        domain={[minWeight, maxWeight]}
        tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value.toString()}
        tick={{ fontSize: 11, fill: '#666' }}
        axisLine={{ stroke: '#E0E0E0' }}
        tickLine={{ stroke: '#E0E0E0' }}
        width={50}
      />
    </>
  );
};

export const createDateFormatter = () => {
  return (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'MMM yyyy');
  };
};
