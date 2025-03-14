
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
  console.log('Weight Stats:', { 
    startingWeight, 
    currentWeight, 
    targetWeight, 
    totalWeightLoss, 
    targetLoss 
  });

  // Calculate the weight loss directly to ensure it matches the Weight page
  const weightLoss = startingWeight && currentWeight && startingWeight > currentWeight 
    ? startingWeight - currentWeight 
    : 0;

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
        value={weightLoss > 0 ? formatWeightWithUnit(weightLoss, isImperial) : '0.0 ' + (isImperial ? 'lbs' : 'kg')}
      />
    </>
  );
};

export default WeightSection;
