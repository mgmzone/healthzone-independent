
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Text } from 'recharts';
import { format } from 'date-fns';

interface ChartAxesProps {
  formatDateForAxis: (date: Date) => string;
  minWeight: number;
  maxWeight: number;
  isImperial: boolean;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({ 
  formatDateForAxis, 
  minWeight, 
  maxWeight,
  isImperial
}) => {
  const weightUnit = isImperial ? 'lbs' : 'kg';

  return (
    <>
      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
      <XAxis 
        dataKey="date"
        tickFormatter={(date) => formatDateForAxis(date)}
        angle={0}
        textAnchor="middle"
        height={60}
        interval="preserveStartEnd"
        tick={{ fontSize: 12, fill: '#666' }}
        axisLine={{ stroke: '#E0E0E0' }}
        tickLine={{ stroke: '#E0E0E0' }}
        label={{ 
          value: 'Month', 
          position: 'insideBottom', 
          offset: -10,
          fill: '#666' 
        }}
      />
      <YAxis 
        domain={[minWeight, maxWeight]}
        tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value.toString()}
        tick={{ fontSize: 11, fill: '#666' }}
        axisLine={{ stroke: '#E0E0E0' }}
        tickLine={{ stroke: '#E0E0E0' }}
        width={60}
        label={{ 
          value: `Weight (${weightUnit})`, 
          angle: -90, 
          position: 'insideLeft', 
          offset: 10,
          style: { textAnchor: 'middle' },
          fill: '#666' 
        }}
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
