import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { WeighIn } from '@/lib/types';

interface WeightTableEditRowProps {
  entry: WeighIn;
  editValues: {
    weight: string;
    date: Date;
    bmi: string;
    bodyFatPercentage: string;
    skeletalMuscleMass: string;
    boneMass: string;
    bodyWaterPercentage: string;
  };
  isImperial: boolean;
  onEditValueChange: (values: any) => void;
  onSave: () => void;
  onCancel: () => void;
  hasBmi: boolean;
  hasBodyFat: boolean;
  hasMuscle: boolean;
  hasBone: boolean;
  hasWater: boolean;
}

const tdClass = 'px-4 py-3 whitespace-nowrap text-sm';

const WeightTableEditRow: React.FC<WeightTableEditRowProps> = ({
  entry,
  editValues,
  onEditValueChange,
  onSave,
  onCancel,
  hasBmi,
  hasBodyFat,
  hasMuscle,
  hasBone,
  hasWater,
}) => {
  const numberInput = (field: keyof typeof editValues, width = 'w-20') => (
    <Input
      type="number"
      step="0.1"
      value={editValues[field] as string}
      onChange={(e) => onEditValueChange({ ...editValues, [field]: e.target.value })}
      className={width}
    />
  );

  return (
    <tr key={entry.id} className="bg-muted/20">
      <td className={tdClass}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'justify-start text-left font-normal',
                !editValues.date && 'text-muted-foreground'
              )}
            >
              {editValues.date ? format(editValues.date, 'MMM d, yyyy') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={editValues.date}
              onSelect={(date) => date && onEditValueChange({ ...editValues, date })}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </td>
      <td className={tdClass}>{numberInput('weight')}</td>
      <td className={tdClass}></td>
      {hasBmi && <td className={tdClass}>{numberInput('bmi')}</td>}
      {hasBodyFat && <td className={tdClass}>{numberInput('bodyFatPercentage')}</td>}
      {hasMuscle && <td className={tdClass}>{numberInput('skeletalMuscleMass')}</td>}
      {hasBone && <td className={tdClass}>{numberInput('boneMass')}</td>}
      {hasWater && <td className={tdClass}>{numberInput('bodyWaterPercentage')}</td>}
      <td className={cn(tdClass, 'text-right font-medium space-x-1')}>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onSave}>
          <Check className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default WeightTableEditRow;
