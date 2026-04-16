import React from 'react';
import { Heart, Dumbbell, Trophy, Wind, Activity } from 'lucide-react';
import { ExerciseCategory } from '@/lib/types';

interface ExerciseActivityIconProps {
  type: ExerciseCategory | string;
  className?: string;
}

const ExerciseActivityIcon: React.FC<ExerciseActivityIconProps> = ({ type, className = 'h-4 w-4' }) => {
  switch (type) {
    case 'cardio':
      return <Heart className={`${className} text-rose-500`} />;
    case 'resistance':
      return <Dumbbell className={`${className} text-amber-500`} />;
    case 'sports':
      return <Trophy className={`${className} text-emerald-500`} />;
    case 'flexibility':
      return <Wind className={`${className} text-sky-500`} />;
    default:
      return <Activity className={`${className} text-purple-500`} />;
  }
};

export default ExerciseActivityIcon;
