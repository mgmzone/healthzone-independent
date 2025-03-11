
import React from 'react';
import WeightStatsCard from './WeightStatsCard';

interface WeightPeriodStatsProps {
  periodStartWeight: number;
  currentWeight: number;
  totalPeriodChange: string;
  isWeightLoss: boolean;
  weightUnit: string;
}

const WeightPeriodStats: React.FC<WeightPeriodStatsProps> = ({
  periodStartWeight,
  currentWeight,
  totalPeriodChange,
  isWeightLoss,
  weightUnit
}) => {
  // Ensure values are formatted consistently with one decimal place
  const formattedStartWeight = parseFloat(periodStartWeight.toFixed(1));
  const formattedCurrentWeight = parseFloat(currentWeight.toFixed(1));
  const formattedChange = Math.abs(parseFloat(totalPeriodChange));
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <WeightStatsCard 
        value={formattedStartWeight}
        label="Starting Weight"
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={formattedCurrentWeight}
        label="Current Weight"
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={formattedChange}
        label={`${isWeightLoss ? 'Lost' : 'Gained'} This Period`}
        unit={weightUnit}
        isNegative={!isWeightLoss}
      />
    </div>
  );
};

export default WeightPeriodStats;
