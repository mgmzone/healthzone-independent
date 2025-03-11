
/**
 * Utility functions for weight unit conversion
 */

/**
 * Converts weight between metric (kg) and imperial (lbs) units
 */
export const convertWeight = (weight: number, isImperial: boolean): number => {
  if (!weight) return 0;
  return isImperial ? weight * 2.20462 : weight;
};

/**
 * Converts weight from display units (kg/lbs) back to metric (kg) for storage
 */
export const convertToMetric = (weight: number, isImperial: boolean): number => {
  if (!weight) return 0;
  return isImperial ? weight / 2.20462 : weight;
};
