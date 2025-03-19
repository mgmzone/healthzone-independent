
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
      if (date._type === 'Date') {
        if (date.value && typeof date.value === 'object' && 'iso' in date.value) {
          return new Date(date.value.iso);
        }
      }
    }
    
    // If it's a string, directly parse it
    if (typeof date === 'string') {
      return new Date(date);
    }
    
    // Create date from whatever we received
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
    console.log(`FastingStats received ${fastingLogs?.length || 0} logs for ${timeFilter} view`);
    if (fastingLogs?.length > 0) {
      // Log first few logs details to help debugging
      console.log('Sample logs (first 3):', fastingLogs.slice(0, 3).map(log => ({
        id: log.id,
        startTimeType: typeof log.startTime,
        startTimeValue: log.startTime,
        endTimeType: typeof log.endTime,
        endTimeValue: log.endTime
      })));
    } else {
      console.log('No fasting logs available');
    }
  }, [fastingLogs, timeFilter]);
  
  // Create a normalized array of logs
  const normalizedLogs = useMemo(() => {
    console.log('FastingStats normalizing logs...');
    
    // Guard against null/undefined logs
    if (!fastingLogs || !Array.isArray(fastingLogs)) {
      console.warn('FastingStats received invalid logs:', fastingLogs);
      return [];
    }
    
    // Process each log to normalize dates
    return fastingLogs.map(log => {
      try {
        // Create new objects to avoid mutating the original logs
        const normalizedLog = { ...log };
        
        // Convert startTime to Date object if needed
        normalizedLog.startTime = ensureDate(normalizedLog.startTime);
        
        // Convert endTime to Date object if it exists
        if (normalizedLog.endTime) {
          normalizedLog.endTime = ensureDate(normalizedLog.endTime);
        }
        
        return normalizedLog as FastingLog;
      } catch (error) {
        console.error('Error normalizing log:', log, error);
        return log; // Return original log if normalization fails
      }
    }).filter(log => 
      // Filter out logs with invalid dates
      log.startTime instanceof Date && !isNaN(log.startTime.getTime()) &&
      (!log.endTime || (log.endTime instanceof Date && !isNaN(log.endTime.getTime())))
    );
  }, [fastingLogs]);
  
  // Debug log for normalized logs
  useEffect(() => {
    if (normalizedLogs.length > 0) {
      console.log('Normalized logs (first 3):', normalizedLogs.slice(0, 3).map(log => ({
        id: log.id,
        startTime: log.startTime instanceof Date ? log.startTime.toISOString() : 'not a date',
        endTime: log.endTime instanceof Date ? log.endTime.toISOString() : 'not a date/not present'
      })));
    } else {
      console.log('No normalized logs available');
    }
  }, [normalizedLogs]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    console.log(`FastingStats preparing ${timeFilter} chart data with ${normalizedLogs.length} normalized logs`);
    
    try {
      const data = prepareChartData(normalizedLogs, timeFilter);
      console.log(`FastingStats ${timeFilter} chart data:`, data);
      
      // Check if we have meaningful data
      const hasData = data.some(item => Math.abs(item.fasting || 0) > 0.01 || Math.abs(item.eating || 0) > 0.01);
      console.log(`FastingStats ${timeFilter} chart has data:`, hasData);
      
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
