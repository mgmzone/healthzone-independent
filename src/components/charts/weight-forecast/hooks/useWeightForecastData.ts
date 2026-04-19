import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { calculateWeightRange } from '../weightForecastUtils';
import { generateForecastPoints } from '../utils/forecast/forecastGenerator';

interface UseWeightForecastDataProps {
  weighIns: WeighIn[];
  currentPeriod: Period;
  isImperial?: boolean;
  targetWeight?: number;
}

export const useWeightForecastData = ({
  weighIns,
  currentPeriod,
  isImperial = false,
  targetWeight,
}: UseWeightForecastDataProps) => {
  // Actual weigh-ins in display units, sorted ascending. This is what the
  // user sees as the "actual" line and what the forecast regression reads.
  const processedData = useMemo(() => {
    return weighIns
      .map((w) => ({
        date: new Date(w.date),
        weight: isImperial ? w.weight * 2.20462 : w.weight,
        isActual: true as const,
        isForecast: false as const,
        formattedDate: format(new Date(w.date), 'MMM d'),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [weighIns, isImperial]);

  const displayTargetWeight = useMemo(() => {
    if (targetWeight !== undefined) return targetWeight;
    if (!currentPeriod.targetWeight) return undefined;
    return isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight;
  }, [targetWeight, currentPeriod.targetWeight, isImperial]);

  // Run the forecast. The generator owns the end-date calculation via
  // regression on recent history + exponential decay fit.
  const forecastResult = useMemo(() => {
    const history = processedData.map((p) => ({ date: p.date, weight: p.weight }));
    return generateForecastPoints(
      history,
      displayTargetWeight,
      currentPeriod.weightLossPerWeek
    );
  }, [processedData, displayTargetWeight, currentPeriod.weightLossPerWeek]);

  const forecastData = forecastResult.points;
  const targetReached = forecastResult.targetReached;
  const projectedEndDate = forecastResult.projectedEndDate;

  // The generator's first forecast point is the anchor (= last actual
  // weigh-in), so we drop it from the combined series to avoid plotting the
  // same (date, weight) twice. What's drawn is: actuals in blue, then orange
  // continuing from that last blue dot.
  const combinedData = useMemo(() => {
    if (forecastData.length === 0) return processedData;
    return [...processedData, ...forecastData.slice(1)];
  }, [processedData, forecastData]);

  const weights = useMemo(() => combinedData.map((d) => d.weight), [combinedData]);

  const { minWeight, maxWeight } = useMemo(
    () => calculateWeightRange(weights, displayTargetWeight),
    [weights, displayTargetWeight]
  );

  const startDate = useMemo(() => {
    const d = new Date(currentPeriod.startDate as any);
    const t = d.getTime();
    return Number.isFinite(t) ? t : Date.now();
  }, [currentPeriod.startDate]);

  // X-axis extent: the generator's projected end date when available,
  // otherwise the period's stored end date, otherwise a month out.
  const endDate = useMemo(() => {
    const candidate =
      projectedEndDate ||
      (currentPeriod.projectedEndDate ? new Date(currentPeriod.projectedEndDate as any) : null) ||
      (currentPeriod.endDate ? new Date(currentPeriod.endDate as any) : null) ||
      addDays(new Date(), 30);
    const t = candidate.getTime();
    return Number.isFinite(t) ? t : addDays(new Date(), 30).getTime();
  }, [projectedEndDate, currentPeriod.projectedEndDate, currentPeriod.endDate]);

  return {
    processedData,
    forecastData,
    combinedData,
    minWeight,
    maxWeight,
    displayTargetWeight,
    startDate,
    endDate,
    projectedEndDate,
    targetReached,
    observedDailyRate: forecastResult.observedDailyRate,
  };
};
