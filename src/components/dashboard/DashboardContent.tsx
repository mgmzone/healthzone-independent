
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import { useFastingData } from '@/hooks/useFastingData';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useMealData } from '@/hooks/useMealData';
import { useDailyGoalsData } from '@/hooks/useDailyGoalsData';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import DashboardCards from './DashboardCards';
import WeightForecastSection from './WeightForecastSection';
import PriorityMilestoneBanner from './PriorityMilestoneBanner';
import TodayStatusStrip from './TodayStatusStrip';
import StreaksHero from './StreaksHero';
import MyDayDialog from './MyDayDialog';
import WelcomeCard from './WelcomeCard';
import { useMilestones } from '@/hooks/useMilestones';
import { 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining,
  getWeeksInPeriod,
  getMonthsInPeriod,
} from '@/lib/utils/dateUtils';
import { getProgressPercentage } from '@/lib/types';
import { convertWeight, convertToMetric } from '@/lib/weight/convertWeight';

const DashboardContent = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, getCurrentPeriod, addPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const { fastingLogs } = useFastingData();
  const { exerciseLogs } = useExerciseData();
  const { mealLogs } = useMealData();
  const { activeGoals, entries: goalEntries } = useDailyGoalsData();
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const currentPeriod = getCurrentPeriod();
  const { milestones } = useMilestones(currentPeriod?.id);
  const priorityMilestone = milestones.find((m) => m.isPriority);

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    const start = currentPeriod ? new Date(currentPeriod.startDate) : null;
    const end = currentPeriod?.endDate ? new Date(currentPeriod.endDate) : new Date();
    const scoped = start
      ? weighIns.filter(w => {
          const d = new Date(w.date);
          return d >= start && d <= (end as Date);
        })
      : weighIns;
    if (scoped.length === 0) return null;
    return convertWeight(scoped[0].weight, isImperial);
  };

  const latestWeight = getLatestWeight();

  const calculateAverageWeightLoss = () => {
    if (!currentPeriod || weighIns.length < 2) return null;
    
    const periodStartDate = new Date(currentPeriod.startDate);
    const periodEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
    const relevantWeighIns = weighIns.filter(w => {
      const d = new Date(w.date);
      return d >= periodStartDate && d <= periodEndDate;
    });
    
    if (relevantWeighIns.length < 2) return null;
    
    // Sort by date ascending (oldest first)
    const sortedWeighIns = [...relevantWeighIns].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstWeight = sortedWeighIns[0].weight;
    const lastWeight = sortedWeighIns[sortedWeighIns.length - 1].weight;
    const totalLoss = firstWeight - lastWeight;
    
    const firstDate = new Date(sortedWeighIns[0].date);
    const lastDate = new Date(sortedWeighIns[sortedWeighIns.length - 1].date);
    const weeksDiff = (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    
    if (weeksDiff < 0.5) return null; // Need at least half a week of data
    
    const avgWeeklyLoss = totalLoss / weeksDiff;
    return convertWeight(avgWeeklyLoss, isImperial);
  };

  const currentAvgWeightLoss = calculateAverageWeightLoss();

  const handleCreatePeriod = (periodData: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string,
    weightLossPerWeek: number
  }) => {
    const startWeight = convertToMetric(periodData.startWeight, isImperial);
    const targetWeight = convertToMetric(periodData.targetWeight, isImperial);
    
    addPeriod({
      ...periodData,
      startWeight,
      targetWeight
    });
    
    setIsPeriodModalOpen(false);
  };

  if (periodsLoading || weighInsLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const currentMetrics = currentPeriod ? {
    weightProgress: latestWeight
      ? getProgressPercentage(
          latestWeight,
          convertWeight(currentPeriod.startWeight, isImperial),
          convertWeight(currentPeriod.targetWeight, isImperial)
        )
      : 0,
    timeProgress: getTimeProgressPercentage(
      currentPeriod.startDate, 
      currentPeriod.endDate,
      currentPeriod.projectedEndDate
    ),
    timeRemaining: getRemainingTimePercentage(
      currentPeriod.startDate, 
      currentPeriod.endDate,
      currentPeriod.projectedEndDate
    ),
    daysRemaining: getDaysRemaining(
      currentPeriod.endDate,
      currentPeriod.projectedEndDate
    ),
    totalWeeks: getWeeksInPeriod(currentPeriod.startDate, currentPeriod.endDate),
    totalMonths: getMonthsInPeriod(currentPeriod.startDate, currentPeriod.endDate),
    weightChange: latestWeight
      ? Math.abs(convertWeight(currentPeriod.startWeight, isImperial) - latestWeight)
      : 0,
    weightDirection: latestWeight && latestWeight < convertWeight(currentPeriod.startWeight, isImperial)
      ? 'lost' as const
      : 'gained' as const
  } : null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <PriorityMilestoneBanner name={priorityMilestone?.name} date={priorityMilestone?.date} />
      <WelcomeCard
        hasAnyLoggedData={
          weighIns.length > 0 ||
          mealLogs.length > 0 ||
          fastingLogs.length > 0 ||
          exerciseLogs.length > 0 ||
          goalEntries.length > 0
        }
      />
      {periods.length === 0 ? (
        <NoPeriodAlert onCreatePeriod={() => setIsPeriodModalOpen(true)} />
      ) : (
        <>
          {!currentPeriod && <NoActivePeriodAlert />}
          {currentPeriod && currentMetrics && (
            <>
              <div className="flex justify-end mb-3">
                <MyDayDialog />
              </div>

              <TodayStatusStrip
                weighIns={weighIns}
                mealLogs={mealLogs}
                fastingLogs={fastingLogs}
                exerciseLogs={exerciseLogs}
                activeGoals={activeGoals}
                goalEntries={goalEntries}
                targetMealsPerDay={profile?.targetMealsPerDay || 3}
                weightUnit={weightUnit}
                isImperial={isImperial}
              />

              <StreaksHero
                mealLogs={mealLogs}
                fastingLogs={fastingLogs}
                weighIns={weighIns}
                activeGoals={activeGoals}
                goalEntries={goalEntries}
                proteinTargetMin={profile?.proteinTargetMin}
              />
              <DashboardCards
                latestWeight={latestWeight}
                weightUnit={weightUnit}
                currentPeriod={currentPeriod}
                exerciseLogs={exerciseLogs}
                fastingLogs={fastingLogs}
                mealLogs={mealLogs}
                weighIns={weighIns}
                targetMealsPerDay={profile?.targetMealsPerDay || 3}
                activeGoals={activeGoals}
                goalEntries={goalEntries}
                profile={profile}
                currentMetrics={currentMetrics}
              />

              <WeightForecastSection
                weighIns={weighIns}
                currentPeriod={currentPeriod}
                isImperial={isImperial}
              />
            </>
          )}
        </>
      )}
      
      <PeriodEntryModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSave={handleCreatePeriod}
        weightUnit={weightUnit}
        defaultValues={{
          startWeight: latestWeight || undefined,
          targetWeight: profile?.targetWeight ? convertWeight(profile.targetWeight, isImperial) : undefined
        }}
      />
    </div>
  );
};

export default DashboardContent;
