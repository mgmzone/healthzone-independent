
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { useWeightData } from '@/hooks/useWeightData';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightCalculations } from '@/hooks/useWeightCalculations';
import WeightEntryModal from '@/components/weight/WeightEntryModal';
import WeightPeriodStats from '@/components/weight/WeightPeriodStats';
import WeightChangeStats from '@/components/weight/WeightChangeStats';
import WeightPageHeader from '@/components/weight/WeightPageHeader';
import WeightEmptyState from '@/components/weight/WeightEmptyState';
import ChartSection from '@/components/weight/ChartSection';
import TableSection from '@/components/weight/TableSection';

const Weight = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { weighIns, isLoading, addWeighIn, updateWeighIn, deleteWeighIn } = useWeightData();
  const { getCurrentPeriod, isLoading: periodsLoading } = usePeriodsData();
  const [selectedMetric, setSelectedMetric] = useState('weight');

  // Get the unit based on user preference
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Check if there's an active period
  const currentPeriod = getCurrentPeriod();

  const { convertWeight, getLatestWeight, calculateWeightChange, calculateTotalChange, formatWeightValue } = useWeightCalculations(weighIns, isImperial);

  const latestWeight = getLatestWeight();
  
  // Calculate weights and changes using consistent formatting
  const periodStartWeight = currentPeriod ? Number(formatWeightValue(convertWeight(currentPeriod.startWeight))) : 0;
  const currentWeight = latestWeight ? Number(formatWeightValue(convertWeight(latestWeight.weight))) : 0;
  
  // Format consistently with the same rounding logic
  const totalPeriodChange = currentWeight && periodStartWeight
    ? formatWeightValue(currentWeight - periodStartWeight)
    : "0.0";
  const isWeightLoss = Number(totalPeriodChange) < 0;

  // Calculate changes for different time periods
  const changes = {
    days7: calculateWeightChange(7),
    days30: calculateWeightChange(30),
    days90: calculateWeightChange(90),
    allTime: weighIns.length >= 2 ? {
      value: calculateTotalChange()
    } : null
  };

  const onAddWeight = (
    weight: number, 
    date: Date, 
    additionalMetrics?: {
      bmi?: number;
      bodyFatPercentage?: number;
      skeletalMuscleMass?: number;
      boneMass?: number;
      bodyWaterPercentage?: number;
    }
  ) => {
    const weightInKg = isImperial ? weight / 2.20462 : weight;
    
    // Convert additional metrics if needed
    let convertedMetrics = additionalMetrics;
    if (isImperial && additionalMetrics) {
      convertedMetrics = {
        ...additionalMetrics,
        skeletalMuscleMass: additionalMetrics.skeletalMuscleMass 
          ? additionalMetrics.skeletalMuscleMass / 2.20462 
          : undefined,
        boneMass: additionalMetrics.boneMass 
          ? additionalMetrics.boneMass / 2.20462 
          : undefined
      };
    }
    
    addWeighIn({ 
      weight: weightInKg, 
      date, 
      additionalMetrics: convertedMetrics 
    });
    setIsModalOpen(false);
  };

  if (isLoading || periodsLoading) {
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
      <div className="container mx-auto px-4 py-16">
        <WeightPageHeader 
          currentPeriod={currentPeriod} 
          onAddWeight={() => setIsModalOpen(true)} 
        />

        {weighIns.length === 0 ? (
          <WeightEmptyState 
            onAddWeight={() => setIsModalOpen(true)} 
            isPeriodActive={!!currentPeriod}
          />
        ) : (
          <>
            <WeightPeriodStats
              periodStartWeight={periodStartWeight}
              currentWeight={currentWeight}
              totalPeriodChange={totalPeriodChange}
              isWeightLoss={isWeightLoss}
              weightUnit={weightUnit}
            />

            <WeightChangeStats
              changes={changes}
              weightUnit={weightUnit}
            />

            <ChartSection
              weighIns={weighIns}
              isImperial={isImperial}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
            />

            <TableSection
              weighIns={weighIns}
              isImperial={isImperial}
              onAddWeight={() => setIsModalOpen(true)}
              isPeriodActive={!!currentPeriod}
              onUpdateWeighIn={updateWeighIn}
              onDeleteWeighIn={deleteWeighIn}
            />
          </>
        )}
      </div>

      <WeightEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddWeight}
        unit={weightUnit}
      />
    </Layout>
  );
};

export default Weight;
