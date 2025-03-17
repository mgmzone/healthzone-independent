
/**
 * Utility functions for smoothing the forecast curve
 */

/**
 * Calculate a gentler curve factor for forecast transitions
 */
export const calculateCurveFactor = (progressPercent: number): number => {
  // Higher exponent creates a more gradual approach to the target
  // Using 0.35 instead of 0.4 makes the curve even more gradual
  return Math.pow(progressPercent, 0.35);
};

/**
 * Apply additional smoothing as we approach the end of the forecast
 */
export const calculateEndingFactor = (progressPercent: number): number => {
  // Only apply when we're more than 70% through the timeline (extended from 80%)
  if (progressPercent <= 0.7) return 1.0;
  
  // Calculate how close we are to the end (0 to 1, where 1 is at the end date)
  const endProximity = (progressPercent - 0.7) / 0.3;
  
  // Apply smoother curve for the ending
  return 1 - Math.pow(endProximity, 2.5);
};

/**
 * Calculate an adjusted daily rate based on progress and curve factors
 */
export const calculateAdjustedDailyRate = (
  initialDailyRate: number,
  finalSustainableRate: number,
  progressPercent: number
): number => {
  const curveFactor = calculateCurveFactor(progressPercent);
  const endingFactor = calculateEndingFactor(progressPercent);
  
  // Apply a more gradual curve for the entire forecast
  let adjustedRate = initialDailyRate - 
    ((initialDailyRate - finalSustainableRate) * curveFactor);
  
  // Apply additional smoothing in the final portion
  if (progressPercent > 0.7) {
    // Further reduce rate as we approach the target date
    // This creates an extremely gentle final approach
    adjustedRate *= endingFactor;
  }
  
  return adjustedRate;
};
