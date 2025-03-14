
import { addDays } from 'date-fns';

/**
 * Separates chart data into actual and forecast data points
 */
export const separateChartData = (chartData: any[]) => {
  const actualData = chartData.filter(point => point.isActual === true);
  const forecastData = chartData.filter(point => point.isForecast === true);
  
  // Log the separation results
  console.log('Separated chart data:', {
    originalLength: chartData.length,
    actualLength: actualData.length,
    forecastLength: forecastData.length,
    actualSample: actualData.length > 0 ? actualData[0] : null,
    forecastSample: forecastData.length > 0 ? forecastData[0] : null
  });
  
  return { actualData, forecastData };
};

/**
 * Calculates appropriate domain for chart axis
 */
export const calculateChartDomain = (chartData: any[], targetLine: any[], activeView: 'actual' | 'forecast') => {
  // Extract dates safely regardless of date format
  const extractDate = (point: any) => {
    if (!point || !point.date) return null;
    
    // Handle various date formats
    let date;
    if (point.date instanceof Date) {
      date = point.date;
    } else if (typeof point.date === 'object' && point.date?._type === 'Date') {
      date = new Date(point.date.value.value);
    } else if (typeof point.date === 'number') {
      date = new Date(point.date);
    } else {
      date = new Date(point.date);
    }
    
    return date;
  };
  
  // Get all valid dates
  const allDates = [
    ...chartData.map(point => extractDate(point)),
    ...targetLine.map(point => extractDate(point))
  ].filter(Boolean) as Date[];
  
  if (allDates.length === 0) {
    // If no valid dates, use defaults
    return {
      domainStart: new Date().getTime(),
      domainEnd: addDays(new Date(), 30).getTime()
    };
  }
  
  // Find earliest and latest dates
  const timeValues = allDates.map(d => d.getTime());
  const earliestDate = new Date(Math.min(...timeValues));
  const latestDate = new Date(Math.max(...timeValues));
  
  console.log('Domain calculation:', {
    earliestDate,
    latestDate,
    activeView,
    displayDataLength: chartData.length,
    targetLineLength: targetLine.length
  });
  
  // For 'actual' view, only show the actual data range
  if (activeView === 'actual') {
    const actualData = chartData.filter(point => point.isActual === true);
    if (actualData.length > 0) {
      const actualDates = actualData
        .map(point => extractDate(point))
        .filter(Boolean) as Date[];
      
      if (actualDates.length > 0) {
        const actualTimeValues = actualDates.map(d => d.getTime());
        const earliestActualDate = new Date(Math.min(...actualTimeValues));
        const latestActualDate = new Date(Math.max(...actualTimeValues));
        
        return {
          domainStart: earliestActualDate.getTime(),
          domainEnd: latestActualDate.getTime()
        };
      }
    }
  }
  
  // For forecast view or fallback, show the full range
  return {
    domainStart: earliestDate.getTime(),
    domainEnd: latestDate.getTime()
  };
};
