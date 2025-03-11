
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';

interface HealthInfoTabProps {
  formData: {
    height: number;
    currentWeight: number;
    targetWeight: number;
    fitnessLevel: string;
    weightLossPerWeek: number;
    exerciseMinutesPerDay: number;
    healthGoals: string;
    measurementUnit: string;
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
  return (
    <TabsContent value="health" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height ({formData.measurementUnit === 'metric' ? 'cm' : 'in'})</Label>
          <Input
            id="height"
            name="height"
            type="number"
            value={formData.height || ''}
            onChange={(e) => handleNumberChange('height', e.target.value)}
            placeholder="Height"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentWeight">Current Weight ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input
            id="currentWeight"
            name="currentWeight"
            type="number"
            value={formData.currentWeight || ''}
            onChange={(e) => handleNumberChange('currentWeight', e.target.value)}
            placeholder="Current Weight"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetWeight">Target Weight ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})</Label>
        <Input
          id="targetWeight"
          name="targetWeight"
          type="number"
          value={formData.targetWeight || ''}
          onChange={(e) => handleNumberChange('targetWeight', e.target.value)}
          placeholder="Target Weight"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fitnessLevel">Fitness Level</Label>
        <Select name="fitnessLevel" value={formData.fitnessLevel} onValueChange={(value) => handleSelectChange('fitnessLevel', value)}>
          <SelectTrigger>
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
        <Label htmlFor="weightLossPerWeek">Target Weight Loss Per Week ({formData.measurementUnit === 'metric' ? 'kg' : 'lbs'})</Label>
        <Input
          id="weightLossPerWeek"
          name="weightLossPerWeek"
          type="number"
          step="0.1"
          value={formData.weightLossPerWeek || ''}
          onChange={(e) => handleNumberChange('weightLossPerWeek', e.target.value)}
          placeholder="Weight Loss Per Week"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="exerciseMinutesPerDay">Exercise Minutes Per Day</Label>
        <Input
          id="exerciseMinutesPerDay"
          name="exerciseMinutesPerDay"
          type="number"
          value={formData.exerciseMinutesPerDay || ''}
          onChange={(e) => handleNumberChange('exerciseMinutesPerDay', e.target.value)}
          placeholder="Exercise Minutes Per Day"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="healthGoals">Health Goals</Label>
        <Textarea
          id="healthGoals"
          name="healthGoals"
          value={formData.healthGoals || ''}
          onChange={handleInputChange}
          placeholder="Describe your health goals..."
          rows={4}
        />
      </div>
    </TabsContent>
  );
};

export default HealthInfoTab;
