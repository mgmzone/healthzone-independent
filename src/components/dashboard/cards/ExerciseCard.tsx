
import React, { useEffect, useState } from 'react';
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
  const [currentWeekMinutes, setCurrentWeekMinutes] = useState(0);
  const [previousWeekMinutes, setPreviousWeekMinutes] = useState(0);
  
  useEffect(() => {
    // Debug log to verify exercise logs received
    console.log('Exercise logs in ExerciseCard:', exerciseLogs);
    
    // Calculate values with the complete exercise log data
    setCurrentWeekMinutes(calculateCurrentWeekExercise(exerciseLogs));
    setPreviousWeekMinutes(calculatePreviousWeekExercise(exerciseLogs));
  }, [exerciseLogs]);

  const getExerciseValues = () => {
    return [
      {
        label: "This Week",
        value: `${currentWeekMinutes} mins`
      },
      {
        label: "Previous Week",
        value: `${previousWeekMinutes} mins`
      }
    ];
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
