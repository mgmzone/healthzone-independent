
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { FastingLog, TimeFilter } from '@/lib/types';

interface FastingChartProps {
  data: FastingLog[];
  timeFilter: TimeFilter;
  className?: string;
}

const FastingChart: React.FC<FastingChartProps> = ({ 
  data,
  timeFilter,
  className
}) => {
  // Format data for the chart
  const chartData = data.map(fastingLog => {
    const startDate = new Date(fastingLog.startTime);
    return {
      date: format(startDate, 'EEE dd'),
      fasting: fastingLog.fastingHours || 0,
      eating: fastingLog.eatingWindowHours || 0,
      fullDate: startDate,
    };
  });

  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
          barSize={20}
          barGap={0}
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
            tickFormatter={(value) => `${value}h`}
            domain={[0, 24]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value, name) => [
              `${value} hours`, 
              name === 'fasting' ? 'Fasting Window' : 'Eating Window'
            ]}
          />
          <Bar 
            dataKey="fasting" 
            name="Fasting Window"
            stackId="a"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
            ))}
          </Bar>
          <Bar 
            dataKey="eating" 
            name="Eating Window"
            stackId="a"
            radius={[0, 0, 4, 4]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--accent))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingChart;
