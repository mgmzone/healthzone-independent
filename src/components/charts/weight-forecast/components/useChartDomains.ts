
import { useMemo } from 'react';

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

export const useChartDomains = (
  displayData: any[],
  targetLine: any[],
  activeView: 'forecast'
) => {
  return useMemo(() => {
    const safeDisplayData = displayData || [];
    const safeTargetLine = targetLine || [];

    console.log('useChartDomains input:', {
      displayDataCount: safeDisplayData.length,
      targetLineCount: safeTargetLine.length,
      activeView,
      dataSample: safeDisplayData[0]
    });
    
    // Find the earliest and latest dates for domain
    const today = new Date();
    
    // Convert complex Date objects to timestamps for processing
    const processData = (data: any[]) => {
      return data.map(d => {
        if (!d) return null;
        
        // Convert date to timestamp for consistent processing
        const timestamp = ensureDate(d.date).getTime();
        
        return {
          ...d,
          date: timestamp
        };
      }).filter(Boolean);
    };
    
    const processedDisplayData = processData(safeDisplayData);
    
    if (processedDisplayData.length === 0) {
      console.log('No display data available for chart domain calculation');
      return {
        domainStart: today.getTime() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        domainEnd: today.getTime() + (30 * 24 * 60 * 60 * 1000),  // 30 days ahead
        actualData: [],
        forecastData: [],
        lastActualPoint: null,
        today,
        targetDate: null,
        periodEndDate: null
      };
    }
    
    // Separate actual and forecast data
    const actualData = processedDisplayData.filter(d => d && d.isActual);
    
    // Get the last actual data point
    const lastActualPoint = actualData.length > 0 ? actualData[actualData.length - 1] : null;
    
    // Process forecast data
    let forecastData: any[] = [];
    
    if (lastActualPoint) {
      // Extract all forecast points (those marked with isForecast)
      forecastData = processedDisplayData.filter(d => d && d.isForecast);
      
      // Ensure forecastData starts with the last actual point
      const lastActualExists = forecastData.some(
        d => d && lastActualPoint && d.date === lastActualPoint.date
      );
      
      if (!lastActualExists && forecastData.length > 0 && lastActualPoint) {
        forecastData.unshift({
          ...lastActualPoint,
          isActual: false,
          isForecast: true
        });
      }
      
      // Sort by date
      forecastData.sort((a, b) => a.date - b.date);
    }
    
    // Process target line data
    const processedTargetLine = processData(safeTargetLine);
    
    // Find earliest date from all data
    let earliestDate = today;
    if (processedDisplayData.length > 0) {
      // Find the earliest date in processed data
      earliestDate = processedDisplayData.reduce((earliest, point) => {
        const date = ensureDate(point.date);
        return date < earliest ? date : earliest;
      }, ensureDate(processedDisplayData[0].date));
    }
    
    // Find target date (the last date in the forecast)
    const lastForecastPoint = forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
    const lastTargetPoint = processedTargetLine.length > 0 ? processedTargetLine[processedTargetLine.length - 1] : null;
    
    // For x-axis domain, use the latest end date between forecast and target line
    const forecastEndDate = lastForecastPoint ? ensureDate(lastForecastPoint.date) : null;
    const targetEndDate = lastTargetPoint ? ensureDate(lastTargetPoint.date) : null;
    
    let latestDate = today;
    if (forecastEndDate && targetEndDate) {
      latestDate = forecastEndDate > targetEndDate ? forecastEndDate : targetEndDate;
    } else if (forecastEndDate) {
      latestDate = forecastEndDate;
    } else if (targetEndDate) {
      latestDate = targetEndDate;
    }
    
    // Add some padding to the domain for better visualization
    const domainStartDate = new Date(earliestDate);
    domainStartDate.setDate(domainStartDate.getDate() - 2); // 2 days before earliest data point
    
    const domainEndDate = new Date(latestDate);
    domainEndDate.setDate(domainEndDate.getDate() + 5); // 5 days after latest data point
    
    // For domain, use timestamps
    const domainStart = domainStartDate.getTime();
    const domainEnd = domainEndDate.getTime();

    console.log('Chart domains calculated:', {
      earliestDate,
      latestDate,
      domainStart,
      domainEnd,
      actualDataCount: actualData.length,
      forecastDataCount: forecastData.length,
      actualDataSample: actualData[0],
      forecastDataSample: forecastData[0]
    });

    return {
      domainStart,
      domainEnd,
      actualData,
      forecastData,
      lastActualPoint,
      today,
      targetDate: lastForecastPoint ? ensureDate(lastForecastPoint.date) : null,
      periodEndDate: latestDate
    };
  }, [displayData, targetLine, activeView]);
};
