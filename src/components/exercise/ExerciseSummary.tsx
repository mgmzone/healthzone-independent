import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { differenceInDays, format, startOfMonth, startOfWeek, endOfWeek, endOfMonth, startOfDay, isWithinInterval } from 'date-fns';
import ExerciseTimeFilter from '@/components/exercise/ExerciseTimeFilter';
import ProgressCircle from '@/components/ProgressCircle';
import { Activity, ActivitySquare, Timer, Footprints } from 'lucide-react';

interface ExerciseSummaryProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({ 
  exerciseLogs, 
  isLoading,
  timeFilter,
  onTimeFilterChange 
}) => {
  const today = new Date();
  const dataForChart = prepareChartData(exerciseLogs, timeFilter);
  
  // Calculate summary statistics
  const totalMinutes = exerciseLogs.reduce((sum, log) => sum + log.minutes, 0);
  const dailyTarget = 30; // Placeholder - this would come from user settings
  const weeklyMinutesTarget = dailyTarget * 7;
  const weeklyMinutesAchieved = exerciseLogs.filter(log => {
    const logDate = new Date(log.date);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
  }).reduce((sum, log) => sum + log.minutes, 0);
  
  const weeklyProgress = (weeklyMinutesAchieved / weeklyMinutesTarget) * 100;
  
  // Calculate steps data
  const stepsGoal = 8000; // Placeholder - would come from user settings
  const stepsAchieved = exerciseLogs
    .filter(log => log.steps && isToday(new Date(log.date)))
    .reduce((sum, log) => sum + (log.steps || 0), 0);
  
  const stepsProgress = (stepsAchieved / stepsGoal) * 100;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activity Summary</h2>
        <ExerciseTimeFilter 
          value={timeFilter} 
          onChange={onTimeFilterChange} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <ActivitySquare className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exerciseLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTimePeriodText(timeFilter)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMinutes}</div>
            <p className="text-xs text-muted-foreground">
              {getTimePeriodText(timeFilter)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-4">
            <ProgressCircle 
              value={weeklyProgress} 
              size={100} 
              strokeWidth={10}
              showPercentage={true}
              valueLabel={`${weeklyMinutesAchieved}/${weeklyMinutesTarget} min`}
              allowExceedGoal={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Steps</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-4">
            <ProgressCircle 
              value={stepsProgress} 
              size={100} 
              strokeWidth={10}
              showPercentage={true}
              valueLabel={`${stepsAchieved}/${stepsGoal}`}
              allowExceedGoal={true}
            />
          </CardContent>
        </Card>
      </div>
      
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
    </div>
  );
};

function getTimePeriodText(timeFilter: TimeFilter): string {
  switch (timeFilter) {
    case 'week': return 'This week';
    case 'month': return 'This month';
    case 'period': return 'Current period';
    default: return 'Selected period';
  }
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function prepareChartData(logs: ExerciseLog[], timeFilter: TimeFilter) {
  const today = new Date();
  const data: any[] = [];
  
  if (timeFilter === 'week') {
    // Create data for each day of the current week
    const startDate = startOfWeek(today);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getDate() === date.getDate() && 
               logDate.getMonth() === date.getMonth() && 
               logDate.getFullYear() === date.getFullYear();
      });
      
      data.push({
        name: format(date, 'EEE'),
        minutes: dayLogs.reduce((sum, log) => sum + log.minutes, 0),
        distance: dayLogs.reduce((sum, log) => sum + (log.distance || 0), 0).toFixed(1),
        walk: dayLogs.filter(log => log.type === 'walk').reduce((sum, log) => sum + log.minutes, 0),
        run: dayLogs.filter(log => log.type === 'run').reduce((sum, log) => sum + log.minutes, 0),
        bike: dayLogs.filter(log => log.type === 'bike').reduce((sum, log) => sum + log.minutes, 0),
        elliptical: dayLogs.filter(log => log.type === 'elliptical').reduce((sum, log) => sum + log.minutes, 0),
        other: dayLogs.filter(log => log.type === 'other').reduce((sum, log) => sum + log.minutes, 0),
      });
    }
  } else if (timeFilter === 'month') {
    // Create weekly data for the current month
    const startDate = startOfMonth(today);
    const weeks = Math.ceil(differenceInDays(today, startDate) / 7) + 1;
    
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });
      
      data.push({
        name: `Week ${i + 1}`,
        minutes: weekLogs.reduce((sum, log) => sum + log.minutes, 0),
        distance: weekLogs.reduce((sum, log) => sum + (log.distance || 0), 0).toFixed(1),
        walk: weekLogs.filter(log => log.type === 'walk').reduce((sum, log) => sum + log.minutes, 0),
        run: weekLogs.filter(log => log.type === 'run').reduce((sum, log) => sum + log.minutes, 0),
        bike: weekLogs.filter(log => log.type === 'bike').reduce((sum, log) => sum + log.minutes, 0),
        elliptical: weekLogs.filter(log => log.type === 'elliptical').reduce((sum, log) => sum + log.minutes, 0),
        other: weekLogs.filter(log => log.type === 'other').reduce((sum, log) => sum + log.minutes, 0),
      });
    }
  }
  
  return data;
}

export default ExerciseSummary;
