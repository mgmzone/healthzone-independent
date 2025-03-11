
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ExerciseLog } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

interface ExerciseWeekHeaderProps {
  weekKey: string;
  entries: ExerciseLog[];
  isExpanded: boolean;
  onToggle: () => void;
}

const ExerciseWeekHeader: React.FC<ExerciseWeekHeaderProps> = ({ 
  weekKey, 
  entries, 
  isExpanded, 
  onToggle 
}) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';
  
  const totalMinutes = entries.reduce((acc, log) => acc + log.minutes, 0);
  const totalDistanceKm = entries.reduce((acc, log) => acc + (log.distance || 0), 0);
  
  const formatTotalDistance = () => {
    if (isImperial) {
      // Convert km to miles
      const totalMiles = totalDistanceKm * 0.621371;
      return `${totalMiles.toFixed(1)} mi`;
    }
    return `${totalDistanceKm.toFixed(1)} km`;
  };
  
  return (
    <TableRow 
      className="group cursor-pointer hover:bg-muted/50"
      onClick={onToggle}
    >
      <TableCell colSpan={6}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <span className="font-medium">{weekKey}</span>
            <Badge variant="outline" className="ml-2">
              {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalMinutes} min</span>
            <span>{formatTotalDistance()}</span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ExerciseWeekHeader;
