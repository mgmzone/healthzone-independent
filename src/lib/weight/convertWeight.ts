
/**
 * Utility functions for weight unit conversion
 */

/**
 * Converts weight from metric (kg) to imperial (lbs) or leaves as is if already in the correct unit
 * 
 * @param weight - Weight value in kg
 * @param isImperial - Whether to convert to imperial (lbs)
 * @returns Weight value in the requested unit
 */
export const convertWeight = (weight: number, isImperial: boolean): number => {
  if (!weight) return 0;
  return isImperial ? weight * 2.20462 : weight;
};

/**
 * Converts weight from display units (kg/lbs) back to metric (kg) for storage
 * 
 * @param weight - Weight value in display units
 * @param isImperial - Whether the input is in imperial (lbs)
 * @returns Weight value in metric (kg)
 */
export const convertToMetric = (weight: number, isImperial: boolean): number => {
  if (!weight) return 0;
  return isImperial ? weight / 2.20462 : weight;
};
