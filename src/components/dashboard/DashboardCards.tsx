
import React from 'react';
import { Period, ExerciseLog, FastingLog, MealLog, DailyGoal, DailyGoalEntry } from '@/lib/types';
import WeightCard from './cards/WeightCard';
import PeriodCard from './cards/PeriodCard';
import ExerciseCard from './cards/ExerciseCard';
import FastingCard from './cards/FastingCard';
import NutritionCard from './cards/NutritionCard';
import GoalsCard from './cards/GoalsCard';

interface DashboardCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: Period;
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
  mealLogs: MealLog[];
  activeGoals: DailyGoal[];
  goalEntries: DailyGoalEntry[];
  currentMetrics: {
    weightProgress: number;
    timeProgress: number;
    daysRemaining: number;
    weightChange: number;
    weightDirection: 'lost' | 'gained';
  };
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  latestWeight,
  weightUnit,
  currentPeriod,
  exerciseLogs,
  fastingLogs,
  mealLogs,
  activeGoals,
  goalEntries,
  currentMetrics
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WeightCard
          latestWeight={latestWeight}
          weightUnit={weightUnit}
          currentPeriod={currentPeriod}
          weightProgress={currentMetrics.weightProgress}
          weightChange={currentMetrics.weightChange}
          weightDirection={currentMetrics.weightDirection}
          showProgressCircle={true}
        />

        <PeriodCard
          currentPeriod={currentPeriod}
          getDaysRemaining={(date) => currentMetrics.daysRemaining}
          timeProgress={currentMetrics.timeProgress}
          daysRemaining={currentMetrics.daysRemaining}
          showProgressCircle={true}
        />

        <ExerciseCard
          exerciseLogs={exerciseLogs}
          showProgressCircle={true}
        />

        <FastingCard
          fastingLogs={fastingLogs}
          showProgressCircle={true}
        />

        <NutritionCard mealLogs={mealLogs} />

        <GoalsCard activeGoals={activeGoals} entries={goalEntries} />
      </div>
    </div>
  );
};

export default DashboardCards;
