
import React from 'react';
import { Timer } from 'lucide-react';
import { FastingLog } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { differenceInSeconds } from 'date-fns';
import { formatDuration } from '@/components/fasting/stats/formatters';
import { calculateCurrentStreak, calculateAverageDailyFasting, findLongestFast } from '../utils/fastingCalculations';

interface FastingCardProps {
  fastingLogs: FastingLog[];
}

const FastingCard: React.FC<FastingCardProps> = ({ fastingLogs }) => {
  const currentStreak = calculateCurrentStreak(fastingLogs);
  const avgDailyFast = calculateAverageDailyFasting(fastingLogs);
  const longestFast = findLongestFast(fastingLogs);
  
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
