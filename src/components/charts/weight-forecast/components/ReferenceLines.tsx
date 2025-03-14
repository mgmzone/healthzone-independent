
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
  
  // Find the exact dates in the chartData for reference lines
  const findExactOrClosestDate = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    
    // First try to find exact match
    const found = chartData.find(item => formatDateToString(new Date(item.date)) === dateStr);
    if (found) return formatDateToString(new Date(found.date));
    
    // If not found, find closest future date
    const targetTime = new Date(dateStr).getTime();
    const closestFuture = chartData
      .filter(item => new Date(item.date).getTime() >= targetTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      
    return closestFuture ? formatDateToString(new Date(closestFuture.date)) : null;
  };
  
  const exactTodayDate = findExactOrClosestDate(todayStr);
  const exactTargetDate = findExactOrClosestDate(targetDateStr);
  const exactPeriodEndDate = findExactOrClosestDate(periodEndStr);

  return (
    <>
      {exactTodayDate && (
        <ReferenceLine
          x={exactTodayDate}
          stroke="#2563eb"
          strokeWidth={2}
          label={{ 
            value: 'Today', 
            position: 'insideTopRight',
            fill: '#2563eb',
            fontSize: 10
          }}
        />
      )}
      
      {exactTargetDate && (
        <ReferenceLine
          x={exactTargetDate}
          stroke="#16a34a"
          strokeWidth={2}
          strokeDasharray="3 3"
          label={{ 
            value: 'Target Date', 
            position: 'insideTopRight',
            fill: '#16a34a',
            fontSize: 10
          }}
        />
      )}
      
      {exactPeriodEndDate && (
        <ReferenceLine
          x={exactPeriodEndDate}
          stroke="#dc2626"
          strokeWidth={2}
          label={{ 
            value: 'Period End', 
            position: 'insideTopRight',
            fill: '#dc2626',
            fontSize: 10
          }}
        />
      )}
    </>
  );
};
