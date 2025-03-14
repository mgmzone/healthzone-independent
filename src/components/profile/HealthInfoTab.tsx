
import React from 'react';
import HealthStatistics from './health/HealthStatistics';

interface HealthInfoTabProps {
  formData: {
    startingWeight?: number;
    currentWeight?: number;
    targetWeight?: number;
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
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthInfoTab: React.FC<HealthInfoTabProps> = ({
  formData,
  currentPeriod,
  currentAvgWeightLoss
}) => {
  return (
    <div className="space-y-6">
      <HealthStatistics 
        formData={formData}
        currentPeriod={currentPeriod}
        currentAvgWeightLoss={currentAvgWeightLoss}
      />
    </div>
  );
};

export default HealthInfoTab;
