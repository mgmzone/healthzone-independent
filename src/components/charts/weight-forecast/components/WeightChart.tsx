
import React from 'react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import CustomTooltip from '../CustomTooltip';
import { ReferenceLines } from './ReferenceLines';

interface WeightChartProps {
  displayData: any[];
  minWeight: number;
  maxWeight: number;
  isImperial: boolean;
  activeView: 'actual' | 'forecast';
}

const WeightChart: React.FC<WeightChartProps> = ({
  displayData,
  minWeight,
  maxWeight,
  isImperial,
  activeView,
}) => {
  // Find out where actual data stops and forecast begins
  const today = new Date();
  
  // Separate actual and forecast data
  const actualData = displayData.filter(d => d.isActual);
  
  // Get the last actual data point
  const lastActualPoint = actualData.length > 0 ? actualData[actualData.length - 1] : null;
  const lastActualDate = lastActualPoint ? new Date(lastActualPoint.date) : today;
  
  // Create forecast data - ensure it includes the last actual point as its first point
  let forecastData = displayData.filter(d => !d.isActual && d.isForecast);
  
  // Ensure the forecast data starts with the last actual point
  if (lastActualPoint && activeView === 'forecast') {
    // Remove any existing duplicate of the last actual point in forecast data
    forecastData = forecastData.filter(
      d => new Date(d.date).getTime() !== lastActualDate.getTime()
    );
    
    // Insert the last actual point at the beginning of forecast data
    forecastData.unshift({
      date: lastActualPoint.date,
      weight: lastActualPoint.weight,
      isActual: false,
      isForecast: true
    });
  }
  
  // Sort the forecast data by date to ensure proper rendering
  forecastData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Find target date (the last date in the forecast)
  const targetDate = forecastData.length > 0 ? new Date(forecastData[forecastData.length - 1].date) : null;
  
  // Find the end date of the period (if any)
  const periodEndDate = displayData.length > 0 ? 
    new Date(displayData[displayData.length - 1].date) : null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={displayData}
        margin={{
          top: 30,
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
        
        {/* Actual Weight Area (Blue) - Always visible */}
        <Area 
          type="monotone" 
          dataKey="weight" 
          data={actualData}
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
          isAnimationActive={false}
        />
        
        {/* Forecast Weight Area (Orange) - Only visible in forecast view */}
        {activeView === 'forecast' && forecastData.length > 0 && (
          <Area
            type="monotone"
            dataKey="weight"
            data={forecastData}
            stroke="#FF9966"
            strokeWidth={2}
            fill="#FEC6A120"
            strokeDasharray="5 5"
            activeDot={false}
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
        )}
        
        {/* Reference lines for current date and target date */}
        <ReferenceLines 
          chartData={displayData}
          today={today}
          targetDate={targetDate}
          periodEndDate={periodEndDate}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
