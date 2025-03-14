
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
  
  // Get domain start date (earliest date in the dataset)
  let earliestDate = displayData.length > 0 
    ? new Date(displayData[0].date) 
    : today;
  
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
  
  // Get domain end date based on active view
  let latestDate;
  
  if (activeView === 'actual') {
    // In actual view, just use actual data for domain
    const actualData = displayData.filter(d => d.isActual);
    latestDate = actualData.length > 0 
      ? new Date(actualData[actualData.length - 1].date) 
      : today;
  } else {
    // In forecast view, use the latest end date between all data
    const allDates = [...displayData];
    if (targetLine && targetLine.length > 0) {
      allDates.push(...targetLine);
    }
    
    // Find latest date
    latestDate = allDates.reduce((latest, point) => {
      const date = new Date(point.date);
      return date > latest ? date : latest;
    }, today);
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
  if (!displayData || displayData.length === 0) {
    return { actualData: [], forecastData: [] };
  }
  
  // Get actual data
  const actualData = displayData.filter(d => d.isActual);
  
  // Get last actual point if not provided
  const lastActual = lastActualPoint || 
    (actualData.length > 0 ? actualData[actualData.length - 1] : null);
  
  // Extract forecast data
  const forecastData = displayData.filter(d => d.isForecast);
  
  // Ensure forecastData starts with the last actual point
  if (lastActual && forecastData.length > 0) {
    const lastActualExists = forecastData.some(
      d => new Date(d.date).getTime() === new Date(lastActual.date).getTime()
    );
    
    if (!lastActualExists) {
      forecastData.unshift({
        ...lastActual,
        isActual: false,
        isForecast: true
      });
    }
    
    // Sort by date
    forecastData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  return { actualData, forecastData };
};
