
import React from 'react';
import { Scale } from 'lucide-react';
import { Period } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { formatWeight } from '../utils/weightUtils';
import ProgressCircle from '@/components/ProgressCircle';

interface WeightCardProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod?: Period;
  weightProgress?: number;
  weightChange?: number;
  weightDirection?: 'lost' | 'gained';
  showProgressCircle?: boolean;
}

const WeightCard: React.FC<WeightCardProps> = ({ 
  latestWeight, 
  weightUnit, 
  currentPeriod,
  weightProgress = 0,
  weightChange = 0,
  weightDirection = 'lost',
  showProgressCircle = false
}) => {
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

  if (showProgressCircle) {
    return (
      <MultiValueCard
        title="Weight"
        values={getWeightValues()}
        icon={Scale}
        color="#4287f5"
        footer={
          <div className="mt-4 flex justify-center">
            <ProgressCircle 
              value={weightProgress} 
              showPercentage={true}
              valueLabel={`${weightChange.toFixed(1)} ${weightUnit} ${weightDirection}`}
              size={120}
              strokeWidth={10}
            />
          </div>
        }
      />
    );
  }

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
