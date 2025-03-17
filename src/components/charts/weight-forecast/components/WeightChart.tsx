
import React from 'react';
import { 
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import CustomTooltip from '../CustomTooltip';
import { ReferenceLines } from './ReferenceLines';
import ChartContainer from './ChartContainer';
import WeightChartLines from './WeightChartLines';
import { useChartDomains } from './useChartDomains';

interface WeightChartProps {
  displayData: any[];
  minWeight: number;
  maxWeight: number;
  isImperial: boolean;
  activeView: 'forecast';
  targetLine: any[];
}

const WeightChart: React.FC<WeightChartProps> = ({
  displayData,
  minWeight,
  maxWeight,
  isImperial,
  targetLine
}) => {
  // Use the custom hook to calculate domains and separate data
  const {
    domainStart,
    domainEnd,
    actualData,
    forecastData,
    today,
    targetDate,
    periodEndDate
  } = useChartDomains(displayData, targetLine, 'forecast');
  
  console.log('WeightChart rendering with:', {
    displayDataCount: displayData?.length || 0,
    minWeight,
    maxWeight,
    domainStart,
    domainEnd,
    actualDataCount: actualData?.length || 0,
    forecastDataCount: forecastData?.length || 0,
    targetLineCount: targetLine?.length || 0,
    actualDataSample: actualData?.[0],
    forecastDataSample: forecastData?.[0]
  });

  // Create the chart
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            scale="time"
            allowDataOverflow
            height={50}
          />
          <YAxis 
            domain={[minWeight, maxWeight]}
            tickFormatter={(value) => value.toFixed(0)}
            tick={{ fill: '#666', fontSize: 12 }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={{ stroke: '#E0E0E0' }}
            allowDataOverflow
            label={{ 
              value: `Weight (${isImperial ? 'lbs' : 'kg'})`, 
              angle: -90, 
              position: 'insideLeft', 
              offset: 0,
              style: { textAnchor: 'middle' },
              fill: '#666' 
            }}
            width={60}
            // For weight loss, we want lower weights at the bottom
            // Only reverse for weight gain goals
            reversed={false}
          />
          <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
          
          {/* Chart Lines: Actual, Forecast, and Target */}
          <WeightChartLines 
            actualData={actualData || []}
            forecastData={forecastData || []}
            targetLine={targetLine || []}
            activeView="forecast"
          />
          
          {/* Reference lines for current date and target date */}
          <ReferenceLines 
            chartData={displayData || []}
            today={today}
            targetDate={targetDate}
            periodEndDate={periodEndDate}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default WeightChart;
