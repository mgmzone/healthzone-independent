
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
  if (!lastWeighIn || !targetWeight) {
    console.log('Missing data for forecast generation', { lastWeighIn, targetWeight });
    return [];
  }
  
  // If no projected end date is provided, calculate a reasonable one
  if (!projectedEndDate) {
    if (!weightLossPerWeek || weightLossPerWeek <= 0) {
      console.log('Cannot generate forecast without either projectedEndDate or weightLossPerWeek');
      return [];
    }

    // Calculate a reasonable projected end date using the weight loss rate
    const totalWeightChange = Math.abs(lastWeighIn.weight - targetWeight);
    const weeksNeeded = totalWeightChange / weightLossPerWeek;
    const daysNeeded = Math.ceil(weeksNeeded * 7) + 14; // Add 2 weeks buffer
    projectedEndDate = addDays(lastWeighIn.date, daysNeeded);
    console.log(`Calculated projected end date: ${projectedEndDate.toISOString()}`);
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
  
  // Final sustainable rate (1 lb per week)
  // For imperial units (lbs), 1 lb per week = 0.143 lbs per day
  // For metric units (kg), 0.45 kg per week = 0.064 kg per day
  const finalSustainableRate = 1.0 / 7.0; // 1 lb per week (or equivalent kg)
  
  console.log('Forecast calculation:', {
    daysToProjectedEnd,
    isWeightLoss,
    totalWeightChange,
    initialDailyRate,
    finalSustainableRate: finalSustainableRate,
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
  const daysPerPoint = 2; // Generate a point every 2 days
  
  // Calculate days needed to reach target based on the actual rate
  const actualDaysToTarget = isWeightLoss ? 
    Math.ceil(totalWeightChange / (initialDailyRate * 0.8)) : // Loss slows down, so more days needed
    Math.ceil(totalWeightChange / initialDailyRate);
    
  // Determine if we might not reach target by the projected date with our rate
  const rateNeedsAdjustment = actualDaysToTarget > daysToProjectedEnd;
  
  // If we need to adjust, create a more aggressive rate so we hit the target weight on the projected date
  const effectiveDailyRate = rateNeedsAdjustment ? 
    (totalWeightChange / daysToProjectedEnd) * 1.1 : // 10% buffer to ensure we get there
    initialDailyRate;
  
  console.log(`Adjusted rate calculation: actualDaysToTarget=${actualDaysToTarget}, needsAdjustment=${rateNeedsAdjustment}, effectiveRate=${effectiveDailyRate}`);
  
  // Generate points every few days for a smoother curve with more data points
  for (let day = daysPerPoint; day <= daysToProjectedEnd; day += daysPerPoint) {
    currentDate = addDays(lastWeighIn.date, day);
    
    // Calculate progress percentage toward target (0 to 1)
    const progressPercent = day / daysToProjectedEnd;
    
    // Get adjusted daily rate using curve calculations
    const adjustedDailyRate = calculateAdjustedDailyRate(
      effectiveDailyRate, 
      finalSustainableRate, 
      progressPercent
    );
    
    // Apply the daily change for each day in this segment
    if (isWeightLoss) {
      currentWeight -= adjustedDailyRate * daysPerPoint;
      if (currentWeight <= targetWeight) {
        forecastPoints.push({
          date: new Date(projectedEndDate),
          weight: targetWeight,
          isForecast: true
        });
        break;
      }
    } else {
      currentWeight += adjustedDailyRate * daysPerPoint;
      if (currentWeight >= targetWeight) {
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
  
  // Ensure the last point is exactly on target weight on the projected end date
  // This is crucial to fix the issue shown in the screenshot
  const lastPoint = forecastPoints[forecastPoints.length - 1];
  if (lastPoint.date.getTime() !== projectedEndDate.getTime() || 
      Math.abs(lastPoint.weight - targetWeight) > 0.01) {
    
    // Remove any points very close to the end to avoid overcrowding
    while (forecastPoints.length > 1 && 
           Math.abs(forecastPoints[forecastPoints.length - 1].date.getTime() - projectedEndDate.getTime()) < (7 * 24 * 60 * 60 * 1000)) {
      forecastPoints.pop();
    }
    
    // Add the exact endpoint
    forecastPoints.push({
      date: new Date(projectedEndDate),
      weight: targetWeight,
      isForecast: true
    });
    
    console.log('Added exact end point:', {
      date: projectedEndDate.toISOString(),
      weight: targetWeight
    });
  }
  
  // Ensure no weird fluctuations by making sure the trend is monotonic
  if (forecastPoints.length >= 3) {
    const filteredPoints = [forecastPoints[0]]; // Start with the first point
    
    const isDescending = isWeightLoss;
    
    for (let i = 1; i < forecastPoints.length; i++) {
      const prevPoint = filteredPoints[filteredPoints.length - 1];
      const currentPoint = forecastPoints[i];
      
      if (isDescending) {
        if (currentPoint.weight <= prevPoint.weight) {
          filteredPoints.push(currentPoint);
        }
      } else {
        if (currentPoint.weight >= prevPoint.weight) {
          filteredPoints.push(currentPoint);
        }
      }
    }
    
    // Make sure the last point is always at the target weight and at the projected end date
    const lastFilteredPoint = filteredPoints[filteredPoints.length - 1];
    if (Math.abs(lastFilteredPoint.weight - targetWeight) > 0.1 || 
        lastFilteredPoint.date.getTime() !== projectedEndDate.getTime()) {
      filteredPoints.push({
        date: new Date(projectedEndDate),
        weight: targetWeight,
        isForecast: true
      });
    }
    
    console.log(`Generated ${filteredPoints.length} final forecast points`);
    return filteredPoints;
  }
  
  console.log(`Generated ${forecastPoints.length} forecast points`);
  return forecastPoints;
};
