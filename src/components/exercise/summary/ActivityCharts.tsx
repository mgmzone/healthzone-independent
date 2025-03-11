
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { prepareChartData } from './summaryUtils';

interface ActivityChartsProps {
  exerciseLogs: ExerciseLog[];
  timeFilter: TimeFilter;
}

const ActivityCharts: React.FC<ActivityChartsProps> = ({ 
  exerciseLogs,
  timeFilter
}) => {
  const dataForChart = prepareChartData(exerciseLogs, timeFilter);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataForChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="walk" stackId="a" fill="#4287f5" name="Walking" />
                <Bar dataKey="run" stackId="a" fill="#f5a742" name="Running" />
                <Bar dataKey="bike" stackId="a" fill="#42f5ad" name="Cycling" />
                <Bar dataKey="elliptical" stackId="a" fill="#a442f5" name="Elliptical" />
                <Bar dataKey="other" stackId="a" fill="#9c9c9c" name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Minutes Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataForChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="minutes" stroke="#8884d8" name="Minutes" />
                <Line type="monotone" dataKey="distance" stroke="#82ca9d" name="Distance (km)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityCharts;
