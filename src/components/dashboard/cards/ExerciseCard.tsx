import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ProgressCircle';
import { useAuth } from '@/lib/AuthContext';
import { 
  calculateCurrentWeekExercise,
  calculateExerciseGoalPercentage,
} from '../utils/exerciseCalculations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExerciseCardProps {
  exerciseLogs: ExerciseLog[];
  showProgressCircle?: boolean;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exerciseLogs,
  showProgressCircle = false,
  cardClassName = "",
  cardStyle = {}
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

  if (showProgressCircle) {
    return (
      <Card className={cardClassName} style={cardStyle}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Weekly Exercise Goal</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ProgressCircle 
            value={goalPercentage} 
            showPercentage={true}
            valueLabel={`${currentWeekMinutes}/${weeklyExerciseGoal} min`}
            size={140}
            strokeWidth={12}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <MultiValueCard
      title="Exercise"
      values={getExerciseValues()}
      icon={Dumbbell}
      color="#42f5ad"
    />
  );
};

export default ExerciseCard;
