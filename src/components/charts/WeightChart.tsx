
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { TimeFilter } from '@/lib/types';

interface WeighIn {
  id: string;
  user_id: string;
  period_id?: string;
  date: Date | string;
  weight: number;
  bmi?: number;
  body_fat_percentage?: number;
  skeletal_muscle_mass?: number;
  bone_mass?: number;
  body_water_percentage?: number;
}

interface WeightChartProps {
  data: WeighIn[];
  timeFilter: TimeFilter;
  targetWeight?: number;
  className?: string;
}

const WeightChart: React.FC<WeightChartProps> = ({ 
  data,
  timeFilter,
  targetWeight,
  className
}) => {
  // Format data for the chart
  const chartData = data.map(weighIn => ({
    date: format(new Date(weighIn.date), 'MMM dd'),
    weight: weighIn.weight,
    fullDate: weighIn.date,
  })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value}`}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value) => [`${value} kg`, 'Weight']}
          />
          {targetWeight && (
            <ReferenceLine 
              y={targetWeight} 
              stroke="hsl(var(--accent))" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Goal', 
                position: 'insideBottomRight',
                fill: 'hsl(var(--accent))',
                fontSize: 12
              }} 
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4, fill: 'hsl(var(--background))' }}
            activeDot={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 6, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
