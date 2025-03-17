import React from 'react';
import { Activity, ActivitySquare, Timer, Footprints } from 'lucide-react';
import ProgressCircle from '@/components/ProgressCircle';
import { ExerciseLog } from '@/lib/types';
import { isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import ActivityCard from './ActivityCard';

interface ExerciseMetricsProps {
  exerciseLogs: ExerciseLog[];
}

const ExerciseMetrics: React.FC<ExerciseMetricsProps> = ({ exerciseLogs }) => {
  // Calculate summary statistics for exercise
  const today = new Date();
  const dailyTarget = 30; // Placeholder - this would come from user settings
  const weeklyMinutesTarget = dailyTarget * 7;
  
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  
  const weeklyMinutesAchieved = exerciseLogs.filter(log => {
    const logDate = new Date(log.date);
    return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
  }).reduce((sum, log) => sum + log.minutes, 0);
  
  const weeklyProgress = (weeklyMinutesAchieved / weeklyMinutesTarget) * 100;
  
  // Calculate steps data
  const stepsGoal = 8000; // Placeholder - would come from user settings
  const stepsAchieved = exerciseLogs
    .filter(log => log.steps && isToday(new Date(log.date)))
    .reduce((sum, log) => sum + (log.steps || 0), 0);
  
  const stepsProgress = (stepsAchieved / stepsGoal) * 100;
  
  const totalActivities = exerciseLogs.length;
  const totalMinutes = exerciseLogs.reduce((sum, log) => sum + log.minutes, 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ActivityCard title="Total Activities" icon={ActivitySquare}>
        <div className="text-2xl font-bold">{totalActivities}</div>
        <p className="text-xs text-muted-foreground">This week</p>
      </ActivityCard>

      <ActivityCard title="Active Minutes" icon={Timer}>
        <div className="text-2xl font-bold">{totalMinutes}</div>
        <p className="text-xs text-muted-foreground">This week</p>
      </ActivityCard>

      <ActivityCard title="Weekly Goal" icon={Activity}>
        <div className="flex items-center justify-center pt-2">
          <ProgressCircle 
            value={weeklyProgress} 
            size={60} 
            strokeWidth={8}
            showPercentage={true}
            valueLabel={`${weeklyMinutesAchieved}/${weeklyMinutesTarget} min`}
            allowExceedGoal={true}
          />
        </div>
      </ActivityCard>

      <ActivityCard title="Today's Steps" icon={Footprints}>
        <div className="flex items-center justify-center pt-2">
          <ProgressCircle 
            value={stepsProgress} 
            size={60} 
            strokeWidth={8}
            showPercentage={true}
            valueLabel={`${stepsAchieved}/${stepsGoal}`}
            allowExceedGoal={true}
          />
        </div>
      </ActivityCard>
    </div>
  );
};

// Helper function to check if a date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export default ExerciseMetrics;
