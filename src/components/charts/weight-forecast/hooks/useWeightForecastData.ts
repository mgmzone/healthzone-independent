
import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { format, addDays } from 'date-fns';
import { calculateWeightRange } from '../utils/weightRangeCalculator';
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
  // Process data - convert to display format with proper units
  const processedData = useMemo(() => {
    return weighIns
      .map(weighIn => {
        // Convert weight to display units if needed
        const displayWeight = isImperial ? 
          weighIn.weight * 2.20462 : weighIn.weight;
        
        return {
          date: new Date(weighIn.date).getTime(),
          weight: displayWeight,
          isActual: true,
          isForecast: false,
          formattedDate: format(new Date(weighIn.date), 'MMM d')
        };
      })
      .sort((a, b) => a.date - b.date); // Sort by date, oldest first
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
      lastWeighInDate: new Date(lastWeighIn.date).toISOString(),
      lastWeighInWeight: lastWeighIn.weight,
      displayTargetWeight,
      projectedEndDate: projectedEndDate?.toISOString(),
      weightLossPerWeek: currentPeriod.weightLossPerWeek
    });
    
    // For forecast generator, convert numeric timestamps back to Date objects
    const lastWeighInWithDateObj = {
      ...lastWeighIn,
      date: new Date(lastWeighIn.date)
    };
    
    // Use the same forecast generator that the calculation service uses
    const forecast = generateForecastPoints(
      lastWeighInWithDateObj,
      displayTargetWeight,
      projectedEndDate,
      currentPeriod.weightLossPerWeek
    );
    
    // Convert Date objects to timestamps for chart consumption
    return forecast.map(point => ({
      ...point,
      date: point.date.getTime()
    }));
  }, [lastWeighIn, displayTargetWeight, currentPeriod.projectedEndDate, currentPeriod.weightLossPerWeek]);
  
  // Combine actual and forecast data for the chart
  const combinedData = useMemo(() => {
    // Skip first forecast point as it duplicates last actual
    // But only if the dates match
    if (forecastData.length > 0 && processedData.length > 0) {
      const firstForecastDate = forecastData[0].date;
      const lastActualDate = processedData[processedData.length - 1].date;
      
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
    return new Date(currentPeriod.startDate).getTime();
  }, [currentPeriod.startDate]);
  
  const endDate = useMemo(() => {
    // Use the projected end date from the period
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
