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
} from 'recharts';
import { ChartDataItem } from './chartData';

interface FastingBarChartProps {
  chartData: ChartDataItem[];
}

const FastingBarChart: React.FC<FastingBarChartProps> = ({ chartData }) => {
  const formatHoursMinutes = (hours: number) => {
    const absHours = Math.abs(hours);
    const wholeHours = Math.floor(absHours);
    const minutes = Math.round((absHours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const fastingValue = payload.find((p: any) => p.dataKey === 'fasting')?.value || 0;
      const eatingValue = payload.find((p: any) => p.dataKey === 'eating')?.value || 0;
      const total = fastingValue + eatingValue;

      return (
        <div className="bg-card border border-border p-3 rounded-md shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <div className="text-destructive text-sm">
            Eating: {formatHoursMinutes(eatingValue)} ({total > 0 ? Math.round(eatingValue / total * 100) : 0}%)
          </div>
          <div className="text-primary text-sm">
            Fasting: {formatHoursMinutes(fastingValue)} ({total > 0 ? Math.round(fastingValue / total * 100) : 0}%)
          </div>
          <div className="text-muted-foreground text-xs mt-1">
            Total: {formatHoursMinutes(total)}
          </div>
        </div>
      );
    }
    return null;
  };

  const fastingColor = "#0EA5E9";
  const eatingColor = "#F43F5E";

  // Normalize: legacy data pipes eating as negative (from the old
  // left-of-zero stacking). We want both positive so the two bars stack
  // cleanly on a 0-24h axis, keeping tiny eating windows visible.
  const normalized = chartData.map((item) => ({
    day: item.day,
    fasting: Math.max(0, item.fasting || 0),
    eating: Math.abs(item.eating || 0),
  }));

  const filteredChartData = normalized.filter(
    (item) => (item.fasting || 0) > 0.01 || (item.eating || 0) > 0.01
  );

  if (filteredChartData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">No Fasting Data</h3>
          <p className="text-muted-foreground">
            No fasting data available for the selected time period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filteredChartData}
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
          layout="vertical"
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
          <XAxis
            type="number"
            domain={[0, 24]}
            ticks={[0, 6, 12, 18, 24]}
            tickFormatter={(value) => `${value}h`}
            tickLine={false}
            axisLine={true}
            fontSize={12}
          />
          <YAxis
            type="category"
            dataKey="day"
            tickLine={false}
            axisLine={true}
            fontSize={12}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (value === 'eating' ? 'Eating Time' : 'Fasting Time')}
            iconType="square"
            iconSize={10}
          />

          <Bar
            dataKey="eating"
            name="eating"
            fill={eatingColor}
            stroke={eatingColor}
            stackId="a"
            radius={[4, 0, 0, 4]}
          />
          <Bar
            dataKey="fasting"
            name="fasting"
            fill={fastingColor}
            stroke={fastingColor}
            stackId="a"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
