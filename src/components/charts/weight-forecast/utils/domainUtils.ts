
import { SimpleWeightData } from './types';

/**
 * Helper function to ensure date is a timestamp
 */
const ensureTimestamp = (dateValue: any): number => {
  if (typeof dateValue === 'number') {
    return dateValue;
  }
  
  if (dateValue instanceof Date) {
    return dateValue.getTime();
  }
  
  // Handle serialized Date objects from console logs
  if (typeof dateValue === 'object' && dateValue?._type === 'Date') {
    return dateValue.value.value;
  }
  
  try {
    return new Date(dateValue).getTime();
  } catch (e) {
    console.error('Failed to convert date to timestamp:', dateValue, e);
    return Date.now();
  }
};

/**
 * Calculates the domain start and end timestamps for the chart x-axis
 */
export const calculateChartDomain = (
  displayData: any[],
  targetLine: any[],
  activeView: 'actual' | 'forecast'
): { domainStart: number; domainEnd: number } => {
  const today = new Date();
  
  if (!displayData || displayData.length === 0) {
    return {
      domainStart: today.getTime() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
      domainEnd: today.getTime() + (7 * 24 * 60 * 60 * 1000)    // 1 week from now
    };
  }
  
  // Get domain start date (earliest date in the dataset)
  let earliestDate = today;
  let foundEarlier = false;
  
  // Check displayData for earliest date
  displayData.forEach(d => {
    if (d && d.date) {
      const dateTimestamp = ensureTimestamp(d.date);
      const date = new Date(dateTimestamp);
      if (!foundEarlier || date < earliestDate) {
        earliestDate = date;
        foundEarlier = true;
      }
    }
  });
  
  // Check target line for earlier dates
  if (targetLine && targetLine.length > 0) {
    targetLine.forEach(point => {
      if (point && point.date) {
        const dateTimestamp = ensureTimestamp(point.date);
        const date = new Date(dateTimestamp);
        if (!foundEarlier || date < earliestDate) {
          earliestDate = date;
          foundEarlier = true;
        }
      }
    });
  }
  
  // Get domain end date based on active view
  let latestDate = today;
  
  if (activeView === 'actual') {
    // In actual view, just use actual data for domain
    const actualData = displayData.filter(d => d.isActual);
    if (actualData.length > 0) {
      actualData.forEach(point => {
        if (point && point.date) {
          const dateTimestamp = ensureTimestamp(point.date);
          const date = new Date(dateTimestamp);
          if (date > latestDate) {
            latestDate = date;
          }
        }
      });
    }
  } else {
    // In forecast view, use the latest end date from all data
    const allPoints = [...displayData];
    if (targetLine && targetLine.length > 0) {
      allPoints.push(...targetLine);
    }
    
    allPoints.forEach(point => {
      if (point && point.date) {
        const dateTimestamp = ensureTimestamp(point.date);
        const date = new Date(dateTimestamp);
        if (date > latestDate) {
          latestDate = date;
        }
      }
    });
  }
  
  console.log('Domain calculation:', {
    earliestDate,
    latestDate,
    activeView,
    displayDataLength: displayData.length,
    targetLineLength: targetLine.length
  });
  
  return {
    domainStart: earliestDate.getTime(),
    domainEnd: latestDate.getTime()
  };
};

/**
 * Separates data into actual and forecast datasets
 */
export const separateChartData = (
  displayData: any[]
): { actualData: any[]; forecastData: any[] } => {
  if (!displayData || displayData.length === 0) {
    return { actualData: [], forecastData: [] };
  }
  
  // Get actual data (those with isActual flag)
  const actualData = displayData.filter(d => d && d.isActual === true);
  
  // Get forecast data (those with isForecast flag)
  const forecastData = displayData.filter(d => d && d.isForecast === true);
  
  console.log('Separated chart data:', {
    originalLength: displayData.length,
    actualLength: actualData.length,
    forecastLength: forecastData.length,
    actualSample: actualData.length > 0 ? actualData[0] : null,
    forecastSample: forecastData.length > 0 ? forecastData[0] : null
  });
  
  return { actualData, forecastData };
};
