
import { differenceInDays, addDays } from 'date-fns';
import { createChartDataPoint } from './forecastUtils';
import { calculateForecastRate, getSustainableRate, validateTrendDirection } from './rateCalculator';
import { calculateDaysToTarget } from './daysToTargetCalculator';
import { generateForecastPoints } from './forecastPointGenerator';

/**
 * Generates forecast data points based on actual weight data using an improved
 * weight loss rate model that gradually decreases to a sustainable rate
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
  const firstPoint = chartData[0];
  const daysElapsed = differenceInDays(new Date(lastActualPoint.date), new Date(firstPoint.date)) || 1;
  
  // Calculate rate and direction
  const { avgDailyChange, isWeightLoss } = calculateForecastRate(
    firstPoint, 
    lastActualPoint, 
    daysElapsed, 
    isImperial
  );
  
  console.log('Forecast calculations:', {
    targetWeight: convertedTargetWeight,
    isImperial,
    weightLossPerWeek
  });
  
  // Start with the last actual point for the forecast
  const forecastData = [{
    date: lastActualPoint.date,
    weight: lastActualPoint.weight,
    isActual: false,  // Mark as not actual
    isForecast: true  // Mark as forecast
  }];

  // Check if trend aligns with goal
  if (convertedTargetWeight !== null) {
    const isCompatible = validateTrendDirection(isWeightLoss, convertedTargetWeight, lastActualPoint.weight);
    if (!isCompatible) {
      console.log('Trend does not align with goal direction');
      // Return only the last actual point for the forecast
      return forecastData;
    }
  }

  // Set sustainable rate based on units
  const finalSustainableRate = getSustainableRate(isImperial);
  
  // Calculate how many days it should take to reach target weight based on sustainable rate
  let daysToTarget = null;
  if (convertedTargetWeight !== null) {
    daysToTarget = calculateDaysToTarget(
      lastActualPoint.weight,
      convertedTargetWeight,
      avgDailyChange,
      finalSustainableRate,
      isWeightLoss
    );
  }

  // Limit the forecast to either the period end date, or until target is reached, whichever comes first
  let endDate = new Date(periodEndDate);
  if (daysToTarget !== null) {
    const targetDate = addDays(new Date(lastActualPoint.date), daysToTarget);
    // Use whichever date comes first
    if (targetDate < endDate) {
      endDate = targetDate;
    }
  }
  
  // Calculate days between last actual point and end date
  const daysToForecast = differenceInDays(endDate, new Date(lastActualPoint.date));
  
  console.log('Forecast range:', { 
    lastActualDate: lastActualPoint.date, 
    daysToForecast,
    daysToTarget,
    endDate
  });
  
  // Generate forecast points
  if (daysToForecast <= 0) return forecastData;
  
  return generateForecastPoints(
    lastActualPoint,
    daysToForecast,
    lastActualPoint.weight,
    convertedTargetWeight,
    avgDailyChange,
    finalSustainableRate,
    isWeightLoss
  );
};
