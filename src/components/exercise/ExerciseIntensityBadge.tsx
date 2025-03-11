
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ExerciseIntensityBadgeProps {
  intensity: string;
}

const ExerciseIntensityBadge: React.FC<ExerciseIntensityBadgeProps> = ({ intensity }) => {
  switch (intensity) {
    case 'low':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moderate</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Intense</Badge>;
    default:
      return <Badge variant="outline">{intensity}</Badge>;
  }
};

export default ExerciseIntensityBadge;
