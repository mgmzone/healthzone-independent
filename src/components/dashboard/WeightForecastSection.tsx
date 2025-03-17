
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeightForecastChartWrapper from '@/components/charts/WeightForecastChart';
import { Period, WeighIn } from '@/lib/types';

interface WeightForecastSectionProps {
  weighIns: WeighIn[];
  currentPeriod: Period;
  isImperial: boolean;
}

const WeightForecastSection: React.FC<WeightForecastSectionProps> = ({
  weighIns,
  currentPeriod,
  isImperial
}) => {
  return (
    <Card className="w-full mb-8">
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
  );
};

export default WeightForecastSection;
