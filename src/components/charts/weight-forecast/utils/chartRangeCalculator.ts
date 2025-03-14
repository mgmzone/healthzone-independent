
import { WeeklyWeightData } from './types';

/**
 * Calculates appropriate min and max weight values for chart display
 */
export const calculateWeightRange = (
  chartData: WeeklyWeightData[],
  targetWeight: number
): { minWeight: number; maxWeight: number } => {
  if (chartData.length === 0) {
    return { minWeight: 0, maxWeight: 0 };
  }

  // Find min and max weights in the data
  let minDataWeight = Number.MAX_VALUE;
  let maxDataWeight = Number.MIN_VALUE;

  chartData.forEach(data => {
    minDataWeight = Math.min(minDataWeight, data.weight);
    maxDataWeight = Math.max(maxDataWeight, data.weight);
  });

  // Consider the target weight when calculating the range
  minDataWeight = Math.min(minDataWeight, targetWeight);
  maxDataWeight = Math.max(maxDataWeight, targetWeight);

  // Add a buffer of 5% on each side for better visualization
  const range = maxDataWeight - minDataWeight;
  const buffer = Math.max(range * 0.05, 1); // At least 1 unit buffer
  
  // Round the min and max to more aesthetically pleasing numbers
  // For the min, round down to the nearest multiple of 10 or 5
  // For the max, round up to the nearest multiple of 10 or 5
  const roundedMin = Math.floor((minDataWeight - buffer) / 5) * 5;
  const roundedMax = Math.ceil((maxDataWeight + buffer) / 5) * 5;

  return {
    minWeight: roundedMin,
    maxWeight: roundedMax
  };
};
