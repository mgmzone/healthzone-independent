
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
  
  // Log incoming data
  console.log(`FastingStats received ${fastingLogs?.length || 0} logs for ${timeFilter} view`);
  
  // Sample a few logs if available
  if (fastingLogs?.length > 0) {
    console.log('Sample logs:', fastingLogs.slice(0, 2).map(log => ({
      id: log.id,
      startTime: log.startTime,
      endTime: log.endTime
    })));
  }
  
  // Prepare chart data
  const chartData = useMemo(() => {
    try {
      console.log(`Preparing chart data for ${timeFilter} with ${fastingLogs?.length || 0} logs`);
      const data = prepareChartData(fastingLogs, timeFilter);
      
      // Check if we have any non-zero data
      const hasData = data.some(item => 
        Math.abs(item.fasting || 0) > 0.01 || Math.abs(item.eating || 0) > 0.01
      );
      
      console.log(`Chart data prepared for ${timeFilter}. Has meaningful data: ${hasData}`);
      
      if (!hasData) {
        console.log('Chart data is empty or all zeros');
      } else {
        console.log('First few data points:', data.slice(0, 3));
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
      <div className="w-full h-full bg-background rounded-md p-2" style={{ minHeight: '300px' }}>
        <FastingBarChart chartData={chartData} />
      </div>
    </div>
  );
};

export default FastingStats;
