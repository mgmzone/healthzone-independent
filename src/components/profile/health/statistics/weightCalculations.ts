
import { convertWeight } from '@/lib/weight/convertWeight';

/**
 * Calculate the percentage of progress towards weight loss goal
 */
export const calculateProgressPercentage = (
  startingWeight: number | undefined,
  currentWeight: number | undefined,
  targetWeight: number | undefined,
  isImperial: boolean
): number | null => {
  if (!startingWeight || !currentWeight || !targetWeight) {
    return null;
  }
  
  // Calculate total weight to lose
  const totalToLose = startingWeight - targetWeight;
  
  // Calculate weight lost so far
  const lostSoFar = startingWeight - currentWeight;
  
  // Calculate percentage of progress
  if (totalToLose <= 0) return 0; // Prevent division by zero or negative values
  
  const percentage = (lostSoFar / totalToLose) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
};

/**
 * Calculate total weight loss (difference between starting and current weight)
 * Positive value means weight loss, negative means weight gain
 */
export const calculateTotalWeightLoss = (
  startingWeight: number | undefined,
  currentWeight: number | undefined
): number | null => {
  // If either value is missing, we can't calculate
  if (!startingWeight || !currentWeight) return null;
  
  // Simply return the raw difference
  return startingWeight - currentWeight;
};

/**
 * Calculate target loss (difference between starting weight and target weight)
 */
export const calculateTargetLoss = (
  startingWeight: number | undefined,
  targetWeight: number | undefined,
  isImperial: boolean
): number | null => {
  if (!startingWeight || !targetWeight) return null;
  
  return Math.abs(startingWeight - targetWeight);
};
