
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { SystemStats } from '@/lib/services/adminService';
import TimeFilterSelector, { TimeFilter } from './charts/TimeFilterSelector';
import { generateTimeBasedData, generateSummaryData, chartConfig } from './charts/chartDataGenerator';
import SummaryBarChart from './charts/SummaryBarChart';
import StackedBarChart from './charts/StackedBarChart';
import ChartLoadingState from './charts/ChartLoadingState';

interface ActivityStatsChartProps {
  stats: SystemStats;
  isLoading: boolean;
}

const ActivityStatsChart: React.FC<ActivityStatsChartProps> = ({ stats, isLoading }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  
  // Generate chart data based on the selected time filter
  const chartData = timeFilter === 'all' 
    ? generateSummaryData(stats)
    : generateTimeBasedData(timeFilter);

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Statistics</CardTitle>
        </CardHeader>
        <ChartLoadingState />
      </Card>
    );
  }

  return (
    <Card className="mt-6 mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Activity Statistics</CardTitle>
        <TimeFilterSelector 
          timeFilter={timeFilter} 
          onFilterChange={setTimeFilter} 
        />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full pb-6">
          <ChartContainer config={chartConfig}>
            {timeFilter === 'all' ? (
              <SummaryBarChart data={chartData} />
            ) : (
              <StackedBarChart data={chartData} />
            )}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityStatsChart;
