
import { SimpleWeightData } from './types';

/**
 * Calculates the domain start and end timestamps for the chart x-axis
 */
export const calculateChartDomain = (
  displayData: any[],
  targetLine: any[],
  activeView: 'actual' | 'forecast'
): { domainStart: number; domainEnd: number } => {
  const today = new Date();
  
  // Separate actual data
  const actualData = displayData.filter(d => d.isActual);
  const lastActualPoint = actualData.length > 0 ? actualData[actualData.length - 1] : null;
  
  // Process forecast data
  const forecastData = activeView === 'forecast' 
    ? displayData.filter(d => d.isForecast)
    : [];
  
  // Get domain start date (earliest date in the dataset)
  let earliestDate = displayData.length > 0 ? new Date(displayData[0].date) : today;
  
  // Ensure we have the earliest date from all data sources
  displayData.forEach(d => {
    const date = new Date(d.date);
    if (date < earliestDate) {
      earliestDate = date;
    }
  });
  
  // Check target line for earlier dates
  if (targetLine.length > 0) {
    const targetEarliestDate = new Date(targetLine[0].date);
    if (targetEarliestDate < earliestDate) {
      earliestDate = targetEarliestDate;
    }
  }
  
  // Get domain end date
  let latestDate;
  
  if (activeView === 'actual') {
    // In actual view, just use the latest actual data point
    latestDate = lastActualPoint ? new Date(lastActualPoint.date) : today;
  } else {
    // In forecast view, use the latest end date between forecast and target line
    const lastForecastPoint = forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
    const lastTargetPoint = targetLine.length > 0 ? targetLine[targetLine.length - 1] : null;
    
    const forecastEndDate = lastForecastPoint ? new Date(lastForecastPoint.date) : null;
    const targetEndDate = lastTargetPoint ? new Date(lastTargetPoint.date) : null;
    
    if (forecastEndDate && targetEndDate) {
      latestDate = forecastEndDate > targetEndDate ? forecastEndDate : targetEndDate;
    } else if (forecastEndDate) {
      latestDate = forecastEndDate;
    } else if (targetEndDate) {
      latestDate = targetEndDate;
    } else {
      latestDate = today;
    }
  }
  
  return {
    domainStart: earliestDate.getTime(),
    domainEnd: latestDate.getTime()
  };
};

/**
 * Separates data into actual and forecast datasets
 */
export const separateChartData = (
  displayData: any[],
  lastActualPoint: any | null
): { actualData: any[]; forecastData: any[] } => {
  // Get actual data
  const actualData = displayData.filter(d => d.isActual);
  
  // Extract forecast data
  let forecastData = displayData.filter(d => d.isForecast);
  
  // Ensure forecastData starts with the last actual point
  if (lastActualPoint && forecastData.length > 0) {
    const lastActualExists = forecastData.some(
      d => new Date(d.date).getTime() === new Date(lastActualPoint.date).getTime()
    );
    
    if (!lastActualExists) {
      forecastData.unshift({
        ...lastActualPoint,
        isActual: false,
        isForecast: true
      });
    }
    
    // Sort by date
    forecastData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  return { actualData, forecastData };
};
