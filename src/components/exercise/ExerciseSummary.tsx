
import React from 'react';
import { ExerciseLog, TimeFilter } from '@/lib/types';
import ExerciseTimeFilter from '@/components/exercise/ExerciseTimeFilter';
import ActivityStatCards from './summary/ActivityStatCards';
import ActivityCharts from './summary/ActivityCharts';

interface ExerciseSummaryProps {
  exerciseLogs: ExerciseLog[];
  isLoading: boolean;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

const ExerciseSummary: React.FC<ExerciseSummaryProps> = ({ 
  exerciseLogs, 
  isLoading,
  timeFilter,
  onTimeFilterChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activity Summary</h2>
        <ExerciseTimeFilter 
          value={timeFilter} 
          onChange={onTimeFilterChange} 
        />
      </div>
      
      <ActivityStatCards 
        exerciseLogs={exerciseLogs}
        timeFilter={timeFilter}
      />
      
      <ActivityCharts 
        exerciseLogs={exerciseLogs}
        timeFilter={timeFilter}
      />
    </div>
  );
};

export default ExerciseSummary;
