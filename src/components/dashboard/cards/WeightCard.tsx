import React from 'react';
import { Scale } from 'lucide-react';
import { Period, WeighIn } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { formatWeight } from '../utils/weightUtils';
import ProgressCircle from '@/components/ProgressCircle';
import TrendArrow from '../TrendArrow';
import { convertWeight } from '@/lib/weight/convertWeight';

interface WeightCardProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod?: Period;
  weightProgress?: number;
  weightChange?: number;
  weightDirection?: 'lost' | 'gained';
  showProgressCircle?: boolean;
  weighIns?: WeighIn[];
}

// Mean weight in (daysAgoStart, daysAgoEnd] window.
function meanWeightInWindow(weighIns: WeighIn[], daysAgoStart: number, daysAgoEnd: number): number | null {
  const now = Date.now();
  const msDay = 86400000;
  const rows = weighIns.filter((w) => {
    const age = (now - new Date(w.date).getTime()) / msDay;
    return age >= daysAgoStart && age < daysAgoEnd;
  });
  if (rows.length === 0) return null;
  return rows.reduce((sum, w) => sum + w.weight, 0) / rows.length;
}

const WeightCard: React.FC<WeightCardProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  weightProgress = 0,
  weightChange = 0,
  weightDirection = 'lost',
  showProgressCircle = false,
  weighIns = [],
}) => {
  const isImperial = weightUnit === 'lbs';
  const thisWeek = meanWeightInWindow(weighIns, 0, 7);
  const priorWeek = meanWeightInWindow(weighIns, 7, 14);
  const thisWeekDisplay = thisWeek != null ? convertWeight(thisWeek, isImperial) : null;
  const priorWeekDisplay = priorWeek != null ? convertWeight(priorWeek, isImperial) : null;

  const getWeightValues = () => {
    const values: { label: string; value: string; trend?: React.ReactNode }[] = [];

    if (currentPeriod) {
      const startingWeight = currentPeriod.startWeight;
      values.push({
        label: 'Starting',
        value: formatWeight(startingWeight ? convertWeight(startingWeight, isImperial) : null, weightUnit),
      });
    }

    values.push({
      label: 'Current',
      value: formatWeight(latestWeight, weightUnit),
      trend:
        thisWeekDisplay != null && priorWeekDisplay != null
          ? (
              <TrendArrow
                current={thisWeekDisplay}
                previous={priorWeekDisplay}
                unit={weightUnit}
                betterDirection="lower"
              />
            )
          : undefined,
    });

    if (currentPeriod) {
      const targetWeight = currentPeriod.targetWeight;
      values.push({
        label: 'Target',
        value: formatWeight(targetWeight ? convertWeight(targetWeight, isImperial) : null, weightUnit),
      });
    }

    return values;
  };

  if (showProgressCircle) {
    return (
      <MultiValueCard
        title="Weight"
        values={getWeightValues()}
        icon={Scale}
        color="#4287f5"
        footer={
          <div className="mt-4 flex justify-center">
            <ProgressCircle
              value={weightProgress}
              showPercentage={true}
              valueLabel={`${weightChange.toFixed(1)} ${weightUnit} ${weightDirection}`}
              size={120}
              strokeWidth={10}
            />
          </div>
        }
      />
    );
  }

  return (
    <MultiValueCard
      title="Weight"
      values={getWeightValues()}
      icon={Scale}
      color="#4287f5"
    />
  );
};

export default WeightCard;
