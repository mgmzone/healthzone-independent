
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Period } from '@/lib/types';
import { getProgressPercentage } from '@/lib/types';
import ProgressCircle from '@/components/ProgressCircle';
import { cn } from "@/lib/utils";

interface PeriodCardProps {
  period: Period;
  isActive?: boolean;
  weightUnit: string;
  latestWeight?: number;
}

const PeriodCard: React.FC<PeriodCardProps> = ({
  period,
  isActive = false,
  weightUnit,
  latestWeight
}) => {
  const formattedStartDate = format(new Date(period.startDate), "MMM d, yyyy");
  const formattedEndDate = period.endDate 
    ? format(new Date(period.endDate), "MMM d, yyyy")
    : "Present";
  
  const isImperial = weightUnit === 'lbs';
  const displayStartWeight = isImperial ? period.startWeight * 2.20462 : period.startWeight;
  const displayTargetWeight = isImperial ? period.targetWeight * 2.20462 : period.targetWeight;
  
  // Calculate progress only if latest weight is provided
  const progress = latestWeight && displayStartWeight
    ? getProgressPercentage(latestWeight, displayStartWeight, displayTargetWeight)
    : 0;
  
  const statusText = period.type === 'weightLoss' ? 'Weight Loss' : 'Maintenance';
  const statusVariant = period.type === 'weightLoss' ? 'default' : 'secondary';
  
  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };
  
  return (
    <Card className={cn("overflow-hidden", isActive && "border-primary border-2")}>
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{formattedStartDate} - {formattedEndDate}</CardTitle>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Start</p>
            <p className="text-xl font-semibold">{formatWeight(displayStartWeight)} {weightUnit}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-xl font-semibold">{formatWeight(displayTargetWeight)} {weightUnit}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Fasting</p>
            <p className="text-xl font-semibold">{period.fastingSchedule}</p>
          </div>
        </div>
        
        {latestWeight && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-20 h-20">
              <ProgressCircle 
                value={progress} 
                strokeWidth={10}
                size={80}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-semibold">{formatWeight(latestWeight)} {weightUnit}</p>
              <p className="text-sm">
                {formatWeight(Math.abs(displayStartWeight - latestWeight))} {weightUnit} {latestWeight < displayStartWeight ? 'lost' : 'gained'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeriodCard;
