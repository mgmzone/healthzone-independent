
import { useMemo } from 'react';

export const useChartDomains = (
  displayData: any[],
  targetLine: any[],
  activeView: 'actual' | 'forecast'
) => {
  return useMemo(() => {
    console.log('useChartDomains input:', {
      displayDataCount: displayData.length,
      targetLineCount: targetLine.length,
      activeView
    });
    
    // Find the earliest and latest dates for domain
    const today = new Date();
    
    // Separate actual and forecast data
    const actualData = displayData.filter(d => d.isActual);
    
    // Get the last actual data point
    const lastActualPoint = actualData.length > 0 ? actualData[actualData.length - 1] : null;
    
    // Process forecast data
    let forecastData: any[] = [];
    
    if (activeView === 'forecast' && lastActualPoint) {
      // Extract all forecast points (those marked with isForecast)
      forecastData = displayData.filter(d => d.isForecast);
      
      // Ensure forecastData starts with the last actual point
      const lastActualExists = forecastData.some(
        d => new Date(d.date).getTime() === new Date(lastActualPoint.date).getTime()
      );
      
      if (!lastActualExists && forecastData.length > 0) {
        forecastData.unshift({
          ...lastActualPoint,
          isActual: false,
          isForecast: true
        });
      }
      
      // Sort by date
      forecastData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    // Find earliest date from all data
    let earliestDate = displayData.length > 0 ? new Date(displayData[0].date) : today;
    
    // Find target date (the last date in the forecast)
    const lastForecastPoint = forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
    const lastTargetPoint = targetLine.length > 0 ? targetLine[targetLine.length - 1] : null;
    
    // For x-axis domain, use the latest end date between forecast and target line
    let latestDate;
    
    if (activeView === 'actual') {
      // In actual view, just use the latest actual data point
      latestDate = lastActualPoint ? new Date(lastActualPoint.date) : today;
    } else {
      // In forecast view, use the latest end date between forecast and target line
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
    
    // Ensure we have the earliest date from all data
    if (displayData.length > 0) {
      displayData.forEach(d => {
        const date = new Date(d.date);
        if (date < earliestDate) {
          earliestDate = date;
        }
      });
    }
    
    // If there's target line data, check its dates too
    if (targetLine.length > 0) {
      // Get the earliest date
      const targetEarliestDate = new Date(targetLine[0].date);
      if (targetEarliestDate < earliestDate) {
        earliestDate = targetEarliestDate;
      }
    }
    
    // For domain, use timestamps
    const domainStart = earliestDate.getTime();
    const domainEnd = latestDate.getTime();

    console.log('Chart domains calculated:', {
      earliestDate,
      latestDate,
      domainStart,
      domainEnd,
      actualDataCount: actualData.length,
      forecastDataCount: forecastData.length
    });

    return {
      domainStart,
      domainEnd,
      actualData,
      forecastData,
      lastActualPoint,
      today,
      targetDate: lastForecastPoint ? new Date(lastForecastPoint.date) : null,
      periodEndDate: latestDate
    };
  }, [displayData, targetLine, activeView]);
};
