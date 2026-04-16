
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { prepareChartData } from './summaryUtils';
import { useAuth } from '@/lib/AuthContext';

interface ActivityChartsProps {
  exerciseLogs: ExerciseLog[];
  timeFilter: TimeFilter;
}

const ActivityCharts: React.FC<ActivityChartsProps> = ({ 
  exerciseLogs,
  timeFilter
}) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';
  
  const dataForChart = prepareChartData(exerciseLogs, timeFilter, isImperial);
  
  // Get the appropriate distance unit label based on user's measurement preference
  const distanceUnit = isImperial ? 'mi' : 'km';
  
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
                <Bar dataKey="cardio" stackId="a" fill="#f43f5e" name="Cardio" />
                <Bar dataKey="resistance" stackId="a" fill="#f59e0b" name="Resistance" />
                <Bar dataKey="sports" stackId="a" fill="#10b981" name="Sports" />
                <Bar dataKey="flexibility" stackId="a" fill="#0ea5e9" name="Flexibility" />
                <Bar dataKey="other" stackId="a" fill="#a855f7" name="Other" />
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
                <Line type="monotone" dataKey="distance" stroke="#82ca9d" name={`Distance (${distanceUnit})`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityCharts;
