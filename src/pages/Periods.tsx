
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightData } from '@/hooks/useWeightData';
import PeriodEntryModal from '@/components/periods/PeriodEntryModal';
import NoPeriodAlert from '@/components/periods/NoPeriodAlert';
import NoActivePeriodAlert from '@/components/periods/NoActivePeriodAlert';
import PeriodsTable from '@/components/periods/PeriodsTable';
import { convertToMetric } from '@/lib/weight/convertWeight';

const Periods = () => {
  const { profile } = useAuth();
  const { periods, isLoading: periodsLoading, addPeriod, getCurrentPeriod, updatePeriod, deletePeriod } = usePeriodsData();
  const { weighIns, isLoading: weighInsLoading } = useWeightData();
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

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-end items-center mb-6">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2" /> Add Period
          </Button>
        </div>

        {needsFirstPeriod ? (
          <NoPeriodAlert onCreatePeriod={() => setIsModalOpen(true)} />
        ) : (
          <>
            {!currentPeriod && <NoActivePeriodAlert />}

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
