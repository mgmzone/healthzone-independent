
import { useMemo } from 'react';

export const useChartDomains = (
  displayData: any[],
  targetLine: any[],
  activeView: 'actual' | 'forecast'
) => {
  return useMemo(() => {
    const safeDisplayData = displayData || [];
    const safeTargetLine = targetLine || [];

    console.log('useChartDomains input:', {
      displayDataCount: safeDisplayData.length,
      targetLineCount: safeTargetLine.length,
      activeView
    });
    
    // Find the earliest and latest dates for domain
    const today = new Date();
    
    // Separate actual and forecast data
    const actualData = safeDisplayData.filter(d => d && d.isActual);
    
    // Get the last actual data point
    const lastActualPoint = actualData.length > 0 ? actualData[actualData.length - 1] : null;
    
    // Process forecast data
    let forecastData: any[] = [];
    
    if (activeView === 'forecast' && lastActualPoint) {
      // Extract all forecast points (those marked with isForecast)
      forecastData = safeDisplayData.filter(d => d && d.isForecast);
      
      // Ensure forecastData starts with the last actual point
      const lastActualExists = forecastData.some(
        d => d && lastActualPoint && 
        new Date(d.date).getTime() === new Date(lastActualPoint.date).getTime()
      );
      
      if (!lastActualExists && forecastData.length > 0 && lastActualPoint) {
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
    let earliestDate = safeDisplayData.length > 0 ? new Date(safeDisplayData[0].date) : today;
    
    // Find target date (the last date in the forecast)
    const lastForecastPoint = forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
    const lastTargetPoint = safeTargetLine.length > 0 ? safeTargetLine[safeTargetLine.length - 1] : null;
    
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
    if (safeDisplayData.length > 0) {
      safeDisplayData.forEach(d => {
        if (d && d.date) {
          const date = new Date(d.date);
          if (date < earliestDate) {
            earliestDate = date;
          }
        }
      });
    }
    
    // If there's target line data, check its dates too
    if (safeTargetLine.length > 0) {
      // Get the earliest date
      const targetEarliestDate = new Date(safeTargetLine[0].date);
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
