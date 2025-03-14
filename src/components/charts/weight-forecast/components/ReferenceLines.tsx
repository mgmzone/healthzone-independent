
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
  const findExactOrClosestDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    
    // Convert string date to Date object for comparison
    const targetDate = new Date(dateStr);
    
    // First try to find exact match by comparing date strings
    for (const item of chartData) {
      const itemDateStr = formatDateToString(new Date(item.date));
      if (itemDateStr === dateStr) {
        return new Date(item.date);
      }
    }
    
    // If not found, find closest future date
    const targetTime = targetDate.getTime();
    const futureDates = chartData
      .filter(item => new Date(item.date).getTime() >= targetTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return futureDates.length > 0 ? new Date(futureDates[0].date) : null;
  };
  
  // Find exact or closest dates from chart data
  const exactTodayDate = findExactOrClosestDate(todayStr);
  const exactTargetDate = findExactOrClosestDate(targetDateStr);
  const exactPeriodEndDate = findExactOrClosestDate(periodEndStr);

  // Convert back to strings for the ReferenceLine component
  const todayDateStr = exactTodayDate ? formatDateToString(exactTodayDate) : null;
  const targetDateRefStr = exactTargetDate ? formatDateToString(exactTargetDate) : null;
  const periodEndDateStr = exactPeriodEndDate ? formatDateToString(exactPeriodEndDate) : null;

  console.log('ReferenceLines - Chart Data Points:', chartData.map(d => formatDateToString(new Date(d.date))));
  console.log('ReferenceLines - Today:', todayStr, '-> exact/closest:', todayDateStr);
  console.log('ReferenceLines - Target:', targetDateStr, '-> exact/closest:', targetDateRefStr);
  console.log('ReferenceLines - Period End:', periodEndStr, '-> exact/closest:', periodEndDateStr);

  return (
    <>
      {todayDateStr && (
        <ReferenceLine
          x={todayDateStr}
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
      
      {targetDateRefStr && (
        <ReferenceLine
          x={targetDateRefStr}
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
      
      {periodEndDateStr && (
        <ReferenceLine
          x={periodEndDateStr}
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
