
import { SimpleWeightData } from './weight-forecast/utils/types';

// Calculate weight range for y-axis with better padding and rounding
export const calculateWeightRange = (
  weights: number[],
  targetWeight?: number
) => {
  // Filter out any invalid weights
  const validWeights = weights.filter(w => w !== null && w !== undefined && !isNaN(w));
  
  if (validWeights.length === 0) {
    return { minWeight: 0, maxWeight: 100 }; // Default range for empty data
  }
  
  // Include target weight in range calculation if provided
  const allWeights = targetWeight ? [...validWeights, targetWeight] : validWeights;
  
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  
  // Ensure there's always space at the top and bottom of the chart (15% padding)
  const range = max - min;
  const padding = Math.max(range * 0.15, 5); // At least 5 units of padding
  
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

// Generate forecast data points from last actual weigh-in to target weight
// with a curved trend line that shows faster loss at the beginning
export const generateForecastPoints = (
  lastWeighIn: {date: Date, weight: number},
  targetWeight: number | undefined,
  projectedEndDate: Date | undefined,
  weightLossPerWeek?: number
) => {
  if (!lastWeighIn || !targetWeight || !projectedEndDate) {
    console.log('Missing data for forecast generation', { lastWeighIn, targetWeight, projectedEndDate });
    return [];
  }
  
  // Calculate days between last weigh-in and projected end date
  const daysToProjectedEnd = Math.max(1, Math.round((projectedEndDate.getTime() - lastWeighIn.date.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Determine if this is weight loss or gain
  const isWeightLoss = lastWeighIn.weight > targetWeight;
  
  // Calculate total weight change needed
  const totalWeightChange = Math.abs(lastWeighIn.weight - targetWeight);
  
  // Initialize variables for the curve generation
  let dailyRate;
  
  // Use the provided weekly rate if available, otherwise calculate based on end date
  if (weightLossPerWeek && weightLossPerWeek > 0) {
    dailyRate = weightLossPerWeek / 7;
  } else {
    // Base rate calculation - this is a starting point, we'll adjust it with a curve
    dailyRate = totalWeightChange / daysToProjectedEnd;
  }
  
  // Cap the initial daily rate to realistic values (0.1% - 0.5% of current weight per day)
  const minRate = lastWeighIn.weight * 0.001; // 0.1% daily
  const maxRate = lastWeighIn.weight * 0.005; // 0.5% daily
  
  // Initial daily rate (will be adjusted as we progress)
  const initialDailyRate = Math.max(minRate, Math.min(dailyRate, maxRate));
  
  // Final sustainable rate (lower than initial rate)
  // For imperial units (lbs), around 0.3 lbs per day (2 lbs per week)
  // For metric units (kg), around 0.14 kg per day (1 kg per week)
  const finalSustainableRate = initialDailyRate * 0.6; // 60% of initial rate as a sustainable target
  
  console.log('Forecast calculation:', {
    daysToProjectedEnd,
    isWeightLoss,
    totalWeightChange,
    initialDailyRate,
    finalSustainableRate,
    lastWeighInDate: lastWeighIn.date.toISOString().split('T')[0],
    lastWeighInWeight: lastWeighIn.weight,
    targetWeight,
    projectedEndDate: projectedEndDate.toISOString().split('T')[0]
  });
  
  // Generate forecast points
  const forecastPoints = [];
  let currentDate = new Date(lastWeighIn.date);
  let currentWeight = lastWeighIn.weight;
  
  // Start with the last actual data point
  forecastPoints.push({
    date: new Date(currentDate),
    weight: currentWeight,
    isForecast: true
  });
  
  // Generate points every 3 days for a smoother curve with more data points
  for (let day = 3; day <= daysToProjectedEnd; day += 3) {
    currentDate = new Date(lastWeighIn.date.getTime() + day * 24 * 60 * 60 * 1000);
    
    // Calculate progress percentage toward target (0 to 1)
    const progressPercent = day / daysToProjectedEnd;
    
    // Calculate adjusted rate using a curve function
    // This creates a more dramatic curve - faster at beginning, slower near end
    // The exponent (0.5) creates a "square root" curve - fast initial progress that slows down
    const curveFactor = Math.pow(progressPercent, 0.5);
    
    // Linear interpolation between initial and final rate based on curve
    const adjustedDailyRate = initialDailyRate - (initialDailyRate - finalSustainableRate) * curveFactor;
    
    // Apply the 3-day change
    if (isWeightLoss) {
      currentWeight -= adjustedDailyRate * 3; // 3 days of weight change
      // Stop if we've reached or passed the target
      if (currentWeight <= targetWeight) {
        forecastPoints.push({
          date: new Date(currentDate),
          weight: targetWeight,
          isForecast: true
        });
        break;
      }
    } else {
      currentWeight += adjustedDailyRate * 3; // 3 days of weight change
      // Stop if we've reached or passed the target
      if (currentWeight >= targetWeight) {
        forecastPoints.push({
          date: new Date(currentDate),
          weight: targetWeight,
          isForecast: true
        });
        break;
      }
    }
    
    forecastPoints.push({
      date: new Date(currentDate),
      weight: currentWeight,
      isForecast: true
    });
  }
  
  // Ensure we include the target weight point at the projected end date
  // (only if we haven't already reached it)
  if (forecastPoints.length > 0 && 
      forecastPoints[forecastPoints.length - 1].weight !== targetWeight) {
    forecastPoints.push({
      date: new Date(projectedEndDate),
      weight: targetWeight,
      isForecast: true
    });
  }
  
  console.log(`Generated ${forecastPoints.length} forecast points`);
  return forecastPoints;
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

// Export types
export type { SimpleWeightData };
