
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HealthStatistics from '@/components/profile/health/HealthStatistics';
import { Period } from '@/lib/types';
import { ensureDate } from '@/lib/utils/dateUtils';

interface HealthStatisticsSectionProps {
  profile: {
    startingWeight?: number;
    currentWeight?: number;
    measurementUnit?: string;
  } | null;
  currentPeriod?: Period;
  currentAvgWeightLoss?: number;
}

const HealthStatisticsSection: React.FC<HealthStatisticsSectionProps> = ({
  profile,
  currentPeriod,
  currentAvgWeightLoss
}) => {
  if (!profile) return null;
  
  const formData = {
    startingWeight: profile.startingWeight,
    currentWeight: profile.currentWeight,
    measurementUnit: profile.measurementUnit
  };

  // Convert period data to the correct format expected by HealthStatistics
  const formattedPeriod = currentPeriod ? {
    id: currentPeriod.id,
    startDate: currentPeriod.startDate.toString(), // Ensure startDate is a string
    endDate: currentPeriod.endDate ? currentPeriod.endDate.toString() : undefined,
    projectedEndDate: currentPeriod.projectedEndDate ? currentPeriod.projectedEndDate.toString() : undefined,
    targetWeight: currentPeriod.targetWeight,
    weightLossPerWeek: currentPeriod.weightLossPerWeek,
    startWeight: currentPeriod.startWeight
  } : undefined;

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Health Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <HealthStatistics 
          formData={formData}
          currentPeriod={formattedPeriod}
          currentAvgWeightLoss={currentAvgWeightLoss}
        />
      </CardContent>
    </Card>
  );
};

export default HealthStatisticsSection;
