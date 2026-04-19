
import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { calculateWeightRange } from '../weightForecastUtils';
import { generateForecastPoints } from '../utils/forecastGenerator';
import { smoothRecentWeighIns } from '../utils/forecast/smoothing';

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
  // Process data - convert to display format with proper units
  const processedData = useMemo(() => {
    return weighIns
      .map(weighIn => {
        // Convert weight to display units if needed
        const displayWeight = isImperial ? 
          weighIn.weight * 2.20462 : weighIn.weight;
        
        return {
          date: new Date(weighIn.date),
          weight: displayWeight,
          isActual: true,
          isForecast: false,
          formattedDate: format(new Date(weighIn.date), 'MMM d')
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date, oldest first
  }, [weighIns, isImperial]);
  
  // Get the last actual weigh-in (for displaying the final real dot)
  const lastWeighIn = useMemo(() => {
    if (processedData.length === 0) return null;
    return processedData[processedData.length - 1];
  }, [processedData]);

  // Smoothed anchor for the forecast line — uses a trimmed mean over recent
  // weigh-ins so a single bad reading doesn't skew the projection. Date stays
  // at the latest real weigh-in.
  const forecastAnchor = useMemo(() => {
    return smoothRecentWeighIns(processedData, 7);
  }, [processedData]);
  
  // Convert target weight to display units if needed
  const displayTargetWeight = useMemo(() => {
    return targetWeight !== undefined ? 
      targetWeight : 
      (currentPeriod.targetWeight ? 
        (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight) : 
        undefined);
  }, [targetWeight, currentPeriod.targetWeight, isImperial]);
  
  // Target-reached short-circuit: if the smoothed current weight is already at
  // or below the target (for weight-loss periods), skip forecast generation.
  // Without this, the chart would keep projecting past the finish line.
  const targetReached = useMemo(() => {
    if (!forecastAnchor || !displayTargetWeight) return false;
    return forecastAnchor.weight <= displayTargetWeight;
  }, [forecastAnchor, displayTargetWeight]);

  // Generate forecast data points if we have a target weight
  const forecastData = useMemo(() => {
    if (!forecastAnchor || !displayTargetWeight || !currentPeriod.projectedEndDate) {
      return [];
    }
    if (targetReached) {
      return [];
    }

    const projectedEndDate = currentPeriod.projectedEndDate ?
      new Date(currentPeriod.projectedEndDate) : undefined;

    // Use the smoothed anchor (not the raw latest weigh-in) so an outlier
    // reading doesn't warp the trajectory.
    const forecast = generateForecastPoints(
      forecastAnchor,
      displayTargetWeight,
      projectedEndDate,
      currentPeriod.weightLossPerWeek
    );
    
    // Ensure the forecast includes the target weight point at the projected end date
    const lastPoint = forecast.length > 0 ? forecast[forecast.length - 1] : null;
    if (lastPoint && (Math.abs(lastPoint.weight - displayTargetWeight) > 0.1 || 
        Math.abs(lastPoint.date.getTime() - projectedEndDate.getTime()) > 24 * 60 * 60 * 1000)) {
      forecast.push({
        date: new Date(projectedEndDate),
        weight: displayTargetWeight,
        isForecast: true
      });
    }
    
    return forecast;
  }, [forecastAnchor, targetReached, displayTargetWeight, currentPeriod.projectedEndDate, currentPeriod.weightLossPerWeek]);
  
  // Combine actual and forecast data for the chart
  const combinedData = useMemo(() => {
    // Skip first forecast point as it duplicates last actual
    // But only if the dates match
    if (forecastData.length > 0 && processedData.length > 0) {
      const firstForecastDate = forecastData[0].date instanceof Date ? 
        forecastData[0].date.getTime() : new Date(forecastData[0].date).getTime();
      
      const lastActualDate = processedData[processedData.length - 1].date instanceof Date ?
        processedData[processedData.length - 1].date.getTime() : 
        new Date(processedData[processedData.length - 1].date).getTime();
      
      if (Math.abs(firstForecastDate - lastActualDate) < 24 * 60 * 60 * 1000) { // Within 24 hours
        return [...processedData, ...forecastData.slice(1)];
      }
    }
    
    return [...processedData, ...forecastData];
  }, [processedData, forecastData]);
  
  // Calculate min/max for y-axis
  const weights = useMemo(() => {
    return combinedData.map(d => d.weight);
  }, [combinedData]);
  
  const { minWeight, maxWeight } = useMemo(() => {
    return calculateWeightRange(weights, displayTargetWeight);
  }, [weights, displayTargetWeight]);
  
  // Define chart domain
  const startDate = useMemo(() => {
    const d = new Date(currentPeriod.startDate as any);
    const t = d.getTime();
    return Number.isFinite(t) ? t : Date.now();
  }, [currentPeriod.startDate]);
  
  const endDate = useMemo(() => {
    // Use the projected end date from the period
    const projectedDate = currentPeriod.projectedEndDate ? 
      new Date(currentPeriod.projectedEndDate as any) : 
      (currentPeriod.endDate ? 
        new Date(currentPeriod.endDate as any) : 
        addDays(new Date(), 30)); // 30 days from now if no end date
    const t = projectedDate.getTime();
    return Number.isFinite(t) ? t : addDays(new Date(), 30).getTime();
  }, [currentPeriod.projectedEndDate, currentPeriod.endDate]);

  return {
    processedData,
    forecastData,
    combinedData,
    minWeight,
    maxWeight,
    displayTargetWeight,
    startDate,
    endDate,
    forecastAnchor,
    targetReached,
  };
};
