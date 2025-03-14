
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Period } from '@/lib/types';
import { getWeeksInPeriod, getMonthsInPeriod, ensureDate } from '@/lib/utils/dateUtils';
import { Pencil, Trash2 } from "lucide-react";

interface PeriodTableRowProps {
  period: Period;
  isActive: boolean;
  latestWeight: number | null;
  weightUnit: string;
  onEdit: (period: Period) => void;
  onDelete: (id: string) => void;
}

const PeriodTableRow: React.FC<PeriodTableRowProps> = ({
  period,
  isActive,
  latestWeight,
  weightUnit,
  onEdit,
  onDelete
}) => {
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  const startDate = ensureDate(period.startDate);
  const endDate = ensureDate(period.endDate);
  const projectedEndDate = ensureDate(period.projectedEndDate);

  const formattedStartDate = startDate ? format(startDate, "MMM d, yyyy") : "Unknown";
  
  // If projected end date exists, use it as the primary display date
  const formattedEndDate = projectedEndDate
    ? format(projectedEndDate, "MMM d, yyyy")
    : endDate 
      ? format(endDate, "MMM d, yyyy")
      : "Present";
  
  // Calculate durations correctly using the projected end date when available
  const endDateForDuration = projectedEndDate || endDate;
  const weeks = getWeeksInPeriod(period.startDate, endDateForDuration);
  const months = getMonthsInPeriod(period.startDate, endDateForDuration);
  
  const isImperial = weightUnit === 'lbs';
  const displayStartWeight = isImperial ? period.startWeight * 2.20462 : period.startWeight;
  const displayTargetWeight = isImperial ? period.targetWeight * 2.20462 : period.targetWeight;
  const displayWeightLossPerWeek = isImperial 
    ? period.weightLossPerWeek * 2.20462 
    : period.weightLossPerWeek;
  
  const weightChange = latestWeight 
    ? Math.abs(displayStartWeight - latestWeight)
    : 0;
  const weightDirection = latestWeight && latestWeight < displayStartWeight 
    ? 'lost' 
    : 'gained';

  return (
    <tr className={`border-b ${isActive ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
      <td className="px-4 py-4">
        <div className="text-sm">
          {formattedStartDate} - {formattedEndDate}
        </div>
        {isActive && (
          <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full mt-1">
            Active
          </span>
        )}
        
        {/* Show original goal end date if it's different from the projected end date */}
        {endDate && projectedEndDate && endDate.getTime() !== projectedEndDate.getTime() && (
          <div className="text-xs text-muted-foreground mt-1">
            Original goal: {format(endDate, "MMM d, yyyy")}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <Badge variant={period.type === 'weightLoss' ? 'default' : 'secondary'} className="text-xs">
          {period.type === 'weightLoss' ? 'Weight Loss' : 'Maintenance'}
        </Badge>
      </td>
      <td className="px-4 py-4 text-center text-sm">{formatWeight(displayStartWeight)} {weightUnit}</td>
      <td className="px-4 py-4 text-center text-sm">{formatWeight(displayTargetWeight)} {weightUnit}</td>
      <td className="px-4 py-4 text-center text-sm">{formatWeight(displayWeightLossPerWeek)} {weightUnit}/week</td>
      <td className="px-4 py-4">
        {latestWeight ? (
          <div className="flex flex-col items-center">
            <div className="text-sm">{formatWeight(latestWeight)} {weightUnit}</div>
            <div className="text-xs text-muted-foreground">
              {formatWeight(weightChange)} {weightUnit} {weightDirection}
            </div>
          </div>
        ) : (
          <div className="text-center text-sm">-</div>
        )}
      </td>
      <td className="px-4 py-4 text-center text-sm">{period.fastingSchedule}</td>
      <td className="px-4 py-4">
        <div className="flex flex-col items-center">
          <div className="text-sm">{weeks} weeks</div>
          <div className="text-xs text-muted-foreground">{months} months</div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(period)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(period.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default PeriodTableRow;
