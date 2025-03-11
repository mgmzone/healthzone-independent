
import React from 'react';
import WeightStatsCard from './WeightStatsCard';

interface WeightChange {
  value: string;
  days?: number;
}

interface WeightChangeStatsProps {
  changes: {
    days7: WeightChange | null;
    days30: WeightChange | null;
    days90: WeightChange | null;
    allTime: WeightChange | null;
  };
  weightUnit: string;
}

const WeightChangeStats: React.FC<WeightChangeStatsProps> = ({ changes, weightUnit }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <WeightStatsCard 
        value={changes.days7 ? Math.abs(Number(changes.days7.value)) : 0}
        label={`${Number(changes.days7?.value || 0) <= 0 ? 'Lost' : 'Gained'} in 7 days`}
        isCompact
        isNegative={changes.days7 ? Number(changes.days7.value) > 0 : false}
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={changes.days30 ? Math.abs(Number(changes.days30.value)) : 0}
        label={`${Number(changes.days30?.value || 0) <= 0 ? 'Lost' : 'Gained'} in 30 days`}
        isCompact
        isNegative={changes.days30 ? Number(changes.days30.value) > 0 : false}
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={changes.days90 ? Math.abs(Number(changes.days90.value)) : 0}
        label={`${Number(changes.days90?.value || 0) <= 0 ? 'Lost' : 'Gained'} in 90 days`}
        isCompact
        isNegative={changes.days90 ? Number(changes.days90.value) > 0 : false}
        unit={weightUnit}
      />
      <WeightStatsCard 
        value={changes.allTime ? Math.abs(Number(changes.allTime.value)) : 0}
        label={`${Number(changes.allTime?.value || 0) <= 0 ? 'Lost' : 'Gained'} all time`}
        isCompact
        isNegative={changes.allTime ? Number(changes.allTime.value) > 0 : false}
        unit={weightUnit}
      />
    </div>
  );
};

export default WeightChangeStats;
