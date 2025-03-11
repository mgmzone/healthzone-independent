import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import { getProgressPercentage } from '@/lib/types';
import { 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining,
  getWeeksInPeriod,
  getMonthsInPeriod
} from '@/lib/utils/dateUtils';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import PeriodMetricsCards from '@/components/periods/PeriodMetricsCards';
import PeriodsTable from '@/components/periods/PeriodsTable';

const Periods = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, addPeriod, getCurrentPeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsFirstPeriod, setNeedsFirstPeriod] = useState(false);

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

  useEffect(() => {
    if (!periodsLoading && periods.length === 0) {
      setNeedsFirstPeriod(true);
    }
  }, [periodsLoading, periods]);

  const handleSavePeriod = (periodData: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string
  }) => {
    const startWeight = isImperial ? periodData.startWeight / 2.20462 : periodData.startWeight;
    const targetWeight = isImperial ? periodData.targetWeight / 2.20462 : periodData.targetWeight;
    
    addPeriod({
      ...periodData,
      startWeight,
      targetWeight
    });
    
    setIsModalOpen(false);
    setNeedsFirstPeriod(false);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Periods</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2" /> Add Period
          </Button>
        </div>

        {needsFirstPeriod ? (
          <NoPeriodAlert onCreatePeriod={() => setIsModalOpen(true)} />
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
              />
            )}

            <PeriodsTable
              periods={periods}
              currentPeriodId={currentPeriod?.id}
              latestWeight={latestWeight}
              weightUnit={weightUnit}
            />
          </>
        )}
      </div>

      <PeriodEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePeriod}
        defaultValues={{
          startWeight: latestWeight || undefined,
          targetWeight: profile?.targetWeight ? convertWeight(profile.targetWeight) : undefined
        }}
        weightUnit={weightUnit}
      />
    </Layout>
  );
};

export default Periods;
