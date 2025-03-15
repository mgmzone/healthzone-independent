
import React from 'react';
import { 
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
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
  // Use the custom hook to calculate domains and separate data
  const {
    domainStart,
    domainEnd,
    actualData,
    forecastData,
    today,
    targetDate,
    periodEndDate
  } = useChartDomains(displayData, targetLine, activeView);
  
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
        
        {/* Chart Lines: Actual, Forecast, and Target */}
        <WeightChartLines 
          actualData={actualData || []}
          forecastData={forecastData || []}
          targetLine={targetLine || []}
          activeView={activeView}
        />
        
        {/* Reference lines for current date and target date */}
        <ReferenceLines 
          chartData={displayData || []}
          today={today}
          targetDate={targetDate}
          periodEndDate={periodEndDate}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default WeightChart;
