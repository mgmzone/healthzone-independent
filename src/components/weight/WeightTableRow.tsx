
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash, Pencil } from 'lucide-react';
import { WeighIn } from '@/lib/types';

interface WeightTableRowProps {
  entry: WeighIn;
  isImperial: boolean;
  onEdit: (entry: WeighIn) => void;
  onDelete: (id: string) => void;
  convertWeight: (weight: number | undefined) => string;
  convertMuscleOrBoneMass: (mass: number | undefined) => string;
  formatPercentage: (value: number | undefined) => string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const WeightTableRow: React.FC<WeightTableRowProps> = ({
  entry,
  isImperial,
  onEdit,
  onDelete,
  convertWeight,
  convertMuscleOrBoneMass,
  formatPercentage,
  canEdit = true,
  canDelete = true
}) => {
  return (
    <tr key={entry.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {format(new Date(entry.date), 'MMM d, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {convertWeight(entry.weight)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {entry.bmi ? entry.bmi.toFixed(1) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatPercentage(entry.bodyFatPercentage)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {convertMuscleOrBoneMass(entry.skeletalMuscleMass)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {convertMuscleOrBoneMass(entry.boneMass)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatPercentage(entry.bodyWaterPercentage)}
      </td>
      {(canEdit || canDelete) && (
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(entry)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(entry.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </td>
      )}
    </tr>
  );
};

export default WeightTableRow;
