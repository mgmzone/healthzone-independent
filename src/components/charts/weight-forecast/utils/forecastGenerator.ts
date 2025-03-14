
import { addDays, differenceInDays } from 'date-fns';
import { 
  calculateRealisticWeightChangeRate, 
  createChartDataPoint,
  isGoalDirectionCompatible
} from './forecastUtils';

/**
 * Generates forecast data points based on actual weight data
 */
export const generateForecastData = (
  chartData: any[],
  periodEndDate: Date,
  targetWeight: number | undefined,
  isImperial: boolean,
  weightLossPerWeek?: number
) => {
  // If we have less than 2 points, we can't make a forecast
  if (chartData.length < 2) return [];

  // Get the converted target weight if provided
  const convertedTargetWeight = targetWeight !== undefined ? 
    (isImperial ? targetWeight * 2.20462 : targetWeight) : null;

  // Get the last actual weigh-in (this is where the forecast should start)
  const lastActualPoint = chartData[chartData.length - 1];
  
  // Calculate the average daily weight change based on the actual data
  const firstPoint = chartData[0];
  const daysElapsed = differenceInDays(lastActualPoint.date, firstPoint.date) || 1;
  let totalWeightChange = lastActualPoint.weight - firstPoint.weight;
  let avgDailyChange = totalWeightChange / daysElapsed;
  
  // If we have a target weight loss per week, override the calculated average
  if (weightLossPerWeek !== undefined) {
    // Convert to daily change
    const targetDailyChange = -(weightLossPerWeek / 7);
    // Apply realistic limits to the weight change rate
    avgDailyChange = calculateRealisticWeightChangeRate(targetDailyChange, isImperial);
  } else {
    // Apply realistic limits to the weight change rate
    avgDailyChange = calculateRealisticWeightChangeRate(avgDailyChange, isImperial);
  }

  // Start with the last actual point as the beginning of forecast
  const forecastData = [{
    date: lastActualPoint.date,
    weight: lastActualPoint.weight,
    isActual: false,  // Mark as not actual
    isForecast: true  // Mark as forecast
  }];

  // If we already reached the end date, no need to forecast further
  if (new Date() >= periodEndDate) return forecastData;

  // Generate forecast points from the day after last actual weigh-in to end date
  const lastDate = lastActualPoint.date;
  const daysToForecast = differenceInDays(periodEndDate, lastDate);

  let previousWeight = lastActualPoint.weight;
  
  // Check if the current trend aligns with the target weight goal
  const isWeightLoss = avgDailyChange < 0;
  
  // If the trend is opposite from the target goal, don't forecast
  if (!isGoalDirectionCompatible(isWeightLoss, convertedTargetWeight, lastActualPoint.weight)) {
    return forecastData;
  }

  // Start forecast FROM the day after the last actual weigh-in
  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    const forecastWeight = previousWeight + avgDailyChange;
    
    // If target weight is provided, check if we've reached it
    if (convertedTargetWeight !== null) {
      // For weight loss: stop if forecast goes below target
      if (isWeightLoss && forecastWeight <= convertedTargetWeight) {
        forecastData.push(createChartDataPoint(
          forecastDate, 
          convertedTargetWeight, 
          false, 
          true
        ));
        // We've reached target, stop forecasting
        break;
      }
      // For weight gain: stop if forecast goes above target
      else if (!isWeightLoss && forecastWeight >= convertedTargetWeight) {
        forecastData.push(createChartDataPoint(
          forecastDate, 
          convertedTargetWeight, 
          false, 
          true
        ));
        // We've reached target, stop forecasting
        break;
      }
    }
    
    forecastData.push(createChartDataPoint(
      forecastDate, 
      forecastWeight, 
      false, 
      true
    ));

    previousWeight = forecastWeight;
  }

  return forecastData;
};
