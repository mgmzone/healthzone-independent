
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import WeightChart from '@/components/charts/WeightChart';
import MetricSelector from '@/components/weight/MetricSelector';
import { WeighIn } from '@/lib/types';

interface ChartSectionProps {
  weighIns: WeighIn[];
  isImperial: boolean;
  selectedMetric: string;
  onSelectMetric: (metric: string) => void;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  weighIns,
  isImperial,
  selectedMetric,
  onSelectMetric
}) => {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Progress Chart</h2>
        <MetricSelector 
          selectedMetric={selectedMetric} 
          onSelectMetric={onSelectMetric}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <WeightChart 
            data={weighIns} 
            isImperial={isImperial}
            metricKey={selectedMetric}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ChartSection;
