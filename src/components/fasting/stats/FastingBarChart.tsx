
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { ChartDataItem } from './chartData';

interface FastingBarChartProps {
  chartData: ChartDataItem[];
}

const FastingBarChart: React.FC<FastingBarChartProps> = ({ chartData }) => {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          barSize={40}
          maxBarSize={50}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="day" 
            tickLine={false}
            axisLine={false}
            fontSize={12}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}h`}
            fontSize={12}
            width={30}
            domain={[0, 24]}
          />
          <Tooltip 
            formatter={(value, name) => [
              `${Math.round(Number(value))} hours`, 
              name === 'fasting' ? 'Fasting Time' : 'Eating Time'
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Bar 
            dataKey="fasting" 
            name="Fasting Time"
            stackId="a"
            fill="#3b82f6" 
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="eating" 
            name="Eating Time"
            stackId="a"
            fill="#ef4444"
            radius={[0, 0, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
