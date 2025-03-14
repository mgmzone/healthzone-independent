
import React from 'react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { Period, WeighIn } from '@/lib/types';
import CustomTooltip from './CustomTooltip';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({
  weighIns,
  currentPeriod,
  isImperial = false,
}) => {
  if (!currentPeriod || weighIns.length === 0) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight chart.</p>
      </div>
    );
  }
  
  // Process and filter weigh-ins to only include those within the current period
  const periodStartDate = new Date(currentPeriod.startDate);
  const periodEndDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
  
  // Filter weigh-ins to only include those within the period
  const filteredWeighIns = weighIns.filter(weighIn => {
    const weighInDate = new Date(weighIn.date);
    return weighInDate >= periodStartDate && weighInDate <= periodEndDate;
  });
  
  // Sort by date (oldest first)
  const sortedWeighIns = [...filteredWeighIns].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Add the starting weight if not already in the data
  const hasStartingWeight = sortedWeighIns.some(
    w => new Date(w.date).toDateString() === periodStartDate.toDateString()
  );
  
  const chartData = [];
  
  // Add starting weight point if needed
  if (!hasStartingWeight) {
    chartData.push({
      date: periodStartDate,
      weight: isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight,
    });
  }
  
  // Add all weigh-ins with converted weight units if needed
  chartData.push(
    ...sortedWeighIns.map(weighIn => ({
      date: new Date(weighIn.date),
      weight: isImperial ? weighIn.weight * 2.20462 : weighIn.weight,
    }))
  );
  
  // Sort again to ensure chronological order
  chartData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Find min and max weight to set y-axis domain with some padding
  const weights = chartData.map(item => item.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);
  
  // Calculate mean weight
  const meanWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  
  // Calculate trend line (linear regression)
  const calculateTrendLine = () => {
    if (chartData.length < 2) return chartData.map(d => ({ ...d, trend: d.weight }));
    
    // Convert dates to numerical x values (days since first date)
    const firstDate = chartData[0].date.getTime();
    const xValues = chartData.map(d => (d.date.getTime() - firstDate) / (1000 * 60 * 60 * 24));
    const yValues = chartData.map(d => d.weight);
    
    // Calculate linear regression coefficients
    // Formula: y = mx + b
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Add trend line values to chart data
    return chartData.map((d, i) => ({
      ...d,
      trend: slope * xValues[i] + intercept
    }));
  };
  
  const dataWithTrend = calculateTrendLine();
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={dataWithTrend}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), 'MMM d')}
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={{ stroke: '#E0E0E0' }}
        />
        <YAxis 
          domain={[minWeight, maxWeight]}
          tickFormatter={(value) => value.toFixed(0)}
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={{ stroke: '#E0E0E0' }}
          label={{ 
            value: `Weight (${isImperial ? 'lbs' : 'kg'})`, 
            angle: -90, 
            position: 'insideLeft', 
            offset: 0,
            style: { textAnchor: 'middle' },
            fill: '#666' 
          }}
        />
        <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
        
        {/* Mean Weight Reference Line */}
        <ReferenceLine 
          y={meanWeight} 
          stroke="#FEC6A1" 
          strokeDasharray="3 3"
          strokeWidth={2}
          label={{ 
            value: `Mean: ${meanWeight.toFixed(1)}`, 
            fill: '#FEC6A1', 
            position: 'right',
            fontSize: 11
          }}
        />
        
        <Area 
          type="monotone" 
          dataKey="weight" 
          stroke="#0066CC" 
          strokeWidth={2}
          fill="#0066CC20"
          activeDot={{ r: 6, fill: '#0066CC', stroke: '#fff', strokeWidth: 2 }}
          dot={{ 
            r: 4, 
            fill: '#0066CC',
            stroke: '#fff',
            strokeWidth: 1
          }}
        />
        
        {/* Trend Line */}
        <Line
          type="monotone"
          dataKey="trend"
          stroke="#FFA07A"
          strokeDasharray="3 3"
          strokeWidth={2}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
