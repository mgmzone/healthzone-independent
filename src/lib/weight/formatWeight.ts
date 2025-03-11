
/**
 * Utility functions for formatting weight values
 */

/**
 * Formats a weight value to consistently have one decimal place
 */
export const formatWeightValue = (value: number): string => {
  return value.toFixed(1);
};

/**
 * Formats a weight with appropriate unit label
 */
export const formatWeightWithUnit = (value: number, isImperial: boolean): string => {
  const unit = isImperial ? 'lbs' : 'kg';
  return `${formatWeightValue(value)} ${unit}`;
};
