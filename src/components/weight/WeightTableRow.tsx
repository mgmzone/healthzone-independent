import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash, Pencil, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { WeighIn } from '@/lib/types';
import { cn } from '@/lib/utils';
import { convertWeight } from '@/lib/weight/convertWeight';

interface WeightTableRowProps {
  entry: WeighIn;
  previousEntry?: WeighIn;
  isImperial: boolean;
  onEdit: (entry: WeighIn) => void;
  onDelete: (id: string) => void;
  convertWeight: (weight: number | undefined) => string;
  convertMuscleOrBoneMass: (mass: number | undefined) => string;
  formatPercentage: (value: number | undefined) => string;
  canEdit?: boolean;
  canDelete?: boolean;
  hasBmi: boolean;
  hasBodyFat: boolean;
  hasMuscle: boolean;
  hasBone: boolean;
  hasWater: boolean;
}

const tdClass = 'px-4 py-3 whitespace-nowrap text-sm';

const WeightTableRow: React.FC<WeightTableRowProps> = ({
  entry,
  previousEntry,
  isImperial,
  onEdit,
  onDelete,
  convertWeight,
  convertMuscleOrBoneMass,
  formatPercentage,
  canEdit = true,
  canDelete = true,
  hasBmi,
  hasBodyFat,
  hasMuscle,
  hasBone,
  hasWater,
}) => {
  // Delta from the user's previous entry. Green when losing, amber when gaining.
  let delta: React.ReactNode = <span className="text-muted-foreground">—</span>;
  if (previousEntry) {
    const diffKg = entry.weight - previousEntry.weight;
    const diffDisplay = convertWeight(diffKg, isImperial);
    if (Math.abs(diffDisplay) < 0.05) {
      delta = (
        <span className="inline-flex items-center text-xs text-muted-foreground">
          <Minus className="h-3 w-3" />
        </span>
      );
    } else {
      const Icon = diffDisplay < 0 ? ArrowDown : ArrowUp;
      const color = diffDisplay < 0 ? 'text-emerald-600' : 'text-amber-600';
      delta = (
        <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', color)}>
          <Icon className="h-3 w-3" />
          {Math.abs(diffDisplay).toFixed(1)}
        </span>
      );
    }
  }

  return (
    <tr key={entry.id} className="hover:bg-muted/30">
      <td className={cn(tdClass, 'text-foreground')}>
        {format(new Date(entry.date), 'MMM d, yyyy')}
      </td>
      <td className={cn(tdClass, 'font-medium text-foreground')}>
        {convertWeight(entry.weight)}
      </td>
      <td className={tdClass}>{delta}</td>
      {hasBmi && <td className={tdClass}>{entry.bmi ? entry.bmi.toFixed(1) : '—'}</td>}
      {hasBodyFat && <td className={tdClass}>{formatPercentage(entry.bodyFatPercentage)}</td>}
      {hasMuscle && <td className={tdClass}>{convertMuscleOrBoneMass(entry.skeletalMuscleMass)}</td>}
      {hasBone && <td className={tdClass}>{convertMuscleOrBoneMass(entry.boneMass)}</td>}
      {hasWater && <td className={tdClass}>{formatPercentage(entry.bodyWaterPercentage)}</td>}
      {(canEdit || canDelete) && (
        <td className={cn(tdClass, 'text-right font-medium space-x-1')}>
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
