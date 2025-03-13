
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatWeightForDisplay } from '@/lib/weight/formatWeight';
import WeightInputField from '@/components/periods/WeightInputField';

interface HealthInfoTabProps {
  formData: {
    height?: number;
    currentWeight?: number;
    targetWeight?: number;
    fitnessLevel?: string;
    weightLossPerWeek?: number;
    exerciseMinutesPerDay?: number;
    healthGoals?: string;
    measurementUnit?: string;
    startingWeight?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthInfoTab: React.FC<HealthInfoTabProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  const unit = formData.measurementUnit || 'imperial';
  const isImperial = unit === 'imperial';
  
  // Format weight values for display (already converted in useProfileForm)
  const formatWeight = (weight: number | undefined): string => {
    if (weight === undefined || weight === 0) return '';
    return weight.toString();
  };
  
  // Handle fitness level changes
  const onFitnessLevelChange = (value: string) => {
    console.log("Fitness level changed to:", value);
    handleSelectChange('fitnessLevel', value);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-left block">Height ({unit === 'metric' ? 'cm' : 'in'})</Label>
          <Input
            id="height"
            name="height"
            type="text"
            inputMode="decimal"
            value={formData.height || ''}
            onChange={(e) => handleNumberChange('height', e.target.value)}
            placeholder="Height"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currentWeight" className="text-left block">Current Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input
            id="currentWeight"
            name="currentWeight"
            type="text"
            inputMode="decimal"
            value={formatWeight(formData.currentWeight)}
            onChange={(e) => handleNumberChange('currentWeight', e.target.value)}
            placeholder="Current Weight"
          />
        </div>
      </div>
      
      {/* Starting Weight (if exists) */}
      {formData.startingWeight ? (
        <div className="space-y-2">
          <Label htmlFor="startingWeight" className="text-left block">Starting Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input
            id="startingWeight"
            name="startingWeight"
            type="text"
            value={formatWeight(formData.startingWeight)}
            disabled
            className="bg-gray-100"
            placeholder="Starting Weight"
          />
        </div>
      ) : null}
      
      {/* Target Weight and Target Weight Loss Per Week on the same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetWeight" className="text-left block">Target Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input
            id="targetWeight"
            name="targetWeight"
            type="text"
            inputMode="decimal"
            value={formatWeight(formData.targetWeight)}
            onChange={(e) => handleNumberChange('targetWeight', e.target.value)}
            placeholder="Target Weight"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weightLossPerWeek" className="text-left block">Weight Loss Per Week ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input
            id="weightLossPerWeek"
            name="weightLossPerWeek"
            type="text"
            inputMode="decimal"
            value={formatWeight(formData.weightLossPerWeek)}
            onChange={(e) => handleNumberChange('weightLossPerWeek', e.target.value)}
            placeholder="Weight Loss Per Week"
          />
        </div>
      </div>
      
      {/* Fitness Level and Exercise Minutes on the same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fitnessLevel" className="text-left block">Fitness Level</Label>
          <Select 
            value={formData.fitnessLevel || 'moderate'} 
            onValueChange={onFitnessLevelChange}
          >
            <SelectTrigger id="fitnessLevel">
              <SelectValue placeholder="Select fitness level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="light">Light Activity</SelectItem>
              <SelectItem value="moderate">Moderate Activity</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="exerciseMinutesPerDay" className="text-left block">Minutes of Exercise Per Day</Label>
          <Input
            id="exerciseMinutesPerDay"
            name="exerciseMinutesPerDay"
            type="text"
            inputMode="numeric"
            value={formData.exerciseMinutesPerDay || ''}
            onChange={(e) => handleNumberChange('exerciseMinutesPerDay', e.target.value)}
            placeholder="Exercise Minutes Per Day"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="healthGoals" className="text-left block">Health Goals</Label>
        <Textarea
          id="healthGoals"
          name="healthGoals"
          value={formData.healthGoals || ''}
          onChange={handleInputChange}
          placeholder="Describe your health goals..."
          rows={4}
        />
      </div>
    </div>
  );
};

export default HealthInfoTab;
