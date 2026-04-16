import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import WeightChart from '@/components/charts/WeightChart';
import MetricSelector from '@/components/weight/MetricSelector';
import { WeighIn } from '@/lib/types';

interface ChartSectionProps {
  weighIns: WeighIn[];
  isImperial: boolean;
  selectedMetric: string;
  onSelectMetric: (metric: string) => void;
  targetValue?: number;
  startValue?: number;
  isNewLow?: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  weighIns,
  isImperial,
  selectedMetric,
  onSelectMetric,
  targetValue,
  startValue,
  isNewLow,
}) => {
  return (
    <>
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Progress Chart</h2>
          {isNewLow && selectedMetric === 'weight' && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
              🎉 New low!
            </span>
          )}
        </div>
        <MetricSelector
          selectedMetric={selectedMetric}
          onSelectMetric={onSelectMetric}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 h-[420px]">
          <WeightChart
            data={weighIns}
            isImperial={isImperial}
            metricKey={selectedMetric}
            targetValue={targetValue}
            startValue={startValue}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ChartSection;
