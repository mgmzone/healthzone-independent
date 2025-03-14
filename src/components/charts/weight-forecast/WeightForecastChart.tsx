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
} from 'recharts';
import { WeeklyWeightData, calculateChartData, calculateWeightRange, formatDateForDisplay } from './weightForecastUtils';
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
    const { minWeight, maxWeight } = calculateWeightRange(
      currentPeriod.targetWeight,
      currentPeriod.startWeight,
      allWeights
    );
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
  
  const hasOverlappingDates = (data: WeeklyWeightData[]): boolean => {
    if (data.length < 2) return false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i].date.getTime() === data[i - 1].date.getTime()) {
        return true;
      }
    }
    
    return false;
  };
  
  const targetDatePosition = targetDate ? chartData.findIndex(item => item.date >= targetDate) : -1;
  
  const getTargetDatePosition = (): number | null => {
    if (!targetDate) return null;
    
    const index = chartData.findIndex(item => item.date >= targetDate);
    return index !== -1 ? index : null;
  };
  
  const getPeriodEndPosition = (): number | null => {
    if (!currentPeriod?.endDate) return null;
    
    const endDate = new Date(currentPeriod.endDate);
    const index = chartData.findIndex(item => item.date >= endDate);
    return index !== -1 ? index : null;
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
          tickFormatter={(weight) => weight.toFixed(1)}
        />
        <Tooltip 
          labelFormatter={(date) => formatDateForDisplay(date as Date)}
          formatter={(value) => (Array.isArray(value) ? value[0].toFixed(1) : value.toFixed(1))}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#8884d8"
          fill="#8884d8"
          name="Weight"
        />
        {targetDate && (
          <ReferenceLine
            x={formatDateForDisplay(targetDate)}
            stroke="green"
            strokeDasharray="3 3"
            label={{ 
              value: `Target Date: ${formatDateForDisplay(targetDate)}`, 
              position: 'insideTopRight',
              fill: 'green'
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
