
// This file re-exports utility functions for backward compatibility
import { getWeighInsForPeriod } from './utils/dataProcessor';

// Simple function to calculate weight range for y-axis
export const calculateWeightRange = (
  weights: number[],
  targetWeight?: number
) => {
  const allWeights = targetWeight ? [...weights, targetWeight] : weights;
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  
  // Add some padding
  const minWeight = Math.floor(min - 1);
  const maxWeight = Math.ceil(max + 1);
  
  return { minWeight, maxWeight };
};

// Simple formatter for display
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

// Re-export the simplified functions
export { getWeighInsForPeriod as calculateChartData };

// Re-export types
export type { SimpleWeightData } from './utils/types';
export interface ProjectionResult {
  chartData: any[];
  targetDate: Date | null;
}
