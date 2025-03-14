
import React, { useState } from 'react';
import { Period, WeighIn } from '@/lib/types';
import ViewToggleButtons from './components/ViewToggleButtons';
import WeightChart from './components/WeightChart';
import { useWeightForecastData } from './hooks/useWeightForecastData';

type ChartView = 'actual' | 'forecast';

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
  const [activeView, setActiveView] = useState<ChartView>('forecast'); // Default to forecast view
  
  const { chartData, minWeight, maxWeight, hasValidData } = useWeightForecastData(
    weighIns,
    currentPeriod,
    isImperial,
    targetWeight
  );
  
  if (!hasValidData) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight chart.</p>
      </div>
    );
  }

  // For the actual view, we show only actual data points
  // For the forecast view, we show all data points (the chart component will handle the styling)
  return (
    <div className="h-[400px] w-full relative">
      <ViewToggleButtons activeView={activeView} setActiveView={setActiveView} />
      
      <WeightChart
        displayData={chartData}
        minWeight={minWeight}
        maxWeight={maxWeight}
        isImperial={isImperial}
        activeView={activeView}
      />
    </div>
  );
};

export default WeightForecastChart;
