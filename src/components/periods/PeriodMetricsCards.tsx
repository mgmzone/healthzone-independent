
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressCircle from '@/components/ProgressCircle';
import { Activity, Footprints } from 'lucide-react';
import { isWithinInterval, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ExerciseLog } from '@/lib/types';

interface PeriodMetricsCardsProps {
  weightProgress: number;
  timeProgress: number;
  timeRemaining: number;
  daysRemaining: number;
  totalWeeks: number;
  totalMonths: number;
  weightChange: number;
  weightDirection: 'lost' | 'gained';
  weightUnit: string;
  exerciseLogs?: ExerciseLog[];
}

const PeriodMetricsCards: React.FC<PeriodMetricsCardsProps> = ({
  weightProgress,
  timeProgress,
  timeRemaining,
  daysRemaining,
  totalWeeks,
  totalMonths,
  weightChange,
  weightDirection,
  weightUnit,
  exerciseLogs = []
}) => {
  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  // Calculate weekly exercise goal progress
  const dailyTarget = 30; // Placeholder - this would come from user settings
  const weeklyMinutesTarget = dailyTarget * 7;
  const today = new Date();
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-0">
          <ProgressCircle 
            value={weightProgress}
            size={120}
            strokeWidth={10}
            showPercentage={true}
            valueLabel={weightProgress >= 100 ? "Goal Reached!" : "of target"}
          />
          <div className="mt-3 text-center">
            <span className="text-sm text-muted-foreground">
              {formatWeight(weightChange)} {weightUnit} {weightDirection}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Time Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pt-0">
          <ProgressCircle 
            value={timeProgress}
            size={120}
            strokeWidth={10}
            showPercentage={true}
            valueLabel={`${daysRemaining} days left`}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Weekly Goal</CardTitle>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex justify-center pt-0">
          <ProgressCircle 
            value={weeklyProgress} 
            size={120} 
            strokeWidth={10}
            showPercentage={true}
            valueLabel={`${weeklyMinutesAchieved}/${weeklyMinutesTarget} min`}
            allowExceedGoal={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Today's Steps</CardTitle>
          <Footprints className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex justify-center pt-0">
          <ProgressCircle 
            value={stepsProgress} 
            size={120} 
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

export default PeriodMetricsCards;
