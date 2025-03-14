
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
  
  // All weights in database are stored in kg
  // For display we convert them to the user's preferred unit
  
  // Use currentPeriod's startWeight as the starting weight (stored in metric/kg)
  const startingWeightKg = currentPeriod?.startWeight || formData.startingWeight;
  const currentWeightKg = formData.currentWeight;
  const targetWeightKg = currentPeriod?.targetWeight;
  
  // Calculate derived values (all calculations done with metric values)
  const progressPercentage = calculateProgressPercentage(
    startingWeightKg,
    currentWeightKg,
    targetWeightKg,
    false // Always operate on metric values
  );
  
  const totalWeightLoss = calculateTotalWeightLoss(
    startingWeightKg,
    currentWeightKg
  );
  
  const targetLoss = calculateTargetLoss(
    startingWeightKg,
    targetWeightKg,
    false // Always operate on metric values
  );
  
  // Convert all weights to display units for rendering
  const displayStartWeight = startingWeightKg !== undefined ? convertWeight(startingWeightKg, isImperial) : undefined;
  const displayCurrentWeight = currentWeightKg !== undefined ? convertWeight(currentWeightKg, isImperial) : undefined;
  const displayTargetWeight = targetWeightKg !== undefined ? convertWeight(targetWeightKg, isImperial) : undefined;
  
  // For the weekly loss rate, we need to convert it to display units
  const displayWeightLossPerWeek = currentPeriod?.weightLossPerWeek !== undefined 
    ? convertWeight(currentPeriod.weightLossPerWeek, isImperial) 
    : undefined;
  
  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
      <div className="grid grid-cols-2 gap-4">
        {/* Dates Section */}
        <DateSection currentPeriod={currentPeriod} />
        
        {/* Weights Section - pass metric weights and let the component handle display */}
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
          weightLossPerWeek={displayWeightLossPerWeek}
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
