
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from 'lucide-react';
import { ExerciseLog } from '@/lib/types';
import { format } from 'date-fns';
import ExerciseActivityIcon from './ExerciseActivityIcon';
import ExerciseIntensityBadge from './ExerciseIntensityBadge';
import { useAuth } from '@/lib/AuthContext';

interface ExerciseTableRowProps {
  log: ExerciseLog;
  onDelete: (id: string) => void;
  onEdit: (log: ExerciseLog) => void;
}

const ExerciseTableRow: React.FC<ExerciseTableRowProps> = ({ log, onDelete, onEdit }) => {
  const { profile } = useAuth();
  const isImperial = profile?.measurementUnit === 'imperial';

  const formatDistance = () => {
    if (!log.distance) return '-';
    
    if (isImperial) {
      // Convert km to miles (1 km = 0.621371 miles)
      const miles = log.distance * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }
    
    return `${log.distance.toFixed(1)} km`;
  };

  return (
    <TableRow className="bg-background">
      <TableCell><ExerciseActivityIcon type={log.type} /></TableCell>
      <TableCell>{format(new Date(log.date), 'MMM dd, yyyy')}</TableCell>
      <TableCell>{log.minutes} min</TableCell>
      <TableCell>{formatDistance()}</TableCell>
      <TableCell><ExerciseIntensityBadge intensity={log.intensity} /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(log);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(log.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ExerciseTableRow;
