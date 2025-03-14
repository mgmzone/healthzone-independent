
import React from 'react';
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
import { format } from 'date-fns';
import CustomTooltip from '../CustomTooltip';

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
  return (
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
        
        {/* Forecast Line - Only visible in forecast view with muted orange color */}
        {activeView === 'forecast' && (
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#FEC6A1"  // Muted orange color
            strokeWidth={2}
            strokeDasharray="5 5"  // Dotted line
            connectNulls={true}
            dot={(props) => {
              // Only show dots for actual data points, not for forecast
              const { payload } = props;
              if (payload.isForecast) return null;
              return null; // No dots on the forecast line
            }}
            activeDot={(props) => {
              // Only show active dots for actual points
              const { payload } = props;
              if (payload.isForecast) return null;
              return null; // No active dots on the forecast line
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightChart;
