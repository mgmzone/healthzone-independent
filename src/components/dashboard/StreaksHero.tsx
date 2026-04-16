import React from 'react';
import { Flame, Timer, UtensilsCrossed, Target, TrendingDown } from 'lucide-react';
import { MealLog, FastingLog, WeighIn, DailyGoal, DailyGoalEntry, PROTEIN_TARGET_MIN } from '@/lib/types';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';
import { calculateCurrentStreak } from './utils/fastingCalculations';

interface StreaksHeroProps {
  mealLogs: MealLog[];
  fastingLogs: FastingLog[];
  weighIns: WeighIn[];
  activeGoals: DailyGoal[];
  goalEntries: DailyGoalEntry[];
  proteinTargetMin?: number;
}

// Count consecutive days up to today (not counting today if it hasn't
// earned the streak yet) where the check function returns true.
function countStreak(days: string[], checkFn: (day: string) => boolean, allowToday = true): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDateString(d);
    if (i === 0 && !allowToday && !checkFn(key)) continue;
    if (!checkFn(key)) {
      // If today hasn't been earned yet but we're expecting it, skip without breaking.
      if (i === 0) continue;
      break;
    }
    streak++;
  }
  return streak;
}

const StreaksHero: React.FC<StreaksHeroProps> = ({
  mealLogs,
  fastingLogs,
  weighIns,
  activeGoals,
  goalEntries,
  proteinTargetMin,
}) => {
  // Protein streak: days where total protein >= user's min target.
  const proteinMin = proteinTargetMin ?? PROTEIN_TARGET_MIN;
  const proteinByDay = new Map<string, number>();
  mealLogs.forEach((m) => {
    const key = toLocalDateString(new Date(m.date));
    proteinByDay.set(key, (proteinByDay.get(key) || 0) + (m.proteinGrams || 0));
  });
  const proteinStreak = countStreak([], (day) => (proteinByDay.get(day) || 0) >= proteinMin);

  // Perfect goals streak: days where every active goal was met.
  const totalGoals = activeGoals.length;
  const metByDay = new Map<string, number>();
  goalEntries.forEach((g) => {
    if (!g.met) return;
    const key = toLocalDateString(new Date(g.date));
    metByDay.set(key, (metByDay.get(key) || 0) + 1);
  });
  const perfectGoalStreak = totalGoals > 0
    ? countStreak([], (day) => (metByDay.get(day) || 0) === totalGoals)
    : 0;

  // Fasting streak: reuse existing calculation
  const fastingStreak = calculateCurrentStreak(fastingLogs);

  // Loss streak: number of consecutive weigh-ins going backward from latest
  // where each entry weighs less than the previous.
  const sortedWeighIns = [...weighIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let lossStreak = 0;
  for (let i = 0; i < sortedWeighIns.length - 1; i++) {
    if (sortedWeighIns[i].weight < sortedWeighIns[i + 1].weight) lossStreak++;
    else break;
  }

  const chips = [
    {
      icon: UtensilsCrossed,
      label: 'Protein',
      value: proteinStreak,
      color: 'text-rose-600',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-900/50',
    },
    {
      icon: Target,
      label: 'Perfect goals',
      value: perfectGoalStreak,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/70 dark:border-indigo-900/50',
    },
    {
      icon: Timer,
      label: 'Fasting',
      value: fastingStreak,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-900/50',
    },
    {
      icon: TrendingDown,
      label: 'Weight loss',
      value: lossStreak,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-900/50',
    },
  ].filter((c) => c.value > 0);

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-semibold">Current streaks</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {chips.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={cn('flex items-center gap-3 rounded-lg border px-3.5 py-2 transition-shadow hover:shadow-sm', c.bg)}
            >
              <div className={cn('rounded-full p-1.5 bg-background/60', c.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tabular-nums">{c.value}</span>
                  <span className="text-xs text-muted-foreground">{c.value === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="text-xs text-muted-foreground leading-tight">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreaksHero;
