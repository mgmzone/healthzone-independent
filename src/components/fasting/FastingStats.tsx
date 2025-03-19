
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
      // Create new objects to avoid mutating the original logs
      const normalizedLog = { ...log };
      
      // Convert startTime to Date object if needed
      if (!(normalizedLog.startTime instanceof Date)) {
        try {
          // Handle potential serialized objects from Supabase
          if (typeof normalizedLog.startTime === 'object' && normalizedLog.startTime !== null) {
            // Check for serialized Date from Supabase (has _type property)
            if ('_type' in normalizedLog.startTime) {
              let dateStr;
              try {
                // Access the actual date string safely
                const anyStart = normalizedLog.startTime as any;
                if (anyStart.value && anyStart.value.iso) {
                  dateStr = anyStart.value.iso;
                } else {
                  dateStr = String(normalizedLog.startTime);
                }
              } catch (e) {
                dateStr = String(normalizedLog.startTime);
              }
              normalizedLog.startTime = new Date(dateStr);
            } else {
              normalizedLog.startTime = new Date(normalizedLog.startTime as any);
            }
          } else {
            // Handle string dates
            normalizedLog.startTime = new Date(normalizedLog.startTime as string);
          }
        } catch (err) {
          console.error('Error converting startTime to Date:', err, normalizedLog.startTime);
          normalizedLog.startTime = new Date(); // Fallback
        }
      }
      
      // Convert endTime to Date object if it exists and isn't already a Date
      if (normalizedLog.endTime && !(normalizedLog.endTime instanceof Date)) {
        try {
          // Handle potential serialized objects from Supabase
          if (typeof normalizedLog.endTime === 'object' && normalizedLog.endTime !== null) {
            // Check for serialized Date from Supabase (has _type property)
            if ('_type' in normalizedLog.endTime) {
              let dateStr;
              try {
                // Access the actual date string safely
                const anyEnd = normalizedLog.endTime as any;
                if (anyEnd.value && anyEnd.value.iso) {
                  dateStr = anyEnd.value.iso;
                } else {
                  dateStr = String(normalizedLog.endTime);
                }
              } catch (e) {
                dateStr = String(normalizedLog.endTime);
              }
              normalizedLog.endTime = new Date(dateStr);
            } else {
              normalizedLog.endTime = new Date(normalizedLog.endTime as any);
            }
          } else {
            // Handle string dates
            normalizedLog.endTime = new Date(normalizedLog.endTime as string);
          }
        } catch (err) {
          console.error('Error converting endTime to Date:', err, normalizedLog.endTime);
          if (normalizedLog.startTime instanceof Date) {
            // Use a reasonable fallback - a few hours after start
            normalizedLog.endTime = new Date(normalizedLog.startTime.getTime() + (18 * 60 * 60 * 1000));
          } else {
            normalizedLog.endTime = new Date(); // Last resort fallback
          }
        }
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
