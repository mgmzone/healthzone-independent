
/**
 * Utility functions for smoothing the forecast curve
 */

/**
 * Calculate a gentler curve factor for forecast transitions
 */
export const calculateCurveFactor = (progressPercent: number): number => {
  // Using a custom curve that maintains initial rate longer then gradually slows
  if (progressPercent < 0.7) {
    // Maintain a more consistent rate for the first 70% of the journey
    return progressPercent * 0.5; // Slower progression rate
  } else {
    // Apply stronger tapering in the final 30%
    return 0.35 + (progressPercent - 0.7) * 2.0; // Accelerated tapering
  }
};

/**
 * Apply additional smoothing as we approach the end of the forecast
 */
export const calculateEndingFactor = (progressPercent: number): number => {
  // Only apply when we're in the final quarter of the timeline
  if (progressPercent <= 0.75) return 1.0;
  
  // Calculate how close we are to the end (0 to 1, where 1 is at the end date)
  const endProximity = (progressPercent - 0.75) / 0.25;
  
  // Apply smoother curve for the ending using cubic function for more gradual approach
  return 1 - Math.pow(endProximity, 2.5);
};

/**
 * Calculate an adjusted daily rate based on progress and curve factors
 * This matches the logic in usePeriodCalculations.ts:
 * - First 80% uses the calculated rate with gentle tapering
 * - Last 20% tapers down to the sustainable rate (1 lb per week)
 */
export const calculateAdjustedDailyRate = (
  initialDailyRate: number,
  finalSustainableRate: number,
  progressPercent: number
): number => {
  // First 80% uses the calculated rate with gentle tapering
  if (progressPercent <= 0.8) {
    // Calculate mild tapering for most of the forecast
    const taperFactor = 1 - (progressPercent * 0.2); // Reduce by up to 20%
    return initialDailyRate * taperFactor;
  } 
  
  // Last 20% tapers down to the sustainable rate (1 lb per week)
  const taperedProgressPercent = (progressPercent - 0.8) / 0.2; // 0 to 1 in last 20%
  const endingRate = initialDailyRate * 0.8; // Rate at 80% mark
  
  // Linear transition from 80% mark rate to the final sustainable rate
  return endingRate - ((endingRate - finalSustainableRate) * taperedProgressPercent);
};
