
import React from 'react';
import { Period, ExerciseLog, FastingLog, MealLog, DailyGoal, DailyGoalEntry, User, WeighIn } from '@/lib/types';
import WeightCard from './cards/WeightCard';
import JourneyCard from './cards/JourneyCard';
import ExerciseCard from './cards/ExerciseCard';
import FastingCard from './cards/FastingCard';
import NutritionCard from './cards/NutritionCard';
import GoalsCard from './cards/GoalsCard';
import AIFeedbackCard from './cards/AIFeedbackCard';

interface DashboardCardsProps {
  latestWeight: number | null;
  weightUnit: string;
  currentPeriod: Period;
  exerciseLogs: ExerciseLog[];
  fastingLogs: FastingLog[];
  mealLogs: MealLog[];
  weighIns: WeighIn[];
  targetMealsPerDay: number;
  activeGoals: DailyGoal[];
  goalEntries: DailyGoalEntry[];
  profile: User | null;
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
  weighIns,
  targetMealsPerDay,
  activeGoals,
  goalEntries,
  profile,
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
          weighIns={weighIns}
        />

        <JourneyCard
          currentPeriod={currentPeriod}
          latestWeight={latestWeight}
          weightUnit={weightUnit}
          weightProgress={currentMetrics.weightProgress}
          daysRemaining={currentMetrics.daysRemaining}
          timeProgress={currentMetrics.timeProgress}
        />

        <ExerciseCard
          exerciseLogs={exerciseLogs}
          showProgressCircle={true}
        />

        <FastingCard
          fastingLogs={fastingLogs}
          showProgressCircle={true}
        />

        <NutritionCard
          mealLogs={mealLogs}
          targetMealsPerDay={targetMealsPerDay}
          proteinTargetMin={profile?.proteinTargetMin}
          proteinTargetMax={profile?.proteinTargetMax}
        />

        <GoalsCard activeGoals={activeGoals} entries={goalEntries} />
      </div>
      <AIFeedbackCard hasApiKey={Boolean(profile?.claudeApiKey)} />
    </div>
  );
};

export default DashboardCards;
