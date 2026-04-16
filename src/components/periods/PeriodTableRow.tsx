
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Period, WeighIn } from '@/lib/types';
import { getWeeksInPeriod, getMonthsInPeriod, ensureDate } from '@/lib/utils/dateUtils';
import { Pencil, Trash2 } from "lucide-react";

interface PeriodTableRowProps {
  period: Period;
  isActive: boolean;
  latestWeight: number | null;
  weightUnit: string;
  weighIns: WeighIn[];
  onEdit: (period: Period) => void;
  onDelete: (id: string) => void;
}

const PeriodTableRow: React.FC<PeriodTableRowProps> = ({
  period,
  isActive,
  weightUnit,
  weighIns,
  onEdit,
  onDelete
}) => {
  const formatWeight = (weight: number): string => weight.toFixed(1);

  const startDate = ensureDate(period.startDate);
  const endDate = ensureDate(period.endDate);
  const projectedEndDate = ensureDate(period.projectedEndDate);

  const formattedStartDate = startDate ? format(startDate, "MMM d, yyyy") : "Unknown";
  const formattedEndDate = projectedEndDate
    ? format(projectedEndDate, "MMM d, yyyy")
    : endDate
      ? format(endDate, "MMM d, yyyy")
      : "Present";

  const endDateForDuration = projectedEndDate || endDate;
  const weeks = getWeeksInPeriod(period.startDate, endDateForDuration);
  const months = getMonthsInPeriod(period.startDate, endDateForDuration);

  const isImperial = weightUnit === 'lbs';
  const toDisplayUnit = (kg: number) => isImperial ? kg * 2.20462 : kg;

  const displayStartWeight = toDisplayUnit(period.startWeight);
  const displayTargetWeight = toDisplayUnit(period.targetWeight);
  const displayWeightLossPerWeek = toDisplayUnit(period.weightLossPerWeek);

  // Scope weigh-ins to this period's date range. For active periods with no end,
  // include everything since startDate.
  const periodEnd = endDate || new Date();
  const inPeriod = weighIns.filter(w => {
    const d = new Date(w.date);
    return startDate ? (d >= startDate && d <= periodEnd) : false;
  });
  // weighIns are typically sorted desc by date; resort by ascending date for clarity
  const sortedAsc = [...inPeriod].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const finalWeighInKg = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1].weight : null;
  const lowestWeighInKg = sortedAsc.length > 0
    ? Math.min(...sortedAsc.map(w => w.weight))
    : null;

  const finalWeight = finalWeighInKg !== null ? toDisplayUnit(finalWeighInKg) : null;
  const lowestWeight = lowestWeighInKg !== null ? toDisplayUnit(lowestWeighInKg) : null;

  const actualLoss = finalWeight !== null ? displayStartWeight - finalWeight : null;
  // Weeks elapsed = full duration for closed periods; for active, use weeks since start (capped at duration)
  let weeksElapsed = weeks;
  if (isActive && startDate) {
    const elapsedMs = Date.now() - startDate.getTime();
    weeksElapsed = Math.max(elapsedMs / (1000 * 60 * 60 * 24 * 7), 0.1);
  }
  const actualLossPerWeek = actualLoss !== null && weeksElapsed > 0 ? actualLoss / weeksElapsed : null;

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
      <td className="px-4 py-4 text-center text-sm">{formatWeight(displayWeightLossPerWeek)} {weightUnit}/wk</td>
      <td className="px-4 py-4 text-center text-sm">
        {finalWeight !== null ? `${formatWeight(finalWeight)} ${weightUnit}` : '—'}
      </td>
      <td className="px-4 py-4 text-center text-sm">
        {lowestWeight !== null ? `${formatWeight(lowestWeight)} ${weightUnit}` : '—'}
      </td>
      <td className="px-4 py-4 text-center text-sm">
        {actualLoss !== null ? (
          <span className={actualLoss > 0 ? 'text-green-600' : actualLoss < 0 ? 'text-red-600' : ''}>
            {actualLoss > 0 ? '−' : actualLoss < 0 ? '+' : ''}
            {formatWeight(Math.abs(actualLoss))} {weightUnit}
          </span>
        ) : '—'}
      </td>
      <td className="px-4 py-4 text-center text-sm">
        {actualLossPerWeek !== null
          ? `${actualLossPerWeek > 0 ? '−' : actualLossPerWeek < 0 ? '+' : ''}${formatWeight(Math.abs(actualLossPerWeek))} ${weightUnit}/wk`
          : '—'}
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
          <Button variant="ghost" size="sm" onClick={() => onEdit(period)}>
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
