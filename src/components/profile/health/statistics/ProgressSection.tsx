
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
  // Log the raw values
  console.log('Progress Section raw values:', {
    weightLossPerWeek,
    currentAvgWeightLoss,
    isImperial
  });
  
  // Format the target loss per week without converting twice
  // weightLossPerWeek is already in kg, just format it directly with the unit conversion
  const formattedTargetLoss = weightLossPerWeek 
    ? formatWeightWithUnit(weightLossPerWeek, isImperial)
    : '';
    
  // Similarly for actual loss, apply the same logic
  const formattedActualLoss = currentAvgWeightLoss !== undefined
    ? formatWeightWithUnit(Math.abs(currentAvgWeightLoss), isImperial)
    : 'Not enough data';
    
  return (
    <>
      <StatisticInput
        id="targetLossPerWeek"
        label="Target Loss/Week"
        value={weightLossPerWeek ? 
          `${formattedTargetLoss}/week` : ''}
      />
      <StatisticInput
        id="actualLossPerWeek"
        label="Actual Loss/Week"
        value={currentAvgWeightLoss !== undefined ? 
          `${formattedActualLoss}/week` : 'Not enough data'}
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
