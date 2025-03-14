
import React from 'react';
import { ReferenceLines } from './ReferenceLines';
import ChartContainer from './ChartContainer';
import ChartLines from './ChartLines';
import { calculateChartDomain, separateChartData } from '../utils/domainUtils';

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
  
  // Separate actual and forecast data
  const { actualData, forecastData } = separateChartData(displayData);
  
  // Calculate domain for chart using utility function
  const { domainStart, domainEnd } = calculateChartDomain(displayData, targetLine, activeView);
  
  // Find target date (the last date in the forecast)
  const lastForecastPoint = forecastData.length > 0 ? forecastData[forecastData.length - 1] : null;
  
  // Get the target date
  let targetDate = null;
  if (lastForecastPoint) {
    if (lastForecastPoint.date instanceof Date) {
      targetDate = lastForecastPoint.date;
    } else if (typeof lastForecastPoint.date === 'object' && lastForecastPoint.date?._type === 'Date') {
      targetDate = new Date(lastForecastPoint.date.value.value);
    } else {
      targetDate = new Date(lastForecastPoint.date);
    }
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
