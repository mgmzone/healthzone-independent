
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Period } from '@/lib/types';
import { getWeeksInPeriod, getMonthsInPeriod } from '@/lib/utils/dateUtils';
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

  const formattedStartDate = format(new Date(period.startDate), "MMM d, yyyy");
  const formattedEndDate = period.endDate 
    ? format(new Date(period.endDate), "MMM d, yyyy")
    : "Present";
  
  const weeks = getWeeksInPeriod(period.startDate, period.endDate);
  const months = getMonthsInPeriod(period.startDate, period.endDate);
  
  // Convert weights to display units (kg to lbs if imperial)
  const isImperial = weightUnit === 'lbs';
  const displayStartWeight = isImperial ? period.startWeight * 2.20462 : period.startWeight;
  const displayTargetWeight = isImperial ? period.targetWeight * 2.20462 : period.targetWeight;
  const displayWeightLossPerWeek = isImperial 
    ? period.weightLossPerWeek * 2.20462 
    : period.weightLossPerWeek;
  
  // For weight change calculation, ensure latestWeight is in the same unit as displayStartWeight
  const weightChange = latestWeight 
    ? Math.abs(displayStartWeight - latestWeight)
    : 0;
  const weightDirection = latestWeight && latestWeight < displayStartWeight 
    ? 'lost' 
    : 'gained';

  return (
    <tr className={`border-b ${isActive ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
      <td className="px-4 py-4">
        <div className="font-medium">{formattedStartDate} - {formattedEndDate}</div>
        {isActive && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full mt-1">
            Active
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <Badge variant={period.type === 'weightLoss' ? 'default' : 'secondary'}>
          {period.type === 'weightLoss' ? 'Weight Loss' : 'Maintenance'}
        </Badge>
      </td>
      <td className="px-4 py-4 text-center">{formatWeight(displayStartWeight)} {weightUnit}</td>
      <td className="px-4 py-4 text-center">{formatWeight(displayTargetWeight)} {weightUnit}</td>
      <td className="px-4 py-4 text-center">{formatWeight(displayWeightLossPerWeek)} {weightUnit}/week</td>
      <td className="px-4 py-4">
        {latestWeight ? (
          <div className="flex flex-col items-center">
            <div className="font-medium">{formatWeight(latestWeight)} {weightUnit}</div>
            <div className="text-xs text-muted-foreground">
              {formatWeight(weightChange)} {weightUnit} {weightDirection}
            </div>
          </div>
        ) : (
          <div className="text-center">-</div>
        )}
      </td>
      <td className="px-4 py-4 text-center">{period.fastingSchedule}</td>
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
