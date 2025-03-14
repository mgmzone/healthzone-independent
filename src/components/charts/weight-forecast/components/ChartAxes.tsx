
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
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="date"
        tickFormatter={(date) => formatDateForAxis(date)}
        angle={-45}
        textAnchor="end"
        height={80}
        interval="preserveStartEnd"
        tick={{ fontSize: 10 }}
      />
      <YAxis 
        domain={[minWeight, maxWeight]}
        tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value.toString()}
        tick={{ fontSize: 10 }}
      />
    </>
  );
};

export const createDateFormatter = () => {
  return (date: Date): string => {
    return format(date, 'MM/dd/yy');
  };
};
