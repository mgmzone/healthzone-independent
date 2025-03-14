
import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { processWeighInData } from '../utils/weightDataProcessor';
import { generateForecastData } from '../utils/forecastGenerator';
import { getWeightRangeFromData } from '../utils/forecastUtils';
import { combineChartData } from '../utils/weightDataProcessor';

/**
 * Hook that processes weight data and generates forecast data for the weight chart
 */
export const useWeightForecastData = (
  weighIns: WeighIn[],
  currentPeriod: Period | undefined,
  isImperial: boolean,
  targetWeight?: number
) => {
  return useMemo(() => {
    // Initial processing of weigh-in data
    const { chartData: actualData, hasValidData } = processWeighInData(
      weighIns, 
      currentPeriod, 
      isImperial
    );
    
    if (!hasValidData || !currentPeriod) {
      return {
        chartData: [],
        forecastData: [],
        minWeight: 0,
        maxWeight: 0,
        hasValidData: false
      };
    }
    
    // Generate forecast data based on actual data
    const periodEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
    const forecastData = generateForecastData(
      actualData,
      periodEndDate,
      targetWeight,
      isImperial,
      currentPeriod.weightLossPerWeek // Pass the period's weight loss per week
    );
    
    // Combine actual and forecast data
    const combinedData = combineChartData(actualData, forecastData);
    
    // Calculate min and max weights for y-axis
    const allWeights = combinedData.map(item => item.weight);
    const { minWeight, maxWeight } = getWeightRangeFromData(allWeights);

    return {
      chartData: combinedData,
      forecastData,
      minWeight,
      maxWeight,
      hasValidData: true
    };
  }, [weighIns, currentPeriod, isImperial, targetWeight]);
};
