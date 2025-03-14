
import React from 'react';
import {
  AreaChart,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Period, WeighIn } from '@/lib/types';
import CustomTooltip from './CustomTooltip';
import { useChartData } from './hooks/useChartData';
import { ReferenceLines } from './components/ReferenceLines';
import { WeightChartArea, createDotRenderer } from './components/WeightChartArea';
import { ChartAxes, createDateFormatter } from './components/ChartAxes';

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
    loading,
    error,
    minWeight,
    maxWeight
  } = useChartData(weighIns, currentPeriod, isImperial);
  
  const today = new Date();
  const formatDateForAxis = createDateFormatter();
  const renderDot = createDotRenderer();
  
  console.log('WeightForecastChart - Rendering with data points:', chartData.length);
  console.log('WeightForecastChart - Current period:', currentPeriod?.id);
  console.log('WeightForecastChart - First data point:', chartData[0]?.date, chartData[0]?.weight);
  console.log('WeightForecastChart - Weight range:', minWeight, maxWeight);
  
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
  
  // Make sure all dates are properly converted to Date objects
  const formattedChartData = chartData.map(item => ({
    ...item,
    date: typeof item.date === 'string' ? new Date(item.date) : item.date
  }));
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={formattedChartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <ChartAxes 
          formatDateForAxis={formatDateForAxis} 
          minWeight={minWeight} 
          maxWeight={maxWeight} 
        />
        
        <Tooltip 
          content={<CustomTooltip isImperial={isImperial} />}
        />
        
        <WeightChartArea renderDot={renderDot} />
        
        <ReferenceLines 
          chartData={formattedChartData} 
          today={today} 
          targetDate={targetDate} 
          periodEndDate={periodEndDate} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
