
import { isGoalDirectionCompatible, calculateRealisticWeightChangeRate } from './forecastUtils';

/**
 * Calculates the weight change rate for the forecast model
 */
export const calculateForecastRate = (
  firstPoint: any,
  lastPoint: any,
  daysElapsed: number,
  isImperial: boolean
) => {
  // Calculate the average daily weight change based on actual data
  let totalWeightChange = lastPoint.weight - firstPoint.weight;
  let avgDailyChange = totalWeightChange / daysElapsed;
  
  // Calculate weekly rate from daily rate
  let initialWeeklyRate = Math.abs(avgDailyChange * 7);
  
  // Apply realistic limits to the calculated weight change rate
  avgDailyChange = calculateRealisticWeightChangeRate(avgDailyChange, isImperial);
  
  console.log('Rate calculations:', {
    firstPointDate: firstPoint.date,
    firstPointWeight: firstPoint.weight,
    lastPointDate: lastPoint.date,
    lastPointWeight: lastPoint.weight,
    daysElapsed,
    totalWeightChange,
    avgDailyChange,
    initialWeeklyRate,
    isImperial
  });
  
  return {
    avgDailyChange,
    initialWeeklyRate,
    isWeightLoss: avgDailyChange < 0
  };
};

/**
 * Gets the sustainable rate based on measurement units
 */
export const getSustainableRate = (isImperial: boolean): number => {
  // Set sustainable rate based on units (daily rate)
  return isImperial ? 2.0 / 7 : 0.9 / 7; // Convert weekly to daily
};

/**
 * Checks if trend direction is compatible with the goal
 */
export const validateTrendDirection = (
  isWeightLoss: boolean,
  targetWeight: number | null,
  currentWeight: number
): boolean => {
  if (targetWeight === null) return true;
  return isGoalDirectionCompatible(isWeightLoss, targetWeight, currentWeight);
};
