
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, differenceInWeeks } from 'date-fns';
import { ProjectionResult } from './types';
import { processWeeklyData, processDailyData } from './dataProcessor';
import { calculateWeightProjection } from './weightLossCalculator';

/**
 * Calculate chart data including projections
 */
export const calculateChartData = async (
  weighIns: WeighIn[], 
  currentPeriod: Period | undefined, 
  isImperial: boolean
): Promise<ProjectionResult> => {
  if (!currentPeriod || weighIns.length === 0) {
    console.warn('No period or weigh-ins available for chart data calculation');
    return { chartData: [], targetDate: null };
  }
  
  const startDate = new Date(currentPeriod.startDate);
  const endDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : addWeeks(new Date(), 12); // Default 12 weeks if no end date
  
  console.log('calculateChartData - Period start:', startDate);
  console.log('calculateChartData - Period end:', endDate);
  
  // Initially, we'll set up for a projection that could go as far as the period end date
  // plus some additional weeks for reasonable extrapolation
  const maxInitialProjectionDate = addWeeks(endDate, 4); // Extend past period end date by 4 weeks to ensure target date is visible
  const totalWeeks = differenceInWeeks(maxInitialProjectionDate, startDate) + 1;
  
  // Convert target weight to display units (kg to lbs if imperial)
  const targetWeight = isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight;
  
  // Process the daily weight data instead of weekly to get all recent weigh-ins
  const actualData = processDailyData(
    weighIns,
    currentPeriod,
    isImperial
  );
  
  console.log('calculateChartData - Actual data points:', actualData.length);
  
  // Calculate projections using the processed data
  const result = await calculateWeightProjection(
    actualData,
    isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
    targetWeight,
    startDate,
    totalWeeks,
    isImperial
  );
  
  console.log('calculateChartData - Projection result:', result.chartData.length, 'data points');
  
  return result;
};
