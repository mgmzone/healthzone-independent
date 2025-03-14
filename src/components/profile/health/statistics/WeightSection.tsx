
import React from 'react';
import StatisticInput from './StatisticInput';
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
  // Format weight values for display
  const formatWeight = (weight: number | undefined): string => {
    if (weight === undefined || weight === 0) return '';
    return weight.toString();
  };

  return (
    <>
      <StatisticInput
        id="startingWeight"
        label="Starting Weight"
        value={startingWeight ? 
          `${formatWeight(isImperial ? (startingWeight * 2.20462).toFixed(1) : startingWeight.toFixed(1))} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
      <StatisticInput
        id="targetWeight"
        label="Target Weight"
        value={targetWeight ? 
          `${isImperial ? (targetWeight * 2.20462).toFixed(1) : targetWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
      <StatisticInput
        id="targetLoss"
        label="Target Loss"
        value={targetLoss ? `${isImperial ? (targetLoss * 2.20462).toFixed(1) : targetLoss.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
      <StatisticInput
        id="lostThusFar"
        label="Lost Thus Far"
        value={totalWeightLoss ? `${isImperial ? (totalWeightLoss * 2.20462).toFixed(1) : totalWeightLoss.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
    </>
  );
};

export default WeightSection;
