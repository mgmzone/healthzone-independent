
/**
 * Calculate the percentage of progress towards weight loss goal
 */
export const calculateProgressPercentage = (
  startingWeight: number | undefined,
  currentWeight: number | undefined,
  targetWeight: number | undefined
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
  
  // If current weight is above starting weight, progress is 0%
  if (lostSoFar < 0) return 0;
  
  const percentage = (lostSoFar / totalToLose) * 100;
  
  console.log('Progress calculation:', {
    startingWeight,
    currentWeight,
    targetWeight,
    totalToLose,
    lostSoFar,
    percentage
  });
  
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
};

/**
 * Calculate total weight loss (difference between starting and current weight)
 * Positive value means weight loss, negative means weight gain
 * All values are expected to be in kg
 */
export const calculateTotalWeightLoss = (
  startingWeight: number | undefined,
  currentWeight: number | undefined
): number | null => {
  // If either value is missing, we can't calculate
  if (!startingWeight || !currentWeight) return null;
  
  // Return the raw difference - positive means loss, negative means gain
  const weightLoss = startingWeight - currentWeight;
  console.log('Total weight loss calc:', { startingWeight, currentWeight, weightLoss });
  return weightLoss;
};

/**
 * Calculate target loss (difference between starting weight and target weight)
 * All values are expected to be in kg
 */
export const calculateTargetLoss = (
  startingWeight: number | undefined,
  targetWeight: number | undefined
): number | null => {
  if (!startingWeight || !targetWeight) return null;
  
  return startingWeight - targetWeight;
};
