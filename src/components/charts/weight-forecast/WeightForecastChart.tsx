
import React, { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
import { ResponsiveContainer } from 'recharts';
import { useWeightForecastData } from './hooks/useWeightForecastData';
import WeightChart from './components/WeightChart';
import NoDataDisplay from './components/NoDataDisplay';

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
  // Early return if no period or weigh-ins
  if (!currentPeriod || weighIns.length === 0) {
    return <NoDataDisplay />;
  }

  // Use our custom hook to handle all data processing
  const {
    processedData,
    forecastData,
    combinedData,
    minWeight,
    maxWeight,
    displayTargetWeight,
    startDate,
    endDate
  } = useWeightForecastData({
    weighIns,
    currentPeriod,
    isImperial,
    targetWeight
  });

  console.log('Chart data:', {
    actualDataCount: processedData.length,
    forecastDataCount: forecastData.length,
    combinedDataCount: combinedData.length,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    minWeight,
    maxWeight,
    displayTargetWeight,
    firstPoint: combinedData[0],
    lastPoint: combinedData[combinedData.length - 1]
  });

  return (
    <div className="h-[350px] w-full">
      <WeightChart
        displayData={combinedData}
        actualData={processedData}
        forecastData={forecastData}
        minWeight={minWeight}
        maxWeight={maxWeight}
        isImperial={isImperial}
        startDate={startDate}
        endDate={endDate}
        targetWeight={displayTargetWeight}
      />
    </div>
  );
};

export default WeightForecastChart;
