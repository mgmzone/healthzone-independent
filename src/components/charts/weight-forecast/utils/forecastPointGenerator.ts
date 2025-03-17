
import { addDays } from 'date-fns';
import { createChartDataPoint } from './forecastUtils';

/**
 * Generate forecast data points day by day using the adjusted rate model
 * with a curved trend line that shows faster loss at the beginning
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
  let totalForecastDistance = 0;

  // For a curved line effect, we need to adjust the rate more gradually
  // Start forecast FROM the day after the last actual weigh-in
  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(new Date(lastActualPoint.date), i);
    
    // Calculate progress towards timeline completion (0 to 1)
    const timeProgress = i / daysToForecast;
    
    // Calculate progress towards goal
    const progressFactor = targetWeight === null ? 0 : isWeightLoss 
      ? (startWeight - previousWeight) / (startWeight - targetWeight) 
      : (previousWeight - startWeight) / (targetWeight - startWeight);
    
    // Use a curve function to make weight loss faster at beginning and slower towards the end
    // This creates a more realistic projection curve
    const curveFactor = Math.pow(timeProgress, 0.8); // Exponential curve, more aggressive at start
    
    // Combine progress factors
    const combinedFactor = Math.max(progressFactor, curveFactor);
    
    // Additional smoothing logic for the final portion of the curve
    let endingSmoothingFactor = 1.0;
    
    // Apply extra smoothing in the last 20% of the forecast
    if (timeProgress > 0.8) {
      // Calculate how far into the final portion we are (0 to 1)
      const endingProgress = (timeProgress - 0.8) / 0.2;
      
      // Apply a smoothing factor that increases as we approach the end
      // Using a quadratic function to create a gentle tapering
      endingSmoothingFactor = 1.0 - (Math.pow(endingProgress, 2) * 0.8);
    }
    
    // Adjust daily rate based on curve - gradually decrease to sustainable rate
    // The higher the curve factor, the more the rate decreases
    let adjustedDailyRate = Math.abs(avgDailyChange) - 
                          (Math.abs(avgDailyChange) - finalSustainableRate) * 
                          Math.min(1, combinedFactor * 1.5);
    
    // Apply additional smoothing to the rate at the end
    adjustedDailyRate *= endingSmoothingFactor;
    
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
    totalForecastDistance += adjustedDailyRate;
    
    // Log progress every 7 days
    if (i % 7 === 0) {
      console.log(`Day ${i} (${forecastDate.toISOString().split('T')[0]}): ${forecastWeight.toFixed(1)} (daily rate: ${adjustedDailyRate.toFixed(3)})`);
    }
  }

  console.log(`Total forecasted ${isWeightLoss ? 'loss' : 'gain'}: ${totalForecastDistance.toFixed(1)}`);
  return forecastData;
};
