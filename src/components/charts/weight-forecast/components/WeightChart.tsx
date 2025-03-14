
import React from 'react';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import CustomTooltip from '../CustomTooltip';
import { ReferenceLines } from './ReferenceLines';

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
  // Find out where actual data stops and forecast begins
  const today = new Date();
  
  // Separate actual and forecast data
  const actualData = displayData.filter(d => d.isActual);
  
  // Get the last actual data point
  const lastActualPoint = actualData.length > 0 ? actualData[actualData.length - 1] : null;
  
  // Process forecast data
  let forecastData = [];
  
  if (activeView === 'forecast' && lastActualPoint) {
    // Extract all forecast points (those marked with isForecast)
    forecastData = displayData.filter(d => d.isForecast);
    
    // Ensure forecastData starts with the last actual point
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
  
  // Find the earliest and latest dates for domain
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
  
  console.log('WeightChart calculated dates:', {
    earliestDate,
    latestDate,
    domainStart,
    domainEnd,
    minWeight,
    maxWeight
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={displayData}
        margin={{
          top: 30,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), 'MMM d')}
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={{ stroke: '#E0E0E0' }}
          domain={[domainStart, domainEnd]}
          type="number"
        />
        <YAxis 
          domain={[minWeight, maxWeight]}
          tickFormatter={(value) => value.toFixed(0)}
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={{ stroke: '#E0E0E0' }}
          label={{ 
            value: `Weight (${isImperial ? 'lbs' : 'kg'})`, 
            angle: -90, 
            position: 'insideLeft', 
            offset: 0,
            style: { textAnchor: 'middle' },
            fill: '#666' 
          }}
        />
        <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
        
        {/* Target Weight Line (Dashed Orange) - Shows the ideal weight loss path */}
        {activeView === 'forecast' && targetLine.length > 0 && (
          <Line 
            type="linear" 
            dataKey="weight"
            data={targetLine}
            stroke="#FF9966"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
            name="Target Path"
            connectNulls={true}
            isAnimationActive={false}
          />
        )}
        
        {/* Actual Weight Line (Blue) - Always visible with dots */}
        <Line 
          type="linear" 
          dataKey="weight" 
          data={actualData}
          stroke="#0066CC" 
          strokeWidth={2}
          activeDot={{ r: 6, fill: '#0066CC', stroke: '#fff', strokeWidth: 2 }}
          dot={{ 
            r: 4, 
            fill: '#0066CC',
            stroke: '#fff',
            strokeWidth: 1
          }}
          isAnimationActive={false}
          name="Actual Weight"
        />
        
        {/* Forecast Weight Line (Blue Dashed) - Only visible in forecast view */}
        {activeView === 'forecast' && forecastData.length > 0 && (
          <Line
            type="linear"
            dataKey="weight"
            data={forecastData}
            stroke="#0066CC"
            strokeWidth={2}
            strokeDasharray="5 5"
            activeDot={false}
            dot={false}
            name="Forecast"
            isAnimationActive={false}
            connectNulls={true}
          />
        )}
        
        {/* Reference lines for current date and target date */}
        <ReferenceLines 
          chartData={displayData}
          today={today}
          targetDate={lastForecastPoint ? new Date(lastForecastPoint.date) : null}
          periodEndDate={latestDate}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
