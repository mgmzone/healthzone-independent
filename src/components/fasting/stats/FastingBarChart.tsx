
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

  // Define colors explicitly - using hex values for more reliable rendering
  const fastingColor = "#0EA5E9"; // Blue
  const eatingColor = "#F43F5E"; // Red
  
  console.log('FastingBarChart - Input data:', JSON.stringify(chartData, null, 2));
  console.log('FastingBarChart - Colors being used:', { fastingColor, eatingColor });
  
  // Filter out entries where BOTH fasting and eating are 0 or undefined
  const filteredChartData = chartData.filter(item => 
    item && (Math.abs(item.fasting || 0) > 0.01 || Math.abs(item.eating || 0) > 0.01)
  );
  
  console.log('FastingBarChart - Filtered data:', JSON.stringify(filteredChartData, null, 2));
  console.log('FastingBarChart - Has data:', filteredChartData.length > 0);

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
          layout="vertical" // Vertical layout for horizontal bars
          barSize={20} // Control bar thickness
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
          <XAxis 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => `${Math.abs(Math.round(value))}h`}
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
            formatter={(value) => value === 'eating' ? 'Eating Time' : 'Fasting Time'} 
            iconType="square"
            iconSize={10}
          />
          <ReferenceLine x={0} stroke="#666" />
          
          {/* Eating bar (negative values) */}
          <Bar 
            dataKey="eating" 
            name="eating"
            fill={eatingColor}
            stroke={eatingColor}
            stackId="a" // Same stackId for both bars to align them
            radius={[4, 0, 0, 4]} // Left side rounded corners
          />
          
          {/* Fasting bar (positive values) */}
          <Bar 
            dataKey="fasting" 
            name="fasting"
            fill={fastingColor} 
            stroke={fastingColor}
            stackId="a" // Same stackId for both bars to align them
            radius={[0, 4, 4, 0]} // Right side rounded corners
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FastingBarChart;
