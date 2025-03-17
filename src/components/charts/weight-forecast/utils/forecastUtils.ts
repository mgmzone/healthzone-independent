
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
    return { minWeight: 0, maxWeight: 100 }; // Default range
  }
  
  // Include target weight in range calculation if provided
  const allWeights = targetWeight ? [...validWeights, targetWeight] : validWeights;
  
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  
  // Ensure there's always space at the top and bottom of the chart (10% padding)
  const range = max - min;
  const padding = Math.max(range * 0.1, 5); // At least 5 units of padding
  
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

/**
 * Checks if the current weight change direction is compatible with the goal direction
 */
export const isGoalDirectionCompatible = (
  isWeightLoss: boolean,
  targetWeight: number,
  currentWeight: number
): boolean => {
  // For weight loss goals, current weight should be higher than target
  if (isWeightLoss) {
    return currentWeight > targetWeight;
  }
  // For weight gain goals, current weight should be lower than target
  return currentWeight < targetWeight;
};

/**
 * Applies realistic limits to calculated weight change rates
 */
export const calculateRealisticWeightChangeRate = (
  dailyChangeRate: number,
  isImperial: boolean
): number => {
  // Convert limit based on measurement units
  // Maximum recommended weight loss per week: ~2 lbs or ~0.9 kg
  const maxWeeklyChange = isImperial ? 2.0 : 0.9;
  const maxDailyChange = maxWeeklyChange / 7;
  
  // If this is weight loss (negative rate), cap at recommended max
  if (dailyChangeRate < 0) {
    return Math.max(dailyChangeRate, -maxDailyChange);
  }
  // If this is weight gain (positive rate), cap at recommended max
  else {
    return Math.min(dailyChangeRate, maxDailyChange);
  }
};
