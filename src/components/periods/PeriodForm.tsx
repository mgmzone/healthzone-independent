
import React from 'react';
import { Button } from "@/components/ui/button";
import WeightInputField from './WeightInputField';
import PeriodTypeSelector from './PeriodTypeSelector';
import DateRangePickerField from './DateRangePickerField';
import FastingScheduleSelector from './FastingScheduleSelector';
import { usePeriodForm } from './hooks/usePeriodForm';
import { Period } from '@/lib/types';

interface PeriodFormProps {
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
  defaultValues?: {
    startWeight?: number;
    targetWeight?: number;
    weightLossPerWeek?: number;
  };
  weightUnit: string;
  initialPeriod?: Period;
}

const PeriodForm: React.FC<PeriodFormProps> = ({
  onSave,
  onClose,
  defaultValues,
  weightUnit,
  initialPeriod
}) => {
  const {
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
    isImperial
  } = usePeriodForm({
    defaultValues,
    weightUnit,
    initialPeriod,
    onSave,
    onClose
  });

  return (
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
          calculatedEndDate={calculatedEndDate}
        />
        
        <FastingScheduleSelector
          value={fastingSchedule}
          onChange={setFastingSchedule}
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default PeriodForm;
