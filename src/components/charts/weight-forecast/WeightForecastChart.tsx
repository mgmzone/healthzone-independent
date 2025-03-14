import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import { WeeklyWeightData, calculateChartData, calculateWeightRange, formatDateForDisplay } from './weightForecastUtils';
import { Period, WeighIn } from '@/lib/types';
import CustomTooltip from './CustomTooltip';
import { format } from 'date-fns';

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
  const [chartData, setChartData] = useState<WeeklyWeightData[]>([]);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { chartData: newChartData, targetDate: newTargetDate } = 
          await calculateChartData(weighIns, currentPeriod, isImperial);
        
        setChartData(newChartData);
        setTargetDate(newTargetDate);
        setError(null);
      } catch (err) {
        console.error('Error calculating weight forecast:', err);
        setError('Failed to calculate weight forecast');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [weighIns, currentPeriod, isImperial]);
  
  const calculateChartRange = () => {
    if (!currentPeriod) return { minWeight: 0, maxWeight: 100 };
    
    const allWeights = chartData.map(item => item.weight);
    const targetWeight = isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight;
    const { minWeight, maxWeight } = calculateWeightRange(chartData, targetWeight);
    
    return { minWeight, maxWeight };
  };
  
  const { minWeight, maxWeight } = calculateChartRange();
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading forecast...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center h-64 flex items-center justify-center">{error}</div>;
  }
  
  if (!currentPeriod || chartData.length === 0) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>Not enough data to create a weight forecast.</p>
      </div>
    );
  }

  const today = new Date();
  const formattedToday = formatDateForDisplay(today);
  
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.isProjected) {
      return (
        <Dot 
          cx={cx} 
          cy={cy} 
          r={4}
          fill="#8884d8"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          tickFormatter={(date) => formatDateForDisplay(date)}
          angle={-45}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
        />
        <YAxis 
          domain={[minWeight, maxWeight]}
          tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value.toString()}
        />
        <Tooltip 
          content={<CustomTooltip isImperial={isImperial} />}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#8884d8"
          fill="#8884d8"
          name="Weight"
          dot={renderDot}
        />
        
        <ReferenceLine
          x={formattedToday}
          stroke="#2563eb"
          strokeWidth={2}
          label={{ 
            value: 'Today', 
            position: 'insideTopRight',
            fill: '#2563eb',
            fontSize: 12
          }}
        />
        
        {targetDate && (
          <ReferenceLine
            x={formatDateForDisplay(targetDate)}
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{ 
              value: 'Target Date', 
              position: 'insideTopRight',
              fill: '#16a34a',
              fontSize: 12
            }}
          />
        )}
        
        {currentPeriod.endDate && (
          <ReferenceLine
            x={formatDateForDisplay(new Date(currentPeriod.endDate))}
            stroke="#dc2626"
            strokeWidth={2}
            label={{ 
              value: 'Period End', 
              position: 'insideTopRight',
              fill: '#dc2626',
              fontSize: 12
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
