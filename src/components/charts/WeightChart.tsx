
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { WeighIn } from '@/lib/types';

interface WeightChartProps {
  data: WeighIn[];
  isImperial?: boolean;
}

const WeightChart: React.FC<WeightChartProps> = ({ data, isImperial = false }) => {
  // Sort and format the data for the chart
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: new Date(item.date),
      weight: item.weight,
      formattedDate: format(new Date(item.date), 'M/d')
    }));

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].value.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`}</p>
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
            dataKey="weight"
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
