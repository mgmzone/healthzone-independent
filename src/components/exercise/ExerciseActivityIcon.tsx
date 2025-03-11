
import React from 'react';
import { Activity, Bike, Footprints } from 'lucide-react';

interface ExerciseActivityIconProps {
  type: string;
  className?: string;
}

const ExerciseActivityIcon: React.FC<ExerciseActivityIconProps> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'walk':
      return <Footprints className={`${className} text-blue-500`} />;
    case 'run':
      return <Activity className={`${className} text-orange-500`} />;
    case 'bike':
      return <Bike className={`${className} text-green-500`} />;
    default:
      return <Activity className={`${className} text-purple-500`} />;
  }
};

export default ExerciseActivityIcon;
