
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
  const finalSustainableRate = initialDailyRate * 0.4; // Reduced to 40% of initial rate (from 60%) for a gentler approach to target
  
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
  
  // Number of days per point - using smaller increments for smoother curve
  const daysPerPoint = 3;
  
  // Generate points every few days for a smoother curve with more data points
  for (let day = daysPerPoint; day <= daysToProjectedEnd; day += daysPerPoint) {
    currentDate = new Date(lastWeighIn.date.getTime() + day * 24 * 60 * 60 * 1000);
    
    // Calculate progress percentage toward target (0 to 1)
    const progressPercent = day / daysToProjectedEnd;
    
    // Create a more gentle curve using a power function with a higher exponent
    // Higher exponent creates a more gradual approach to the target
    // Using 0.4 instead of 0.5 makes the curve even more gradual
    const curveFactor = Math.pow(progressPercent, 0.4);
    
    // Apply exponential slowdown as we approach the target
    // This creates a more gradual approach to the target weight at the end
    let adjustedDailyRate;
    
    // If we're more than 80% through the timeline, apply additional slowdown
    if (progressPercent > 0.8) {
      // Calculate how close we are to the end (0 to 1, where 1 is at the end date)
      const endProximity = (progressPercent - 0.8) / 0.2;
      
      // Apply sigmoid-like curve for very smooth ending
      // This creates an elegant taper as we approach the target
      const endingFactor = 1 - (endProximity * endProximity);
      
      // Reduce rate as we approach the target date
      adjustedDailyRate = initialDailyRate - 
        ((initialDailyRate - finalSustainableRate) * curveFactor) - 
        (finalSustainableRate * endProximity * 0.8); // Additional slowdown factor
    } else {
      // Normal curve for most of the forecast
      adjustedDailyRate = initialDailyRate - ((initialDailyRate - finalSustainableRate) * curveFactor);
    }
    
    // Apply the daily change for each day in this segment
    if (isWeightLoss) {
      currentWeight -= adjustedDailyRate * daysPerPoint; // Apply weight change
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
      currentWeight += adjustedDailyRate * daysPerPoint; // Apply weight change
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
  
  // Force include the target weight point at the projected end date if we haven't already reached it
  // This ensures we always show the goal being reached by the projected date
  if (forecastPoints.length > 0 && 
      Math.abs(forecastPoints[forecastPoints.length - 1].weight - targetWeight) > 0.1) {
    
    // Add an extra point ~10% before the end date for even smoother transition
    const transitionDate = new Date(projectedEndDate);
    transitionDate.setDate(transitionDate.getDate() - Math.max(5, Math.floor(daysToProjectedEnd * 0.1)));
    
    // Calculate weight for transition point - make it closer to target
    const lastPointWeight = forecastPoints[forecastPoints.length - 1].weight;
    const remainingChange = isWeightLoss ? 
      lastPointWeight - targetWeight : 
      targetWeight - lastPointWeight;
    
    // Make the transition point 80% of the way to the target
    const transitionWeight = isWeightLoss ? 
      targetWeight + (remainingChange * 0.2) : 
      targetWeight - (remainingChange * 0.2);
    
    // Add the transition point
    forecastPoints.push({
      date: transitionDate,
      weight: transitionWeight,
      isForecast: true
    });
    
    // Add the final target point
    forecastPoints.push({
      date: new Date(projectedEndDate),
      weight: targetWeight,
      isForecast: true
    });
  }
  
  console.log(`Generated ${forecastPoints.length} forecast points with enhanced smoothing at end`);
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
