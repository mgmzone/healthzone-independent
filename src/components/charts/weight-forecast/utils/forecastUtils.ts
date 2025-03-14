
import { WeighIn, Period } from '@/lib/types';
import { addDays, differenceInDays } from 'date-fns';

/**
 * Converts weight units between metric and imperial
 */
export const convertWeightUnits = (weight: number, isImperial: boolean): number => {
  return isImperial ? weight * 2.20462 : weight;
};

/**
 * Creates a data point for the chart
 */
export const createChartDataPoint = (
  date: Date,
  weight: number,
  isActual: boolean = true,
  isForecast: boolean = false
) => {
  return {
    date,
    weight,
    isActual,
    isForecast
  };
};

/**
 * Calculates a realistic daily weight change rate based on current data
 */
export const calculateRealisticWeightChangeRate = (
  avgDailyChange: number,
  isImperial: boolean
): number => {
  // Set realistic limits for weight loss/gain (in pounds or kg per day)
  // For weight loss: max 2 pounds per week = ~0.286 pounds per day
  // For weight gain: max 1 pound per week = ~0.143 pounds per day
  const maxDailyLoss = isImperial ? 0.286 : 0.13; // 0.13 kg is ~0.286 pounds
  const maxDailyGain = isImperial ? 0.143 : 0.065; // 0.065 kg is ~0.143 pounds
  
  // Apply realistic limits
  if (avgDailyChange < 0) {
    // Weight loss case
    return Math.max(avgDailyChange, -maxDailyLoss);
  } else {
    // Weight gain case
    return Math.min(avgDailyChange, maxDailyGain);
  }
};

/**
 * Determines if the target weight goal direction is compatible with current trend
 */
export const isGoalDirectionCompatible = (
  isWeightLoss: boolean,
  targetWeight: number | null,
  currentWeight: number
): boolean => {
  if (targetWeight === null) return true;
  
  const isTargetLower = targetWeight < currentWeight;
  
  // If the trend is opposite from the target goal, consider it incompatible
  return !(
    (isWeightLoss && !isTargetLower) || // losing weight but goal is to gain
    (!isWeightLoss && isTargetLower)     // gaining weight but goal is to lose
  );
};

/**
 * Gets weight trend data points for the chart (min and max)
 * Ensures the y-axis starts at target weight and ends at starting weight
 */
export const getWeightRangeFromData = (weights: number[]): { minWeight: number; maxWeight: number } => {
  if (weights.length === 0) {
    return { minWeight: 0, maxWeight: 0 };
  }
  
  let minWeight = Math.min(...weights);
  let maxWeight = Math.max(...weights);
  
  // Add some padding to min and max for better visualization
  minWeight = Math.floor(minWeight - 1);
  maxWeight = Math.ceil(maxWeight + 1);
  
  return { minWeight, maxWeight };
};
