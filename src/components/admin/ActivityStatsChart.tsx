
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { SystemStats } from '@/lib/services/adminService';
import TimeFilterSelector, { TimeFilter } from './charts/TimeFilterSelector';
import { 
  ActivityLogItem,
  chartConfig,
  getChartData
} from './charts/chartDataGenerator';
import SummaryBarChart from './charts/SummaryBarChart';
import StackedBarChart from './charts/StackedBarChart';
import ChartLoadingState from './charts/ChartLoadingState';
import { getActivityLogs } from '@/lib/services/adminService';

interface ActivityStatsChartProps {
  stats: SystemStats;
  isLoading: boolean;
}

const ActivityStatsChart: React.FC<ActivityStatsChartProps> = ({ stats, isLoading }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchActivityLogs = async () => {
      setIsLoadingLogs(true);
      try {
        const logs = await getActivityLogs();
        setActivityLogs(logs);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    };
    
    fetchActivityLogs();
  }, []);
  
  // Generate chart data based on the selected time filter
  const chartData = getChartData(stats, activityLogs, timeFilter);

  if (isLoading || isLoadingLogs) {
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
      <CardContent className="pb-6">
        {/* Reduced height container */}
        <div className="h-[150px] w-full">
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
