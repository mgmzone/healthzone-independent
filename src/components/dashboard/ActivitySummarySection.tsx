
import React from 'react';
import { Card } from "@/components/ui/card";
import FastingStats from '@/components/fasting/FastingStats';
import { ExerciseLog, FastingLog } from '@/lib/types';

// Create a simplified version of ExerciseSummary for the dashboard
import { 
  Activity, 
  ActivitySquare, 
  Timer, 
  Footprints 
} from 'lucide-react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressCircle from '@/components/ProgressCircle';
import { isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

interface ActivitySummarySectionProps {
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
}

const ActivitySummarySection: React.FC<ActivitySummarySectionProps> = ({
  exerciseLogs,
  fastingLogs
}) => {
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
  
  const weeklyProgress = Math.min((weeklyMinutesAchieved / weeklyMinutesTarget) * 100, 100);
  
  // Calculate steps data
  const stepsGoal = 8000; // Placeholder - would come from user settings
  const stepsAchieved = exerciseLogs
    .filter(log => log.steps && isToday(new Date(log.date)))
    .reduce((sum, log) => sum + (log.steps || 0), 0);
  
  const stepsProgress = Math.min((stepsAchieved / stepsGoal) * 100, 100);
  
  const totalActivities = exerciseLogs.length;
  const totalMinutes = exerciseLogs.reduce((sum, log) => sum + log.minutes, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Minutes</h2>
        <div className="h-72"> {/* Increased height from h-64 to h-72 (approximately 10% taller) */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <ActivitySquare className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActivities}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMinutes}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent className="flex items-center justify-center pt-2">
                <ProgressCircle 
                  value={weeklyProgress} 
                  size={60} 
                  strokeWidth={8}
                  showPercentage={true}
                  valueLabel={`${weeklyMinutesAchieved}/${weeklyMinutesTarget} min`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Steps</CardTitle>
                <Footprints className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent className="flex items-center justify-center pt-2">
                <ProgressCircle 
                  value={stepsProgress} 
                  size={60} 
                  strokeWidth={8}
                  showPercentage={true}
                  valueLabel={`${stepsAchieved}/${stepsGoal}`}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Fasting Progress</h2>
        <div className="h-72"> {/* Increased height from h-64 to h-72 to match the activity card (approximately 10% taller) */}
          <FastingStats 
            fastingLogs={fastingLogs}
            timeFilter="week"
          />
        </div>
      </Card>
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

export default ActivitySummarySection;
