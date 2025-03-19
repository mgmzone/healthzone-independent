
import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ui/ProgressCircle';
import { useAuth } from '@/lib/auth';
import { 
  calculateCurrentWeekExercise,
  calculateExerciseGoalPercentage,
} from '../utils/exerciseCalculations';

interface ExerciseCardProps {
  exerciseLogs: ExerciseLog[];
  showProgressCircle?: boolean;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exerciseLogs,
  showProgressCircle = false,
  cardClassName,
  cardStyle
}) => {
  const { profile } = useAuth();
  const [currentWeekMinutes, setCurrentWeekMinutes] = useState(0);
  const [goalPercentage, setGoalPercentage] = useState(0);
  
  // Calculate weekly exercise goal based on user's daily target (7 days)
  const weeklyExerciseGoal = profile?.exerciseMinutesPerDay 
    ? profile.exerciseMinutesPerDay * 7 
    : 150; // Default to 150 if no profile data
  
  useEffect(() => {
    // Calculate values with the complete exercise log data
    const weekMinutes = calculateCurrentWeekExercise(exerciseLogs);
    setCurrentWeekMinutes(weekMinutes);
    
    // Calculate percentage based on the personal weekly goal without capping at 100%
    const percentage = (weekMinutes / weeklyExerciseGoal) * 100;
    setGoalPercentage(Math.round(percentage));
  }, [exerciseLogs, weeklyExerciseGoal]);

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

  if (showProgressCircle) {
    return (
      <MultiValueCard
        title="Exercise"
        values={getExerciseValues()}
        icon={Dumbbell}
        color="#42f5ad"
        className={cardClassName}
        style={cardStyle}
        footer={
          <div className="mt-4 flex justify-center">
            <ProgressCircle 
              percentage={goalPercentage} 
              showPercentage={true}
              valueLabel={`${currentWeekMinutes}/${weeklyExerciseGoal} min`}
              size={120}
              strokeWidth={10}
              allowExceedGoal={true}
            />
          </div>
        }
      />
    );
  }

  return (
    <MultiValueCard
      title="Exercise"
      values={getExerciseValues()}
      icon={Dumbbell}
      color="#42f5ad"
      className={cardClassName}
      style={cardStyle}
    />
  );
};

export default ExerciseCard;
