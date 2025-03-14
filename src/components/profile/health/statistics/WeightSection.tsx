
import React from 'react';
import StatisticInput from './StatisticInput';
import { formatWeightWithUnit } from '@/lib/weight/formatWeight';

interface WeightSectionProps {
  startingWeight?: number;
  currentWeight?: number;
  targetWeight?: number;
  totalWeightLoss: number | null;
  targetLoss: number | null;
  isImperial: boolean;
}

const WeightSection: React.FC<WeightSectionProps> = ({
  startingWeight,
  currentWeight,
  targetWeight,
  totalWeightLoss,
  targetLoss,
  isImperial
}) => {
  // Debug inputs for debugging
  console.log('Weight Section Debug:', {
    startingWeight,
    currentWeight,
    targetWeight,
    totalWeightLoss,
    targetLoss,
    isImperial
  });

  // Format weight loss display - no conversion needed as displayValues are already converted by parent
  let weightLossDisplay;
  
  if (!startingWeight || !currentWeight) {
    weightLossDisplay = '0.0 ' + (isImperial ? 'lbs' : 'kg');
  } else {
    // Calculate weight difference (startingWeight and currentWeight are already in display units)
    const weightChange = startingWeight - currentWeight;
    
    if (weightChange === 0) {
      weightLossDisplay = '0.0 ' + (isImperial ? 'lbs' : 'kg');
    } else if (weightChange > 0) {
      // Weight LOSS (positive number = weight went down)
      weightLossDisplay = formatWeightWithUnit(Math.abs(weightChange), isImperial);
    } else {
      // Weight GAIN (negative number = weight went up)
      weightLossDisplay = '+' + formatWeightWithUnit(Math.abs(weightChange), isImperial);
    }
  }
  
  return (
    <>
      <StatisticInput
        id="startingWeight"
        label="Starting Weight"
        value={startingWeight ? formatWeightWithUnit(startingWeight, isImperial) : ''}
      />
      <StatisticInput
        id="targetWeight"
        label="Target Weight"
        value={targetWeight ? formatWeightWithUnit(targetWeight, isImperial) : ''}
      />
      <StatisticInput
        id="targetLoss"
        label="Target Loss"
        value={targetLoss ? formatWeightWithUnit(targetLoss, isImperial) : ''}
      />
      <StatisticInput
        id="lostThusFar"
        label="Lost This Period"
        value={weightLossDisplay}
      />
    </>
  );
};

export default WeightSection;
