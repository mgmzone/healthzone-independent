
/**
 * Utilities for calculating the curve and rate adjustments for weight forecasts
 */
import { calculateAdjustedDailyRate } from '../curveCalculator';

/**
 * Calculate the initial daily rate based on user data and realistic constraints
 */
export const calculateInitialDailyRate = (
  currentWeight: number, 
  totalWeightChange: number, 
  daysToProjectedEnd: number,
  weightLossPerWeek?: number
): number => {
  let dailyRate;
  
  // Use the provided weekly rate if available, otherwise calculate based on end date
  if (weightLossPerWeek && weightLossPerWeek > 0) {
    dailyRate = weightLossPerWeek / 7;
  } else {
    // Base rate calculation - this is a starting point, we'll adjust it with a curve
    dailyRate = totalWeightChange / daysToProjectedEnd;
  }
  
  // Cap the initial daily rate to realistic values (0.1% - 0.5% of current weight per day)
  const minRate = currentWeight * 0.001; // 0.1% daily
  const maxRate = currentWeight * 0.005; // 0.5% daily
  
  // Return capped daily rate
  return Math.max(minRate, Math.min(dailyRate, maxRate));
};

/**
 * Determine if the forecast needs rate adjustment to hit target date
 */
export const needsRateAdjustment = (
  totalWeightChange: number,
  initialDailyRate: number,
  daysToProjectedEnd: number,
  isWeightLoss: boolean
): boolean => {
  // Calculate days needed to reach target based on the actual rate
  const actualDaysToTarget = isWeightLoss ? 
    Math.ceil(totalWeightChange / (initialDailyRate * 0.8)) : // Loss slows down, so more days needed
    Math.ceil(totalWeightChange / initialDailyRate);
    
  // Return true if we might not reach target by the projected date with our rate
  return actualDaysToTarget > daysToProjectedEnd;
};

/**
 * Calculate the effective daily rate based on whether we need to adjust
 */
export const calculateEffectiveDailyRate = (
  totalWeightChange: number,
  daysToProjectedEnd: number,
  initialDailyRate: number,
  rateNeedsAdjustment: boolean
): number => {
  return rateNeedsAdjustment ? 
    (totalWeightChange / daysToProjectedEnd) * 1.1 : // 10% buffer to ensure we get there
    initialDailyRate;
};

/**
 * Apply the daily weight change for a segment
 */
export const applyDailyChange = (
  currentWeight: number,
  adjustedDailyRate: number,
  daysPerPoint: number,
  targetWeight: number,
  isWeightLoss: boolean
): number => {
  let newWeight;
  
  if (isWeightLoss) {
    newWeight = currentWeight - (adjustedDailyRate * daysPerPoint);
    // Ensure we don't go below target weight
    return Math.max(newWeight, targetWeight);
  } else {
    newWeight = currentWeight + (adjustedDailyRate * daysPerPoint);
    // Ensure we don't go above target weight
    return Math.min(newWeight, targetWeight);
  }
};
