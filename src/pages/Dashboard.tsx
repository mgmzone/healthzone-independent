
import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useFastingData } from '@/hooks/useFastingData';
import PeriodMetricsCards from '@/components/periods/PeriodMetricsCards';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import ActivitySummarySection from '@/components/dashboard/ActivitySummarySection';
import { 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining,
  getWeeksInPeriod,
  getMonthsInPeriod
} from '@/lib/utils/dateUtils';
import { getProgressPercentage } from '@/lib/types';

const Dashboard = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, getCurrentPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const { exerciseLogs } = useExerciseData('week');
  const { fastingLogs } = useFastingData();
  
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return isImperial ? weight * 2.20462 : weight;
  };

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return convertWeight(weighIns[0].weight);
  };

  const latestWeight = getLatestWeight();
  const currentPeriod = getCurrentPeriod();

  const currentMetrics = currentPeriod ? {
    weightProgress: latestWeight
      ? getProgressPercentage(latestWeight, convertWeight(currentPeriod.startWeight), convertWeight(currentPeriod.targetWeight))
      : 0,
    timeProgress: getTimeProgressPercentage(currentPeriod.startDate, currentPeriod.endDate),
    timeRemaining: getRemainingTimePercentage(currentPeriod.startDate, currentPeriod.endDate),
    daysRemaining: getDaysRemaining(currentPeriod.endDate),
    totalWeeks: getWeeksInPeriod(currentPeriod.startDate, currentPeriod.endDate),
    totalMonths: getMonthsInPeriod(currentPeriod.startDate, currentPeriod.endDate),
    weightChange: latestWeight 
      ? Math.abs(convertWeight(currentPeriod.startWeight) - latestWeight)
      : 0,
    weightDirection: latestWeight && latestWeight < convertWeight(currentPeriod.startWeight) 
      ? 'lost' as const
      : 'gained' as const
  } : null;

  if (periodsLoading || weighInsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <SummaryCards
            latestWeight={latestWeight}
            weightUnit={weightUnit}
            currentPeriod={currentPeriod}
            exerciseLogs={exerciseLogs}
            fastingLogs={fastingLogs}
            getDaysRemaining={getDaysRemaining}
          />

          {periods.length === 0 ? (
            <NoPeriodAlert onCreatePeriod={() => {}} />
          ) : (
            <>
              {!currentPeriod && <NoActivePeriodAlert />}
              {currentPeriod && currentMetrics && (
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
                />
              )}
            </>
          )}
          
          <ActivitySummarySection 
            exerciseLogs={exerciseLogs}
            fastingLogs={fastingLogs}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
