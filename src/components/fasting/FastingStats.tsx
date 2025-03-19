
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
    console.log('First 3 logs:', fastingLogs.slice(0, 3));
  }, [fastingLogs, timeFilter]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    // Log for debugging
    console.log('FastingStats preparing chart data with logs:', fastingLogs.length);
    
    // Clone logs to avoid reference issues
    const logsToProcess = [...fastingLogs];
    
    try {
      const data = prepareChartData(logsToProcess, timeFilter);
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
  }, [fastingLogs, timeFilter, toast]);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-full bg-background rounded-md p-2">
        <FastingBarChart chartData={chartData} />
      </div>
    </div>
  );
};

export default FastingStats;
