import React from 'react';
import WeightStatsCard from './WeightStatsCard';
import { Card, CardContent } from '@/components/ui/card';
import ProgressCircle from '@/components/ProgressCircle';
import { Scale, ArrowDownToLine, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface WeightPeriodStatsProps {
  periodStartWeight: number;
  currentWeight: number;
  totalPeriodChange: string;
  isWeightLoss: boolean;
  weightUnit: string;
  targetWeight?: number;
  projectedCompletion?: Date | null;
  startDate?: Date;
}

const WeightPeriodStats: React.FC<WeightPeriodStatsProps> = ({
  periodStartWeight,
  currentWeight,
  totalPeriodChange,
  isWeightLoss,
  weightUnit,
  targetWeight,
  projectedCompletion,
  startDate,
}) => {
  const absChange = Math.abs(parseFloat(totalPeriodChange));

  // Progress to target = (start - current) / (start - target); clamped to 0-100.
  let targetProgress = 0;
  if (targetWeight !== undefined && periodStartWeight !== targetWeight) {
    const range = periodStartWeight - targetWeight;
    const done = periodStartWeight - currentWeight;
    targetProgress = Math.max(0, Math.min(100, (done / range) * 100));
  }

  const weeksElapsed = startDate
    ? Math.max(0.1, differenceInDays(new Date(), startDate) / 7)
    : 0;

  const lostSubtitle = weeksElapsed > 0.5
    ? `${(absChange / weeksElapsed).toFixed(1)} ${weightUnit}/week pace`
    : undefined;

  const projectedSubtitle = projectedCompletion
    ? `Target ${projectedCompletion.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <WeightStatsCard
        value={periodStartWeight}
        label="Starting Weight"
        unit={weightUnit}
        icon={Scale}
        iconColor="text-slate-500"
      />
      <WeightStatsCard
        value={currentWeight}
        label="Current Weight"
        unit={weightUnit}
        icon={ArrowDownToLine}
        iconColor="text-blue-500"
      />
      <WeightStatsCard
        value={absChange}
        label={isWeightLoss ? 'Lost This Period' : 'Gained This Period'}
        unit={weightUnit}
        icon={isWeightLoss ? TrendingDown : TrendingUp}
        iconColor={isWeightLoss ? 'text-emerald-500' : 'text-amber-500'}
        subtitle={lostSubtitle}
        accentClass={isWeightLoss ? 'border-emerald-100 dark:border-emerald-900' : 'border-amber-100 dark:border-amber-900'}
      />

      {targetWeight !== undefined ? (
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Target Weight</p>
                <div className="flex items-end mt-1 text-3xl font-bold tracking-tight">
                  {targetWeight.toFixed(1)}
                  <span className="ml-1 text-sm text-muted-foreground font-normal">{weightUnit}</span>
                </div>
                {projectedSubtitle && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{projectedSubtitle}</p>
                )}
              </div>
              <ProgressCircle
                value={targetProgress}
                size={64}
                strokeWidth={6}
                showPercentage={true}
                animate={true}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <WeightStatsCard
          value={0}
          label="No target set"
          unit={weightUnit}
          icon={Target}
          iconColor="text-muted-foreground"
        />
      )}
    </div>
  );
};

export default WeightPeriodStats;
