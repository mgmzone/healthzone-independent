import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressCircle from '@/components/ProgressCircle';
import { Period, WeighIn } from '@/lib/types';
import WeightForecastChart from '@/components/charts/WeightForecastChart';

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
  isImperial
}) => {
  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
