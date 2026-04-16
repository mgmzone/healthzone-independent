import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { useWeightData } from '@/hooks/useWeightData';
import { usePeriodsData } from '@/hooks/usePeriodsData';
import { useWeightCalculations } from '@/hooks/useWeightCalculations';
import WeightEntryModal from '@/components/weight/WeightEntryModal';
import WeightPeriodStats from '@/components/weight/WeightPeriodStats';
import WeightPageHeader from '@/components/weight/WeightPageHeader';
import WeightEmptyState from '@/components/weight/WeightEmptyState';
import ChartSection from '@/components/weight/ChartSection';
import TableSection from '@/components/weight/TableSection';
import WeightTimeFilter from '@/components/weight/WeightTimeFilter';
import PeriodProgressBar from '@/components/weight/PeriodProgressBar';
import { TimeFilter } from '@/lib/types';

const Weight = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { weighIns, isLoading, addWeighIn, updateWeighIn, deleteWeighIn } = useWeightData();
  const { getCurrentPeriod, isLoading: periodsLoading } = usePeriodsData();
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('period');

  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const currentPeriod = getCurrentPeriod();

  // Scope weigh-ins to the current period window
  const periodWeighIns = React.useMemo(() => {
    if (!currentPeriod) return weighIns;
    const start = new Date(currentPeriod.startDate);
    const end = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
    return weighIns.filter(w => {
      const d = new Date(w.date);
      return d >= start && d <= end;
    });
  }, [weighIns, currentPeriod]);

  const { 
    convertWeight, 
    getLatestWeight, 
    formatWeightValue,
    filterWeighInsByTimePeriod,
    calculateFilteredWeightChange,
    getStartingWeight
  } = useWeightCalculations(periodWeighIns, isImperial);

  const filteredWeighIns = filterWeighInsByTimePeriod(timeFilter);
  
  const latestWeight = getLatestWeight();
  
  const periodStartWeight = getStartingWeight(timeFilter) || 0;
  const currentWeight = latestWeight ? Number(formatWeightValue(convertWeight(latestWeight.weight))) : 0;
  
  const filteredChange = calculateFilteredWeightChange(timeFilter);
  const totalChange = Number(filteredChange.value || "0.0");
  const isWeightLoss = totalChange <= 0;

  // Target weight / start weight from the active period, in the user's display units.
  const targetDisplay = currentPeriod
    ? (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight)
    : undefined;
  const periodStartDisplay = currentPeriod
    ? (isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight)
    : undefined;

  // Projected completion: use the current weekly rate to extrapolate when the user will hit target.
  const projectedCompletion = React.useMemo(() => {
    if (!currentPeriod || !targetDisplay || !latestWeight) return null;
    const currentDisplay = isImperial ? latestWeight.weight * 2.20462 : latestWeight.weight;
    const startDate = new Date(currentPeriod.startDate);
    const weeks = Math.max(0.1, (Date.now() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const lostSoFar = periodStartDisplay ? (periodStartDisplay - currentDisplay) : 0;
    if (lostSoFar <= 0) return null;
    const rate = lostSoFar / weeks;
    const remaining = currentDisplay - targetDisplay;
    if (remaining <= 0) return new Date();
    const weeksNeeded = remaining / rate;
    const proj = new Date();
    proj.setDate(proj.getDate() + Math.round(weeksNeeded * 7));
    return proj;
  }, [currentPeriod, targetDisplay, periodStartDisplay, latestWeight, isImperial]);

  // Flag "new low" when the most recent weigh-in is the period minimum.
  const isNewLow = React.useMemo(() => {
    if (!periodWeighIns || periodWeighIns.length < 2) return false;
    const sorted = [...periodWeighIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    const min = periodWeighIns.reduce((acc, w) => (w.weight < acc ? w.weight : acc), Infinity);
    return latest.weight <= min + 1e-6;
  }, [periodWeighIns]);

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
    
    addWeighIn(weightInKg, date, convertedMetrics);
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

        {periodWeighIns.length === 0 ? (
          <WeightEmptyState 
            onAddWeight={() => setIsModalOpen(true)} 
            isPeriodActive={!!currentPeriod}
          />
        ) : (
          <>
            <WeightTimeFilter
              selectedFilter={timeFilter}
              onFilterChange={setTimeFilter}
            />

            {currentPeriod && <PeriodProgressBar period={currentPeriod} />}

            <WeightPeriodStats
              periodStartWeight={periodStartWeight}
              currentWeight={currentWeight}
              totalPeriodChange={filteredChange.value}
              isWeightLoss={isWeightLoss}
              weightUnit={weightUnit}
              targetWeight={targetDisplay}
              projectedCompletion={projectedCompletion}
              startDate={currentPeriod ? new Date(currentPeriod.startDate) : undefined}
            />

            <ChartSection
              weighIns={filteredWeighIns}
              isImperial={isImperial}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
              targetValue={targetDisplay}
              startValue={periodStartDisplay}
              isNewLow={isNewLow}
            />

            <TableSection
              weighIns={filteredWeighIns}
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
