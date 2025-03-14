
import React from 'react';
import StatisticInput from './StatisticInput';
import { formatWeightWithUnit } from '@/lib/weight/formatWeight';
import { convertWeight } from '@/lib/weight/convertWeight';

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
  // Debug inputs with exactly what we're receiving
  console.log('Weight Section EXACT Input Values:', {
    startingWeight,
    currentWeight,
    targetWeight,
    totalWeightLoss,
    targetLoss,
    isImperial
  });

  // Make sure we're working with the correct units for calculation
  // When using imperial, we need to first convert stored metric values to imperial for calculation
  const displayStartWeight = startingWeight ? (isImperial ? convertWeight(startingWeight, true) : startingWeight) : 0;
  const displayCurrentWeight = currentWeight ? (isImperial ? convertWeight(currentWeight, true) : currentWeight) : 0;
  
  console.log('Converted weights for calculation:', {
    displayStartWeight,
    displayCurrentWeight
  });

  // Calculate weight loss - exact same logic as Weight page and Periods table
  const weightLoss = displayStartWeight && displayCurrentWeight 
    ? displayStartWeight - displayCurrentWeight 
    : 0;
  
  console.log('Direct weight loss calculation:', {
    displayStartWeight,
    displayCurrentWeight,
    weightLoss
  });
  
  // Format with proper weight units and sign
  let weightLossDisplay;
  
  if (weightLoss === 0) {
    weightLossDisplay = '0.0 ' + (isImperial ? 'lbs' : 'kg');
  } else if (weightLoss > 0) {
    // Weight LOSS (positive number = weight went down)
    weightLossDisplay = '-' + formatWeightWithUnit(Math.abs(weightLoss), false).trim();
  } else {
    // Weight GAIN (negative number = weight went up)
    weightLossDisplay = '+' + formatWeightWithUnit(Math.abs(weightLoss), false).trim();
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
