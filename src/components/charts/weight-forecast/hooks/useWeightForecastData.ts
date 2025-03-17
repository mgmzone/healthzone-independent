
import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { calculateWeightRange } from '../../weightForecastUtils';
import { generateForecastPoints } from '../utils/forecastGenerator';

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
  
  // Get the last actual weigh-in for forecasting
  const lastWeighIn = useMemo(() => {
    if (processedData.length === 0) return null;
    return processedData[processedData.length - 1];
  }, [processedData]);
  
  // Convert target weight to display units if needed
  const displayTargetWeight = useMemo(() => {
    return targetWeight !== undefined ? 
      targetWeight : 
      (currentPeriod.targetWeight ? 
        (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight) : 
        undefined);
  }, [targetWeight, currentPeriod.targetWeight, isImperial]);
  
  // Generate forecast data points if we have a target weight
  const forecastData = useMemo(() => {
    if (!lastWeighIn || !displayTargetWeight || !currentPeriod.projectedEndDate) {
      return [];
    }
    
    const projectedEndDate = currentPeriod.projectedEndDate ? 
      new Date(currentPeriod.projectedEndDate) : undefined;
    
    console.log('Generating forecast data with:', {
      lastWeighInDate: lastWeighIn.date.toISOString(),
      lastWeighInWeight: lastWeighIn.weight,
      displayTargetWeight,
      projectedEndDate: projectedEndDate?.toISOString(),
      weightLossPerWeek: currentPeriod.weightLossPerWeek
    });
    
    return generateForecastPoints(
      lastWeighIn,
      displayTargetWeight,
      projectedEndDate,
      currentPeriod.weightLossPerWeek
    );
  }, [lastWeighIn, displayTargetWeight, currentPeriod.projectedEndDate, currentPeriod.weightLossPerWeek]);
  
  // Combine actual and forecast data for the chart
  const combinedData = useMemo(() => {
    return [...processedData, ...forecastData.slice(1)]; // Skip first forecast point as it duplicates last actual
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
    return new Date(currentPeriod.startDate).getTime();
  }, [currentPeriod.startDate]);
  
  const endDate = useMemo(() => {
    // Ensure there's enough room at the end of the chart by adding 15 days
    const projectedDate = currentPeriod.projectedEndDate ? 
      new Date(currentPeriod.projectedEndDate) : 
      (currentPeriod.endDate ? 
        new Date(currentPeriod.endDate) : 
        addDays(new Date(), 30)); // 30 days from now if no end date
    
    return projectedDate.getTime();
  }, [currentPeriod.projectedEndDate, currentPeriod.endDate]);

  return {
    processedData,
    forecastData,
    combinedData,
    minWeight,
    maxWeight,
    displayTargetWeight,
    startDate,
    endDate
  };
};
