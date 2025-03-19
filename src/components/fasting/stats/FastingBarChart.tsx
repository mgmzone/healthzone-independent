
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

  // Debug data coming into chart
  console.log('FastingBarChart - Input data:', JSON.stringify(chartData, null, 2));
  
  // Filter out entries where BOTH fasting and eating are 0 or undefined
  const filteredChartData = chartData.filter(item => 
    item && (Math.abs(item.fasting || 0) > 0.01 || Math.abs(item.eating || 0) > 0.01)
  );
  
  console.log('FastingBarChart - Filtered data:', JSON.stringify(filteredChartData, null, 2));
  console.log('FastingBarChart - Has data:', filteredChartData.length > 0);

  // Force positive values for rendering (we'll handle negatives in the visualization)
  const processedData = filteredChartData.map(item => ({
    day: item.day,
    fasting: Math.abs(item.fasting || 0),
    eating: Math.abs(item.eating || 0)
  }));

  // Determine domain limits based on data
  const maxVal = Math.max(
    ...processedData.map(d => Math.max(d.fasting || 0, d.eating || 0, 1))
  );
  const domainMax = Math.ceil(Math.max(24, maxVal)); 

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
          data={processedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          barGap={0}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day"
            tickLine={false}
            axisLine={true}
            fontSize={12}
          />
          <YAxis 
            type="number"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            domain={[0, domainMax]}
            tickFormatter={(value) => `${value}h`}
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
          <Bar 
            dataKey="eating" 
            name="eating"
            fill="hsl(var(--destructive))" 
            radius={[4, 4, 0, 0]}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-eating-${index}`} fill="hsl(var(--destructive))" />
            ))}
          </Bar>
          <Bar 
            dataKey="fasting" 
            name="fasting"
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-fasting-${index}`} fill="hsl(var(--primary))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
