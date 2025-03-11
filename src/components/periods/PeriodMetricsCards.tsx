import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scale, 
  Clock,
  Activity,
  Footprints
} from 'lucide-react';
import ProgressCircle from '@/components/ProgressCircle';
import { differenceInSeconds, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
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
  weighIns: any[];
  currentPeriod: any;
  isImperial: boolean;
  singleRow?: boolean;
}

const PeriodMetricsCards = ({
  weightProgress,
  timeProgress,
  timeRemaining,
  daysRemaining,
  totalWeeks,
  totalMonths,
  weightChange,
  weightDirection,
  weightUnit,
  weighIns,
  currentPeriod,
  isImperial,
  singleRow = false
}) => {

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

  // Placeholder for exercise logs
  const exerciseLogs: ExerciseLog[] = [];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Period Metrics</h2>
      
      {/* Modified grid layout based on singleRow prop */}
      <div className={`grid grid-cols-1 ${singleRow ? 'md:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-2'} gap-6`}>
        {/* Weight Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Weight Progress</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
              <ProgressCircle 
                value={weightProgress}
                size={120}
                strokeWidth={10}
                label="Weight Progress"
                valueLabel={`${weightChange.toFixed(1)} ${weightUnit} ${weightDirection}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-lg">Time Progress</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
              <ProgressCircle 
                value={timeProgress}
                size={120}
                strokeWidth={10}
                label="Time Progress"
                valueLabel={`${daysRemaining} days left`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Weekly Goal</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Footprints className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-lg">Today's Steps</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2">
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

export default PeriodMetricsCards;
