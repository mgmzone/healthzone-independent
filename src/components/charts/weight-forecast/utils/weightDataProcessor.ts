
import { WeighIn, Period } from '@/lib/types';
import { convertWeightUnits, createChartDataPoint } from './forecastUtils';

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
    const startingWeightConverted = convertWeightUnits(currentPeriod.startWeight, isImperial);
    chartData.push(createChartDataPoint(periodStartDate, startingWeightConverted, true, false));
  }
  
  // Add all weigh-ins with converted weight units if needed
  chartData.push(
    ...sortedWeighIns.map(weighIn => {
      const weightConverted = convertWeightUnits(weighIn.weight, isImperial);
      return createChartDataPoint(new Date(weighIn.date), weightConverted, true, false);
    })
  );
  
  // Sort again to ensure chronological order
  chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
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
    const existingPoint = actualData.find(
      actualPoint => new Date(actualPoint.date).getTime() === new Date(forecastPoint.date).getTime()
    );
    
    if (!existingPoint) {
      combinedData.push(forecastPoint);
    }
  });
  
  // Sort combined data by date
  return combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
