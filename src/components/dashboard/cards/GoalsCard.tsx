import React from 'react';
import { Target } from 'lucide-react';
import { DailyGoal, DailyGoalEntry } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { subDays } from 'date-fns';
import { toLocalDateString } from '@/lib/utils/dateUtils';

interface GoalsCardProps {
  activeGoals: DailyGoal[];
  entries: DailyGoalEntry[];
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

const GoalsCard: React.FC<GoalsCardProps> = ({
  activeGoals,
  entries,
  cardClassName,
  cardStyle,
}) => {
  const todayStr = toLocalDateString(new Date());
  const todayEntries = entries.filter(
    e => toLocalDateString(new Date(e.date)) === todayStr
  );
  const metCount = todayEntries.filter(e => e.met).length;
  const totalCount = activeGoals.length;
  const complianceRate = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

  // Perfect day streak
  let perfectStreak = 0;
  if (activeGoals.length > 0) {
    const activeGoalIds = new Set(activeGoals.map(g => g.id));
    const dateGoalMap = new Map<string, Set<string>>();
    entries.filter(e => e.met).forEach(e => {
      const dateStr = toLocalDateString(new Date(e.date));
      if (!dateGoalMap.has(dateStr)) {
        dateGoalMap.set(dateStr, new Set());
      }
      dateGoalMap.get(dateStr)!.add(e.goalId);
    });

    const today = new Date();
    let checkDate = new Date(today);

    // If today isn't complete, start from yesterday
    const todayMet = dateGoalMap.get(todayStr);
    const todayPerfect = todayMet && [...activeGoalIds].every(id => todayMet.has(id));
    if (!todayPerfect) {
      checkDate = subDays(today, 1);
    }

    while (true) {
      const dateStr = toLocalDateString(checkDate);
      const metGoals = dateGoalMap.get(dateStr);
      if (metGoals && [...activeGoalIds].every(id => metGoals.has(id))) {
        perfectStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
  }

  const values = [
    {
      label: "Today",
      value: totalCount > 0 ? `${metCount}/${totalCount} (${complianceRate}%)` : 'No goals set',
    },
    {
      label: "Perfect Streak",
      value: `${perfectStreak} days`,
    },
    {
      label: "Active Goals",
      value: `${totalCount}`,
    },
  ];

  return (
    <MultiValueCard
      title="Daily Goals"
      values={values}
      icon={Target}
      color="#8b5cf6"
      className={cardClassName}
      style={cardStyle}
    />
  );
};

export default GoalsCard;
