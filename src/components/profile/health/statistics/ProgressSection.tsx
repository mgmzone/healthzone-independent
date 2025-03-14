
import React from 'react';
import StatisticInput from './StatisticInput';

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
  return (
    <>
      <StatisticInput
        id="targetLossPerWeek"
        label="Target Loss/Week"
        value={weightLossPerWeek ? 
          `${isImperial ? (weightLossPerWeek * 2.20462).toFixed(2) : weightLossPerWeek.toFixed(2)} ${isImperial ? 'lbs' : 'kg'}/week` : ''}
      />
      <StatisticInput
        id="actualLossPerWeek"
        label="Actual Loss/Week"
        value={currentAvgWeightLoss !== undefined ? 
          `${isImperial ? Math.abs(currentAvgWeightLoss * 2.20462).toFixed(2) : Math.abs(currentAvgWeightLoss).toFixed(2)} ${isImperial ? 'lbs' : 'kg'}/week` : 'Not enough data'}
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
        value={currentWeight ? `${currentWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
    </>
  );
};

export default ProgressSection;
