
import React from 'react';
import { ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface ReferenceLinesProps {
  chartData: any[];
  today: Date;
  targetDate: Date | null;
  periodEndDate: Date | null;
}

export const ReferenceLines: React.FC<ReferenceLinesProps> = ({
  chartData,
  today,
  targetDate,
  periodEndDate
}) => {
  if (!chartData || chartData.length === 0) return null;

  return (
    <>
      {/* "Today" line */}
      <ReferenceLine
        x={today.getTime()}
        stroke="#6D28D9"
        strokeDasharray="3 3"
        strokeWidth={1.5}
        label={{
          value: 'Today',
          position: 'top',
          fill: '#6D28D9',
          fontSize: 12
        }}
      />

      {/* Target date line (if available) */}
      {targetDate && (
        <ReferenceLine
          x={targetDate.getTime()}
          stroke="#6366F1"
          strokeDasharray="5 5"
          strokeWidth={1.5}
          label={{
            value: `Target (${format(targetDate, 'MMM d')})`,
            position: 'top',
            fill: '#6366F1',
            fontSize: 12
          }}
        />
      )}

      {/* Period end date line */}
      {periodEndDate && (
        <ReferenceLine
          x={periodEndDate.getTime()}
          stroke="#A5B4FC"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          label={{
            value: `End (${format(periodEndDate, 'MMM d')})`,
            position: 'top',
            fill: '#A5B4FC',
            fontSize: 12
          }}
        />
      )}
    </>
  );
};
