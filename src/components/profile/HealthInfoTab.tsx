
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import WeightInputField from '@/components/periods/WeightInputField';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

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
  currentPeriod?: {
    id: string;
    startDate: string;
    endDate?: string;
    targetWeight: number;
    weightLossPerWeek: number;
  };
  currentAvgWeightLoss?: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthInfoTab: React.FC<HealthInfoTabProps> = ({
  formData,
  currentPeriod,
  currentAvgWeightLoss,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  const unit = formData.measurementUnit || 'imperial';
  const isImperial = unit === 'imperial';
  
  // Format weight values for display
  const formatWeight = (weight: number | undefined): string => {
    if (weight === undefined || weight === 0) return '';
    return weight.toString();
  };
  
  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Handle fitness level changes
  const onFitnessLevelChange = (value: string) => {
    console.log("Fitness level changed to:", value);
    handleSelectChange('fitnessLevel', value);
  };
  
  return (
    <div className="space-y-4">
      {currentPeriod && (
        <div className="mb-6 bg-muted/50 rounded-lg p-4 border">
          <h3 className="font-medium flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4" />
            Current Active Period
          </h3>
          <div className="text-sm text-muted-foreground mb-2">
            {formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <Label className="text-xs text-muted-foreground">Current Target Weight</Label>
              <div className="font-medium">
                {isImperial 
                  ? (currentPeriod.targetWeight * 2.20462).toFixed(1) 
                  : currentPeriod.targetWeight.toFixed(1)
                } {isImperial ? 'lbs' : 'kg'}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Average Weight Loss Per Week</Label>
              <div className="font-medium">
                {currentAvgWeightLoss !== undefined ? (
                  <span>
                    {isImperial 
                      ? Math.abs(currentAvgWeightLoss * 2.20462).toFixed(1) 
                      : Math.abs(currentAvgWeightLoss).toFixed(1)
                    } {isImperial ? 'lbs' : 'kg'}/week
                    <Badge variant={currentAvgWeightLoss < 0 ? "success" : "destructive"} className="ml-2 text-xs">
                      {currentAvgWeightLoss < 0 ? 'Loss' : 'Gain'}
                    </Badge>
                  </span>
                ) : (
                  'Not enough data'
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
        
        <WeightInputField
          id="currentWeight"
          label="Current Weight"
          value={formatWeight(formData.currentWeight)}
          onChange={(value) => handleNumberChange('currentWeight', value)}
          weightUnit={isImperial ? 'lbs' : 'kg'}
        />
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

export default HealthInfoTab;
