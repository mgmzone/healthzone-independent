
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SystemStats } from '@/lib/services/adminService';
import { Badge } from '@/components/ui/badge';
import { format, subDays, subMonths, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

interface ActivityStatsChartProps {
  stats: SystemStats;
  isLoading: boolean;
}

// Time filter options
type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

// Sample data for time-based stats - in a real app, this would come from the database
const generateTimeBasedData = (filter: TimeFilter) => {
  const today = new Date();
  const data = [];
  
  switch (filter) {
    case 'day':
      // Last 24 hours in 6-hour intervals
      for (let i = 3; i >= 0; i--) {
        const time = subDays(today, i/4);
        data.push({
          name: format(time, 'ha'),
          weighIns: Math.floor(Math.random() * 5),
          fasts: Math.floor(Math.random() * 8),
          exercises: Math.floor(Math.random() * 6),
        });
      }
      break;
    case 'week':
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        data.push({
          name: format(day, 'EEE'),
          weighIns: Math.floor(Math.random() * 10),
          fasts: Math.floor(Math.random() * 15),
          exercises: Math.floor(Math.random() * 12),
        });
      }
      break;
    case 'month':
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const week = subDays(today, i * 7);
        data.push({
          name: `Week ${4-i}`,
          weighIns: Math.floor(Math.random() * 30),
          fasts: Math.floor(Math.random() * 40),
          exercises: Math.floor(Math.random() * 35),
        });
      }
      break;
    case 'year':
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        data.push({
          name: format(month, 'MMM'),
          weighIns: Math.floor(Math.random() * 80),
          fasts: Math.floor(Math.random() * 120),
          exercises: Math.floor(Math.random() * 100),
        });
      }
      break;
    case 'all':
    default:
      // Total summary
      data.push({
        name: 'Weigh-ins',
        count: 0, // Will be replaced with actual data
      });
      data.push({
        name: 'Fasting Logs',
        count: 0, // Will be replaced with actual data
      });
      data.push({
        name: 'Exercise Logs',
        count: 0, // Will be replaced with actual data
      });
      break;
  }
  
  return data;
};

const ActivityStatsChart: React.FC<ActivityStatsChartProps> = ({ stats, isLoading }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  
  // Generate chart data based on the selected time filter
  let chartData = generateTimeBasedData(timeFilter);
  
  // For the 'all' filter, use the actual totals
  if (timeFilter === 'all') {
    chartData = [
      {
        name: 'Weigh-ins',
        count: stats.totalWeighIns,
      },
      {
        name: 'Fasting Logs',
        count: stats.totalFasts,
      },
      {
        name: 'Exercise Logs',
        count: stats.totalExercises,
      }
    ];
  }

  const chartConfig = {
    weighIns: {
      label: "Weigh-ins",
      color: "#38bdf8",
    },
    fasts: {
      label: "Fasting Logs",
      color: "#fb923c",
    },
    exercises: {
      label: "Exercise Logs",
      color: "#4ade80",
    },
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Activity Statistics</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Activity Statistics</CardTitle>
        <div className="flex space-x-2">
          <Badge 
            onClick={() => setTimeFilter('day')} 
            className={`cursor-pointer ${timeFilter === 'day' ? 'bg-primary' : 'bg-secondary'}`}
          >
            Day
          </Badge>
          <Badge 
            onClick={() => setTimeFilter('week')} 
            className={`cursor-pointer ${timeFilter === 'week' ? 'bg-primary' : 'bg-secondary'}`}
          >
            Week
          </Badge>
          <Badge 
            onClick={() => setTimeFilter('month')} 
            className={`cursor-pointer ${timeFilter === 'month' ? 'bg-primary' : 'bg-secondary'}`}
          >
            Month
          </Badge>
          <Badge 
            onClick={() => setTimeFilter('year')} 
            className={`cursor-pointer ${timeFilter === 'year' ? 'bg-primary' : 'bg-secondary'}`}
          >
            Year
          </Badge>
          <Badge 
            onClick={() => setTimeFilter('all')} 
            className={`cursor-pointer ${timeFilter === 'all' ? 'bg-primary' : 'bg-secondary'}`}
          >
            All
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full pb-6">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              {timeFilter === 'all' ? (
                // Simple bar chart for 'all' view
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} entries`, 'Count']}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#38bdf8"
                    name="Entry Count"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                // Stacked bar chart for time-based views
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      const label = name === 'weighIns' ? 'Weigh-ins' : 
                                   name === 'fasts' ? 'Fasting Logs' : 'Exercise Logs';
                      return [`${value} entries`, label];
                    }}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="weighIns" stackId="a" fill="#38bdf8" name="Weigh-ins" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fasts" stackId="a" fill="#fb923c" name="Fasting Logs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="exercises" stackId="a" fill="#4ade80" name="Exercise Logs" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityStatsChart;
