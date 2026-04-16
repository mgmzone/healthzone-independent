import React from 'react';
import { differenceInDays } from 'date-fns';
import { Period } from '@/lib/types';

interface PeriodProgressBarProps {
  period: Period;
}

const PeriodProgressBar: React.FC<PeriodProgressBarProps> = ({ period }) => {
  const start = new Date(period.startDate as any);
  const endRaw = period.projectedEndDate || period.endDate;
  const end = endRaw ? new Date(endRaw as any) : null;
  const today = new Date();

  if (!end) return null;

  const totalDays = Math.max(1, differenceInDays(end, start));
  const elapsedDays = Math.max(0, Math.min(totalDays, differenceInDays(today, start)));
  const pct = Math.round((elapsedDays / totalDays) * 100);

  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-1.5 text-xs text-muted-foreground">
        <span>
          Day <strong className="text-foreground">{elapsedDays}</strong> of {totalDays} &bull; {pct}% elapsed
        </span>
        <span>{totalDays - elapsedDays} days remaining</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default PeriodProgressBar;
