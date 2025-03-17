
/**
 * Utilities for creating and filtering forecast data points
 */
import { addDays } from 'date-fns';

/**
 * Create a forecast data point
 */
export const createForecastPoint = (
  date: Date,
  weight: number
): { date: Date; weight: number; isForecast: boolean } => {
  return {
    date: new Date(date),
    weight,
    isForecast: true
  };
};

/**
 * Add intermediate points for a smoother ending
 */
export const addIntermediatePoints = (
  lastWeighInDate: Date,
  day: number,
  remainingDays: number,
  targetWeight: number
): { date: Date; weight: number; isForecast: boolean }[] => {
  const points = [];
  
  if (remainingDays > 4) {
    const intermediateDay1 = day + Math.floor(remainingDays/3);
    const intermediateDay2 = day + Math.floor(remainingDays*2/3);
    
    points.push(createForecastPoint(
      addDays(lastWeighInDate, intermediateDay1),
      targetWeight
    ));
    
    points.push(createForecastPoint(
      addDays(lastWeighInDate, intermediateDay2),
      targetWeight
    ));
  }
  
  return points;
};

/**
 * Ensure the forecast ends with the target weight
 */
export const ensureTargetEndPoint = (
  projectedEndDate: Date,
  targetWeight: number,
  forecastPoints: { date: Date; weight: number; isForecast: boolean }[]
): { date: Date; weight: number; isForecast: boolean } | null => {
  if (forecastPoints.length === 0) return null;
  
  const lastPoint = forecastPoints[forecastPoints.length - 1];
  const daysDifference = Math.abs((lastPoint.date.getTime() - projectedEndDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If the last point is more than 1 day away from projected end date or weight is off
  if (daysDifference > 1 || Math.abs(lastPoint.weight - targetWeight) > 0.1) {
    return createForecastPoint(projectedEndDate, targetWeight);
  }
  
  return null;
};

/**
 * Filter points to ensure monotonic trend (always increasing or decreasing)
 */
export const ensureMonotonicTrend = (
  forecastPoints: { date: Date; weight: number; isForecast: boolean }[],
  isWeightLoss: boolean,
  projectedEndDate: Date,
  targetWeight: number
): { date: Date; weight: number; isForecast: boolean }[] => {
  if (forecastPoints.length < 3) return forecastPoints;
  
  const filteredPoints = [forecastPoints[0]]; // Start with the first point
  const isDescending = isWeightLoss;
  
  for (let i = 1; i < forecastPoints.length; i++) {
    const prevPoint = filteredPoints[filteredPoints.length - 1];
    const currentPoint = forecastPoints[i];
    
    // Skip points with duplicate dates (can happen with the added intermediate points)
    if (prevPoint.date.getTime() === currentPoint.date.getTime()) {
      continue;
    }
    
    if (isDescending) {
      if (currentPoint.weight <= prevPoint.weight) {
        filteredPoints.push(currentPoint);
      } else {
        // If weight increased (which shouldn't happen for weight loss),
        // use the previous weight to maintain the trend
        filteredPoints.push({
          ...currentPoint,
          weight: prevPoint.weight
        });
      }
    } else {
      if (currentPoint.weight >= prevPoint.weight) {
        filteredPoints.push(currentPoint);
      } else {
        // If weight decreased (which shouldn't happen for weight gain),
        // use the previous weight to maintain the trend
        filteredPoints.push({
          ...currentPoint,
          weight: prevPoint.weight
        });
      }
    }
  }
  
  // Make sure the last point is always at the target weight and at the projected end date
  const lastFilteredPoint = filteredPoints[filteredPoints.length - 1];
  if (Math.abs(lastFilteredPoint.weight - targetWeight) > 0.1 || 
      Math.abs(lastFilteredPoint.date.getTime() - projectedEndDate.getTime()) > 24 * 60 * 60 * 1000) {
    filteredPoints.push(createForecastPoint(projectedEndDate, targetWeight));
  }
  
  return filteredPoints;
};
