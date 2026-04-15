import React from 'react';
import { Apple } from 'lucide-react';
import { MealLog, PROTEIN_TARGET_MIN, PROTEIN_TARGET_MAX } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import ProgressCircle from '@/components/ProgressCircle';
import TrendArrow from '../TrendArrow';
import { toLocalDateString } from '@/lib/utils/dateUtils';

interface NutritionCardProps {
  mealLogs: MealLog[];
  targetMealsPerDay: number;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
  mealLogs,
  targetMealsPerDay,
  cardClassName,
  cardStyle,
}) => {
  const todayStr = toLocalDateString(new Date());
  const todayMeals = mealLogs.filter(
    log => toLocalDateString(new Date(log.date)) === todayStr
  );
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
  const proteinPercent = Math.round((todayProtein / PROTEIN_TARGET_MIN) * 100);

  // Protein streak
  let proteinStreak = 0;
  const dayMap = new Map<string, number>();
  mealLogs.forEach(log => {
    const d = toLocalDateString(new Date(log.date));
    dayMap.set(d, (dayMap.get(d) || 0) + (log.proteinGrams || 0));
  });

  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateString(d);
    const protein = dayMap.get(dateStr);
    if (protein === undefined) {
      if (i === 0) continue; // Today might not be logged yet
      break;
    }
    if (protein >= PROTEIN_TARGET_MIN) {
      proteinStreak++;
    } else {
      break;
    }
  }

  // Weekly avg protein: last 7 days vs prior 7 days
  const msDay = 86400000;
  const now = Date.now();
  let last7Protein = 0, last7Days = new Set<string>();
  let prev7Protein = 0, prev7Days = new Set<string>();
  mealLogs.forEach(log => {
    const t = new Date(log.date).getTime();
    const dateStr = toLocalDateString(new Date(log.date));
    const ageDays = (now - t) / msDay;
    if (ageDays >= 0 && ageDays < 7) {
      last7Protein += log.proteinGrams || 0;
      last7Days.add(dateStr);
    } else if (ageDays >= 7 && ageDays < 14) {
      prev7Protein += log.proteinGrams || 0;
      prev7Days.add(dateStr);
    }
  });
  const last7Avg = last7Days.size > 0 ? last7Protein / last7Days.size : 0;
  const prev7Avg = prev7Days.size > 0 ? prev7Protein / prev7Days.size : 0;

  const values = [
    {
      label: "Today's Protein",
      value: `${todayProtein}g / ${PROTEIN_TARGET_MIN}-${PROTEIN_TARGET_MAX}g`,
    },
    {
      label: "7-Day Avg",
      value: `${Math.round(last7Avg)}g`,
      trend: prev7Avg > 0 ? <TrendArrow current={last7Avg} previous={prev7Avg} unit="g" betterDirection="higher" /> : undefined,
    },
    {
      label: "Meals Logged",
      value: `${todayMeals.length}/${targetMealsPerDay}`,
    },
    {
      label: "Protein Streak",
      value: `${proteinStreak} days`,
    },
  ];

  return (
    <MultiValueCard
      title="Nutrition"
      values={values}
      icon={Apple}
      color="#f97316"
      className={cardClassName}
      style={cardStyle}
      footer={
        <div className="mt-4 flex justify-center">
          <ProgressCircle
            value={proteinPercent}
            showPercentage={true}
            valueLabel={`${todayProtein}/${PROTEIN_TARGET_MIN}g`}
            size={120}
            strokeWidth={10}
            allowExceedGoal={true}
          />
        </div>
      }
    />
  );
};

export default NutritionCard;
