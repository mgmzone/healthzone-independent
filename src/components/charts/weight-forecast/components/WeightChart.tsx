
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
  
  // Find target date (the last date in the forecast)
  const targetDate = forecastData.length > 0 ? new Date(forecastData[forecastData.length - 1].date) : null;
  
  // Find the last meaningful date in both datasets for x-axis range
  let lastTargetLineDate = targetLine.length > 0 ? 
    new Date(targetLine[targetLine.length - 1].date) : null;
  
  let lastForecastDate = forecastData.length > 0 ? 
    new Date(forecastData[forecastData.length - 1].date) : null;
  
  // Determine the latest date between the two trend lines for x-axis domain
  let latestEndDate = null;
  if (lastTargetLineDate && lastForecastDate) {
    latestEndDate = lastTargetLineDate > lastForecastDate ? lastTargetLineDate : lastForecastDate;
  } else if (lastTargetLineDate) {
    latestEndDate = lastTargetLineDate;
  } else if (lastForecastDate) {
    latestEndDate = lastForecastDate;
  }
  
  console.log('WeightChart render:', {
    minWeight,
    maxWeight,
    actualDataCount: actualData.length,
    forecastDataCount: forecastData.length,
    targetLineCount: targetLine.length,
    lastTargetLineDate,
    lastForecastDate,
    latestEndDate,
    isImperial
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
          domain={['dataMin', latestEndDate ? new Date(latestEndDate).getTime() : 'dataMax']}
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
          targetDate={targetDate}
          periodEndDate={latestEndDate || null}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
