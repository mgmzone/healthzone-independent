
/**
 * Utility functions for formatting weight values
 */
import { convertWeight } from './convertWeight';

/**
 * Formats a weight value to consistently have one decimal place
 */
export const formatWeightValue = (value: number): string => {
  if (value === undefined || value === null) return '0.0';
  return value.toFixed(1);
};

/**
 * Formats a weight with appropriate unit label
 * 
 * @param value - Weight in kg
 * @param isImperial - Whether to convert and display in imperial (lbs)
 */
export const formatWeightWithUnit = (value: number, isImperial: boolean): string => {
  if (value === undefined || value === null) return '0.0 ' + (isImperial ? 'lbs' : 'kg');
  
  // Convert the value if needed (all values coming in are in kg)
  const displayValue = isImperial ? convertWeight(value, true) : value;
  const unit = isImperial ? 'lbs' : 'kg';
  return `${formatWeightValue(displayValue)} ${unit}`;
};

/**
 * Formats weight for display with proper unit conversion
 * All weights stored in the database are in kg, so we need to convert to lbs if isImperial is true
 */
export const formatWeightForDisplay = (weight: number | undefined, isImperial: boolean): string => {
  if (weight === undefined || weight === null) return '';
  
  // Convert from kg to lbs if needed
  const convertedValue = isImperial ? convertWeight(weight, true) : weight;
  return formatWeightValue(convertedValue);
};

/**
 * Formats weight difference (can be positive or negative)
 */
export const formatWeightDifference = (
  difference: number | undefined, 
  isImperial: boolean
): string => {
  if (difference === undefined || difference === null) return '';
  
  // Convert difference to imperial if needed
  const convertedDiff = isImperial ? convertWeight(difference, true) : difference;
  const prefix = convertedDiff > 0 ? '+' : '';
  return `${prefix}${formatWeightValue(convertedDiff)}`;
};
