
import React, { useMemo } from 'react';
import { FastingLog } from '@/lib/types';
import FastingBarChart from './stats/FastingBarChart';
import { prepareChartData } from './stats/fastingStatsUtils';

interface FastingStatsProps {
  fastingLogs: FastingLog[];
  timeFilter: 'week' | 'month' | 'year';
}

const FastingStats: React.FC<FastingStatsProps> = ({ fastingLogs, timeFilter }) => {
  // Prepare chart data
  const chartData = useMemo(() => {
    return prepareChartData(fastingLogs, timeFilter);
  }, [fastingLogs, timeFilter]);

  // For debugging
  console.log('FastingStats logs count:', fastingLogs.length);
  console.log('FastingStats chartData:', chartData);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-full bg-background rounded-md p-2">
        <FastingBarChart chartData={chartData} />
      </div>
    </div>
  );
};

export default FastingStats;
