
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { WeighIn } from '@/lib/types';

interface WeightChartProps {
  data: WeighIn[];
  isImperial?: boolean;
  metricKey?: string;
}

const WeightChart: React.FC<WeightChartProps> = ({ 
  data, 
  isImperial = false, 
  metricKey = 'weight' 
}) => {
  // Get label based on selected metric
  const getMetricLabel = () => {
    switch (metricKey) {
      case 'weight': return isImperial ? 'lbs' : 'kg';
      case 'bmi': return '';
      case 'bodyFatPercentage': return '%';
      case 'skeletalMuscleMass': return isImperial ? 'lbs' : 'kg';
      case 'boneMass': return isImperial ? 'lbs' : 'kg';
      case 'bodyWaterPercentage': return '%';
      default: return '';
    }
  };

  // Convert value based on metric and measurement system
  const convertValue = (entry: WeighIn) => {
    switch (metricKey) {
      case 'weight':
        return isImperial ? entry.weight * 2.20462 : entry.weight;
      case 'bmi':
        return entry.bmi || null;
      case 'bodyFatPercentage':
        return entry.bodyFatPercentage || null;
      case 'skeletalMuscleMass':
        return entry.skeletalMuscleMass 
          ? (isImperial ? entry.skeletalMuscleMass * 2.20462 : entry.skeletalMuscleMass)
          : null;
      case 'boneMass':
        return entry.boneMass 
          ? (isImperial ? entry.boneMass * 2.20462 : entry.boneMass)
          : null;
      case 'bodyWaterPercentage':
        return entry.bodyWaterPercentage || null;
      default:
        return null;
    }
  };

  // Sort and format the data for the chart
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => {
      const value = convertValue(item);
      return {
        date: new Date(item.date),
        [metricKey]: value,
        formattedDate: format(new Date(item.date), 'M/d')
      };
    })
    .filter(item => item[metricKey] !== null);

  // If no data available for the selected metric
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-gray-500">No data available for the selected metric</p>
      </div>
    );
  }

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].value.toFixed(1)} ${getMetricLabel()}`}</p>
          <p className="text-xs text-gray-500">{format(new Date(label), 'MMM d, yyyy')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'M/d')}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            minTickGap={15}
          />
          <YAxis 
            domain={['dataMin - 5', 'dataMax + 5']} 
            hide={true}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={metricKey}
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ stroke: '#6366F1', strokeWidth: 2, r: 4, fill: 'white' }}
            activeDot={{ r: 6, fill: '#6366F1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
