
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
    
    const { minWeight, maxWeight } = calculateWeightRange(chartData);
    
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
  const formatDateForAxis = (date: Date): string => {
    return format(date, 'MM/dd/yy');
  };
  
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.isProjected) {
      return (
        <Dot 
          cx={cx} 
          cy={cy} 
          r={4}
          fill="#33C3F0"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };
  
  // Format date to string for use with ReferenceLine
  const formatDateToString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Get the date strings for reference lines
  const todayStr = formatDateToString(today);
  const targetDateStr = targetDate ? formatDateToString(targetDate) : null;
  const periodEndStr = currentPeriod?.endDate ? formatDateToString(new Date(currentPeriod.endDate)) : null;
  
  // Find the exact dates in the chartData for reference lines
  const findExactOrClosestDate = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    
    // First try to find exact match
    const found = chartData.find(item => formatDateToString(new Date(item.date)) === dateStr);
    if (found) return formatDateToString(new Date(found.date));
    
    // If not found, find closest future date
    const targetTime = new Date(dateStr).getTime();
    const closestFuture = chartData
      .filter(item => new Date(item.date).getTime() >= targetTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      
    return closestFuture ? formatDateToString(new Date(closestFuture.date)) : null;
  };
  
  const exactTodayDate = findExactOrClosestDate(todayStr);
  const exactTargetDate = findExactOrClosestDate(targetDateStr);
  const exactPeriodEndDate = findExactOrClosestDate(periodEndStr);
  
  console.log('Reference lines:', { exactTodayDate, exactTargetDate, exactPeriodEndDate });
  
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
          tickFormatter={(date) => formatDateForAxis(date)}
          angle={-45}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          domain={[minWeight, maxWeight]}
          tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value.toString()}
          tick={{ fontSize: 10 }}
        />
        <Tooltip 
          content={<CustomTooltip isImperial={isImperial} />}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#33C3F0"
          fill="#D3E4FD"
          name="Weight"
          dot={renderDot}
        />
        
        {exactTodayDate && (
          <ReferenceLine
            x={exactTodayDate}
            stroke="#2563eb"
            strokeWidth={2}
            label={{ 
              value: 'Today', 
              position: 'insideTopRight',
              fill: '#2563eb',
              fontSize: 10
            }}
          />
        )}
        
        {exactTargetDate && (
          <ReferenceLine
            x={exactTargetDate}
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{ 
              value: 'Target Date', 
              position: 'insideTopRight',
              fill: '#16a34a',
              fontSize: 10
            }}
          />
        )}
        
        {exactPeriodEndDate && (
          <ReferenceLine
            x={exactPeriodEndDate}
            stroke="#dc2626"
            strokeWidth={2}
            label={{ 
              value: 'Period End', 
              position: 'insideTopRight',
              fill: '#dc2626',
              fontSize: 10
            }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeightForecastChart;
