
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
 */
export const formatWeightWithUnit = (value: number, isImperial: boolean): string => {
  const convertedValue = isImperial ? convertWeight(value, true) : value;
  const unit = isImperial ? 'lbs' : 'kg';
  return `${formatWeightValue(convertedValue)} ${unit}`;
};

/**
 * Formats weight for display with proper unit conversion
 */
export const formatWeightForDisplay = (weight: number | undefined, isImperial: boolean): string => {
  if (weight === undefined || weight === null) return '';
  const convertedValue = isImperial ? convertWeight(weight, true) : weight;
  return formatWeightValue(convertedValue);
};
