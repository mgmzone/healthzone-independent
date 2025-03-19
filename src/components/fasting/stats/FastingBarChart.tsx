
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { ChartDataItem } from './chartData';

interface FastingBarChartProps {
  chartData: ChartDataItem[];
}

const FastingBarChart: React.FC<FastingBarChartProps> = ({ chartData }) => {
  // Customize tooltip display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <div className="text-primary text-sm">
            Fasting: {Math.round(payload[0].value)} hours
          </div>
          <div className="text-destructive text-sm">
            Eating: {Math.round(payload[1].value)} hours
          </div>
          <div className="text-muted-foreground text-xs mt-1">
            Total: 24 hours
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          stackOffset="sign"
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            domain={[-12, 24]}
            tickLine={false}
            axisLine={true}
            ticks={[-12, -6, 0, 6, 12, 18, 24]}
            tickFormatter={(value) => `${Math.abs(value)}h`}
            fontSize={12}
          />
          <YAxis 
            dataKey="day" 
            type="category"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => (
              <span className={value === 'fasting' ? 'text-primary' : 'text-destructive'}>
                {value === 'fasting' ? 'Fasting Time' : 'Eating Time'}
              </span>
            )}
          />
          <ReferenceLine x={0} stroke="#666" />
          <Bar 
            dataKey="fasting" 
            name="fasting"
            fill="hsl(var(--primary))" 
            stackId="stack"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="eating" 
            name="eating"
            fill="hsl(var(--destructive))" 
            stackId="stack"
            radius={[0, 0, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
