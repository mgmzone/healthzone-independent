import React from 'react';
import { Target } from 'lucide-react';
import { DailyGoal, DailyGoalEntry } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ProgressCircle';
import TrendArrow from '../TrendArrow';
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

  // 7-day compliance vs prior 7-day compliance
  const msDay = 86400000;
  const now = Date.now();
  let last7Met = 0, last7Total = 0, prev7Met = 0, prev7Total = 0;
  entries.forEach(e => {
    const ageDays = (now - new Date(e.date).getTime()) / msDay;
    if (ageDays >= 0 && ageDays < 7) {
      last7Total++;
      if (e.met) last7Met++;
    } else if (ageDays >= 7 && ageDays < 14) {
      prev7Total++;
      if (e.met) prev7Met++;
    }
  });
  const last7Compliance = last7Total > 0 ? Math.round((last7Met / last7Total) * 100) : 0;
  const prev7Compliance = prev7Total > 0 ? Math.round((prev7Met / prev7Total) * 100) : 0;

  const values = [
    {
      label: "Today",
      value: totalCount > 0 ? `${metCount}/${totalCount} (${complianceRate}%)` : 'No goals set',
    },
    {
      label: "7-Day Compliance",
      value: `${last7Compliance}%`,
      trend: prev7Total > 0
        ? <TrendArrow current={last7Compliance} previous={prev7Compliance} unit="%" betterDirection="higher" />
        : undefined,
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
      footer={
        <div className="mt-4 flex justify-center">
          <ProgressCircle
            value={complianceRate}
            showPercentage={true}
            valueLabel={`${metCount}/${totalCount} goals`}
            size={120}
            strokeWidth={10}
          />
        </div>
      }
    />
  );
};

export default GoalsCard;
