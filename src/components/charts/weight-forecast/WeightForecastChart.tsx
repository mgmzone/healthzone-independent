
import React from 'react';
import { Period, WeighIn } from '@/lib/types';
import WeightChart from './components/WeightChart';
import { useWeightForecastData } from './hooks/useWeightForecastData';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
  targetWeight?: number;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({
  weighIns,
  currentPeriod,
  isImperial = false,
  targetWeight,
}) => {
  // Use the hook to get formatted chart data
  const { chartData, targetLine, minWeight, maxWeight, hasValidData } = useWeightForecastData(
    weighIns,
    currentPeriod,
    isImperial,
    targetWeight
  );
  
  console.log('WeightForecastChart rendering with:', {
    targetWeight,
    minWeight,
    maxWeight,
    chartDataCount: chartData?.length || 0,
    targetLineCount: targetLine?.length || 0,
    isImperial,
    hasValidData
  });

  if (!hasValidData) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight chart. Please add at least two weight entries.</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full relative">
      <WeightChart
        displayData={chartData}
        minWeight={minWeight}
        maxWeight={maxWeight}
        isImperial={isImperial}
        activeView="forecast"
        targetLine={targetLine}
      />
    </div>
  );
};

export default WeightForecastChart;
