
import React from 'react';
import { Scale } from 'lucide-react';
import { Period } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { formatWeight } from '../utils/weightUtils';

interface WeightCardProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod?: Period;
}

const WeightCard: React.FC<WeightCardProps> = ({ latestWeight, weightUnit, currentPeriod }) => {
  const getWeightValues = () => {
    const values = [];
    
    if (currentPeriod) {
      const startingWeight = currentPeriod.startWeight;
      values.push({ 
        label: "Starting", 
        value: formatWeight(startingWeight ? (weightUnit === 'lbs' ? startingWeight * 2.20462 : startingWeight) : null, weightUnit) 
      });
    }
    
    values.push({ 
      label: "Current", 
      value: formatWeight(latestWeight, weightUnit) 
    });
    
    if (currentPeriod) {
      const targetWeight = currentPeriod.targetWeight;
      values.push({ 
        label: "Target", 
        value: formatWeight(targetWeight ? (weightUnit === 'lbs' ? targetWeight * 2.20462 : targetWeight) : null, weightUnit) 
      });
    }
    
    return values;
  };

  return (
    <MultiValueCard
      title="Weight"
      values={getWeightValues()}
      icon={Scale}
      color="#4287f5"
    />
  );
};

export default WeightCard;
