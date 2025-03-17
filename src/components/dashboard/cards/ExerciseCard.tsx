
import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { useAuth } from '@/lib/AuthContext';
import { 
  calculateCurrentWeekExercise,
  calculateExerciseGoalPercentage,
} from '../utils/exerciseCalculations';

interface ExerciseCardProps {
  exerciseLogs: ExerciseLog[];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exerciseLogs }) => {
  const { profile } = useAuth();
  const [currentWeekMinutes, setCurrentWeekMinutes] = useState(0);
  const [goalPercentage, setGoalPercentage] = useState(0);
  
  // Calculate weekly exercise goal based on user's daily target (7 days)
  const weeklyExerciseGoal = profile?.exerciseMinutesPerDay 
    ? profile.exerciseMinutesPerDay * 7 
    : 150; // Default to 150 if no profile data
  
  useEffect(() => {
    // Calculate values with the complete exercise log data
    setCurrentWeekMinutes(calculateCurrentWeekExercise(exerciseLogs));
    
    // Calculate percentage based on the personal weekly goal
    const percentage = (currentWeekMinutes / weeklyExerciseGoal) * 100;
    setGoalPercentage(Math.min(Math.round(percentage), 100));
  }, [exerciseLogs, weeklyExerciseGoal, currentWeekMinutes]);

  const getExerciseValues = () => {
    return [
      {
        label: "This Week",
        value: `${currentWeekMinutes} mins`
      },
      {
        label: "Weekly Target",
        value: `${weeklyExerciseGoal} mins`
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
