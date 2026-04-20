
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    openEnded,
    setOpenEnded,
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
        
        {!openEnded && (
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
        )}

        {!openEnded && (
          <DateRangePickerField
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            calculatedEndDate={calculatedEndDate}
          />
        )}

        <div className="flex items-start gap-2 p-3 rounded-md bg-muted/40 border">
          <Checkbox
            id="open-ended"
            checked={openEnded}
            onCheckedChange={(v) => setOpenEnded(v === true)}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor="open-ended" className="cursor-pointer font-medium">
              Open-ended period &mdash; no target date
            </Label>
            <p className="text-xs text-muted-foreground">
              Skip the weekly target and deadline. The weight forecast will still project a completion date from your actual pace once you have a few weigh-ins.
            </p>
          </div>
        </div>
        
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
