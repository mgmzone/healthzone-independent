
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeighIn, Period } from '@/lib/types';
import { format } from 'date-fns';
import { 
  calculateChartData, 
  calculateWeightRange,
  WeeklyWeightData
} from './weightForecastUtils';
import CustomTooltip from './CustomTooltip';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial: boolean;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({ 
  weighIns, 
  currentPeriod,
  isImperial 
}) => {
  const chartData = useMemo(() => {
    return calculateChartData(weighIns, currentPeriod, isImperial);
  }, [weighIns, currentPeriod, isImperial]);
  
  const { minWeight, maxWeight } = useMemo(() => {
    return calculateWeightRange(chartData);
  }, [chartData]);

  const today = new Date();
  
  if (!currentPeriod || chartData.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-gray-500">Not enough data for weight forecast</p>
      </div>
    );
  }

  // Convert Date objects to timestamps for the chart
  const formattedData = chartData.map(item => ({
    ...item,
    formattedDate: format(item.date, 'MMM d, yyyy'),
    dateValue: item.date.getTime() // Convert Date to number timestamp for XAxis
  }));

  // Split data into actual and projected for different line styles
  const actualData = formattedData.filter(d => !d.isProjected);
  const projectedData = formattedData.filter(d => d.isProjected);

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="dateValue" 
            tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            minTickGap={30}
            domain={['dataMin', 'dataMax']}
            type="number"
            allowDataOverflow={true}
          />
          <YAxis 
            domain={[minWeight, maxWeight]} 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
          
          {/* Reference line for today */}
          <ReferenceLine x={today.getTime()} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" />
          
          {/* Actual weight line */}
          <Line
            type="monotone"
            dataKey="weight"
            data={actualData}
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ stroke: '#6366F1', strokeWidth: 2, r: 4, fill: 'white' }}
            activeDot={{ r: 6, fill: '#6366F1' }}
            connectNulls={true}
            isAnimationActive={true}
            animationDuration={1000}
            name="Actual"
          />
          
          {/* Projected weight line (dashed) */}
          {projectedData.length > 0 && (
            <Line
              type="monotone"
              dataKey="weight"
              data={projectedData}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 3, fill: 'white' }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
              isAnimationActive={true}
              animationDuration={1000}
              name="Projected"
              connectNulls={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightForecastChart;
