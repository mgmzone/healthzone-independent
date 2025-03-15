
import { addDays, differenceInDays } from 'date-fns';
import { 
  calculateRealisticWeightChangeRate, 
  createChartDataPoint,
  isGoalDirectionCompatible
} from './forecastUtils';

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
  let totalWeightChange = lastActualPoint.weight - firstPoint.weight;
  let avgDailyChange = totalWeightChange / daysElapsed;
  
  // Calculate weekly rate from daily rate
  let initialWeeklyRate = Math.abs(avgDailyChange * 7);
  
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
    initialWeeklyRate,
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

  // Check direction of weight change
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

  // Set sustainable rate based on units
  const finalSustainableRate = isImperial ? 2.0 / 7 : 0.9 / 7; // Convert weekly to daily
  
  // Calculate how many days it should take to reach target weight based on sustainable rate
  let daysToTarget = null;
  if (convertedTargetWeight !== null) {
    const weightToLose = Math.abs(lastActualPoint.weight - convertedTargetWeight);
    
    // Use a more complex model for days to target calculation
    // This model assumes gradual rate decrease
    let simulatedWeight = lastActualPoint.weight;
    let dayCounter = 0;
    const startWeight = lastActualPoint.weight;
    
    // We'll simulate day by day until we reach the target weight
    while ((isWeightLoss && simulatedWeight > convertedTargetWeight) || 
           (!isWeightLoss && simulatedWeight < convertedTargetWeight)) {
      
      // Calculate progress factor (0 to 1)
      const progressFactor = isWeightLoss 
        ? (startWeight - simulatedWeight) / (startWeight - convertedTargetWeight) 
        : (simulatedWeight - startWeight) / (convertedTargetWeight - startWeight);
      
      // Adjust daily rate based on progress - gradually decrease to sustainable rate
      const adjustedDailyRate = Math.abs(avgDailyChange) - 
                              (Math.abs(avgDailyChange) - finalSustainableRate) * 
                              Math.min(1, progressFactor * 1.5);
      
      // Apply the daily change
      if (isWeightLoss) {
        simulatedWeight -= adjustedDailyRate;
      } else {
        simulatedWeight += adjustedDailyRate;
      }
      
      dayCounter++;
      
      // Safety exit if taking too long
      if (dayCounter > 730) {
        console.log('Forecast simulation reached maximum days limit');
        break;
      }
    }
    
    daysToTarget = dayCounter;
    console.log(`Estimated days to target using gradual model: ${daysToTarget}`);
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
  
  let previousWeight = lastActualPoint.weight;
  const startWeight = lastActualPoint.weight;

  // Start forecast FROM the day after the last actual weigh-in
  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(new Date(lastActualPoint.date), i);
    
    // Calculate progress towards goal
    const progressFactor = convertedTargetWeight === null ? 0 : isWeightLoss 
      ? (startWeight - previousWeight) / (startWeight - convertedTargetWeight) 
      : (previousWeight - startWeight) / (convertedTargetWeight - startWeight);
    
    // Calculate time factor
    const timeFactor = Math.min(1, i / 90);  // Gradually over 90 days
    
    // Use the larger of the two factors
    const combinedFactor = Math.max(progressFactor, timeFactor);
    
    // Adjust daily rate based on factors - gradually decrease to sustainable rate
    const adjustedDailyRate = Math.abs(avgDailyChange) - 
                            (Math.abs(avgDailyChange) - finalSustainableRate) * 
                            Math.min(1, combinedFactor * 1.5);
    
    // Calculate new weight using adjusted rate
    let forecastWeight;
    if (isWeightLoss) {
      forecastWeight = previousWeight - adjustedDailyRate;
    } else {
      forecastWeight = previousWeight + adjustedDailyRate;
    }
    
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
    
    // Log progress every 7 days
    if (i % 7 === 0) {
      console.log(`Day ${i} (${forecastDate.toISOString().split('T')[0]}): ${forecastWeight.toFixed(1)} (daily rate: ${adjustedDailyRate.toFixed(3)})`);
    }
  }

  return forecastData;
};
