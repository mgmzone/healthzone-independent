
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import WeightInputField from '@/components/periods/WeightInputField';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, LineChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/dateUtils';

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
  
  // Calculate weight loss progress percentage if we have all necessary data
  const calculateProgressPercentage = () => {
    if (!formData.startingWeight || !formData.currentWeight || !currentPeriod?.targetWeight) {
      return null;
    }
    
    // Convert weights to the same unit system if needed
    const startWeight = formData.startingWeight;
    const currentWeight = formData.currentWeight;
    const targetWeight = isImperial 
      ? (currentPeriod.targetWeight * 2.20462)
      : currentPeriod.targetWeight;
    
    // Calculate total weight to lose
    const totalToLose = startWeight - targetWeight;
    
    // Calculate weight lost so far
    const lostSoFar = startWeight - currentWeight;
    
    // Calculate percentage of progress
    if (totalToLose <= 0) return 0; // Prevent division by zero or negative values
    
    const percentage = (lostSoFar / totalToLose) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
  };
  
  // Calculate total weight loss
  const totalWeightLoss = formData.startingWeight && formData.currentWeight
    ? Math.abs(formData.startingWeight - formData.currentWeight)
    : null;
  
  // Calculate target loss (difference between starting weight and target weight)
  const targetLoss = formData.startingWeight && currentPeriod?.targetWeight
    ? Math.abs(formData.startingWeight - (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight))
    : null;
  
  const progressPercentage = calculateProgressPercentage();
  
  // Format date for display
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'Present';
    return formatDate(new Date(dateString), "MM/dd/yyyy");
  };
  
  // Handle fitness level changes
  const onFitnessLevelChange = (value: string) => {
    console.log("Fitness level changed to:", value);
    handleSelectChange('fitnessLevel', value);
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
        <h3 className="font-medium flex items-center gap-2 mb-4">
          <LineChart className="h-4 w-4" />
          Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* First row: Dates */}
          {currentPeriod && (
            <>
              <div>
                <div className="text-xl font-semibold">
                  {formatDisplayDate(currentPeriod.startDate)}
                </div>
                <div className="text-xs text-muted-foreground">Session Start Date</div>
              </div>
              <div>
                <div className="text-xl font-semibold">
                  {formatDisplayDate(currentPeriod.endDate)}
                </div>
                <div className="text-xs text-muted-foreground">Session End Date</div>
              </div>
            </>
          )}
          
          {/* Second row: Starting and Target Weight */}
          <div>
            <div className="text-xl font-semibold">
              {formatWeight(formData.startingWeight)}
              {formData.startingWeight ? <span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}</span> : ''}
            </div>
            <div className="text-xs text-muted-foreground">Starting Weight</div>
          </div>
          <div>
            <div className="text-xl font-semibold">
              {currentPeriod?.targetWeight ? (
                <>
                  {isImperial 
                    ? (currentPeriod.targetWeight * 2.20462).toFixed(1) 
                    : currentPeriod.targetWeight.toFixed(1)}
                  <span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}</span>
                </>
              ) : ''}
            </div>
            <div className="text-xs text-muted-foreground">Target Weight</div>
          </div>
          
          {/* Third row: Target Loss and Lost Thus Far */}
          <div>
            <div className="text-xl font-semibold">
              {targetLoss ? (
                <>
                  {targetLoss.toFixed(1)}<span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}</span>
                </>
              ) : ''}
            </div>
            <div className="text-xs text-muted-foreground">Target Loss</div>
          </div>
          <div>
            <div className="text-xl font-semibold">
              {totalWeightLoss ? (
                <>
                  {totalWeightLoss.toFixed(1)}<span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}</span>
                </>
              ) : ''}
            </div>
            <div className="text-xs text-muted-foreground">Lost Thus Far</div>
          </div>
          
          {/* Fourth row: Target Loss/Week and Actual Loss/Week */}
          <div>
            <div className="text-xl font-semibold">
              {currentPeriod?.weightLossPerWeek ? (
                <>
                  {isImperial 
                    ? (currentPeriod.weightLossPerWeek * 2.20462).toFixed(2) 
                    : currentPeriod.weightLossPerWeek.toFixed(2)}
                  <span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}/week</span>
                </>
              ) : ''}
            </div>
            <div className="text-xs text-muted-foreground">Target Loss/Week</div>
          </div>
          <div>
            <div className="text-xl font-semibold">
              {currentAvgWeightLoss !== undefined ? (
                <>
                  {isImperial 
                    ? Math.abs(currentAvgWeightLoss * 2.20462).toFixed(2) 
                    : Math.abs(currentAvgWeightLoss).toFixed(2)}
                  <span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}/week</span>
                  <Badge variant={currentAvgWeightLoss < 0 ? "secondary" : "destructive"} className="ml-2 text-xs">
                    {currentAvgWeightLoss < 0 ? 'Loss' : 'Gain'}
                  </Badge>
                </>
              ) : (
                'Not enough data'
              )}
            </div>
            <div className="text-xs text-muted-foreground">Actual Loss/Week</div>
          </div>
          
          {/* Fifth row: Progress percentage */}
          <div>
            <div className="text-xl font-semibold">
              {currentPeriod && progressPercentage !== null ? (
                <>
                  {progressPercentage.toFixed(2)}<span className="text-sm ml-1">%</span>
                </>
              ) : ''}
            </div>
            <div className="text-xs text-muted-foreground">Weight Loss Progress</div>
          </div>
          
          {/* Current Weight (read-only) */}
          <div>
            <div className="text-xl font-semibold">
              {formData.currentWeight ? (
                <>
                  {formData.currentWeight.toFixed(1)}<span className="text-sm ml-1">{isImperial ? 'lbs' : 'kg'}</span>
                </>
              ) : ''}
            </div>
            <div className="text-xs text-muted-foreground">Current Weight</div>
          </div>
        </div>
      </div>
      
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

export default HealthInfoTab;
