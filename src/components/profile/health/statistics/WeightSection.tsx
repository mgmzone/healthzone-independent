
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
  // Debug inputs
  console.log('Weight Section Input Values:', {
    startingWeight,
    currentWeight,
    targetWeight,
    totalWeightLoss,
    targetLoss,
    isImperial
  });

  // Calculate weight loss - this should match exactly with the Weight page
  const weightLoss = startingWeight && currentWeight 
    ? startingWeight - currentWeight 
    : 0;
  
  console.log('Direct weight loss calculation:', {
    startingWeight,
    currentWeight,
    weightLoss
  });
  
  // Format with proper weight units
  let weightLossDisplay;
  
  if (weightLoss === 0) {
    weightLossDisplay = '0.0 ' + (isImperial ? 'lbs' : 'kg');
  } else if (weightLoss > 0) {
    // Weight LOSS (positive number = weight went down)
    weightLossDisplay = '-' + formatWeightWithUnit(Math.abs(weightLoss), isImperial).trim();
  } else {
    // Weight GAIN (negative number = weight went up)
    weightLossDisplay = '+' + formatWeightWithUnit(Math.abs(weightLoss), isImperial).trim();
  }
  
  console.log('Final display value:', weightLossDisplay);

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
