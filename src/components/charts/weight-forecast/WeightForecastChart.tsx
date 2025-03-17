
import React, { useMemo } from 'react';
import { Period, WeighIn } from '@/lib/types';
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
import { format } from 'date-fns';
import { calculateWeightRange, generateForecastPoints } from '../weightForecastUtils';
import CustomTooltip from '../CustomTooltip';

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
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight chart. Please add at least one weight entry.</p>
      </div>
    );
  }

  // Process data - convert to display format with proper units
  const processedData = useMemo(() => {
    return weighIns
      .map(weighIn => {
        // Convert weight to display units if needed
        const displayWeight = isImperial ? 
          weighIn.weight * 2.20462 : weighIn.weight;
        
        return {
          date: new Date(weighIn.date),
          weight: displayWeight,
          isActual: true,
          isForecast: false,
          formattedDate: format(new Date(weighIn.date), 'MMM d')
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date, oldest first
  }, [weighIns, isImperial]);
  
  // Get the last actual weigh-in for forecasting
  const lastWeighIn = useMemo(() => {
    if (processedData.length === 0) return null;
    return processedData[processedData.length - 1];
  }, [processedData]);
  
  // Convert target weight to display units if needed
  const displayTargetWeight = useMemo(() => {
    return targetWeight !== undefined ? 
      targetWeight : 
      (currentPeriod.targetWeight ? 
        (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight) : 
        undefined);
  }, [targetWeight, currentPeriod.targetWeight, isImperial]);
  
  // Generate forecast data points if we have a target weight
  const forecastData = useMemo(() => {
    if (!lastWeighIn || !displayTargetWeight || !currentPeriod.projectedEndDate) {
      return [];
    }
    
    const projectedEndDate = currentPeriod.projectedEndDate ? 
      new Date(currentPeriod.projectedEndDate) : undefined;
    
    return generateForecastPoints(
      lastWeighIn,
      displayTargetWeight,
      projectedEndDate,
      currentPeriod.weightLossPerWeek
    );
  }, [lastWeighIn, displayTargetWeight, currentPeriod.projectedEndDate, currentPeriod.weightLossPerWeek]);
  
  // Combine actual and forecast data for the chart
  const combinedData = useMemo(() => {
    return [...processedData, ...forecastData.slice(1)]; // Skip first forecast point as it duplicates last actual
  }, [processedData, forecastData]);
  
  // Calculate min/max for y-axis
  const weights = useMemo(() => {
    return combinedData.map(d => d.weight);
  }, [combinedData]);
  
  const { minWeight, maxWeight } = useMemo(() => {
    return calculateWeightRange(weights, displayTargetWeight);
  }, [weights, displayTargetWeight]);
  
  // Define chart domain
  const startDate = useMemo(() => {
    return new Date(currentPeriod.startDate).getTime();
  }, [currentPeriod.startDate]);
  
  const endDate = useMemo(() => {
    return currentPeriod.projectedEndDate ? 
      new Date(currentPeriod.projectedEndDate).getTime() : 
      (currentPeriod.endDate ? 
        new Date(currentPeriod.endDate).getTime() : 
        new Date().getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now if no end date
  }, [currentPeriod.projectedEndDate, currentPeriod.endDate]);

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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={combinedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date"
            type="number"
            domain={[startDate, endDate]}
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
            data={processedData}
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={{ r: 4, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 1 }}
            isAnimationActive={false}
            name="Actual Weight"
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
          />
          
          {/* Target weight line */}
          {displayTargetWeight && (
            <ReferenceLine 
              y={displayTargetWeight} 
              stroke="#10B981" 
              strokeDasharray="3 3"
              label={{ 
                value: `Target: ${displayTargetWeight.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`,
                position: 'right',
                fill: '#10B981',
                fontSize: 12
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightForecastChart;
