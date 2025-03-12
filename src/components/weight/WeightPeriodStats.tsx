
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <WeightStatsCard 
        value={periodStartWeight}
        label="Starting Weight"
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={currentWeight}
        label="Current Weight"
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={Math.abs(parseFloat(totalPeriodChange))}
        label={`${isWeightLoss ? 'Lost' : 'Gained'} This Period`}
        unit={weightUnit}
        isNegative={!isWeightLoss}
      />
    </div>
  );
};

export default WeightPeriodStats;
