
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressCircle from '@/components/ProgressCircle';
import WeightStatsCard from '@/components/weight/WeightStatsCard';

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
  weightUnit
}) => {
  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pt-0">
          <ProgressCircle 
            value={weightProgress}
            size={120}
            strokeWidth={10}
            showPercentage={true}
            valueLabel={weightProgress >= 100 ? "Goal Reached!" : "of target"}
          />
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
          <CardTitle className="text-lg">Period Duration</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            <WeightStatsCard 
              value={totalWeeks} 
              label="Weeks" 
              isCompact={true} 
            />
            <WeightStatsCard 
              value={totalMonths} 
              label="Months" 
              isCompact={true} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Weight Change</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-3xl font-bold">{formatWeight(weightChange)}</div>
            <div className="text-sm text-muted-foreground">{weightUnit} {weightDirection}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodMetricsCards;
