
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Period } from '@/lib/types';
import { getWeeksInPeriod, getMonthsInPeriod } from '@/lib/utils/dateUtils';

interface PeriodsTableProps {
  periods: Period[];
  currentPeriodId?: string;
  latestWeight: number | null;
  weightUnit: string;
}

const PeriodsTable: React.FC<PeriodsTableProps> = ({
  periods,
  currentPeriodId,
  latestWeight,
  weightUnit
}) => {
  // Format weight with 1 decimal place
  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  // Convert weight if needed based on weightUnit
  const convertWeight = (weight: number): number => {
    return weightUnit === 'lbs' ? weight * 2.20462 : weight;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left">Period</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-center">Start Weight</th>
            <th className="px-4 py-3 text-center">Target Weight</th>
            <th className="px-4 py-3 text-center">Current Weight</th>
            <th className="px-4 py-3 text-center">Fasting</th>
            <th className="px-4 py-3 text-center">Duration</th>
          </tr>
        </thead>
        <tbody>
          {periods.map(period => {
            const formattedStartDate = format(new Date(period.startDate), "MMM d, yyyy");
            const formattedEndDate = period.endDate 
              ? format(new Date(period.endDate), "MMM d, yyyy")
              : "Present";
            
            const weeks = getWeeksInPeriod(period.startDate, period.endDate);
            const months = getMonthsInPeriod(period.startDate, period.endDate);
            
            const convertedStartWeight = convertWeight(period.startWeight);
            const convertedTargetWeight = convertWeight(period.targetWeight);
            
            const weightChange = latestWeight 
              ? Math.abs(convertedStartWeight - latestWeight)
              : 0;
            const weightDirection = latestWeight && latestWeight < convertedStartWeight 
              ? 'lost' 
              : 'gained';
              
            return (
              <tr 
                key={period.id} 
                className={`border-b ${currentPeriodId === period.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
              >
                <td className="px-4 py-4">
                  <div className="font-medium">{formattedStartDate} - {formattedEndDate}</div>
                  {currentPeriodId === period.id && (
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
                <td className="px-4 py-4 text-center">{formatWeight(convertedStartWeight)} {weightUnit}</td>
                <td className="px-4 py-4 text-center">{formatWeight(convertedTargetWeight)} {weightUnit}</td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PeriodsTable;
