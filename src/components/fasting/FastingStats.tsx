
import React, { useMemo, useEffect } from 'react';
import { FastingLog } from '@/lib/types';
import FastingBarChart from './stats/FastingBarChart';
import { prepareChartData } from './stats/chartData';
import { useToast } from '@/hooks/use-toast';

interface FastingStatsProps {
  fastingLogs: FastingLog[];
  timeFilter: 'week' | 'month' | 'year';
}

/**
 * Ensure date is a proper Date object
 */
const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  
  try {
    // Handle serialized Supabase dates
    if (date && typeof date === 'object' && '_type' in date) {
      if (date._type === 'Date' && date.value && date.value.iso) {
        return new Date(date.value.iso);
      }
    }
    // Try to create date from whatever we received
    return new Date(date);
  } catch (error) {
    console.error('Failed to parse date:', date, error);
    return new Date(); // Fallback to current date
  }
};

const FastingStats: React.FC<FastingStatsProps> = ({ fastingLogs, timeFilter }) => {
  const { toast } = useToast();
  
  // Debug logs for fastingLogs input
  useEffect(() => {
    console.log(`FastingStats received ${fastingLogs.length} logs for ${timeFilter} view`);
    if (fastingLogs.length > 0) {
      // Check if logs have proper date objects or if they need conversion
      const firstLog = fastingLogs[0];
      console.log('First log format check:', {
        id: firstLog.id,
        startTime: typeof firstLog.startTime,
        startTimeValue: firstLog.startTime,
        endTime: typeof firstLog.endTime,
        endTimeValue: firstLog.endTime
      });
    }
  }, [fastingLogs, timeFilter]);
  
  // Normalize logs to ensure consistent date objects
  const normalizedLogs = useMemo(() => {
    return fastingLogs.map(log => {
      // Create new objects to avoid mutating the original logs
      const normalizedLog = { ...log };
      
      // Convert startTime to Date object if needed
      normalizedLog.startTime = ensureDate(normalizedLog.startTime);
      
      // Convert endTime to Date object if it exists
      if (normalizedLog.endTime) {
        normalizedLog.endTime = ensureDate(normalizedLog.endTime);
      }
      
      return normalizedLog as FastingLog;
    });
  }, [fastingLogs]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    // Log for debugging
    console.log('FastingStats preparing chart data with normalized logs:', normalizedLogs.length);
    
    try {
      const data = prepareChartData(normalizedLogs, timeFilter);
      console.log(`FastingStats ${timeFilter} chart data:`, data);
      
      // Check if we have meaningful data
      const hasData = data.some(item => Math.abs(item.fasting || 0) > 0 || Math.abs(item.eating || 0) > 0);
      if (!hasData) {
        console.log(`No meaningful data for ${timeFilter} chart`);
      }
      
      return data;
    } catch (error) {
      console.error('Error preparing chart data:', error);
      toast({
        title: 'Error displaying chart',
        description: 'There was a problem processing your fasting data',
        variant: 'destructive',
      });
      return [];
    }
  }, [normalizedLogs, timeFilter, toast]);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-full bg-background rounded-md p-2">
        <FastingBarChart chartData={chartData} />
      </div>
    </div>
  );
};

export default FastingStats;
