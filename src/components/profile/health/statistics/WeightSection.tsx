
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
  // For debugging
  console.log('Weight Stats (Before Calculation):', { 
    startingWeight, 
    currentWeight, 
    targetWeight, 
    totalWeightLoss, 
    targetLoss
  });

  // IMPORTANT: Calculate the actual weight loss
  // This matches the same calculation used on the Weight page
  // We need to show the actual loss value regardless of whether it's negative or positive
  const actualWeightLoss = startingWeight && currentWeight 
    ? startingWeight - currentWeight 
    : 0;
  
  console.log('Actual weight loss calculation:', {
    startingWeight,
    currentWeight,
    calculation: `${startingWeight} - ${currentWeight} = ${actualWeightLoss}`
  });
  
  // Format the weight loss for display
  const formattedWeightLoss = actualWeightLoss 
    ? formatWeightWithUnit(Math.abs(actualWeightLoss), isImperial) 
    : '0.0 ' + (isImperial ? 'lbs' : 'kg');
  
  // Add a "+" prefix for weight gain, "-" for weight loss
  const weightLossDisplay = actualWeightLoss !== 0 
    ? (actualWeightLoss < 0 ? '+' : '-') + formattedWeightLoss.trim()
    : formattedWeightLoss;
  
  console.log('Final displayed weight loss:', weightLossDisplay);

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
