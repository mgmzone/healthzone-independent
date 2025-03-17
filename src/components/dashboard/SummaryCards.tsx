
import React from 'react';
import { Period, ExerciseLog, FastingLog } from '@/lib/types';
import WeightCard from './cards/WeightCard';
import PeriodCard from './cards/PeriodCard';
import ExerciseCard from './cards/ExerciseCard';
import FastingCard from './cards/FastingCard';

interface SummaryCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: Period | undefined;
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
  getDaysRemaining: (date: Date, projectedEndDate?: Date | string | undefined) => number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  exerciseLogs,
  fastingLogs,
  getDaysRemaining
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WeightCard 
          latestWeight={latestWeight} 
          weightUnit={weightUnit} 
          currentPeriod={currentPeriod} 
        />
        
        <PeriodCard 
          currentPeriod={currentPeriod} 
          getDaysRemaining={getDaysRemaining} 
        />
        
        <ExerciseCard exerciseLogs={exerciseLogs} />
        
        <FastingCard fastingLogs={fastingLogs} />
      </div>
    </div>
  );
};
