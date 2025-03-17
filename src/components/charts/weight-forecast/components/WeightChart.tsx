
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
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={displayData}
        margin={{ top: 20, right: 30, left: 20, bottom: 30 }} // Reduced right margin to 30
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
        <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
        
        {/* Actual weight line */}
        <Line 
          type="monotone" 
          dataKey="weight" 
          data={actualData}
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 1 }}
          isAnimationActive={false}
          name="Actual Weight"
          connectNulls={true}
        />
        
        {/* Forecast weight line */}
        <Line 
          type="monotone" 
          dataKey="weight" 
          data={forecastData}
          stroke="#F97316" // Orange color for forecast
          strokeWidth={2}
          strokeDasharray="5 5" // Dashed line for forecast
          dot={{ r: 4, fill: '#F97316', stroke: '#fff', strokeWidth: 1 }}
          isAnimationActive={false}
          name="Forecast"
          connectNulls={true}
        />
        
        {/* Target weight line */}
        {targetWeight && (
          <ReferenceLine 
            y={targetWeight} 
            stroke="#10B981" 
            strokeDasharray="3 3"
            label={{ 
              value: `Target: ${targetWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`,
              position: 'insideTopRight', // Changed from 'right' to 'insideTopRight'
              fill: '#10B981',
              fontSize: 12
            }}
          />
        )}
        
        {/* Projected End Date vertical line */}
        {endDate && (
          <ReferenceLine 
            x={endDate} 
            stroke="#6366F1" // Purple color for projected completion
            strokeDasharray="3 3"
            label={{ 
              value: 'Projected Completion',
              position: 'top',
              fill: '#6366F1',
              fontSize: 12
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
