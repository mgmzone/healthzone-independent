
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ActivitySquare, Timer, Footprints } from 'lucide-react';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import { isWithinInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import ProgressCircle from '@/components/ProgressCircle';
import { getTimePeriodText } from './summaryUtils';

interface ActivityStatCardsProps {
  exerciseLogs: ExerciseLog[];
  timeFilter: TimeFilter;
}

const ActivityStatCards: React.FC<ActivityStatCardsProps> = ({ 
  exerciseLogs,
  timeFilter
}) => {
  const today = new Date();
  
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
  );
};

export default ActivityStatCards;
