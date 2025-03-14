
import { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { addDays, differenceInDays } from 'date-fns';

export const useWeightForecastData = (
  weighIns: WeighIn[],
  currentPeriod: Period | undefined,
  isImperial: boolean,
  targetWeight?: number
) => {
  return useMemo(() => {
    if (!currentPeriod || weighIns.length === 0) {
      return {
        chartData: [],
        forecastData: [],
        minWeight: 0,
        maxWeight: 0,
        hasValidData: false
      };
    }
    
    // Process and filter weigh-ins to only include those within the current period
    const periodStartDate = new Date(currentPeriod.startDate);
    const periodEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
    
    // Filter weigh-ins to only include those within the period
    const filteredWeighIns = weighIns.filter(weighIn => {
      const weighInDate = new Date(weighIn.date);
      return weighInDate >= periodStartDate && weighInDate <= periodEndDate;
    });
    
    // Sort by date (oldest first)
    const sortedWeighIns = [...filteredWeighIns].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Add the starting weight if not already in the data
    const hasStartingWeight = sortedWeighIns.some(
      w => new Date(w.date).toDateString() === periodStartDate.toDateString()
    );
    
    const chartData = [];
    
    // Add starting weight point if needed
    if (!hasStartingWeight) {
      chartData.push({
        date: periodStartDate,
        weight: isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
        isActual: false
      });
    }
    
    // Add all weigh-ins with converted weight units if needed
    chartData.push(
      ...sortedWeighIns.map(weighIn => ({
        date: new Date(weighIn.date),
        weight: isImperial ? weighIn.weight * 2.20462 : weighIn.weight,
        isActual: true
      }))
    );
    
    // Sort again to ensure chronological order
    chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Find min and max weight to set y-axis domain with some padding
    const weights = chartData.map(item => item.weight);
    const minWeight = Math.floor(Math.min(...weights) - 1);
    
    // Generate the forecast data
    const generateForecastData = () => {
      // If we have less than 2 points, we can't make a forecast
      if (chartData.length < 2) return chartData;

      // Get the converted target weight if provided
      const convertedTargetWeight = targetWeight !== undefined ? 
        (isImperial ? targetWeight * 2.20462 : targetWeight) : null;

      // Calculate the average daily weight change based on the actual data
      const firstPoint = chartData[0];
      const lastActualPoint = chartData[chartData.length - 1];
      const daysElapsed = differenceInDays(lastActualPoint.date, firstPoint.date) || 1;
      const totalWeightChange = lastActualPoint.weight - firstPoint.weight;
      const avgDailyChange = totalWeightChange / daysElapsed;

      // Create a copy of the chart data for forecast
      const forecastData = [...chartData];

      // If we already reached the end date, no need to forecast
      if (new Date() >= periodEndDate) return forecastData;

      // Generate forecast points from last actual weigh-in to end date
      const lastDate = lastActualPoint.date;
      const daysToForecast = differenceInDays(periodEndDate, lastDate);

      let previousWeight = lastActualPoint.weight;
      
      // If weight is increasing (gaining) but we want to lose weight, or
      // if weight is decreasing (losing) but we want to gain weight,
      // don't continue the forecast in the wrong direction
      const isWeightLoss = avgDailyChange < 0;
      const isTargetLower = convertedTargetWeight !== null && 
                           convertedTargetWeight < lastActualPoint.weight;
      
      // If the trend is opposite from the target goal, don't forecast
      if ((isWeightLoss && !isTargetLower) || (!isWeightLoss && isTargetLower)) {
        return forecastData;
      }

      for (let i = 1; i <= daysToForecast; i++) {
        const forecastDate = addDays(lastDate, i);
        const forecastWeight = previousWeight + avgDailyChange;
        
        // If target weight is provided, check if we've reached it
        if (convertedTargetWeight !== null) {
          // For weight loss: stop if forecast goes below target
          if (isWeightLoss && forecastWeight <= convertedTargetWeight) {
            forecastData.push({
              date: forecastDate,
              weight: convertedTargetWeight,
              isActual: false,
              isForecast: true
            });
            // We've reached target, stop forecasting
            break;
          }
          // For weight gain: stop if forecast goes above target
          else if (!isWeightLoss && forecastWeight >= convertedTargetWeight) {
            forecastData.push({
              date: forecastDate,
              weight: convertedTargetWeight,
              isActual: false,
              isForecast: true
            });
            // We've reached target, stop forecasting
            break;
          }
        }
        
        forecastData.push({
          date: forecastDate,
          weight: forecastWeight,
          isActual: false,
          isForecast: true
        });

        previousWeight = forecastWeight;
      }

      return forecastData;
    };

    // Get the max weight considering both actual data and possibly the target weight
    const forecastData = generateForecastData();
    const allWeights = [...forecastData.map(item => item.weight)];
    const maxWeight = Math.ceil(Math.max(...allWeights) + 1);

    return {
      chartData,
      forecastData,
      minWeight,
      maxWeight,
      hasValidData: true
    };
  }, [weighIns, currentPeriod, isImperial, targetWeight]);
};
