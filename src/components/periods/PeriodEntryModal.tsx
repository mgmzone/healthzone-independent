
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Period } from '@/lib/types';
import WeightInputField from './WeightInputField';
import PeriodTypeSelector from './PeriodTypeSelector';
import DateRangePickerField from './DateRangePickerField';
import FastingScheduleSelector from './FastingScheduleSelector';
import { convertToMetric } from '@/lib/weight/convertWeight';

interface PeriodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (period: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string,
    weightLossPerWeek: number
  }) => void;
  defaultValues?: {
    startWeight?: number;
    targetWeight?: number;
    weightLossPerWeek?: number;
  };
  weightUnit: string;
  initialPeriod?: Period;
}

const PeriodEntryModal: React.FC<PeriodEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultValues,
  weightUnit,
  initialPeriod
}) => {
  const [startWeight, setStartWeight] = useState<string>(defaultValues?.startWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState<string>(defaultValues?.targetWeight?.toString() || '');
  const [weightLossPerWeek, setWeightLossPerWeek] = useState<string>(defaultValues?.weightLossPerWeek?.toString() || '0.5');
  const [type, setType] = useState<'weightLoss' | 'maintenance'>('weightLoss');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [fastingSchedule, setFastingSchedule] = useState<string>('16:8');
  const { toast } = useToast();
  const isImperial = weightUnit === 'lbs';
  
  useEffect(() => {
    if (initialPeriod) {
      setStartWeight(defaultValues?.startWeight?.toString() || '');
      setTargetWeight(defaultValues?.targetWeight?.toString() || '');
      setType(initialPeriod.type);
      setStartDate(new Date(initialPeriod.startDate));
      setEndDate(initialPeriod.endDate ? new Date(initialPeriod.endDate) : undefined);
      setFastingSchedule(initialPeriod.fastingSchedule);
      
      if (initialPeriod.weightLossPerWeek !== undefined) {
        // Format to one decimal place when displaying
        const displayValue = isImperial 
          ? (initialPeriod.weightLossPerWeek * 2.20462).toFixed(1)
          : initialPeriod.weightLossPerWeek.toFixed(1);
        setWeightLossPerWeek(displayValue);
      }
    }
  }, [initialPeriod, defaultValues, isImperial]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startWeightValue = parseFloat(startWeight);
    const targetWeightValue = parseFloat(targetWeight);
    const weightLossPerWeekValue = parseFloat(weightLossPerWeek || '0.5');
    
    if (isNaN(startWeightValue) || startWeightValue <= 0) {
      toast({
        title: "Invalid start weight",
        description: "Please enter a valid weight value",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(targetWeightValue) || targetWeightValue <= 0) {
      toast({
        title: "Invalid target weight",
        description: "Please enter a valid target weight",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(weightLossPerWeekValue) || weightLossPerWeekValue < 0) {
      toast({
        title: "Invalid weight loss per week",
        description: "Please enter a valid value",
        variant: "destructive",
      });
      return;
    }
    
    if (endDate && startDate > endDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    // Convert the weightLossPerWeek to metric (kg) before saving if in imperial mode
    const weightLossPerWeekInKg = isImperial 
      ? convertToMetric(weightLossPerWeekValue, true)
      : weightLossPerWeekValue;
    
    onSave({
      startWeight: startWeightValue,
      targetWeight: targetWeightValue,
      weightLossPerWeek: weightLossPerWeekInKg,
      type,
      startDate,
      endDate,
      fastingSchedule
    });
    
    setStartWeight('');
    setTargetWeight('');
    setWeightLossPerWeek('0.5');
    setType('weightLoss');
    setStartDate(new Date());
    setEndDate(undefined);
    setFastingSchedule('16:8');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialPeriod ? 'Edit Period' : 'Create New Period'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <PeriodTypeSelector 
              value={type} 
              onChange={setType} 
            />
            
            <WeightInputField
              id="startWeight"
              label="Starting Weight"
              value={startWeight}
              onChange={setStartWeight}
              weightUnit={weightUnit}
            />
            
            <WeightInputField
              id="targetWeight"
              label="Target Weight"
              value={targetWeight}
              onChange={setTargetWeight}
              weightUnit={weightUnit}
            />
            
            <WeightInputField
              id="weightLossPerWeek"
              label="Target Weight Loss Per Week"
              value={weightLossPerWeek}
              onChange={setWeightLossPerWeek}
              weightUnit={weightUnit}
              step="0.1"
              min="0"
              max={isImperial ? "10" : "4.5"}
            />
            
            <DateRangePickerField
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            <FastingScheduleSelector
              value={fastingSchedule}
              onChange={setFastingSchedule}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodEntryModal;
