
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeighIn, Period } from '@/lib/types';
import { format } from 'date-fns';
import { calculateChartData } from './utils/weightForecastCalculator';
import { calculateWeightRange } from './utils/chartRangeCalculator';
import { formatDateForDisplay } from './utils/dateFormatters';
import { convertWeight } from '@/lib/weight/convertWeight';
import CustomTooltip from './CustomTooltip';

// Import everything from the calculator module
import { 
  calculateChartData as calculateChartDataFromCalc,
  calculateWeightRange as calculateWeightRangeFromCalc,
  formatDateForDisplay as formatDateFromCalc 
} from './weightForecastUtils';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial: boolean;
}

const WeightForecastChart: React.FC<WeightForecastChartProps> = ({ 
  weighIns, 
  currentPeriod,
  isImperial 
}) => {
  // Use the re-exported functions to maintain backward compatibility
  const { chartData, targetDate } = useMemo(() => {
    return calculateChartDataFromCalc(weighIns, currentPeriod, isImperial);
  }, [weighIns, currentPeriod, isImperial]);
  
  const targetWeight = useMemo(() => {
    return currentPeriod ? convertWeight(currentPeriod.targetWeight, isImperial) : undefined;
  }, [currentPeriod, isImperial]);
  
  const { minWeight, maxWeight } = useMemo(() => {
    return calculateWeightRangeFromCalc(chartData, targetWeight);
  }, [chartData, targetWeight]);

  const today = new Date();
  
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

  // Format function for YAxis to remove the large numbers
  const formatYAxis = (value: number) => {
    return value.toFixed(1);
  };

  // Check if target date and period end date are close to each other
  const hasOverlappingDates = () => {
    if (!targetDate || !currentPeriod.endDate) return false;
    
    const endDate = new Date(currentPeriod.endDate);
    const diffInDays = Math.abs((endDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If less than 10 days apart, consider them overlapping
    return diffInDays < 10;
  };

  return (
    <>
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
            />
            <YAxis 
              domain={[minWeight, maxWeight]} 
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
            
            {/* Reference line for today */}
            <ReferenceLine x={today.getTime()} stroke="#10B981" strokeWidth={1} strokeDasharray="3 3" label={{ value: 'Today', position: 'insideBottomRight', fill: '#10B981', fontSize: 10 }} />
            
            {/* Target weight horizontal reference line */}
            {targetWeight && (
              <ReferenceLine 
                y={targetWeight} 
                stroke="#F59E0B" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                label={{ 
                  value: `Target: ${targetWeight.toFixed(1)}`, 
                  position: 'right', 
                  fill: '#F59E0B',
                  fontSize: 10
                }} 
              />
            )}
            
            {/* Target date vertical reference line (if projection reaches target) */}
            {targetDate && (
              <ReferenceLine 
                x={targetDate.getTime()} 
                stroke="#F59E0B" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Target date', 
                  position: hasOverlappingDates() ? 'insideTopLeft' : 'insideTopRight', 
                  fill: '#F59E0B',
                  fontSize: 10
                }} 
              />
            )}
            
            {/* Period end date vertical reference line */}
            {currentPeriod.endDate && (
              <ReferenceLine 
                x={new Date(currentPeriod.endDate).getTime()} 
                stroke="#64748B" 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Period end', 
                  position: hasOverlappingDates() ? 'insideBottomLeft' : 'insideBottomRight', 
                  fill: '#64748B',
                  fontSize: 10
                }} 
              />
            )}
            
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
      
      {targetDate && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Projected to reach target weight by <span className="font-semibold text-amber-500">{formatDateFromCalc(targetDate)}</span>
        </div>
      )}
    </>
  );
};

export default WeightForecastChart;
