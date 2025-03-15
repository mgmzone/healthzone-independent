
import { addDays } from 'date-fns';
import { createChartDataPoint } from './forecastUtils';

/**
 * Generate forecast data points day by day using the adjusted rate model
 */
export const generateForecastPoints = (
  lastActualPoint: any,
  daysToForecast: number,
  startWeight: number,
  targetWeight: number | null,
  avgDailyChange: number,
  finalSustainableRate: number,
  isWeightLoss: boolean
) => {
  // Start with the last actual point as the beginning of forecast
  const forecastData = [{
    date: lastActualPoint.date,
    weight: lastActualPoint.weight,
    isActual: false,  // Mark as not actual
    isForecast: true  // Mark as forecast
  }];
  
  let previousWeight = lastActualPoint.weight;

  // Start forecast FROM the day after the last actual weigh-in
  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(new Date(lastActualPoint.date), i);
    
    // Calculate progress towards goal
    const progressFactor = targetWeight === null ? 0 : isWeightLoss 
      ? (startWeight - previousWeight) / (startWeight - targetWeight) 
      : (previousWeight - startWeight) / (targetWeight - startWeight);
    
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
    if (targetWeight !== null) {
      // For weight loss: stop if forecast goes below target
      if (isWeightLoss && forecastWeight <= targetWeight) {
        forecastData.push(createChartDataPoint(
          forecastDate, 
          targetWeight, 
          false, 
          true
        ));
        console.log(`Forecast reached target weight ${targetWeight} on day ${i}`);
        // We've reached target, stop forecasting
        break;
      }
      // For weight gain: stop if forecast goes above target
      else if (!isWeightLoss && forecastWeight >= targetWeight) {
        forecastData.push(createChartDataPoint(
          forecastDate, 
          targetWeight, 
          false, 
          true
        ));
        console.log(`Forecast reached target weight ${targetWeight} on day ${i}`);
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
