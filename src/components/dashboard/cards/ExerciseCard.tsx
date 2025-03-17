
import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { 
  calculateCurrentWeekExercise,
  calculateExerciseGoalPercentage,
  WEEKLY_EXERCISE_GOAL
} from '../utils/exerciseCalculations';

interface ExerciseCardProps {
  exerciseLogs: ExerciseLog[];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exerciseLogs }) => {
  const [currentWeekMinutes, setCurrentWeekMinutes] = useState(0);
  const [goalPercentage, setGoalPercentage] = useState(0);
  
  useEffect(() => {
    // Calculate values with the complete exercise log data
    setCurrentWeekMinutes(calculateCurrentWeekExercise(exerciseLogs));
    setGoalPercentage(calculateExerciseGoalPercentage(exerciseLogs));
  }, [exerciseLogs]);

  const getExerciseValues = () => {
    return [
      {
        label: "This Week",
        value: `${currentWeekMinutes} mins`
      },
      {
        label: "Weekly Target",
        value: `${WEEKLY_EXERCISE_GOAL} mins`
      },
      {
        label: "% Complete",
        value: `${goalPercentage}%`
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
