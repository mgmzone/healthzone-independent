
import React from 'react';
import { ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { WeeklyWeightData } from '../utils/types';

interface ReferenceLinesProps {
  chartData: WeeklyWeightData[];
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
  const periodEndStr = periodEndDate ? formatDateToString(periodEndDate) : null;
  
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
  const closestPeriodEndDate = findClosestDate(periodEndStr);
  
  return (
    <>
      {closestPeriodEndDate && (
        <ReferenceLine
          x={closestPeriodEndDate}
          stroke="#dc2626"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          label={{ 
            value: 'Period End', 
            position: 'insideTopRight',
            fill: '#dc2626',
            fontSize: 11
          }}
        />
      )}
      
      {closestTodayDate && (
        <ReferenceLine
          x={closestTodayDate}
          stroke="#2563eb"
          strokeWidth={1.5}
          label={{ 
            value: 'Today', 
            position: 'insideTopRight',
            fill: '#2563eb',
            fontSize: 11
          }}
        />
      )}
      
      {closestTargetDate && (
        <ReferenceLine
          x={closestTargetDate}
          stroke="#16a34a"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          label={{ 
            value: 'Goal Date', 
            position: 'insideTopRight',
            fill: '#16a34a',
            fontSize: 11
          }}
        />
      )}
    </>
  );
};
