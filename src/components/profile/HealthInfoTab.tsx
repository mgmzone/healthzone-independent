
import React from 'react';
import HealthStatistics from './health/HealthStatistics';
import HealthForm from './health/HealthForm';

interface HealthInfoTabProps {
  formData: {
    height?: number;
    currentWeight?: number;
    targetWeight?: number;
    fitnessLevel?: string;
    weightLossPerWeek?: number;
    exerciseMinutesPerDay?: number;
    healthGoals?: string;
    measurementUnit?: string;
    startingWeight?: number;
  };
  currentPeriod?: {
    id: string;
    startDate: string;
    endDate?: string;
    targetWeight: number;
    weightLossPerWeek: number;
  };
  currentAvgWeightLoss?: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthInfoTab: React.FC<HealthInfoTabProps> = ({
  formData,
  currentPeriod,
  currentAvgWeightLoss,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  return (
    <div className="space-y-6">
      <HealthStatistics 
        formData={formData}
        currentPeriod={currentPeriod}
        currentAvgWeightLoss={currentAvgWeightLoss}
      />
      
      <HealthForm 
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleNumberChange={handleNumberChange}
      />
    </div>
  );
};

export default HealthInfoTab;
