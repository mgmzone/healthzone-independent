
import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { processWeighInData } from '../utils/weightDataProcessor';
import { generateForecastData } from '../utils/forecastGenerator';
import { generateTargetLine } from '../utils/targetLineGenerator';
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
    console.log('useWeightForecastData input:', {
      weighInsCount: weighIns.length,
      currentPeriod,
      isImperial,
      targetWeight
    });
    
    // Initial processing of weigh-in data
    const { chartData: actualData, hasValidData } = processWeighInData(
      weighIns, 
      currentPeriod, 
      isImperial
    );
    
    if (!hasValidData || !currentPeriod) {
      return {
        chartData: [],
        targetLine: [],
        minWeight: 0,
        maxWeight: 0,
        hasValidData: false
      };
    }
    
    // Convert target weight to proper display units if needed
    // Make sure we're using the target weight in the right units (lbs or kg)
    let displayTargetWeight = undefined;
    
    if (currentPeriod.targetWeight) {
      // If imperial, convert from kg to lbs, otherwise use as is
      displayTargetWeight = isImperial ? 
        currentPeriod.targetWeight * 2.20462 : 
        currentPeriod.targetWeight;
        
      console.log('Target weight conversion:', {
        originalTarget: currentPeriod.targetWeight,
        displayTargetWeight,
        isImperial
      });
    }
    
    // Generate the target line based on the period's settings
    const targetLine = generateTargetLine(
      currentPeriod,
      isImperial,
      displayTargetWeight
    );
    
    // Generate forecast data based on actual data
    const periodEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
    const forecastData = generateForecastData(
      actualData,
      periodEndDate,
      displayTargetWeight,
      isImperial,
      currentPeriod.weightLossPerWeek
    );
    
    // Combine actual and forecast data
    const combinedData = combineChartData(actualData, forecastData);
    
    // Calculate min and max weights for y-axis based on target, actual, and forecast data
    const allWeights = [
      ...combinedData.map(item => item.weight),
      ...targetLine.map(item => item.weight)
    ];
    
    const { minWeight, maxWeight } = getWeightRangeFromData(allWeights, displayTargetWeight);
    
    console.log('useWeightForecastData output:', {
      actualDataCount: actualData.length,
      forecastDataCount: forecastData.length,
      combinedDataCount: combinedData.length,
      targetLineCount: targetLine.length,
      displayTargetWeight,
      minWeight,
      maxWeight
    });

    return {
      chartData: combinedData,
      targetLine,
      forecastData,
      minWeight,
      maxWeight,
      hasValidData: true
    };
  }, [weighIns, currentPeriod, isImperial, targetWeight]);
};
