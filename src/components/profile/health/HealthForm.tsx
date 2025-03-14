
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import WeightInputField from '@/components/periods/WeightInputField';

interface HealthFormProps {
  formData: {
    height?: number;
    fitnessLevel?: string;
    exerciseMinutesPerDay?: number;
    healthGoals?: string;
    measurementUnit?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthForm: React.FC<HealthFormProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  const unit = formData.measurementUnit || 'imperial';
  const isImperial = unit === 'imperial';
  
  // Handle fitness level changes
  const onFitnessLevelChange = (value: string) => {
    console.log("Fitness level changed to:", value);
    handleSelectChange('fitnessLevel', value);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeightInputField
          id="height"
          label="Height"
          value={formData.height?.toString() || ''}
          onChange={(value) => handleNumberChange('height', value)}
          weightUnit={isImperial ? 'in' : 'cm'}
          type="number"
          step="0.01"
        />
      </div>
      
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
            type="number"
            inputMode="numeric"
            value={formData.exerciseMinutesPerDay || ''}
            onChange={(e) => handleNumberChange('exerciseMinutesPerDay', e.target.value)}
            placeholder="Exercise Minutes Per Day"
            step="1"
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

export default HealthForm;
