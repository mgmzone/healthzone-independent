
import React from 'react';
import DateSection from './statistics/DateSection';
import WeightSection from './statistics/WeightSection';
import ProgressSection from './statistics/ProgressSection';
import { calculateProgressPercentage, calculateTotalWeightLoss, calculateTargetLoss } from './statistics/weightCalculations';

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
  const startingWeightKg = currentPeriod?.startWeight;
  
  // Current weight from formData is already in the correct display unit (from profileFormState)
  // For imperial users, this is already in lbs
  const currentWeightKg = formData.currentWeight;
  const targetWeightKg = currentPeriod?.targetWeight;
  
  // Calculate derived values (all calculations done with metric values)
  const progressPercentage = calculateProgressPercentage(
    startingWeightKg,
    currentWeightKg,
    targetWeightKg
  );
  
  const totalWeightLoss = calculateTotalWeightLoss(
    startingWeightKg,
    currentWeightKg
  );
  
  const targetLoss = calculateTargetLoss(
    startingWeightKg,
    targetWeightKg
  );
  
  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
      <div className="grid grid-cols-2 gap-4">
        {/* Dates Section */}
        <DateSection currentPeriod={currentPeriod} />
        
        {/* Weights Section - pass metric weights and let the component handle display */}
        <WeightSection
          startingWeight={startingWeightKg}
          currentWeight={currentWeightKg}
          targetWeight={targetWeightKg}
          totalWeightLoss={totalWeightLoss}
          targetLoss={targetLoss}
          isImperial={isImperial}
        />
        
        {/* Progress Section */}
        <ProgressSection
          weightLossPerWeek={currentPeriod?.weightLossPerWeek}
          currentAvgWeightLoss={currentAvgWeightLoss}
          progressPercentage={progressPercentage}
          currentWeight={currentWeightKg}
          isImperial={isImperial}
        />
      </div>
    </div>
  );
};

export default HealthStatistics;
