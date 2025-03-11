
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
}

const WeightTableEditRow: React.FC<WeightTableEditRowProps> = ({
  entry,
  editValues,
  isImperial,
  onEditValueChange,
  onSave,
  onCancel
}) => {
  return (
    <tr key={entry.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !editValues.date && "text-muted-foreground"
              )}
            >
              {editValues.date ? format(editValues.date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={editValues.date}
              onSelect={(date) => date && onEditValueChange({...editValues, date})}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Input 
          type="number" 
          step="0.1" 
          value={editValues.weight}
          onChange={(e) => onEditValueChange({...editValues, weight: e.target.value})}
          className="w-24"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Input 
          type="number" 
          step="0.1" 
          value={editValues.bmi}
          onChange={(e) => onEditValueChange({...editValues, bmi: e.target.value})}
          className="w-24"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Input 
          type="number" 
          step="0.1" 
          value={editValues.bodyFatPercentage}
          onChange={(e) => onEditValueChange({...editValues, bodyFatPercentage: e.target.value})}
          className="w-24"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Input 
          type="number" 
          step="0.1" 
          value={editValues.skeletalMuscleMass}
          onChange={(e) => onEditValueChange({...editValues, skeletalMuscleMass: e.target.value})}
          className="w-24"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Input 
          type="number" 
          step="0.1" 
          value={editValues.boneMass}
          onChange={(e) => onEditValueChange({...editValues, boneMass: e.target.value})}
          className="w-24"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <Input 
          type="number" 
          step="0.1" 
          value={editValues.bodyWaterPercentage}
          onChange={(e) => onEditValueChange({...editValues, bodyWaterPercentage: e.target.value})}
          className="w-24"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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
