
/**
 * Utility functions for smoothing the forecast curve
 */

/**
 * Calculate a gentler curve factor for forecast transitions
 */
export const calculateCurveFactor = (progressPercent: number): number => {
  // Even higher exponent (0.3) creates an extremely gradual approach to the target
  // The lower the exponent, the more gradual the curve
  return Math.pow(progressPercent, 0.3);
};

/**
 * Apply additional smoothing as we approach the end of the forecast
 */
export const calculateEndingFactor = (progressPercent: number): number => {
  // Only apply when we're more than 60% through the timeline (extended from 70%)
  if (progressPercent <= 0.6) return 1.0;
  
  // Calculate how close we are to the end (0 to 1, where 1 is at the end date)
  const endProximity = (progressPercent - 0.6) / 0.4;
  
  // Apply smoother curve for the ending using cubic function for more gradual approach
  return 1 - Math.pow(endProximity, 3.0);
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
  if (progressPercent > 0.6) {
    // Further reduce rate as we approach the target date
    // This creates an extremely gentle final approach
    adjustedRate *= endingFactor;
    
    // Add an additional rate reduction factor as we get very close to the end
    if (progressPercent > 0.9) {
      // Apply super-gradual approach in the last 10%
      const finalApproachFactor = 1 - Math.pow((progressPercent - 0.9) / 0.1, 2) * 0.5;
      adjustedRate *= finalApproachFactor;
    }
  }
  
  return adjustedRate;
};
