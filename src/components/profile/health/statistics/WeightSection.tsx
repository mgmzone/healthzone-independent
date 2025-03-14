
import React from 'react';
import StatisticInput from './StatisticInput';
import { convertWeight } from '@/lib/weight/convertWeight';
import { formatWeightValue, formatWeightWithUnit } from '@/lib/weight/formatWeight';

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
        label="Lost Thus Far"
        value={totalWeightLoss ? formatWeightWithUnit(totalWeightLoss, isImperial) : ''}
      />
    </>
  );
};

export default WeightSection;
