
import { addDays } from 'date-fns';
import { calculateAdjustedDailyRate } from './curveCalculator';

/**
 * Generate forecast data points from last actual weigh-in to target weight
 * with a curved trend line that shows faster loss at the beginning
 */
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
  const finalSustainableRate = initialDailyRate * 0.3; // Reduced to 30% of initial rate for an even gentler approach
  
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
  const daysPerPoint = 2; // Reduced from 3 to 2 for more data points and smoother curve
  
  // Generate points every few days for a smoother curve with more data points
  for (let day = daysPerPoint; day <= daysToProjectedEnd; day += daysPerPoint) {
    currentDate = new Date(lastWeighIn.date.getTime() + day * 24 * 60 * 60 * 1000);
    
    // Calculate progress percentage toward target (0 to 1)
    const progressPercent = day / daysToProjectedEnd;
    
    // Get adjusted daily rate using curve calculations
    const adjustedDailyRate = calculateAdjustedDailyRate(
      initialDailyRate, 
      finalSustainableRate, 
      progressPercent
    );
    
    // Apply the daily change for each day in this segment
    if (isWeightLoss) {
      currentWeight -= adjustedDailyRate * daysPerPoint; // Apply weight change
      // Stop if we've reached or passed the target
      if (currentWeight <= targetWeight) {
        // Add a point at 95% of the way to target if we're jumping too close to target
        if (currentWeight < targetWeight * 0.95) {
          const intermediateWeight = targetWeight + (currentWeight - targetWeight) * 0.5;
          forecastPoints.push({
            date: new Date(currentDate),
            weight: intermediateWeight,
            isForecast: true
          });
        }
        
        // Add the target point
        forecastPoints.push({
          date: new Date(projectedEndDate),
          weight: targetWeight,
          isForecast: true
        });
        break;
      }
    } else {
      currentWeight += adjustedDailyRate * daysPerPoint; // Apply weight change
      // Stop if we've reached or passed the target
      if (currentWeight >= targetWeight) {
        // Add a point at 95% of the way to target if we're jumping too close to target
        if (currentWeight > targetWeight * 1.05) {
          const intermediateWeight = targetWeight + (currentWeight - targetWeight) * 0.5;
          forecastPoints.push({
            date: new Date(currentDate),
            weight: intermediateWeight,
            isForecast: true
          });
        }
        
        // Add the target point
        forecastPoints.push({
          date: new Date(projectedEndDate),
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
  
  // If we haven't reached the target yet, add a final approach point and then the target
  if (forecastPoints.length > 0 && 
      Math.abs(forecastPoints[forecastPoints.length - 1].weight - targetWeight) > 0.1) {
    
    // Calculate a point 95% of the way to the target for a smooth approach
    const lastPointWeight = forecastPoints[forecastPoints.length - 1].weight;
    const remainingChange = targetWeight - lastPointWeight;
    const intermediateWeight = lastPointWeight + (remainingChange * 0.8);
    
    // Add an intermediate point at 90% of the projection time
    const intermediateDate = new Date(lastWeighIn.date.getTime() + daysToProjectedEnd * 0.9 * 24 * 60 * 60 * 1000);
    forecastPoints.push({
      date: new Date(intermediateDate),
      weight: intermediateWeight,
      isForecast: true
    });
    
    // Add the final target point at the projected end date
    forecastPoints.push({
      date: new Date(projectedEndDate),
      weight: targetWeight,
      isForecast: true
    });
  }
  
  // Ensure no weird fluctuations at the end by removing any points that would create
  // a change in direction near the end of the forecast
  if (forecastPoints.length >= 3) {
    // Keep only the filtered points that maintain a consistent direction
    const filteredPoints = [forecastPoints[0]]; // Start with the first point
    
    const isDescending = isWeightLoss; // Direction should be consistent with goal
    
    for (let i = 1; i < forecastPoints.length; i++) {
      const prevPoint = filteredPoints[filteredPoints.length - 1];
      const currentPoint = forecastPoints[i];
      
      // Check if this point would maintain the correct direction
      if (isDescending) {
        // For weight loss, each point should be <= the previous point
        if (currentPoint.weight <= prevPoint.weight) {
          filteredPoints.push(currentPoint);
        } else {
          // Skip this point as it would create an upward fluctuation
          console.log('Skipping point that would create upward fluctuation:', currentPoint);
        }
      } else {
        // For weight gain, each point should be >= the previous point
        if (currentPoint.weight >= prevPoint.weight) {
          filteredPoints.push(currentPoint);
        } else {
          // Skip this point as it would create a downward fluctuation
          console.log('Skipping point that would create downward fluctuation:', currentPoint);
        }
      }
    }
    
    // Make sure the last point is always the target weight at the end date
    if (filteredPoints.length > 0) {
      // If the last point isn't already at the target weight and end date
      const lastPoint = filteredPoints[filteredPoints.length - 1];
      if (Math.abs(lastPoint.weight - targetWeight) > 0.1 || 
          Math.abs(lastPoint.date.getTime() - projectedEndDate.getTime()) > 1000 * 60 * 60 * 24) {
        
        // Add the target weight point
        filteredPoints.push({
          date: new Date(projectedEndDate),
          weight: targetWeight,
          isForecast: true
        });
      }
    }
    
    // Replace the original points with the filtered ones
    return filteredPoints;
  }
  
  console.log(`Generated ${forecastPoints.length} forecast points with enhanced smoothing at end`);
  return forecastPoints;
};
