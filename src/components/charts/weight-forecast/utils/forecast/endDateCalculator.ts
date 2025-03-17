
/**
 * Utilities for calculating end dates for weight forecasts
 */
import { addDays } from 'date-fns';

/**
 * Calculate a reasonable projected end date if one isn't provided
 */
export const calculateProjectedEndDate = (
  lastWeighInDate: Date,
  lastWeighInWeight: number,
  targetWeight: number,
  weightLossPerWeek?: number
): Date | null => {
  if (!weightLossPerWeek || weightLossPerWeek <= 0) {
    console.log('Cannot calculate projected end date without weightLossPerWeek');
    return null;
  }

  // Calculate a reasonable projected end date using the weight loss rate
  const totalWeightChange = Math.abs(lastWeighInWeight - targetWeight);
  const weeksNeeded = totalWeightChange / weightLossPerWeek;
  const daysNeeded = Math.ceil(weeksNeeded * 7) + 14; // Add 2 weeks buffer
  
  const projectedEndDate = addDays(lastWeighInDate, daysNeeded);
  console.log(`Calculated projected end date: ${projectedEndDate.toISOString()}`);
  
  return projectedEndDate;
};

/**
 * Calculate days between last weigh-in and projected end date
 */
export const calculateDaysToProjectedEnd = (
  lastWeighInDate: Date,
  projectedEndDate: Date
): number => {
  return Math.max(1, Math.round((projectedEndDate.getTime() - lastWeighInDate.getTime()) / (1000 * 60 * 60 * 24)));
};
