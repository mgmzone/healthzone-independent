
/**
 * Utility functions for smoothing the forecast curve
 */

/**
 * Calculate a gentler curve factor for forecast transitions
 */
export const calculateCurveFactor = (progressPercent: number): number => {
  // Higher exponent creates a more gradual approach to the target
  // Using 0.4 instead of 0.5 makes the curve even more gradual
  return Math.pow(progressPercent, 0.4);
};

/**
 * Apply additional smoothing as we approach the end of the forecast
 */
export const calculateEndingFactor = (progressPercent: number): number => {
  // Only apply when we're more than 80% through the timeline
  if (progressPercent <= 0.8) return 1.0;
  
  // Calculate how close we are to the end (0 to 1, where 1 is at the end date)
  const endProximity = (progressPercent - 0.8) / 0.2;
  
  // Apply sigmoid-like curve for very smooth ending
  // This creates an elegant taper as we approach the target
  return 1 - (endProximity * endProximity);
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
  
  // Apply sigmoid-like curve for very smooth ending
  if (progressPercent > 0.8) {
    const endProximity = (progressPercent - 0.8) / 0.2;
    
    // Reduce rate as we approach the target date
    return (initialDailyRate - 
      ((initialDailyRate - finalSustainableRate) * curveFactor) - 
      (finalSustainableRate * endProximity * 0.8)) * endingFactor; // Additional slowdown factor
  } 
  
  // Normal curve for most of the forecast
  return initialDailyRate - ((initialDailyRate - finalSustainableRate) * curveFactor);
};
