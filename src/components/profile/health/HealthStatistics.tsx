
import React from 'react';
import DateSection from './statistics/DateSection';
import WeightSection from './statistics/WeightSection';
import ProgressSection from './statistics/ProgressSection';
import { calculateProgressPercentage, calculateTotalWeightLoss, calculateTargetLoss } from './statistics/weightCalculations';
import { convertToMetric, convertWeight } from '@/lib/weight/convertWeight';

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
    projectedEndDate?: string;
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
  
  // All weights come in from database as kg (metric)
  const startingWeightKg = currentPeriod?.startWeight;
  const targetWeightKg = currentPeriod?.targetWeight;
  
  // Current weight from profile service is in kg
  const currentWeightKg = formData.currentWeight;
  
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
  
  console.log('Weight values (kg):', {
    startingWeightKg,
    currentWeightKg,
    targetWeightKg,
    totalWeightLoss,
    progressPercentage
  });
  
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
