
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TimeFilteredData } from './chartDataGenerator';

interface SummaryBarChartProps {
  data: TimeFilteredData[];
}

const SummaryBarChart: React.FC<SummaryBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} entries`, 'Count']}
          contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
        />
        <Legend />
        <Bar
          dataKey="count"
          fill="#38bdf8"
          name="Entry Count"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SummaryBarChart;
