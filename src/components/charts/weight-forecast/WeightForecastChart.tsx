
import React, { useState } from 'react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from 'recharts';
import { format, addDays, differenceInDays } from 'date-fns';
import { Period, WeighIn } from '@/lib/types';
import CustomTooltip from './CustomTooltip';
import { Button } from '@/components/ui/button';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
}

type ChartView = 'actual' | 'forecast';

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({
  weighIns,
  currentPeriod,
  isImperial = false,
}) => {
  const [activeView, setActiveView] = useState<ChartView>('actual');

  if (!currentPeriod || weighIns.length === 0) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight chart.</p>
      </div>
    );
  }
  
  // Process and filter weigh-ins to only include those within the current period
  const periodStartDate = new Date(currentPeriod.startDate);
  const periodEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
  
  // Filter weigh-ins to only include those within the period
  const filteredWeighIns = weighIns.filter(weighIn => {
    const weighInDate = new Date(weighIn.date);
    return weighInDate >= periodStartDate && weighInDate <= periodEndDate;
  });
  
  // Sort by date (oldest first)
  const sortedWeighIns = [...filteredWeighIns].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Add the starting weight if not already in the data
  const hasStartingWeight = sortedWeighIns.some(
    w => new Date(w.date).toDateString() === periodStartDate.toDateString()
  );
  
  const chartData = [];
  
  // Add starting weight point if needed
  if (!hasStartingWeight) {
    chartData.push({
      date: periodStartDate,
      weight: isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
      isActual: false
    });
  }
  
  // Add all weigh-ins with converted weight units if needed
  chartData.push(
    ...sortedWeighIns.map(weighIn => ({
      date: new Date(weighIn.date),
      weight: isImperial ? weighIn.weight * 2.20462 : weighIn.weight,
      isActual: true
    }))
  );
  
  // Sort again to ensure chronological order
  chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Find min and max weight to set y-axis domain with some padding
  const weights = chartData.map(item => item.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  // Generate the forecast data
  const generateForecastData = () => {
    // If we have less than 2 points, we can't make a forecast
    if (chartData.length < 2) return chartData;

    // Calculate the average daily weight change based on the actual data
    const firstPoint = chartData[0];
    const lastActualPoint = chartData[chartData.length - 1];
    const daysElapsed = differenceInDays(lastActualPoint.date, firstPoint.date) || 1;
    const totalWeightChange = lastActualPoint.weight - firstPoint.weight;
    const avgDailyChange = totalWeightChange / daysElapsed;

    // Create a copy of the chart data for forecast
    const forecastData = [...chartData];

    // If we already reached the end date, no need to forecast
    if (new Date() >= periodEndDate) return forecastData;

    // Generate forecast points from last actual weigh-in to end date
    const lastDate = lastActualPoint.date;
    const daysToForecast = differenceInDays(periodEndDate, lastDate);

    let previousWeight = lastActualPoint.weight;

    for (let i = 1; i <= daysToForecast; i++) {
      const forecastDate = addDays(lastDate, i);
      const forecastWeight = previousWeight + avgDailyChange;
      
      forecastData.push({
        date: forecastDate,
        weight: forecastWeight,
        isActual: false,
        isForecast: true
      });

      previousWeight = forecastWeight;
    }

    return forecastData;
  };

  // Get the appropriate data based on the active view
  const displayData = activeView === 'actual' ? chartData : generateForecastData();
  
  return (
    <div className="h-[400px] w-full relative">
      <div className="absolute top-0 right-0 z-10 space-x-2">
        <Button 
          variant={activeView === 'actual' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveView('actual')}
        >
          Actual
        </Button>
        <Button 
          variant={activeView === 'forecast' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setActiveView('forecast')}
        >
          Forecast
        </Button>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          margin={{
            top: 30, // Increased top margin to make space for the buttons
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
          
          {/* Actual Weight Area */}
          <Area 
            type="monotone" 
            dataKey="weight" 
            stroke="#0066CC" 
            strokeWidth={2}
            fill="#0066CC20"
            activeDot={{ r: 6, fill: '#0066CC', stroke: '#fff', strokeWidth: 2 }}
            dot={{ 
              r: 4, 
              fill: '#0066CC',
              stroke: '#fff',
              strokeWidth: 1
            }}
          />
          
          {/* Forecast Line - Only visible in forecast view */}
          {activeView === 'forecast' && (
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#FFA07A"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={(props) => {
                // Only show dots for actual data points
                const { cx, cy, payload } = props;
                if (!payload.isForecast) return null;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={3} 
                    fill="#FFA07A" 
                    stroke="#fff"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={(props) => {
                // Only show active dots for forecast points
                const { cx, cy, payload } = props;
                if (!payload.isForecast) return null;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill="#FFA07A" 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightForecastChart;
