
import React from 'react';
import { Timer } from 'lucide-react';
import { FastingLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ProgressCircle';
import { calculateCurrentStreak, calculateAverageDailyFasting, findLongestFast } from '../utils/fastingCalculations';
import { formatDuration } from '@/components/fasting/stats/formatters';

interface FastingCardProps {
  fastingLogs: FastingLog[];
  showProgressCircle?: boolean;
}

const FastingCard: React.FC<FastingCardProps> = ({ 
  fastingLogs,
  showProgressCircle = false
}) => {
  const currentStreak = calculateCurrentStreak(fastingLogs);
  const avgDailyFast = calculateAverageDailyFasting(fastingLogs);
  const longestFast = findLongestFast(fastingLogs);
  
  if (showProgressCircle) {
    return (
      <MultiValueCard
        title="Fasting"
        icon={Timer}
        color="#f542a7"
        values={[
          { label: "Current Streak", value: `${currentStreak} days` },
          { label: "Avg Daily Fast", value: formatDuration(avgDailyFast) },
          { label: "Longest Fast", value: formatDuration(longestFast) }
        ]}
        footer={
          <div className="mt-4 flex justify-center">
            <ProgressCircle 
              value={(avgDailyFast / 24) * 100} 
              showPercentage={false}
              valueLabel="hours"
              size={120}
              strokeWidth={10}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">{avgDailyFast.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">hours</div>
              </div>
            </ProgressCircle>
          </div>
        }
      />
    );
  }
  
  return (
    <MultiValueCard
      title="Fasting"
      icon={Timer}
      color="#f542a7"
      values={[
        { label: "Current Streak", value: `${currentStreak} days` },
        { label: "Avg Daily Fast", value: formatDuration(avgDailyFast) },
        { label: "Longest Fast", value: formatDuration(longestFast) }
      ]}
    />
  );
};

export default FastingCard;
