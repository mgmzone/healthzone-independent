
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SystemStats } from '@/lib/services/adminService';

interface ActivityStatsChartProps {
  stats: SystemStats;
  isLoading: boolean;
}

const ActivityStatsChart: React.FC<ActivityStatsChartProps> = ({ stats, isLoading }) => {
  const chartData = [
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

  const chartConfig = {
    weighins: {
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
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Activity Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer
            config={chartConfig}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityStatsChart;
