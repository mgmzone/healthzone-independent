
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
    // Log the input for debugging
    console.log('FastingStats ensureDate input:', JSON.stringify(date));
    
    // Handle serialized Supabase dates
    if (date && typeof date === 'object' && '_type' in date) {
      if (date._type === 'Date') {
        if (date.value && typeof date.value === 'object' && 'iso' in date.value) {
          console.log('Parsing from iso string:', date.value.iso);
          return new Date(date.value.iso);
        }
      }
    }
    
    // If it's a string, directly parse it
    if (typeof date === 'string') {
      console.log('Parsing from string:', date);
      return new Date(date);
    }
    
    // If it's a number (timestamp), create from that
    if (typeof date === 'number') {
      console.log('Parsing from timestamp:', date);
      return new Date(date);
    }
    
    // Last resort, try to create date from whatever we received
    console.log('Trying generic date parsing for:', date);
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
  
  // Normalize logs to ensure consistent date objects
  const normalizedLogs = useMemo(() => {
    console.log('FastingStats normalizing logs...');
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
  
  // Debug log for normalized logs
  useEffect(() => {
    if (normalizedLogs.length > 0) {
      console.log('Normalized logs (first 3):', normalizedLogs.slice(0, 3).map(log => ({
        id: log.id,
        startTime: log.startTime instanceof Date ? log.startTime.toISOString() : 'not a date',
        endTime: log.endTime instanceof Date ? log.endTime.toISOString() : 'not a date/not present'
      })));
    }
  }, [normalizedLogs]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    console.log(`FastingStats preparing ${timeFilter} chart data with ${normalizedLogs.length} normalized logs`);
    
    try {
      const data = prepareChartData(normalizedLogs, timeFilter);
      console.log(`FastingStats ${timeFilter} chart data:`, data);
      
      // Check if we have meaningful data
      const hasData = data.some(item => Math.abs(item.fasting || 0) > 0 || Math.abs(item.eating || 0) > 0);
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
