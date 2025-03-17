
import { addDays } from 'date-fns';

/**
 * Create a standardized chart data point
 */
export const createChartDataPoint = (
  date: Date,
  weight: number,
  isActual: boolean = false,
  isForecast: boolean = false
) => {
  return {
    date: date.getTime(), // Use timestamp for better charting
    weight,
    isActual,
    isForecast
  };
};

/**
 * Calculate the min and max weight range for the chart
 */
export const getWeightRangeFromData = (weights: number[], targetWeight?: number) => {
  // Filter out any invalid weights
  const validWeights = weights.filter(w => w !== null && w !== undefined && !isNaN(w));
  
  if (validWeights.length === 0) {
    return { minWeight: 0, maxWeight: 0 };
  }
  
  // Include target weight in range calculation if provided
  const allWeights = targetWeight ? [...validWeights, targetWeight] : validWeights;
  
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  
  // Ensure there's always space at the top and bottom of the chart (5% padding)
  const range = max - min;
  const padding = range * 0.05;
  
  // Round values nicely
  const minWeight = Math.floor(min - padding);
  const maxWeight = Math.ceil(max + padding);
  
  console.log('Weight range calculation:', { 
    min, max, range, padding, minWeight, maxWeight,
    weightsCount: validWeights.length,
    targetWeight
  });
  
  return { minWeight, maxWeight };
};

/**
 * Format a date for display on the chart
 */
export const formatChartDate = (date: Date | string | number): string => {
  if (!date) return 'Unknown';
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric'
  }).format(dateObj);
};
