
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
  ReferenceLine,
  Cell
} from 'recharts';
import { ChartDataItem } from './chartData';

interface FastingBarChartProps {
  chartData: ChartDataItem[];
}

const FastingBarChart: React.FC<FastingBarChartProps> = ({ chartData }) => {
  // Helper to format hours and minutes
  const formatHoursMinutes = (hours: number) => {
    const absHours = Math.abs(hours);
    const wholeHours = Math.floor(absHours);
    const minutes = Math.round((absHours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Customize tooltip display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Get values for fasting and eating (use absolute values for calculations)
      const fastingValue = payload.find(p => p.dataKey === 'fasting')?.value || 0;
      const eatingValue = Math.abs(payload.find(p => p.dataKey === 'eating')?.value || 0);
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

  // Filter out entries with no data (both fasting and eating are 0)
  const filteredChartData = chartData.filter(item => 
    Math.abs(item.fasting) > 0 || Math.abs(item.eating) > 0
  );

  // Check if we have any data to display
  const hasData = filteredChartData.length > 0;
  
  // For debugging
  console.log('FastingBarChart - Chart data:', chartData);
  console.log('FastingBarChart - Filtered data:', filteredChartData);
  console.log('FastingBarChart - Has data:', hasData);

  // Determine domain limits based on data
  // We want to show a balanced view with equal space for fasting and eating
  const maxFasting = Math.max(...chartData.map(d => d.fasting || 0), 1); // At least 1 hour
  const maxEating = Math.max(...chartData.map(d => Math.abs(d.eating || 0)), 1); // At least 1 hour
  const domainMax = Math.max(24, maxFasting); // At least 24 hours, or more if needed
  const domainMin = -Math.max(24, maxEating); // At least -24 hours for eating
  
  if (!hasData) {
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
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          stackOffset="sign"
          layout="vertical"
          barGap={0}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            domain={[domainMin, domainMax]}
            tickLine={false}
            axisLine={true}
            ticks={[-24, -18, -12, -6, 0, 6, 12, 18, 24]}
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
              <span className={value === 'eating' ? 'text-destructive' : 'text-primary'}>
                {value === 'eating' ? 'Eating Time' : 'Fasting Time'}
              </span>
            )}
          />
          <ReferenceLine x={0} stroke="#666" />
          <Bar 
            dataKey="eating" 
            name="eating"
            fill="hsl(var(--destructive))" 
            stackId="stack"
            radius={[0, 0, 4, 4]}
          >
            {filteredChartData.map((entry, index) => (
              <Cell key={`cell-eating-${index}`} fill="hsl(var(--destructive))" />
            ))}
          </Bar>
          <Bar 
            dataKey="fasting" 
            name="fasting"
            fill="hsl(var(--primary))" 
            stackId="stack"
            radius={[4, 4, 0, 0]}
          >
            {filteredChartData.map((entry, index) => (
              <Cell key={`cell-fasting-${index}`} fill="hsl(var(--primary))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
