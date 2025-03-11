
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

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 gap-6 h-full">
        <div className="flex flex-col gap-4">
          <StatsCard title="Fasts" value={stats.totalFasts || 0} />
          <StatsCard title="Longest fast" value={formatDuration(stats.longestFast)} />
          <StatsCard title="Total fasting time" value={formatDuration(stats.totalFastingTime)} />
        </div>
        
        <div className="flex-1 min-h-[280px]">
          <FastingBarChart chartData={chartData} />
        </div>
      </div>
    </div>
  );
};

export default FastingStats;
