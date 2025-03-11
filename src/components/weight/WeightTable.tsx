
import React, { useState } from 'react';
import { format } from 'date-fns';
import { WeighIn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Pencil, X, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WeightTableProps {
  weighIns: WeighIn[];
  isImperial: boolean;
  onUpdateWeighIn?: (id: string, weight: number, date: Date, additionalMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMuscleMass?: number;
    boneMass?: number;
    bodyWaterPercentage?: number;
  }) => void;
  onDeleteWeighIn?: (id: string) => void;
}

const WeightTable: React.FC<WeightTableProps> = ({ 
  weighIns, 
  isImperial, 
  onUpdateWeighIn,
  onDeleteWeighIn 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    weight: string;
    date: Date;
    bmi: string;
    bodyFatPercentage: string;
    skeletalMuscleMass: string;
    boneMass: string;
    bodyWaterPercentage: string;
  }>({
    weight: '',
    date: new Date(),
    bmi: '',
    bodyFatPercentage: '',
    skeletalMuscleMass: '',
    boneMass: '',
    bodyWaterPercentage: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number | undefined) => {
    if (!weight) return '-';
    return isImperial ? (weight * 2.20462).toFixed(1) : weight.toFixed(1);
  };

  const convertMuscleOrBoneMass = (mass: number | undefined) => {
    if (!mass) return '-';
    return isImperial ? (mass * 2.20462).toFixed(1) : mass.toFixed(1);
  };

  const formatPercentage = (value: number | undefined) => {
    if (!value) return '-';
    return `${value.toFixed(1)}%`;
  };

  // Convert back to kg for database
  const convertToMetric = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    return isImperial ? num / 2.20462 : num;
  };

  const handleEdit = (entry: WeighIn) => {
    setEditingId(entry.id);
    setEditValues({
      weight: convertWeight(entry.weight),
      date: new Date(entry.date),
      bmi: entry.bmi ? entry.bmi.toFixed(1) : '',
      bodyFatPercentage: entry.bodyFatPercentage ? entry.bodyFatPercentage.toFixed(1) : '',
      skeletalMuscleMass: entry.skeletalMuscleMass ? convertMuscleOrBoneMass(entry.skeletalMuscleMass) : '',
      boneMass: entry.boneMass ? convertMuscleOrBoneMass(entry.boneMass) : '',
      bodyWaterPercentage: entry.bodyWaterPercentage ? entry.bodyWaterPercentage.toFixed(1) : ''
    });
  };

  const handleSave = () => {
    if (!editingId || !onUpdateWeighIn) return;
    
    const weight = convertToMetric(editValues.weight);
    if (!weight) return;

    const additionalMetrics = {
      bmi: editValues.bmi ? parseFloat(editValues.bmi) : undefined,
      bodyFatPercentage: editValues.bodyFatPercentage ? parseFloat(editValues.bodyFatPercentage) : undefined,
      skeletalMuscleMass: editValues.skeletalMuscleMass ? convertToMetric(editValues.skeletalMuscleMass) : undefined,
      boneMass: editValues.boneMass ? convertToMetric(editValues.boneMass) : undefined,
      bodyWaterPercentage: editValues.bodyWaterPercentage ? parseFloat(editValues.bodyWaterPercentage) : undefined
    };

    onUpdateWeighIn(editingId, weight, editValues.date, additionalMetrics);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (onDeleteWeighIn) {
      onDeleteWeighIn(id);
    }
    setDeleteConfirmId(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight ({isImperial ? 'lbs' : 'kg'})
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BMI
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Body Fat
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Muscle ({isImperial ? 'lbs' : 'kg'})
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bone ({isImperial ? 'lbs' : 'kg'})
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Water
              </th>
              {(onUpdateWeighIn || onDeleteWeighIn) && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weighIns.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
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
                          onSelect={(date) => date && setEditValues({...editValues, date})}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    format(new Date(entry.date), 'MMM d, yyyy')
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={editValues.weight}
                      onChange={(e) => setEditValues({...editValues, weight: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    convertWeight(entry.weight)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={editValues.bmi}
                      onChange={(e) => setEditValues({...editValues, bmi: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    entry.bmi ? entry.bmi.toFixed(1) : '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={editValues.bodyFatPercentage}
                      onChange={(e) => setEditValues({...editValues, bodyFatPercentage: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    formatPercentage(entry.bodyFatPercentage)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={editValues.skeletalMuscleMass}
                      onChange={(e) => setEditValues({...editValues, skeletalMuscleMass: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    convertMuscleOrBoneMass(entry.skeletalMuscleMass)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={editValues.boneMass}
                      onChange={(e) => setEditValues({...editValues, boneMass: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    convertMuscleOrBoneMass(entry.boneMass)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === entry.id ? (
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={editValues.bodyWaterPercentage}
                      onChange={(e) => setEditValues({...editValues, bodyWaterPercentage: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    formatPercentage(entry.bodyWaterPercentage)
                  )}
                </td>
                {(onUpdateWeighIn || onDeleteWeighIn) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {editingId === entry.id ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleSave}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {onUpdateWeighIn && (
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteWeighIn && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteConfirmId(entry.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this weight record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WeightTable;
