
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

  // Check if the current trend aligns with the target weight goal
  const isWeightLoss = avgDailyChange < 0;
  
  if (convertedTargetWeight !== null) {
    // Check if trend aligns with goal
    const isCompatible = isGoalDirectionCompatible(isWeightLoss, convertedTargetWeight, lastActualPoint.weight);
    if (!isCompatible) {
      console.log('Trend does not align with goal direction');
      // Return only the last actual point for the forecast
      return forecastData;
    }
  }

  // Calculate how many days it should take to reach target weight based on current progress
  let daysToTarget = null;
  if (convertedTargetWeight !== null) {
    const weightToLose = Math.abs(lastActualPoint.weight - convertedTargetWeight);
    daysToTarget = Math.abs(Math.ceil(weightToLose / Math.abs(avgDailyChange)));
    console.log(`Estimated days to target: ${daysToTarget} with daily change of ${avgDailyChange}`);
  }

  // Limit the forecast to a reasonable timeframe
  // Either until target weight is reached or up to 365 days, whichever comes first
  const maxDaysToForecast = daysToTarget !== null ? 
    Math.min(daysToTarget, 365) : 
    365;
  
  console.log('Forecast range:', { 
    lastActualDate: lastActualPoint.date, 
    maxDaysToForecast, 
    daysToTarget 
  });
  
  let previousWeight = lastActualPoint.weight;

  // Start forecast FROM the day after the last actual weigh-in
  for (let i = 1; i <= maxDaysToForecast; i++) {
    const forecastDate = addDays(lastActualPoint.date, i);
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
