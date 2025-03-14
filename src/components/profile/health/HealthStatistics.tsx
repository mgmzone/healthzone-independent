
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
  
  // Use currentPeriod's startWeight as the starting weight
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
  
  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
      <div className="grid grid-cols-2 gap-4">
        {/* Dates Section */}
        <DateSection currentPeriod={currentPeriod} />
        
        {/* Weights Section */}
        <WeightSection
          startingWeight={startingWeight}
          currentWeight={formData.currentWeight}
          targetWeight={currentPeriod?.targetWeight}
          totalWeightLoss={totalWeightLoss}
          targetLoss={targetLoss}
          isImperial={isImperial}
        />
        
        {/* Progress Section */}
        <ProgressSection
          weightLossPerWeek={currentPeriod?.weightLossPerWeek}
          currentAvgWeightLoss={currentAvgWeightLoss}
          progressPercentage={progressPercentage}
          currentWeight={formData.currentWeight}
          isImperial={isImperial}
        />
      </div>
    </div>
  );
};

export default HealthStatistics;
