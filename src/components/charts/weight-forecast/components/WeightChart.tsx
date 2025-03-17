
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
import { format, addDays } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import CustomTooltip from '../../CustomTooltip';

interface WeightChartProps {
  displayData: any[];
  actualData: any[];
  forecastData: any[];
  minWeight: number;
  maxWeight: number;
  isImperial: boolean;
  startDate: number;
  endDate: number;
  targetWeight?: number;
}

const WeightChart: React.FC<WeightChartProps> = ({
  displayData,
  actualData,
  forecastData,
  minWeight,
  maxWeight,
  isImperial,
  startDate,
  endDate,
  targetWeight
}) => {
  // Add padding to the end date to ensure labels aren't cut off
  // Reduced padding from 35 days to 15 days to minimize whitespace
  const paddedEndDate = addDays(new Date(endDate), 15).getTime();
  
  // Chart configuration
  const chartConfig = {
    actual: {
      label: "Actual Weight",
      color: "#0EA5E9"
    },
    forecast: {
      label: "Forecast",
      color: "#F97316"
    },
    target: {
      label: "Target",
      color: "#10B981"
    }
  };
  
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        data={displayData}
        margin={{ top: 20, right: 90, left: 20, bottom: 30 }} // Increased right margin to 90
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date"
          type="number"
          domain={[startDate, paddedEndDate]} 
          tickFormatter={(date) => format(new Date(date), 'MMM d')}
          scale="time"
          tick={{ fill: '#666', fontSize: 12 }}
          allowDataOverflow
        />
        <YAxis 
          domain={[minWeight, maxWeight]}
          tickFormatter={(value) => value.toFixed(0)}
          tick={{ fill: '#666', fontSize: 12 }}
          allowDataOverflow
          label={{ 
            value: `Weight (${isImperial ? 'lbs' : 'kg'})`, 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle' },
            fill: '#666' 
          }}
        />
        <ChartTooltip content={<CustomTooltip isImperial={isImperial} />} />
        
        {/* Actual weight line */}
        <Line 
          type="monotone" 
          dataKey="weight" 
          data={actualData}
          stroke="var(--color-actual)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-actual)", stroke: '#fff', strokeWidth: 1 }}
          isAnimationActive={false}
          name="Actual Weight"
          connectNulls={true}
        />
        
        {/* Forecast weight line */}
        <Line 
          type="monotone" 
          dataKey="weight" 
          data={forecastData}
          stroke="var(--color-forecast)" 
          strokeWidth={2}
          strokeDasharray="5 5" // Dashed line for forecast
          dot={{ r: 4, fill: "var(--color-forecast)", stroke: '#fff', strokeWidth: 1 }}
          isAnimationActive={false}
          name="Forecast"
          connectNulls={true}
        />
        
        {/* Target weight line */}
        {targetWeight && (
          <ReferenceLine 
            y={targetWeight} 
            stroke="var(--color-target)" 
            strokeDasharray="3 3"
            label={{ 
              value: `Target: ${targetWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`,
              position: 'right',
              fill: "var(--color-target)",
              fontSize: 12
            }}
          />
        )}
      </LineChart>
    </ChartContainer>
  );
};

export default WeightChart;
