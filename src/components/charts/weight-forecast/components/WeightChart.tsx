
import React from 'react';
import { ReferenceLines } from './ReferenceLines';
import ChartContainer from './ChartContainer';
import ChartLines from './ChartLines';
import { separateChartData } from '../utils/domainUtils';

interface WeightChartProps {
  displayData: any[];
  minWeight: number;
  maxWeight: number;
  isImperial: boolean;
  activeView: 'actual' | 'forecast';
  targetLine: any[];
}

const WeightChart: React.FC<WeightChartProps> = ({
  displayData,
  minWeight,
  maxWeight,
  isImperial,
  activeView,
  targetLine
}) => {
  const today = new Date();
  
  console.log('WeightChart input data:', {
    displayDataCount: displayData.length,
    targetLineCount: targetLine.length,
    displayDataSample: displayData.slice(0, 3),
    targetLineSample: targetLine.slice(0, 3)
  });
  
  // Separate actual and forecast data - using the utility function
  const { actualData, forecastData } = separateChartData(displayData);
  
  console.log('Separated chart data:', {
    originalLength: displayData.length,
    actualLength: actualData.length,
    forecastLength: forecastData.length,
    actualSample: actualData.length > 0 ? actualData[0] : null,
    forecastSample: forecastData.length > 0 ? forecastData[0] : null
  });
  
  // Calculate domain for chart using utility function
  const domainStart = Math.min(
    ...displayData.map(d => d.date instanceof Date ? d.date.getTime() : new Date(d.date).getTime())
  );
  
  const domainEnd = Math.max(
    ...displayData.map(d => d.date instanceof Date ? d.date.getTime() : new Date(d.date).getTime()),
    ...targetLine.map(d => d.date instanceof Date ? d.date.getTime() : new Date(d.date).getTime())
  );
  
  // Find target date (the last date in the forecast)
  const lastForecastPoint = forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
  
  // Get the target date
  let targetDate = null;
  if (lastForecastPoint) {
    targetDate = lastForecastPoint.date instanceof Date 
      ? lastForecastPoint.date 
      : new Date(lastForecastPoint.date);
  }
  
  console.log('WeightChart calculated dates:', {
    domainStart,
    domainEnd,
    minWeight,
    maxWeight,
    actualDataLength: actualData.length,
    forecastDataLength: forecastData.length,
    displayDataLength: displayData.length,
    actualFirstPoint: actualData.length > 0 ? actualData[0] : null,
    forecastFirstPoint: forecastData.length > 0 ? forecastData[0] : null,
    targetDate
  });

  return (
    <ChartContainer
      data={displayData}
      minWeight={minWeight}
      maxWeight={maxWeight}
      isImperial={isImperial}
      domainStart={domainStart}
      domainEnd={domainEnd}
    >
      <ChartLines
        actualData={actualData}
        forecastData={forecastData}
        targetLine={targetLine}
        activeView={activeView}
      />
        
      {/* Reference lines for current date and target date */}
      <ReferenceLines 
        chartData={displayData}
        today={today}
        targetDate={targetDate}
        periodEndDate={new Date(domainEnd)}
      />
    </ChartContainer>
  );
};

export default WeightChart;
