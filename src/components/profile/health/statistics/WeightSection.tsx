
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
  // Format weight display - all inputs are in kg, convert for display if needed
  let weightLossDisplay;
  
  if (totalWeightLoss === null || !startingWeight || !currentWeight) {
    weightLossDisplay = '0.0 ' + (isImperial ? 'lbs' : 'kg');
  } else {    
    if (totalWeightLoss === 0) {
      weightLossDisplay = '0.0 ' + (isImperial ? 'lbs' : 'kg');
    } else if (totalWeightLoss > 0) {
      // Weight LOSS (positive number = weight went down)
      weightLossDisplay = formatWeightWithUnit(totalWeightLoss, isImperial);
    } else {
      // Weight GAIN (negative number = weight went up)
      weightLossDisplay = '+' + formatWeightWithUnit(Math.abs(totalWeightLoss), isImperial);
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
