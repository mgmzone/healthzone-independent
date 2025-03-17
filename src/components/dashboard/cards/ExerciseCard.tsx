
import React from 'react';
import { Activity } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { 
  calculateCurrentWeekExercise, 
  calculatePreviousWeekExercise 
} from '../utils/exerciseCalculations';

interface ExerciseCardProps {
  exerciseLogs: ExerciseLog[];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exerciseLogs }) => {
  const getExerciseValues = () => {
    const values = [];
    
    values.push({
      label: "This Week",
      value: `${calculateCurrentWeekExercise(exerciseLogs)} mins`
    });
    
    values.push({
      label: "Previous Week",
      value: `${calculatePreviousWeekExercise(exerciseLogs)} mins`
    });
    
    return values;
  };

  return (
    <MultiValueCard
      title="Exercise"
      values={getExerciseValues()}
      icon={Activity}
      color="#42f5ad"
    />
  );
};

export default ExerciseCard;
