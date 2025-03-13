
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressCircle from '@/components/ProgressCircle';
import { Period, WeighIn, FastingLog } from '@/lib/types';
import WeightForecastChart from '@/components/charts/WeightForecastChart';
import { differenceInSeconds } from 'date-fns';

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
  weighIns: WeighIn[];
  currentPeriod?: Period;
  isImperial: boolean;
  fastingLogs: FastingLog[];
}

const PeriodMetricsCards: React.FC<PeriodMetricsCardsProps> = ({
  weightProgress,
  timeProgress,
  daysRemaining,
  weightChange,
  weightDirection,
  weightUnit,
  weighIns,
  currentPeriod,
  isImperial,
  fastingLogs
}) => {
  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  // Calculate average daily fasting hours
  const calculateAverageDailyFasting = (): { hours: number, percentage: number } => {
    if (!fastingLogs.length) return { hours: 0, percentage: 0 };
    
    const completedLogs = fastingLogs.filter(log => log.endTime);
    if (!completedLogs.length) return { hours: 0, percentage: 0 };
    
    const totalFastingSeconds = completedLogs.reduce((total, log) => {
      const startTime = new Date(log.startTime);
      const endTime = new Date(log.endTime!);
      return total + differenceInSeconds(endTime, startTime);
    }, 0);
    
    const averageHours = totalFastingSeconds / 3600 / completedLogs.length;
    
    // Get target fasting hours from period's fasting schedule
    let targetFastingHours = 16; // Default to 16 hours if no schedule is found
    if (currentPeriod?.fastingSchedule) {
      const schedule = currentPeriod.fastingSchedule.split(':');
      if (schedule.length === 2) {
        targetFastingHours = parseInt(schedule[0], 10);
      }
    }
    
    // Calculate percentage based on the target fasting hours
    const percentage = (averageHours / targetFastingHours) * 100;
    
    return {
      hours: parseFloat(averageHours.toFixed(1)),
      percentage: percentage
    };
  };

  const averageFasting = calculateAverageDailyFasting();

  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Daily Fasting</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pt-0">
            <ProgressCircle 
              value={averageFasting.percentage}
              size={120}
              strokeWidth={10}
              showPercentage={true}
              valueLabel={`${averageFasting.hours}h per day`}
              allowExceedGoal={true}
            />
          </CardContent>
        </Card>
      </div>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weight Forecast</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <WeightForecastChart 
            weighIns={weighIns}
            currentPeriod={currentPeriod}
            isImperial={isImperial}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodMetricsCards;
