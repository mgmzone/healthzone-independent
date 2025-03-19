
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

  console.log('FastingBarChart - Input data:', JSON.stringify(chartData, null, 2));
  
  // Filter out entries where BOTH fasting and eating are 0 or undefined
  const filteredChartData = chartData.filter(item => 
    item && (Math.abs(item.fasting || 0) > 0.01 || Math.abs(item.eating || 0) > 0.01)
  );
  
  console.log('FastingBarChart - Filtered data:', JSON.stringify(filteredChartData, null, 2));
  console.log('FastingBarChart - Has data:', filteredChartData.length > 0);

  // For horizontal display: Eating will be negative (left side) and fasting positive (right side)
  const processedData = filteredChartData.map(item => ({
    day: item.day,
    fasting: Math.abs(item.fasting || 0),
    eating: -(Math.abs(item.eating || 0)) // Make eating negative for left-side display
  }));

  // Determine domain limits based on data
  const maxVal = Math.max(...processedData.map(d => Math.abs(d.fasting || 0)));
  const minVal = Math.min(...processedData.map(d => d.eating || 0));
  
  // Ensure domain is balanced and large enough
  const maxDomain = Math.max(maxVal, Math.abs(minVal), 12);
  const domainMax = Math.ceil(maxDomain);
  const domainMin = -Math.ceil(maxDomain);

  // Define colors
  const eatingColor = "hsl(var(--destructive))";
  const fastingColor = "hsl(var(--primary))";

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
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
          layout="vertical" // Set layout to vertical for horizontal bars
          barCategoryGap={20} // Increase gap between day groups
          barSize={20} // Control bar thickness
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
          <XAxis 
            type="number"
            domain={[domainMin, domainMax]}
            tickFormatter={(value) => `${Math.abs(value)}h`}
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
            stackId="day"
            radius={[4, 0, 0, 4]}
          >
            {processedData.map((_, index) => (
              <Cell key={`cell-eating-${index}`} fill={eatingColor} />
            ))}
          </Bar>
          <Bar 
            dataKey="fasting" 
            name="fasting"
            stackId="day"
            radius={[0, 4, 4, 0]}
          >
            {processedData.map((_, index) => (
              <Cell key={`cell-fasting-${index}`} fill={fastingColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
