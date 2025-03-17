
/**
 * Generate forecast data points from last actual weigh-in to target weight
 * with a curved trend line that shows faster loss at the beginning
 */
import { addDays } from 'date-fns';
import { calculateAdjustedDailyRate } from '../curveCalculator';
import { createForecastPoint, addIntermediatePoints, ensureTargetEndPoint, ensureMonotonicTrend } from './dataPointUtils';
import { calculateInitialDailyRate, needsRateAdjustment, calculateEffectiveDailyRate, applyDailyChange } from './curveUtils';
import { calculateProjectedEndDate, calculateDaysToProjectedEnd } from './endDateCalculator';

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
    const calculatedEndDate = calculateProjectedEndDate(
      lastWeighIn.date,
      lastWeighIn.weight,
      targetWeight,
      weightLossPerWeek
    );
    
    if (!calculatedEndDate) {
      return [];
    }
    
    projectedEndDate = calculatedEndDate;
  }
  
  // Calculate days between last weigh-in and projected end date
  const daysToProjectedEnd = calculateDaysToProjectedEnd(lastWeighIn.date, projectedEndDate);
  
  // Determine if this is weight loss or gain
  const isWeightLoss = lastWeighIn.weight > targetWeight;
  
  // Calculate total weight change needed
  const totalWeightChange = Math.abs(lastWeighIn.weight - targetWeight);
  
  // Calculate initial daily rate
  const initialDailyRate = calculateInitialDailyRate(
    lastWeighIn.weight,
    totalWeightChange,
    daysToProjectedEnd,
    weightLossPerWeek
  );
  
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
  
  // Determine if rate needs adjustment to reach target by projected date
  const rateNeedsAdjustment = needsRateAdjustment(
    totalWeightChange,
    initialDailyRate,
    daysToProjectedEnd,
    isWeightLoss
  );
  
  // Calculate effective daily rate
  const effectiveDailyRate = calculateEffectiveDailyRate(
    totalWeightChange,
    daysToProjectedEnd,
    initialDailyRate,
    rateNeedsAdjustment
  );
  
  console.log(`Adjusted rate calculation: needsAdjustment=${rateNeedsAdjustment}, effectiveRate=${effectiveDailyRate}`);
  
  // Generate forecast points
  const forecastPoints = [];
  let currentDate = new Date(lastWeighIn.date);
  let currentWeight = lastWeighIn.weight;
  
  // Start with the last actual data point
  forecastPoints.push(createForecastPoint(currentDate, currentWeight));
  
  // Number of days per point for smoother curve
  const daysPerPoint = 2; // Generate a point every 2 days
  
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
    currentWeight = applyDailyChange(
      currentWeight,
      adjustedDailyRate,
      daysPerPoint,
      targetWeight,
      isWeightLoss
    );
    
    forecastPoints.push(createForecastPoint(currentDate, currentWeight));
    
    // If we reached target weight and we're past 80% of the timeline,
    // add more frequent points for a smoother ending
    if ((isWeightLoss && currentWeight <= targetWeight && progressPercent > 0.8) ||
        (!isWeightLoss && currentWeight >= targetWeight && progressPercent > 0.8)) {
      const remainingDays = daysToProjectedEnd - day;
      const intermediatePoints = addIntermediatePoints(
        lastWeighIn.date,
        day,
        remainingDays,
        targetWeight
      );
      
      forecastPoints.push(...intermediatePoints);
      break;
    }
  }
  
  // Ensure the last point is exactly on target weight on the projected end date
  const endPoint = ensureTargetEndPoint(projectedEndDate, targetWeight, forecastPoints);
  if (endPoint) {
    forecastPoints.push(endPoint);
    console.log('Added exact end point:', {
      date: endPoint.date.toISOString(),
      weight: endPoint.weight
    });
  }
  
  // Ensure no weird fluctuations by making sure the trend is monotonic
  const filteredPoints = ensureMonotonicTrend(
    forecastPoints,
    isWeightLoss,
    projectedEndDate,
    targetWeight
  );
  
  console.log(`Generated ${filteredPoints.length} final forecast points`);
  return filteredPoints;
};
