
import React, { useMemo } from 'react';
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
  
  // Prepare chart data
  const chartData = useMemo(() => {
    // Log for debugging
    console.log('FastingStats preparing chart data with logs:', fastingLogs.length);
    
    // Clone logs to avoid reference issues
    const logsToProcess = [...fastingLogs];
    
    try {
      const data = prepareChartData(logsToProcess, timeFilter);
      console.log(`FastingStats ${timeFilter} chart data:`, data);
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
