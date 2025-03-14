
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
  // Format date to string for use with ReferenceLine
  const formatDateToString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Get the date strings for reference lines
  const todayStr = formatDateToString(today);
  const targetDateStr = targetDate ? formatDateToString(targetDate) : null;
  
  // Find date objects in chartData that match (or are closest to) our reference dates
  const findClosestDate = (targetDateStr: string | null): string | null => {
    if (!targetDateStr || !chartData || chartData.length === 0) return null;
    
    const targetDate = new Date(targetDateStr);
    const targetTime = targetDate.getTime();
    
    // Find the closest date in chartData
    let closestDate = null;
    let minDiff = Number.MAX_VALUE;
    
    for (const item of chartData) {
      const itemDate = new Date(item.date);
      const diff = Math.abs(itemDate.getTime() - targetTime);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestDate = item.date;
      }
    }
    
    return closestDate ? formatDateToString(new Date(closestDate)) : null;
  };
  
  // Find closest dates in chart data
  const closestTodayDate = findClosestDate(todayStr);
  const closestTargetDate = findClosestDate(targetDateStr);
  
  return (
    <>
      {/* Current Date line (red) */}
      {closestTodayDate && (
        <ReferenceLine
          x={closestTodayDate}
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
      )}
      
      {/* Forecast Goal line (red) */}
      {closestTargetDate && (
        <ReferenceLine
          x={closestTargetDate}
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
