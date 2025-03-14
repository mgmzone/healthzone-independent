
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface HealthStatisticsProps {
  formData: {
    startingWeight?: number;
    currentWeight?: number;
    measurementUnit?: string;
  };
  currentPeriod?: {
    id: string;
    startDate: string;
    endDate?: string;
    targetWeight: number;
    weightLossPerWeek: number;
  };
  currentAvgWeightLoss?: number;
}

const HealthStatistics: React.FC<HealthStatisticsProps> = ({
  formData,
  currentPeriod,
  currentAvgWeightLoss
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
    return format(new Date(dateString), "MM/dd/yyyy");
  };
  
  return (
    <div className="mb-6 bg-muted/30 rounded-lg p-4 border">
      <h3 className="font-medium flex items-center gap-2 mb-4">
        <LineChart className="h-4 w-4" />
        Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* First row: Dates */}
        {currentPeriod && (
          <>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-left block">Session Start Date</Label>
              <Input
                id="startDate"
                value={formatDisplayDate(currentPeriod.startDate)}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-left block">Session End Date</Label>
              <Input
                id="endDate"
                value={formatDisplayDate(currentPeriod.endDate)}
                disabled
                className="bg-muted/50"
              />
            </div>
          </>
        )}
        
        {/* Second row: Starting and Target Weight */}
        <div className="space-y-2">
          <Label htmlFor="startingWeight" className="text-left block">Starting Weight</Label>
          <Input
            id="startingWeight"
            value={formData.startingWeight ? `${formatWeight(formData.startingWeight)} ${isImperial ? 'lbs' : 'kg'}` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetWeight" className="text-left block">Target Weight</Label>
          <Input
            id="targetWeight"
            value={currentPeriod?.targetWeight ? 
              `${isImperial ? (currentPeriod.targetWeight * 2.20462).toFixed(1) : currentPeriod.targetWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
        
        {/* Third row: Target Loss and Lost Thus Far */}
        <div className="space-y-2">
          <Label htmlFor="targetLoss" className="text-left block">Target Loss</Label>
          <Input
            id="targetLoss"
            value={targetLoss ? `${targetLoss.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lostThusFar" className="text-left block">Lost Thus Far</Label>
          <Input
            id="lostThusFar"
            value={totalWeightLoss ? `${totalWeightLoss.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
        
        {/* Fourth row: Target Loss/Week and Actual Loss/Week */}
        <div className="space-y-2">
          <Label htmlFor="targetLossPerWeek" className="text-left block">Target Loss/Week</Label>
          <Input
            id="targetLossPerWeek"
            value={currentPeriod?.weightLossPerWeek ? 
              `${isImperial ? (currentPeriod.weightLossPerWeek * 2.20462).toFixed(2) : currentPeriod.weightLossPerWeek.toFixed(2)} ${isImperial ? 'lbs' : 'kg'}/week` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actualLossPerWeek" className="text-left block">Actual Loss/Week</Label>
          <div className="flex items-center gap-2">
            <Input
              id="actualLossPerWeek"
              value={currentAvgWeightLoss !== undefined ? 
                `${isImperial ? Math.abs(currentAvgWeightLoss * 2.20462).toFixed(2) : Math.abs(currentAvgWeightLoss).toFixed(2)} ${isImperial ? 'lbs' : 'kg'}/week` : 'Not enough data'}
              disabled
              className="bg-muted/50"
            />
            {currentAvgWeightLoss !== undefined && (
              <Badge variant={currentAvgWeightLoss < 0 ? "secondary" : "destructive"} className="text-xs">
                {currentAvgWeightLoss < 0 ? 'Loss' : 'Gain'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Fifth row: Progress percentage */}
        <div className="space-y-2">
          <Label htmlFor="weightLossProgress" className="text-left block">Weight Loss Progress</Label>
          <Input
            id="weightLossProgress"
            value={currentPeriod && progressPercentage !== null ? `${progressPercentage.toFixed(2)}%` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
        
        {/* Current Weight (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="currentWeight" className="text-left block">Current Weight</Label>
          <Input
            id="currentWeight"
            value={formData.currentWeight ? `${formData.currentWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}` : ''}
            disabled
            className="bg-muted/50"
          />
        </div>
      </div>
    </div>
  );
};

export default HealthStatistics;
