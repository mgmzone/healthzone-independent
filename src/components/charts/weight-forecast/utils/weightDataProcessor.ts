
import { WeighIn, Period } from '@/lib/types';
import { createChartDataPoint } from './forecastUtils';

/**
 * Safely converts various date formats to a Date object
 */
const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  if (typeof date === 'number') return new Date(date);
  if (typeof date === 'string') return new Date(date);
  if (date?._type === 'Date' && date?.value?.value) {
    return new Date(date.value.value);
  }
  return new Date(); // fallback
};

/**
 * Processes weigh-in data to create chart data points
 */
export const processWeighInData = (
  weighIns: WeighIn[],
  currentPeriod: Period | undefined,
  isImperial: boolean
) => {
  if (!currentPeriod || weighIns.length === 0) {
    return {
      chartData: [],
      hasValidData: false
    };
  }
  
  // Process and filter weigh-ins to only include those within the current period
  const periodStartDate = ensureDate(currentPeriod.startDate);
  const periodEndDate = currentPeriod.endDate ? ensureDate(currentPeriod.endDate) : new Date();
  
  console.log('Processing weight data:', {
    periodStartDate,
    periodEndDate,
    weighInsCount: weighIns.length,
    startWeight: currentPeriod.startWeight,
    isImperial
  });
  
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
    // Convert starting weight to display units
    const startingWeightConverted = isImperial ? 
      currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight;
    
    chartData.push(createChartDataPoint(periodStartDate, startingWeightConverted, true, false));
    
    console.log('Added starting weight point:', {
      date: periodStartDate,
      weight: startingWeightConverted,
      isImperial
    });
  }
  
  // Add all weigh-ins with converted weight units if needed
  chartData.push(
    ...sortedWeighIns.map(weighIn => {
      // Weigh-ins are stored in kg, convert if needed
      const weightConverted = isImperial ? 
        weighIn.weight * 2.20462 : weighIn.weight;
      
      return createChartDataPoint(new Date(weighIn.date), weightConverted, true, false);
    })
  );
  
  // Sort again to ensure chronological order
  chartData.sort((a, b) => {
    const aDate = ensureDate(a.date);
    const bDate = ensureDate(b.date);
    return aDate.getTime() - bDate.getTime();
  });
  
  console.log('Processed chart data:', {
    chartDataCount: chartData.length,
    firstPoint: chartData.length > 0 ? chartData[0] : null,
    lastPoint: chartData.length > 0 ? chartData[chartData.length - 1] : null
  });
  
  return {
    chartData,
    hasValidData: true
  };
};

/**
 * Combines actual data with forecast data without duplicates
 */
export const combineChartData = (actualData: any[], forecastData: any[]) => {
  const combinedData = [...actualData];
  
  // Only add forecast points that don't overlap with actual data
  forecastData.forEach(forecastPoint => {
    const forecastDate = ensureDate(forecastPoint.date).getTime();
      
    const existingPoint = actualData.find(actualPoint => {
      const actualDate = ensureDate(actualPoint.date).getTime();
      return actualDate === forecastDate;
    });
    
    if (!existingPoint) {
      combinedData.push(forecastPoint);
    }
  });
  
  // Sort combined data by date
  return combinedData.sort((a, b) => {
    const aDate = ensureDate(a.date).getTime();
    const bDate = ensureDate(b.date).getTime();
    return aDate - bDate;
  });
};
