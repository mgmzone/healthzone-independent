
import React from 'react';
import DateSection from './statistics/DateSection';
import WeightSection from './statistics/WeightSection';
import ProgressSection from './statistics/ProgressSection';
import { calculateProgressPercentage, calculateTotalWeightLoss, calculateTargetLoss } from './statistics/weightCalculations';
import { convertWeight } from '@/lib/weight/convertWeight';

interface HealthStatisticsProps {
  formData: {
    startingWeight?: number;
    currentWeight?: number;
    measurementUnit?: string;
  };
  currentPeriod?: {
    id: string;
    startDate: string;
    endDate?: string;
    targetWeight: number;
    weightLossPerWeek: number;
    startWeight: number;
  };
  currentAvgWeightLoss?: number;
}

const HealthStatistics: React.FC<HealthStatisticsProps> = ({
  formData,
  currentPeriod,
  currentAvgWeightLoss
}) => {
  const unit = formData.measurementUnit || 'imperial';
  const isImperial = unit === 'imperial';
  
  // Use currentPeriod's startWeight as the starting weight (stored in metric/kg)
  const startingWeight = currentPeriod?.startWeight || formData.startingWeight;
  
  // Calculate derived values
  const progressPercentage = calculateProgressPercentage(
    startingWeight,
    formData.currentWeight,
    currentPeriod?.targetWeight,
    isImperial
  );
  
  const totalWeightLoss = calculateTotalWeightLoss(
    startingWeight,
    formData.currentWeight
  );
  
  const targetLoss = calculateTargetLoss(
    startingWeight,
    currentPeriod?.targetWeight,
    isImperial
  );
  
  // Convert all weights to display units (imperial or metric) for consistent display
  const displayStartWeight = startingWeight ? convertWeight(startingWeight, isImperial) : undefined;
  const displayCurrentWeight = formData.currentWeight ? convertWeight(formData.currentWeight, isImperial) : undefined;
  const displayTargetWeight = currentPeriod?.targetWeight ? convertWeight(currentPeriod.targetWeight, isImperial) : undefined;
  
  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
      <div className="grid grid-cols-2 gap-4">
        {/* Dates Section */}
        <DateSection currentPeriod={currentPeriod} />
        
        {/* Weights Section - pass display weights that are already converted */}
        <WeightSection
          startingWeight={displayStartWeight}
          currentWeight={displayCurrentWeight}
          targetWeight={displayTargetWeight}
          totalWeightLoss={totalWeightLoss}
          targetLoss={targetLoss}
          isImperial={isImperial}
        />
        
        {/* Progress Section */}
        <ProgressSection
          weightLossPerWeek={currentPeriod?.weightLossPerWeek}
          currentAvgWeightLoss={currentAvgWeightLoss}
          progressPercentage={progressPercentage}
          currentWeight={displayCurrentWeight}
          isImperial={isImperial}
        />
      </div>
    </div>
  );
};

export default HealthStatistics;
