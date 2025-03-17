
import React from 'react';
import { Period, WeighIn } from '@/lib/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { calculateWeightRange } from '../weightForecastUtils';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
  targetWeight?: number;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({
  weighIns,
  currentPeriod,
  isImperial = false,
  targetWeight,
}) => {
  // Early return if no period or weigh-ins
  if (!currentPeriod || weighIns.length === 0) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight chart. Please add at least two weight entries.</p>
      </div>
    );
  }

  // Process data - convert to display format with proper units
  const processedData = weighIns
    .map(weighIn => {
      // Convert weight to display units if needed
      const displayWeight = isImperial ? 
        weighIn.weight * 2.20462 : weighIn.weight;
      
      return {
        date: new Date(weighIn.date).getTime(), // Use timestamp for easier processing
        weight: displayWeight,
        formattedDate: format(new Date(weighIn.date), 'MMM d')
      };
    })
    .sort((a, b) => a.date - b.date); // Sort by date, oldest first
  
  // Convert target weight to display units if needed
  const displayTargetWeight = targetWeight !== undefined ? targetWeight : 
    (currentPeriod.targetWeight ? 
      (isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight) : 
      undefined);
  
  // Calculate min/max for y-axis
  const weights = processedData.map(d => d.weight);
  if (displayTargetWeight) weights.push(displayTargetWeight);
  
  const { minWeight, maxWeight } = calculateWeightRange(weights);
  
  // Define chart domain
  const startDate = new Date(currentPeriod.startDate).getTime();
  const endDate = currentPeriod.projectedEndDate ? 
    new Date(currentPeriod.projectedEndDate).getTime() : 
    (currentPeriod.endDate ? 
      new Date(currentPeriod.endDate).getTime() : 
      new Date().getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now if no end date
  
  console.log('Chart data:', {
    processedDataCount: processedData.length,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    minWeight,
    maxWeight,
    displayTargetWeight,
    firstPoint: processedData[0],
    lastPoint: processedData[processedData.length - 1]
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].value.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`}</p>
          <p className="text-xs text-gray-500">{format(new Date(label), 'MMM d, yyyy')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date"
            type="number"
            scale="time"
            domain={[startDate, endDate]}
            tickFormatter={(date) => format(new Date(date), 'MMM d')}
            tick={{ fill: '#666', fontSize: 12 }}
            allowDataOverflow
          />
          <YAxis 
            domain={[minWeight, maxWeight]}
            tickFormatter={(value) => value.toFixed(0)}
            tick={{ fill: '#666', fontSize: 12 }}
            allowDataOverflow
            label={{ 
              value: `Weight (${isImperial ? 'lbs' : 'kg'})`, 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' },
              fill: '#666' 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={{ r: 4, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 1 }}
            activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightForecastChart;
