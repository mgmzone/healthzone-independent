
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import { useFastingData } from '@/hooks/useFastingData';
import { useExerciseData } from '@/hooks/useExerciseData';
import PeriodMetricsCards from '@/components/periods/PeriodMetricsCards';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import HealthStatisticsSection from '@/components/dashboard/HealthStatisticsSection';
import { 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining,
  getWeeksInPeriod,
  getMonthsInPeriod,
  ensureDate
} from '@/lib/utils/dateUtils';
import { getProgressPercentage } from '@/lib/types';

const Dashboard = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, getCurrentPeriod, addPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const { fastingLogs } = useFastingData();
  const { exerciseLogs } = useExerciseData();
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    
    const weightInKg = weighIns[0].weight;
    return isImperial ? weightInKg * 2.20462 : weightInKg;
  };

  const latestWeight = getLatestWeight();
  const currentPeriod = getCurrentPeriod();

  // Calculate average weight loss per week for the current period
  const calculateAverageWeightLoss = () => {
    if (!currentPeriod || weighIns.length < 2) return null;
    
    const periodStartDate = new Date(currentPeriod.startDate);
    const relevantWeighIns = weighIns.filter(w => new Date(w.date) >= periodStartDate);
    
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
    return isImperial ? avgWeeklyLoss * 2.20462 : avgWeeklyLoss;
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
    const startWeight = isImperial ? periodData.startWeight / 2.20462 : periodData.startWeight;
    const targetWeight = isImperial ? periodData.targetWeight / 2.20462 : periodData.targetWeight;
    
    addPeriod({
      ...periodData,
      startWeight,
      targetWeight
    });
    
    setIsPeriodModalOpen(false);
  };

  if (periodsLoading || weighInsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  const currentMetrics = currentPeriod ? {
    weightProgress: latestWeight
      ? getProgressPercentage(
          latestWeight,
          isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
          isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight
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
      ? Math.abs((isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight) - latestWeight)
      : 0,
    weightDirection: latestWeight && latestWeight < (isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight)
      ? 'lost' as const
      : 'gained' as const
  } : null;

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <div className="w-full max-w-7xl mx-auto">
          <SummaryCards
            latestWeight={latestWeight}
            weightUnit={weightUnit}
            currentPeriod={currentPeriod}
            exerciseLogs={exerciseLogs}
            fastingLogs={fastingLogs}
            getDaysRemaining={getDaysRemaining}
          />

          {periods.length === 0 ? (
            <NoPeriodAlert onCreatePeriod={() => setIsPeriodModalOpen(true)} />
          ) : (
            <>
              {!currentPeriod && <NoActivePeriodAlert />}
              {currentPeriod && (
                <>
                  <HealthStatisticsSection 
                    profile={profile}
                    currentPeriod={currentPeriod}
                    currentAvgWeightLoss={currentAvgWeightLoss}
                  />
                  
                  {currentMetrics && (
                    <PeriodMetricsCards
                      weightProgress={currentMetrics.weightProgress}
                      timeProgress={currentMetrics.timeProgress}
                      timeRemaining={currentMetrics.timeRemaining}
                      daysRemaining={currentMetrics.daysRemaining}
                      totalWeeks={currentMetrics.totalWeeks}
                      totalMonths={currentMetrics.totalMonths}
                      weightChange={currentMetrics.weightChange}
                      weightDirection={currentMetrics.weightDirection}
                      weightUnit={weightUnit}
                      weighIns={weighIns}
                      currentPeriod={currentPeriod}
                      isImperial={isImperial}
                      fastingLogs={fastingLogs}
                    />
                  )}
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
              targetWeight: profile?.targetWeight ? (isImperial ? profile.targetWeight * 2.20462 : profile.targetWeight) : undefined
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
