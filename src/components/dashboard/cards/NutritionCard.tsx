import React from 'react';
import { Apple } from 'lucide-react';
import { MealLog, PROTEIN_TARGET_MIN, PROTEIN_TARGET_MAX } from '@/lib/types';
import MultiValueCard from './MultiValueCard';
import { toLocalDateString } from '@/lib/utils/dateUtils';

interface NutritionCardProps {
  mealLogs: MealLog[];
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
  mealLogs,
  cardClassName,
  cardStyle,
}) => {
  const todayStr = toLocalDateString(new Date());
  const todayMeals = mealLogs.filter(
    log => toLocalDateString(new Date(log.date)) === todayStr
  );
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);

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

  const values = [
    {
      label: "Today's Protein",
      value: `${todayProtein}g / ${PROTEIN_TARGET_MIN}-${PROTEIN_TARGET_MAX}g`,
    },
    {
      label: "Meals Logged",
      value: `${todayMeals.length}/3`,
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
    />
  );
};

export default NutritionCard;
