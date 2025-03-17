
import React from 'react';
import { Timer } from 'lucide-react';
import { FastingLog } from '@/lib/types';
import StandardCard from './StandardCard';

interface FastingCardProps {
  fastingLogs: FastingLog[];
}

const FastingCard: React.FC<FastingCardProps> = ({ fastingLogs }) => {
  return (
    <StandardCard
      title="Fasting Streaks"
      value={`${fastingLogs.length} fasts`}
      icon={Timer}
      color="#f542a7"
    />
  );
};

export default FastingCard;
