import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Scale, Timer, Calendar, Footprints } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { ExerciseLog, FastingLog } from '@/lib/types';
import { isWithinInterval, subWeeks, startOfWeek, endOfWeek, isToday } from 'date-fns';
import ProgressCircle from '@/components/ProgressCircle';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface SummaryCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: any;
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
  getDaysRemaining: (date: Date) => number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  exerciseLogs,
  fastingLogs,
  getDaysRemaining
}) => {
  // Calculate average weekly exercise minutes
  const calculateAverageWeeklyExercise = () => {
    if (exerciseLogs.length === 0) return 0;
    
    const now = new Date();
    const fourWeeksAgo = subWeeks(now, 4);
    
    // Filter logs from the last 4 weeks
    const recentLogs = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: fourWeeksAgo, end: now });
    });
    
    // Calculate total minutes
    const totalMinutes = recentLogs.reduce((sum, log) => sum + log.minutes, 0);
    
    // Calculate weekly average (divide by 4 weeks)
    return Math.round(totalMinutes / 4);
  };

  // Calculate weekly goal progress
  const calculateWeeklyGoalProgress = () => {
    const today = new Date();
    const dailyTarget = 30; // Placeholder - this would come from user settings
    const weeklyMinutesTarget = dailyTarget * 7;
    
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    
    const weeklyMinutesAchieved = exerciseLogs.filter(log => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    }).reduce((sum, log) => sum + log.minutes, 0);
    
    return {
      progress: (weeklyMinutesAchieved / weeklyMinutesTarget) * 100,
      achieved: weeklyMinutesAchieved,
      target: weeklyMinutesTarget
    };
  };
  
  // Calculate steps progress
  const calculateStepsProgress = () => {
    const stepsGoal = 8000; // Placeholder - would come from user settings
    const stepsAchieved = exerciseLogs
      .filter(log => log.steps && isToday(new Date(log.date)))
      .reduce((sum, log) => sum + (log.steps || 0), 0);
    
    return {
      progress: (stepsAchieved / stepsGoal) * 100,
      achieved: stepsAchieved,
      target: stepsGoal
    };
  };

  const weeklyGoal = calculateWeeklyGoalProgress();
  const stepsGoal = calculateStepsProgress();
  const weightProgress = currentPeriod && latestWeight ? 
    Math.round(((latestWeight - currentPeriod.startWeight) / (currentPeriod.targetWeight - currentPeriod.startWeight)) * 100) : 0;
  const timeProgress = currentPeriod ? 
    Math.round(((new Date().getTime() - new Date(currentPeriod.startDate).getTime()) / 
    (new Date(currentPeriod.endDate).getTime() - new Date(currentPeriod.startDate).getTime())) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Weight Progress Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <div className="flex items-center space-x-2 mb-4 w-full">
              <Scale className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Current Weight</h3>
            </div>
            <div className="flex items-center justify-center py-2">
              <ProgressCircle 
                value={weightProgress} 
                size={120} 
                strokeWidth={10}
                showPercentage={true}
                valueLabel={latestWeight ? `${latestWeight.toFixed(1)} ${weightUnit}` : "No data"}
                allowExceedGoal={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time Progress Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <div className="flex items-center space-x-2 mb-4 w-full">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-lg">Time Progress</h3>
            </div>
            <div className="flex items-center justify-center py-2">
              <ProgressCircle 
                value={timeProgress} 
                size={120} 
                strokeWidth={10}
                showPercentage={true}
                valueLabel={currentPeriod ? `${getDaysRemaining(currentPeriod.endDate)} days left` : "No period"}
                allowExceedGoal={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <div className="flex items-center space-x-2 mb-4 w-full">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Weekly Goal</h3>
            </div>
            <div className="flex items-center justify-center py-2">
              <ProgressCircle 
                value={weeklyGoal.progress} 
                size={120} 
                strokeWidth={10}
                showPercentage={true}
                valueLabel={`${weeklyGoal.achieved}/${weeklyGoal.target} min`}
                allowExceedGoal={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Steps Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <div className="flex items-center space-x-2 mb-4 w-full">
              <Footprints className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">Today's Steps</h3>
            </div>
            <div className="flex items-center justify-center py-2">
              <ProgressCircle 
                value={stepsGoal.progress} 
                size={120} 
                strokeWidth={10}
                showPercentage={true}
                valueLabel={`${stepsGoal.achieved}/${stepsGoal.target}`}
                allowExceedGoal={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
