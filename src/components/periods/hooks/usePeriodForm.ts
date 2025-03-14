
import { useState, useEffect } from 'react';
import { Period } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { addWeeks } from 'date-fns';
import { convertToMetric } from '@/lib/weight/convertWeight';

interface UsePeriodFormProps {
  defaultValues?: {
    startWeight?: number;
    targetWeight?: number;
    weightLossPerWeek?: number;
  };
  weightUnit: string;
  initialPeriod?: Period;
  onSave: (period: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string,
    weightLossPerWeek: number
  }) => void;
  onClose: () => void;
}

export const usePeriodForm = ({
  defaultValues,
  weightUnit,
  initialPeriod,
  onSave,
  onClose
}: UsePeriodFormProps) => {
  const [startWeight, setStartWeight] = useState<string>(defaultValues?.startWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState<string>(defaultValues?.targetWeight?.toString() || '');
  const [weightLossPerWeek, setWeightLossPerWeek] = useState<string>(defaultValues?.weightLossPerWeek?.toString() || '0.5');
  const [type, setType] = useState<'weightLoss' | 'maintenance'>('weightLoss');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [calculatedEndDate, setCalculatedEndDate] = useState<Date | undefined>(undefined);
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
  
  // Calculate end date whenever relevant inputs change
  useEffect(() => {
    if (type === 'weightLoss' && startWeight && targetWeight && weightLossPerWeek && parseFloat(weightLossPerWeek) > 0) {
      try {
        const startWeightNum = parseFloat(startWeight);
        const targetWeightNum = parseFloat(targetWeight);
        const weightLossPerWeekNum = parseFloat(weightLossPerWeek);
        
        if (startWeightNum > targetWeightNum && weightLossPerWeekNum > 0) {
          // Calculate total weight to lose
          const totalWeightToLose = startWeightNum - targetWeightNum;
          
          // Calculate number of weeks needed
          const weeksNeeded = Math.ceil(totalWeightToLose / weightLossPerWeekNum);
          
          // Calculate projected end date by adding the weeks to start date
          const projectedEndDate = addWeeks(startDate, weeksNeeded);
          setCalculatedEndDate(projectedEndDate);
          
          // If no end date was manually set yet, or if we're creating a new period, 
          // automatically set the end date to the calculated one
          if (!initialPeriod || !endDate) {
            setEndDate(projectedEndDate);
          }
        }
      } catch (e) {
        console.error("Error calculating end date:", e);
      }
    }
  }, [startWeight, targetWeight, weightLossPerWeek, startDate, type, initialPeriod, endDate]);
  
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
    
    // For weight loss periods, ensure a valid end date is calculated
    if (type === 'weightLoss' && !endDate && startWeightValue <= targetWeightValue) {
      toast({
        title: "Invalid weight goal",
        description: "Target weight must be lower than starting weight for weight loss periods",
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
    
    resetForm();
  };

  const resetForm = () => {
    setStartWeight('');
    setTargetWeight('');
    setWeightLossPerWeek('0.5');
    setType('weightLoss');
    setStartDate(new Date());
    setEndDate(undefined);
    setCalculatedEndDate(undefined);
    setFastingSchedule('16:8');
  };
  
  return {
    startWeight,
    setStartWeight,
    targetWeight,
    setTargetWeight,
    weightLossPerWeek,
    setWeightLossPerWeek,
    type,
    setType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    calculatedEndDate,
    fastingSchedule,
    setFastingSchedule,
    handleSubmit,
    isImperial,
    weightUnit
  };
};
