import React from 'react';
import { Scale, UtensilsCrossed, Timer, Dumbbell, Target, Check } from 'lucide-react';
import { WeighIn, MealLog, FastingLog, ExerciseLog, DailyGoal, DailyGoalEntry } from '@/lib/types';
import { toLocalDateString } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';

interface TodayStatusStripProps {
  weighIns: WeighIn[];
  mealLogs: MealLog[];
  fastingLogs: FastingLog[];
  exerciseLogs: ExerciseLog[];
  activeGoals: DailyGoal[];
  goalEntries: DailyGoalEntry[];
  targetMealsPerDay: number;
  weightUnit: string;
  isImperial: boolean;
}

interface Chip {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  done: boolean;
}

const TodayStatusStrip: React.FC<TodayStatusStripProps> = ({
  weighIns,
  mealLogs,
  fastingLogs,
  exerciseLogs,
  activeGoals,
  goalEntries,
  targetMealsPerDay,
  weightUnit,
  isImperial,
}) => {
  const todayStr = toLocalDateString(new Date());

  // Weigh-in today
  const todayWeighIn = weighIns.find(
    (w) => toLocalDateString(new Date(w.date)) === todayStr
  );

  // Meals today
  const todayMeals = mealLogs.filter(
    (m) => toLocalDateString(new Date(m.date)) === todayStr
  );

  // Active fast: most recent fast with no end_time
  const activeFast = fastingLogs.find((f) => !f.endTime);
  const fastHours = activeFast
    ? (Date.now() - new Date(activeFast.startTime).getTime()) / (1000 * 60 * 60)
    : 0;

  // Exercise today (any log with today's date)
  const todayExercise = exerciseLogs.filter(
    (e) => toLocalDateString(new Date(e.date)) === todayStr
  );
  const todayMinutes = todayExercise.reduce((sum, e) => sum + e.minutes, 0);

  // Goals today
  const todaysGoalEntries = goalEntries.filter(
    (g) => toLocalDateString(new Date(g.date)) === todayStr
  );
  const metToday = todaysGoalEntries.filter((g) => g.met).length;
  const totalActive = activeGoals.length;

  const chips: Chip[] = [
    {
      icon: Scale,
      label: 'Weigh-in',
      value: todayWeighIn
        ? `${(isImperial ? todayWeighIn.weight * 2.20462 : todayWeighIn.weight).toFixed(1)} ${weightUnit}`
        : 'Not yet',
      done: !!todayWeighIn,
    },
    {
      icon: UtensilsCrossed,
      label: 'Meals',
      value: `${todayMeals.length}/${targetMealsPerDay}`,
      done: todayMeals.length >= targetMealsPerDay,
    },
    {
      icon: Timer,
      label: 'Fasting',
      value: activeFast ? `${Math.floor(fastHours)}h ${Math.floor((fastHours % 1) * 60)}m` : 'Inactive',
      done: !!activeFast,
    },
    {
      icon: Dumbbell,
      label: 'Exercise',
      value: todayMinutes > 0 ? `${todayMinutes} min` : '0 min',
      done: todayMinutes > 0,
    },
    {
      icon: Target,
      label: 'Goals',
      value: totalActive > 0 ? `${metToday}/${totalActive}` : '—',
      done: totalActive > 0 && metToday === totalActive,
    },
  ];

  return (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
        Today
      </span>
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <div
            key={chip.label}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
              chip.done
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'border-border bg-muted/40 text-muted-foreground'
            )}
          >
            {chip.done ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            <span className="font-medium">{chip.label}</span>
            <span className={cn('tabular-nums', chip.done ? 'font-semibold' : '')}>
              {chip.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TodayStatusStrip;
