
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
  // targetWeight is already in the display units (kg or lbs)
  const convertedTargetWeight = targetWeight !== undefined ? targetWeight : null;

  // Get the last actual weigh-in (this is where the forecast should start)
  const lastActualPoint = chartData[chartData.length - 1];
  
  // Calculate the average daily weight change based on actual data
  // This will give us the real trend based on user's actual progress
  const firstPoint = chartData[0];
  const daysElapsed = differenceInDays(lastActualPoint.date, firstPoint.date) || 1;
  let totalWeightChange = lastActualPoint.weight - firstPoint.weight;
  let avgDailyChange = totalWeightChange / daysElapsed;
  
  // Apply realistic limits to the calculated weight change rate
  avgDailyChange = calculateRealisticWeightChangeRate(avgDailyChange, isImperial);
  
  console.log('Forecast calculations:', {
    firstPointDate: firstPoint.date,
    firstPointWeight: firstPoint.weight,
    lastPointDate: lastActualPoint.date,
    lastPointWeight: lastActualPoint.weight,
    daysElapsed,
    totalWeightChange,
    avgDailyChange,
    weightLossPerWeek,
    targetWeight: convertedTargetWeight,
    isImperial
  });
  
  // Start with the last actual point as the beginning of forecast
  const forecastData = [{
    date: lastActualPoint.date,
    weight: lastActualPoint.weight,
    isActual: false,  // Mark as not actual
    isForecast: true  // Mark as forecast
  }];

  // If we already reached the end date, no need to forecast further
  if (new Date() >= periodEndDate) return forecastData;

  // Generate forecast points from the day after last actual weigh-in
  // We'll forecast either until we reach the target weight or until the end of the period
  const lastDate = lastActualPoint.date;
  
  // Calculate maximum days to forecast - either 1 year or until period end, whichever is sooner
  const daysToPeriodEnd = differenceInDays(periodEndDate, lastDate);
  const maxDaysToForecast = Math.min(daysToPeriodEnd, 365); 
  
  console.log('Forecast range:', { lastDate, periodEndDate, daysToPeriodEnd, maxDaysToForecast });
  
  let previousWeight = lastActualPoint.weight;
  
  // Check if the current trend aligns with the target weight goal
  const isWeightLoss = avgDailyChange < 0;
  
  if (convertedTargetWeight !== null) {
    // Check if trend aligns with goal
    const isTargetLower = convertedTargetWeight < lastActualPoint.weight;
    // If losing weight but target is higher, or gaining weight but target is lower, trend doesn't align
    if ((isWeightLoss && !isTargetLower) || (!isWeightLoss && isTargetLower)) {
      console.log('Trend does not align with goal direction');
      // Return only the last actual point for the forecast
      return forecastData;
    }
  }

  // Start forecast FROM the day after the last actual weigh-in
  for (let i = 1; i <= maxDaysToForecast; i++) {
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
        console.log(`Forecast reached target weight ${convertedTargetWeight} on day ${i}`);
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
        console.log(`Forecast reached target weight ${convertedTargetWeight} on day ${i}`);
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
