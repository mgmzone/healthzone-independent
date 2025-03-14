
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
  
  // Convert weights to the same unit system if needed
  const convertedStartingWeight = isImperial ? startingWeight : startingWeight;
  const convertedCurrentWeight = isImperial ? currentWeight : currentWeight;
  const convertedTargetWeight = isImperial ? (targetWeight * 2.20462) : targetWeight;
  
  // Calculate total weight to lose
  const totalToLose = convertedStartingWeight - convertedTargetWeight;
  
  // Calculate weight lost so far
  const lostSoFar = convertedStartingWeight - convertedCurrentWeight;
  
  // Calculate percentage of progress
  if (totalToLose <= 0) return 0; // Prevent division by zero or negative values
  
  const percentage = (lostSoFar / totalToLose) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
};

/**
 * Calculate total weight loss (difference between starting and current weight)
 */
export const calculateTotalWeightLoss = (
  startingWeight: number | undefined,
  currentWeight: number | undefined
): number | null => {
  if (!startingWeight || !currentWeight) return null;
  return Math.abs(startingWeight - currentWeight);
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
  
  const convertedTargetWeight = isImperial ? targetWeight * 2.20462 : targetWeight;
  return Math.abs(startingWeight - convertedTargetWeight);
};
