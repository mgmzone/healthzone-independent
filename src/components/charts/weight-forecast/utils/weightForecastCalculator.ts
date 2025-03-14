
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, differenceInWeeks } from 'date-fns';
import { ProjectionResult } from './types';
import { processWeeklyData } from './dataProcessor';
import { calculateWeightProjection } from './weightLossCalculator';

/**
 * Calculate chart data including projections
 */
export const calculateChartData = (
  weighIns: WeighIn[], 
  currentPeriod: Period | undefined, 
  isImperial: boolean
): ProjectionResult => {
  if (!currentPeriod || weighIns.length === 0) {
    return { chartData: [], targetDate: null };
  }
  
  const startDate = new Date(currentPeriod.startDate);
  const endDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : addWeeks(new Date(), 12); // Default 12 weeks if no end date
  
  // Initially, we'll set up for a projection that could go as far as the period end date
  // plus some additional weeks for reasonable extrapolation
  const maxInitialProjectionDate = addWeeks(endDate, 12); // Extend past period end date initially
  const totalWeeks = differenceInWeeks(maxInitialProjectionDate, startDate) + 1;
  
  // Convert target weight to display units (kg to lbs if imperial)
  const targetWeight = isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight;
  
  // Process the weekly weight data
  const weeklyData = processWeeklyData(
    weighIns,
    currentPeriod,
    startDate,
    totalWeeks,
    isImperial
  );
  
  // Calculate projections using the processed data
  return calculateWeightProjection(
    weeklyData,
    isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
    targetWeight,
    startDate,
    totalWeeks,
    isImperial
  );
};
