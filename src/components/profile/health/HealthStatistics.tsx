
import React from 'react';
import { LineChart } from 'lucide-react';
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
  
  // Calculate derived values
  const progressPercentage = calculateProgressPercentage(
    formData.startingWeight,
    formData.currentWeight,
    currentPeriod?.targetWeight,
    isImperial
  );
  
  const totalWeightLoss = calculateTotalWeightLoss(
    formData.startingWeight,
    formData.currentWeight
  );
  
  const targetLoss = calculateTargetLoss(
    formData.startingWeight,
    currentPeriod?.targetWeight,
    isImperial
  );
  
  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
      <h3 className="font-medium flex items-center gap-2 mb-4">
        <LineChart className="h-4 w-4" />
        Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Dates Section */}
        <DateSection currentPeriod={currentPeriod} />
        
        {/* Weights Section */}
        <WeightSection
          startingWeight={formData.startingWeight}
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
