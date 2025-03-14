
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import { useFastingData } from '@/hooks/useFastingData';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import { getProgressPercentage } from '@/lib/types';
import { 
  getTimeProgressPercentage,
  getRemainingTimePercentage,
  getDaysRemaining,
  getWeeksInPeriod,
  getMonthsInPeriod,
  ensureDate
} from '@/lib/utils/dateUtils';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import PeriodMetricsCards from '@/components/periods/PeriodMetricsCards';
import PeriodsTable from '@/components/periods/PeriodsTable';
import { convertToMetric } from '@/lib/weight/convertWeight';

const Periods = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, addPeriod, getCurrentPeriod, updatePeriod, deletePeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
  const { fastingLogs } = useFastingData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsFirstPeriod, setNeedsFirstPeriod] = useState(false);

  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Get latest weight directly in the unit we need to display
  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    
    // Weight is stored in kg, convert to lbs if needed
    const weightInKg = weighIns[0].weight;
    return isImperial ? weightInKg * 2.20462 : weightInKg;
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
    fastingSchedule: string,
    weightLossPerWeek: number
  }) => {
    // Convert weight to metric (kg) for storage if coming from imperial
    const startWeight = isImperial ? convertToMetric(periodData.startWeight, true) : periodData.startWeight;
    const targetWeight = isImperial ? convertToMetric(periodData.targetWeight, true) : periodData.targetWeight;
    
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
    // Calculate weight progress correctly
    weightProgress: latestWeight
      ? getProgressPercentage(
          latestWeight,
          isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
          isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight
        )
      : 0,
    // Use projected end date for time calculations if available
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
    totalWeeks: getWeeksInPeriod(
      currentPeriod.startDate, 
      currentPeriod.projectedEndDate || currentPeriod.endDate
    ),
    totalMonths: getMonthsInPeriod(
      currentPeriod.startDate, 
      currentPeriod.projectedEndDate || currentPeriod.endDate
    ),
    // Calculate weight change correctly
    weightChange: latestWeight 
      ? Math.abs((isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight) - latestWeight)
      : 0,
    weightDirection: latestWeight && latestWeight < (isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight)
      ? 'lost' as const
      : 'gained' as const
  } : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-end items-center mb-6">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2" /> Add Period
          </Button>
        </div>

        {!needsFirstPeriod && (
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
                fastingLogs={fastingLogs}
              />
            )}

            <PeriodsTable
              periods={periods}
              currentPeriodId={currentPeriod?.id}
              latestWeight={latestWeight}
              weightUnit={weightUnit}
              onUpdatePeriod={updatePeriod}
              onDeletePeriod={deletePeriod}
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
          targetWeight: profile?.targetWeight ? (isImperial ? profile.targetWeight * 2.20462 : profile.targetWeight) : undefined
        }}
        weightUnit={weightUnit}
      />
    </Layout>
  );
};

export default Periods;
