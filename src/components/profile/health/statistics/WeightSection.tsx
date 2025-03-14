
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
  // Format weight values for display with unit
  const formatWeightWithUnit = (weight: number | undefined): string => {
    if (weight === undefined) return '';
    const convertedWeight = isImperial ? convertWeight(weight, true) : weight;
    return `${formatWeightValue(convertedWeight)} ${isImperial ? 'lbs' : 'kg'}`;
  };

  return (
    <>
      <StatisticInput
        id="startingWeight"
        label="Starting Weight"
        value={startingWeight ? formatWeightWithUnit(startingWeight) : ''}
      />
      <StatisticInput
        id="targetWeight"
        label="Target Weight"
        value={targetWeight ? formatWeightWithUnit(targetWeight) : ''}
      />
      <StatisticInput
        id="targetLoss"
        label="Target Loss"
        value={targetLoss ? formatWeightWithUnit(targetLoss) : ''}
      />
      <StatisticInput
        id="lostThusFar"
        label="Lost Thus Far"
        value={totalWeightLoss ? formatWeightWithUnit(totalWeightLoss) : ''}
      />
    </>
  );
};

export default WeightSection;
