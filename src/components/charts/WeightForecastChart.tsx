
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { Period, WeighIn } from '@/lib/types';

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
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">{format(data.date, 'MMM d, yyyy')}</p>
          <p className="text-gray-700">
            Weight: <span className="font-medium">{data.weight.toFixed(1)} {isImperial ? 'lbs' : 'kg'}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
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
          tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={{ stroke: '#E0E0E0' }}
          label={{ 
            value: 'Date', 
            position: 'insideBottom', 
            offset: -10,
            fill: '#666' 
          }}
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
        <Tooltip content={<CustomTooltip />} />
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
        
        {/* Add weight labels for selected points */}
        {chartData.map((entry, index) => {
          // Show labels for every 5th point or at important milestones
          const shouldShowLabel = index % 5 === 0 || 
                                 index === 0 || 
                                 index === chartData.length - 1 ||
                                 index === Math.floor(chartData.length / 2);
          
          if (shouldShowLabel) {
            return (
              <text
                key={`label-${index}`}
                x="50%"
                y="50%"
                textAnchor="middle"
                fill="#666"
                className="weight-label"
                fontSize={11}
                dy={-15}
              >
                {entry.weight.toFixed(0)}
              </text>
            );
          }
          return null;
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
