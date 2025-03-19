
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressCircle from '@/components/ProgressCircle'; // Changed import to use the correct component
import { Period, WeighIn, FastingLog, ExerciseLog } from '@/lib/types';
import { calculateAverageDailyFasting } from '@/components/dashboard/utils/fastingCalculations';
import ExerciseCard from '@/components/dashboard/cards/ExerciseCard';
import WeightForecastChartWrapper from '@/components/charts/WeightForecastChart';

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
  currentPeriod: Period;
  isImperial: boolean;
  fastingLogs: FastingLog[];
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
  weighIns,
  currentPeriod,
  isImperial,
  fastingLogs,
  exerciseLogs = []
}) => {
  const avgFastingHours = calculateAverageDailyFasting(fastingLogs);

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4" style={{ borderTopColor: '#4287f5' }}>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Weight Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressCircle 
              value={weightProgress} 
              showPercentage={true}
              valueLabel={`${weightChange.toFixed(1)} ${weightUnit} ${weightDirection}`}
              size={140}
              strokeWidth={12}
            />
          </CardContent>
        </Card>

        <Card className="border-t-4" style={{ borderTopColor: '#f5a742' }}>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Time Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressCircle 
              value={timeProgress} 
              showPercentage={true}
              valueLabel={`${daysRemaining} days left`}
              size={140} 
              strokeWidth={12}
            />
          </CardContent>
        </Card>

        <ExerciseCard 
          exerciseLogs={exerciseLogs} 
          showProgressCircle={true} 
          cardClassName="border-t-4"
          cardStyle={{ borderTopColor: '#42f5ad' }}
        />

        <Card className="border-t-4" style={{ borderTopColor: '#f542a7' }}>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Average Daily Fasting</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressCircle 
              value={(avgFastingHours / 24) * 100} 
              showPercentage={false}
              valueLabel="hours"
              size={140}
              strokeWidth={12}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">{avgFastingHours.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">hours</div>
              </div>
            </ProgressCircle>
          </CardContent>
        </Card>
      </div>

      {/* Weight Forecast Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weight Forecast</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <WeightForecastChartWrapper 
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
