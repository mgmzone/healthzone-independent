
import React, { useMemo, useEffect } from 'react';
import { FastingLog } from '@/lib/types';
import FastingBarChart from './stats/FastingBarChart';
import { prepareChartData } from './stats/chartData';
import { useToast } from '@/hooks/use-toast';

interface FastingStatsProps {
  fastingLogs: FastingLog[];
  timeFilter: 'week' | 'month' | 'year';
}

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
      let normalizedStartTime;
      let normalizedEndTime = log.endTime;
      
      // Handle start time
      if (typeof log.startTime === 'object' && log.startTime !== null) {
        if ('_type' in log.startTime) {
          // Handle serialized Date objects from Supabase
          try {
            normalizedStartTime = new Date(log.startTime.value.iso);
          } catch (err) {
            console.error('Error parsing startTime:', err);
            normalizedStartTime = new Date(log.startTime);
          }
        } else {
          // It's already a Date object
          normalizedStartTime = log.startTime;
        }
      } else {
        // It's a string or timestamp
        normalizedStartTime = new Date(log.startTime);
      }
      
      // Handle end time if it exists
      if (log.endTime) {
        if (typeof log.endTime === 'object' && log.endTime !== null) {
          if ('_type' in log.endTime) {
            // Handle serialized Date objects from Supabase
            try {
              normalizedEndTime = new Date(log.endTime.value.iso);
            } catch (err) {
              console.error('Error parsing endTime:', err);
              normalizedEndTime = new Date(log.endTime);
            }
          } else {
            // It's already a Date object
            normalizedEndTime = log.endTime;
          }
        } else {
          // It's a string or timestamp
          normalizedEndTime = new Date(log.endTime);
        }
      }
      
      return {
        ...log,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime
      };
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
      const hasData = data.some(item => Math.abs(item.fasting) > 0 || Math.abs(item.eating) > 0);
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
