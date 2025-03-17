
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
  
  // Make sure we're accessing date properties correctly
  const getDateFromPoint = (point: any): Date => {
    // If date is already a number (timestamp), create a Date from it
    // If it's a Date object or string, convert to Date to be safe
    return typeof point.date === 'number' ? new Date(point.date) : new Date(point.date);
  };
  
  const lastDate = getDateFromPoint(lastActualPoint);
  const firstDate = getDateFromPoint(firstPoint);
  
  const daysElapsed = differenceInDays(lastDate, firstDate) || 1;
  
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
    weightLossPerWeek,
    avgDailyChange,
    isWeightLoss,
    firstPointDate: firstDate.toISOString().split('T')[0],
    lastPointDate: lastDate.toISOString().split('T')[0],
    daysElapsed
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

  // Set sustainable rate based on units - around 0.5 lbs per week or 0.2 kg per week
  const finalSustainableRate = getSustainableRate(isImperial);

  // If we have a specific weightLossPerWeek value from the period settings, use that
  // to inform our sustainable rate (convert from weekly to daily rate)
  let customSustainableRate = finalSustainableRate;
  if (weightLossPerWeek && weightLossPerWeek > 0) {
    // Convert from weekly to daily
    customSustainableRate = weightLossPerWeek / 7;
    console.log(`Using custom sustainable daily rate: ${customSustainableRate} based on weekly goal: ${weightLossPerWeek}`);
  }
  
  // Calculate how many days it should take to reach target weight based on sustainable rate
  let daysToTarget = null;
  if (convertedTargetWeight !== null) {
    daysToTarget = calculateDaysToTarget(
      lastActualPoint.weight,
      convertedTargetWeight,
      avgDailyChange,
      customSustainableRate,
      isWeightLoss
    );
  }

  // Limit the forecast to either the period end date, or until target is reached, whichever comes first
  let endDate = new Date(periodEndDate);
  if (daysToTarget !== null) {
    const targetDate = addDays(lastDate, daysToTarget);
    // Use whichever date comes first
    if (targetDate < endDate) {
      endDate = targetDate;
    }
  }
  
  // Calculate days between last actual point and end date
  const daysToForecast = differenceInDays(endDate, lastDate);
  
  console.log('Forecast range:', { 
    lastActualDate: lastDate.toISOString().split('T')[0], 
    daysToForecast,
    daysToTarget,
    endDate: endDate.toISOString().split('T')[0]
  });
  
  // Generate forecast points
  if (daysToForecast <= 0) return forecastData;
  
  return generateForecastPoints(
    lastActualPoint,
    daysToForecast,
    firstPoint.weight, // Use starting weight of period, not last actual
    convertedTargetWeight,
    avgDailyChange,
    customSustainableRate,
    isWeightLoss
  );
};
