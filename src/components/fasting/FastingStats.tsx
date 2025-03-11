
import React, { useMemo } from 'react';
import { FastingLog } from '@/lib/types';
import StatsCard from './stats/StatsCard';
import FastingBarChart from './stats/FastingBarChart';
import { calculateStats, formatDuration, prepareChartData } from './stats/fastingStatsUtils';

interface FastingStatsProps {
  fastingLogs: FastingLog[];
  timeFilter: 'week' | 'month' | 'year';
}

const FastingStats: React.FC<FastingStatsProps> = ({ fastingLogs, timeFilter }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStats(fastingLogs, timeFilter);
  }, [fastingLogs, timeFilter]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return prepareChartData(fastingLogs, timeFilter);
  }, [fastingLogs, timeFilter]);

  // For debugging
  console.log('FastingStats stats:', stats);
  console.log('FastingStats logs count:', fastingLogs.length);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 h-full">
        <div className="flex flex-col gap-4 md:col-span-1">
          <StatsCard title="Total fasts" value={stats.totalFasts} />
          <StatsCard title="Total fasting time" value={formatDuration(stats.totalFastingTime)} />
        </div>
        
        <div className="md:col-span-3 h-full min-h-[280px]">
          <FastingBarChart chartData={chartData} />
        </div>
      </div>
    </div>
  );
};

export default FastingStats;
