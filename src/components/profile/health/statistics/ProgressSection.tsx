
import React from 'react';
import StatisticInput from './StatisticInput';
import { formatWeightWithUnit } from '@/lib/weight/formatWeight';

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
  // Format the target loss per week - this is already in the correct display units
  // from the database (unlike other weight values which are stored in kg)
  const formattedTargetLoss = weightLossPerWeek !== undefined
    ? `${weightLossPerWeek.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}/week`
    : '';
    
  // Format the actual loss per week - (also already in display units)
  const formattedActualLoss = currentAvgWeightLoss !== undefined
    ? `${Math.abs(currentAvgWeightLoss).toFixed(1)} ${isImperial ? 'lbs' : 'kg'}/week`
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
        value={progressPercentage !== null ? `${progressPercentage.toFixed(2)}%` : ''}
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
