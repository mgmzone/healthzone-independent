
import React from 'react';
import StatisticInput from './StatisticInput';
import { convertWeight } from '@/lib/weight/convertWeight';
import { formatWeightValue } from '@/lib/weight/formatWeight';

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
          `${formatWeight(isImperial ? convertWeight(startingWeight, true) : startingWeight)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
      <StatisticInput
        id="targetWeight"
        label="Target Weight"
        value={targetWeight ? 
          `${formatWeight(isImperial ? convertWeight(targetWeight, true) : targetWeight)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
      <StatisticInput
        id="targetLoss"
        label="Target Loss"
        value={targetLoss ? 
          `${formatWeight(isImperial ? convertWeight(targetLoss, true) : targetLoss)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
      <StatisticInput
        id="lostThusFar"
        label="Lost Thus Far"
        value={totalWeightLoss ? 
          `${formatWeight(isImperial ? convertWeight(totalWeightLoss, true) : totalWeightLoss)} ${isImperial ? 'lbs' : 'kg'}` : ''}
      />
    </>
  );
};

export default WeightSection;
