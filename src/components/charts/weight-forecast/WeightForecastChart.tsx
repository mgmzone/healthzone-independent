
import React from 'react';
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  Text
} from 'recharts';
import { Period, WeighIn } from '@/lib/types';
import CustomTooltip from './CustomTooltip';
import { useChartData } from './hooks/useChartData';
import { ReferenceLines } from './components/ReferenceLines';
import { ChartAxes, createDateFormatter } from './components/ChartAxes';
import { WeightLabels } from './components/WeightLabels';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({
  weighIns,
  currentPeriod,
  isImperial = false,
}) => {
  const {
    chartData,
    targetDate,
    trendLineData,
    goalLineData,
    loading,
    error,
    minWeight,
    maxWeight
  } = useChartData(weighIns, currentPeriod, isImperial);
  
  const today = new Date();
  const formatDateForAxis = createDateFormatter();
  
  console.log('WeightForecastChart - Rendering with data points:', chartData.length);
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading forecast...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center h-64 flex items-center justify-center">{error}</div>;
  }
  
  if (!currentPeriod || chartData.length === 0) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight forecast.</p>
      </div>
    );
  }

  const periodEndDate = currentPeriod?.endDate ? new Date(currentPeriod.endDate) : null;
  
  // Split data into actual and projected
  const actualData = chartData.filter(item => !item.isProjected);
  const projectedData = chartData.filter(item => item.isProjected);
  
  // Make sure all dates are properly converted to Date objects
  const formattedChartData = chartData.map(item => ({
    ...item,
    date: typeof item.date === 'string' ? new Date(item.date) : item.date
  }));
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={formattedChartData}
        margin={{
          top: 20,
          right: 30,
          left: 10,
          bottom: 30,
        }}
      >
        <ChartAxes 
          formatDateForAxis={formatDateForAxis} 
          minWeight={minWeight} 
          maxWeight={maxWeight}
          isImperial={isImperial}
        />
        
        <Tooltip 
          content={<CustomTooltip isImperial={isImperial} />}
        />
        
        {/* Goal line (dotted light blue) */}
        {goalLineData && goalLineData.length > 0 && (
          <Line
            type="monotone"
            data={goalLineData}
            dataKey="weight"
            stroke="#33C3F0"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            name="Target Weight"
          />
        )}
        
        {/* Trend line (dashed red) */}
        {trendLineData && trendLineData.length > 0 && (
          <Line
            type="monotone"
            data={trendLineData}
            dataKey="weight"
            stroke="#ea384c"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            name="Average Trend"
          />
        )}
        
        {/* Projected weight line (dotted, same color as actual) */}
        {projectedData.length > 0 && (
          <Line 
            type="monotone" 
            data={projectedData}
            dataKey="weight" 
            stroke="#0066CC" 
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ 
              r: 3, 
              fill: '#0066CC',
              stroke: '#fff',
              strokeWidth: 1
            }}
            activeDot={{ 
              r: 5, 
              fill: '#0066CC',
              stroke: '#fff',
              strokeWidth: 2
            }}
            name="Projected Weight"
          />
        )}
        
        {/* Main weight line (solid blue) - actual data */}
        {actualData.length > 0 && (
          <Line 
            type="monotone" 
            data={actualData}
            dataKey="weight" 
            stroke="#0066CC" 
            strokeWidth={2.5}
            dot={{ 
              r: 4, 
              fill: '#0066CC',
              stroke: '#fff',
              strokeWidth: 2
            }}
            activeDot={{ 
              r: 6, 
              fill: '#0066CC',
              stroke: '#fff',
              strokeWidth: 2
            }}
            name="Actual Weight"
          />
        )}
        
        <WeightLabels 
          data={formattedChartData} 
          isImperial={isImperial} 
        />
        
        <ReferenceLines 
          chartData={formattedChartData} 
          today={today} 
          targetDate={targetDate} 
          periodEndDate={periodEndDate} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
