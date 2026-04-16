import React from 'react';
import { Route } from 'lucide-react';
import { Period } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ProgressCircle';
import { formatWeight } from '../utils/weightUtils';

interface JourneyCardProps {
  currentPeriod: Period;
  latestWeight: number | null; // already converted to display units
  weightUnit: string;
  weightProgress: number; // 0-100, progress toward target weight
  daysRemaining: number;
  timeProgress: number; // 0-100, time elapsed in period
}

// Fuses the former "Weight" target row with the former "Active Period"
// timeline into one hero card — both the "how close to goal" and the "how
// much time left" numbers the user actually cares about, rendered side by
// side rather than in two separate cards.
const JourneyCard: React.FC<JourneyCardProps> = ({
  currentPeriod,
  latestWeight,
  weightUnit,
  weightProgress,
  daysRemaining,
  timeProgress,
}) => {
  const isImperial = weightUnit === 'lbs';
  const targetDisplay = isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight;
  const toGo = latestWeight != null ? Math.max(0, latestWeight - targetDisplay) : null;

  const values = [
    {
      label: 'Target',
      value: `${formatWeight(targetDisplay, weightUnit)}`,
    },
    {
      label: 'To go',
      value: toGo !== null ? `${toGo.toFixed(1)} ${weightUnit}` : '—',
    },
    {
      label: 'Time remaining',
      value: daysRemaining > 0 ? `${daysRemaining} days` : 'Period complete',
    },
  ];

  return (
    <MultiValueCard
      title="Journey"
      values={values}
      icon={Route}
      color="#8b5cf6"
      footer={
        <div className="mt-4 flex items-center justify-around gap-4">
          <div className="flex flex-col items-center">
            <ProgressCircle
              value={weightProgress}
              size={84}
              strokeWidth={7}
              showPercentage={true}
            />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">Weight goal</div>
          </div>
          <div className="flex flex-col items-center">
            <ProgressCircle
              value={timeProgress}
              size={84}
              strokeWidth={7}
              showPercentage={true}
            />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">Time elapsed</div>
          </div>
        </div>
      }
    />
  );
};

export default JourneyCard;
