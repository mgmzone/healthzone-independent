
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 h-full">
      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="Fasts" value={stats.totalFasts || 0} />
        <StatsCard title="Longest fast" value={formatDuration(stats.longestFast)} />
        <StatsCard title="Total fasting time" value={formatDuration(stats.totalFastingTime)} />
        <StatsCard title="Days with fast" value={stats.daysWithFast || 0} />
      </div>
      
      <div className="h-full min-h-[220px]">
        <FastingBarChart chartData={chartData} />
      </div>
    </div>
  );
};

export default FastingStats;
