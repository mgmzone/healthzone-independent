
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TimeFilteredData } from './chartDataGenerator';

interface StackedBarChartProps {
  data: TimeFilteredData[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => {
            const label = name === 'weighIns' ? 'Weigh-ins' : 
                         name === 'fasts' ? 'Fasting Logs' : 'Exercise Logs';
            return [`${value} entries`, label];
          }}
          contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
        />
        <Legend />
        <Bar dataKey="weighIns" stackId="a" fill="#38bdf8" name="Weigh-ins" radius={[4, 4, 0, 0]} />
        <Bar dataKey="fasts" stackId="a" fill="#fb923c" name="Fasting Logs" radius={[4, 4, 0, 0]} />
        <Bar dataKey="exercises" stackId="a" fill="#4ade80" name="Exercise Logs" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StackedBarChart;
