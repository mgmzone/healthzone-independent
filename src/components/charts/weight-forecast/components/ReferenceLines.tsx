
import React from 'react';
import { ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface ReferenceLinesProps {
  chartData: any[];
  today: Date;
  targetDate: Date | null;
  periodEndDate: Date | null;
}

export const ReferenceLines: React.FC<ReferenceLinesProps> = ({
  chartData,
  today,
  targetDate,
  periodEndDate,
}) => {
  // Convert dates to timestamps for use with ReferenceLine
  const todayTime = today.getTime();
  const targetTime = targetDate ? targetDate.getTime() : null;
  
  console.log('Reference lines rendering with:', {
    todayTime,
    targetTime,
    chartDataLength: chartData.length,
    today: format(today, 'yyyy-MM-dd'),
    targetDate: targetDate ? format(targetDate, 'yyyy-MM-dd') : 'none'
  });

  return (
    <>
      {/* Current Date line (red) */}
      <ReferenceLine
        x={todayTime}
        stroke="#E63946"
        strokeWidth={2}
        label={{ 
          value: 'Current Date', 
          position: 'top',
          fill: '#E63946',
          fontSize: 14,
          fontWeight: 600
        }}
      />
      
      {/* Forecast Goal line (red) - Only shown if we have a target date */}
      {targetTime && (
        <ReferenceLine
          x={targetTime}
          stroke="#E63946"
          strokeWidth={2}
          label={{ 
            value: 'Forecast Goal', 
            position: 'top',
            fill: '#E63946', 
            fontSize: 14,
            fontWeight: 600
          }}
        />
      )}
    </>
  );
};
