
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, format, startOfWeek, endOfWeek, differenceInWeeks } from 'date-fns';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial: boolean;
}

interface WeeklyWeightData {
  week: number;
  date: Date;
  weight: number;
  isProjected: boolean;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({ 
  weighIns, 
  currentPeriod,
  isImperial 
}) => {
  // Convert weight based on measurement system
  const convertWeight = (weight: number): number => {
    return isImperial ? weight * 2.20462 : weight;
  };
  
  const chartData = useMemo(() => {
    if (!currentPeriod || weighIns.length === 0) return [];
    
    const startDate = new Date(currentPeriod.startDate);
    const endDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : addWeeks(new Date(), 12); // Default 12 weeks if no end date
    const totalWeeks = differenceInWeeks(endDate, startDate) + 1;
    
    // Group weigh-ins by week
    const weeklyWeights: Map<number, number[]> = new Map();
    
    // Initialize with starting weight
    const startWeight = convertWeight(currentPeriod.startWeight);
    weeklyWeights.set(0, [startWeight]);
    
    // Fill in actual weights from weigh-ins
    weighIns.forEach(entry => {
      const entryDate = new Date(entry.date);
      const weekNum = differenceInWeeks(entryDate, startDate);
      
      if (weekNum >= 0 && weekNum < totalWeeks) {
        if (!weeklyWeights.has(weekNum)) {
          weeklyWeights.set(weekNum, []);
        }
        weeklyWeights.get(weekNum)?.push(convertWeight(entry.weight));
      }
    });
    
    // Create a sorted array of weekly averages
    const weeklyData: WeeklyWeightData[] = [];
    
    // Calculate average for each week
    for (let week = 0; week < totalWeeks; week++) {
      const weights = weeklyWeights.get(week) || [];
      
      if (weights.length > 0) {
        const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
        weeklyData.push({
          week,
          date: addWeeks(startDate, week),
          weight: avgWeight,
          isProjected: false
        });
      }
    }
    
    // Sort data chronologically
    weeklyData.sort((a, b) => a.week - b.week);
    
    // If we have at least 2 weeks of data, calculate weight loss projection
    if (weeklyData.length >= 2) {
      const lastRealDataPoint = weeklyData[weeklyData.length - 1];
      const firstDataPoint = weeklyData[0];
      
      // Calculate average weekly weight change from real data
      const totalChange = lastRealDataPoint.weight - firstDataPoint.weight;
      const weeksPassed = lastRealDataPoint.week - firstDataPoint.week || 1; // Avoid division by zero
      const initialWeeklyRate = totalChange / weeksPassed;
      
      // Project future weeks with decreasing rate of change
      for (let week = lastRealDataPoint.week + 1; week < totalWeeks; week++) {
        // Calculate a diminishing rate factor (starts at 1.0 and gradually decreases)
        // The rate drops by 10% every 4 weeks
        const weeksFromLastReal = week - lastRealDataPoint.week;
        const diminishingFactor = Math.pow(0.9, weeksFromLastReal / 4);
        
        // Apply the diminishing factor to the weekly rate
        const adjustedWeeklyRate = initialWeeklyRate * diminishingFactor;
        
        // Calculate the projected weight for this week
        const projectedWeight = lastRealDataPoint.weight + 
          (adjustedWeeklyRate * weeksFromLastReal);
        
        weeklyData.push({
          week,
          date: addWeeks(startDate, week),
          weight: projectedWeight,
          isProjected: true
        });
      }
    }
    
    return weeklyData;
  }, [weighIns, currentPeriod, isImperial]);

  const minWeight = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.floor(Math.min(...chartData.map(d => d.weight)) - 5);
  }, [chartData]);

  const maxWeight = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.ceil(Math.max(...chartData.map(d => d.weight)) + 5);
  }, [chartData]);

  const today = new Date();
  
  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].value.toFixed(1)} ${isImperial ? 'lbs' : 'kg'}`}</p>
          <p className="text-xs text-gray-500">{format(new Date(data.date), 'MMM d, yyyy')}</p>
          {data.isProjected && (
            <p className="text-xs text-blue-500">Projected</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!currentPeriod || chartData.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-gray-500">Not enough data for weight forecast</p>
      </div>
    );
  }

  // Convert Date objects to timestamps for the chart
  const formattedData = chartData.map(item => ({
    ...item,
    formattedDate: format(item.date, 'MMM d, yyyy'),
    dateValue: item.date.getTime() // Convert Date to number timestamp for XAxis
  }));

  // Split data into actual and projected for different line styles
  const actualData = formattedData.filter(d => !d.isProjected);
  const projectedData = formattedData.filter(d => d.isProjected);

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="dateValue" 
            tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            minTickGap={30}
            domain={['dataMin', 'dataMax']}
            type="number"
            allowDataOverflow={true}
            data={formattedData}
          />
          <YAxis 
            domain={[minWeight, maxWeight]} 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference line for today */}
          <ReferenceLine x={today.getTime()} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" />
          
          {/* Actual weight line */}
          <Line
            type="monotone"
            dataKey="weight"
            data={actualData}
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ stroke: '#6366F1', strokeWidth: 2, r: 4, fill: 'white' }}
            activeDot={{ r: 6, fill: '#6366F1' }}
            connectNulls={true}
            isAnimationActive={true}
            animationDuration={1000}
            name="Actual"
          />
          
          {/* Projected weight line (dashed) */}
          {projectedData.length > 0 && (
            <Line
              type="monotone"
              dataKey="weight"
              data={projectedData}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 3, fill: 'white' }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
              isAnimationActive={true}
              animationDuration={1000}
              name="Projected"
              connectNulls={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightForecastChart;
