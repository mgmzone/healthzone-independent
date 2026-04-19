
import React from 'react';
import StatisticInput from './StatisticInput';
import { formatWeightWithUnit } from '@/lib/weight/formatWeight';
import { convertWeight } from '@/lib/weight/convertWeight';

interface ProgressSectionProps {
  weightLossPerWeek?: number;
  currentAvgWeightLoss?: number;
  progressPercentage: number | null;
  currentWeight?: number;
  isImperial: boolean;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  weightLossPerWeek,
  currentAvgWeightLoss,
  progressPercentage,
  currentWeight,
  isImperial
}) => {
  const unit = isImperial ? 'lbs' : 'kg';
  const formattedTargetLoss = weightLossPerWeek !== undefined
    ? `${convertWeight(weightLossPerWeek, isImperial).toFixed(1)} ${unit}/week`
    : '';

  const formattedActualLoss = currentAvgWeightLoss !== undefined
    ? `${Math.abs(convertWeight(currentAvgWeightLoss, isImperial)).toFixed(1)} ${unit}/week`
    : 'Not enough data';


  return (
    <>
      <StatisticInput
        id="targetLossPerWeek"
        label="Target Loss/Week"
        value={formattedTargetLoss}
      />
      <StatisticInput
        id="actualLossPerWeek"
        label="Actual Loss/Week"
        value={currentAvgWeightLoss !== undefined ? formattedActualLoss : 'Not enough data'}
        badge={currentAvgWeightLoss !== undefined ? {
          text: currentAvgWeightLoss < 0 ? 'Loss' : 'Gain',
          variant: currentAvgWeightLoss < 0 ? "secondary" : "destructive"
        } : undefined}
      />
      <StatisticInput
        id="weightLossProgress"
        label="Weight Loss Progress"
        value={progressPercentage !== null ? `${progressPercentage.toFixed(1)}%` : '0.0%'}
      />
      <StatisticInput
        id="currentWeight"
        label="Current Weight"
        value={currentWeight ? formatWeightWithUnit(currentWeight, isImperial) : ''}
      />
    </>
  );
};

export default ProgressSection;
