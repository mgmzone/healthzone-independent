import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { WeighIn } from '@/lib/types';

interface WeightChartProps {
  data: WeighIn[];
  isImperial?: boolean;
  metricKey?: string;
  targetValue?: number;
  startValue?: number;
}

const WeightChart: React.FC<WeightChartProps> = ({
  data,
  isImperial = false,
  metricKey = 'weight',
  targetValue,
  startValue,
}) => {
  const getMetricLabel = () => {
    switch (metricKey) {
      case 'weight':
        return isImperial ? 'lbs' : 'kg';
      case 'bmi':
        return '';
      case 'bodyFatPercentage':
        return '%';
      case 'skeletalMuscleMass':
        return isImperial ? 'lbs' : 'kg';
      case 'boneMass':
        return isImperial ? 'lbs' : 'kg';
      case 'bodyWaterPercentage':
        return '%';
      default:
        return '';
    }
  };

  const convertValue = (entry: WeighIn) => {
    switch (metricKey) {
      case 'weight':
        return isImperial ? entry.weight * 2.20462 : entry.weight;
      case 'bmi':
        return entry.bmi || null;
      case 'bodyFatPercentage':
        return entry.bodyFatPercentage || null;
      case 'skeletalMuscleMass':
        return entry.skeletalMuscleMass
          ? isImperial ? entry.skeletalMuscleMass * 2.20462 : entry.skeletalMuscleMass
          : null;
      case 'boneMass':
        return entry.boneMass
          ? isImperial ? entry.boneMass * 2.20462 : entry.boneMass
          : null;
      case 'bodyWaterPercentage':
        return entry.bodyWaterPercentage || null;
      default:
        return null;
    }
  };

  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => {
      const value = convertValue(item);
      return {
        date: new Date(item.date),
        [metricKey]: value,
        formattedDate: format(new Date(item.date), 'M/d'),
      };
    })
    .filter((item) => item[metricKey] !== null);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available for the selected metric</p>
      </div>
    );
  }

  // Find the minimum point on the chart. For the weight metric this is the
  // user's best mark in the current window — worth calling out.
  const values = chartData
    .map((d) => d[metricKey] as number)
    .filter((v): v is number => typeof v === 'number');
  const minValue = values.length > 0 ? Math.min(...values) : null;
  const minEntry = minValue !== null ? chartData.find((d) => d[metricKey] === minValue) : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{`${payload[0].value.toFixed(1)} ${getMetricLabel()}`}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(label), 'MMM d, yyyy')}</p>
        </div>
      );
    }
    return null;
  };

  const showTargetLine = metricKey === 'weight' && typeof targetValue === 'number';
  const showStartLine = metricKey === 'weight' && typeof startValue === 'number';

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="weightLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), 'M/d')}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            minTickGap={15}
          />
          <YAxis domain={['dataMin - 3', 'dataMax + 3']} hide={true} />
          <Tooltip content={<CustomTooltip />} />

          {showStartLine && (
            <ReferenceLine
              y={startValue}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: `Start ${startValue!.toFixed(1)}`,
                fill: '#94a3b8',
                position: 'right',
                fontSize: 10,
              }}
            />
          )}
          {showTargetLine && (
            <ReferenceLine
              y={targetValue}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{
                value: `Target ${targetValue!.toFixed(1)}`,
                fill: '#10b981',
                position: 'right',
                fontSize: 10,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey={metricKey}
            stroke={metricKey === 'weight' ? 'url(#weightLineGradient)' : '#6366F1'}
            strokeWidth={3}
            dot={{ stroke: '#6366F1', strokeWidth: 2, r: 3, fill: 'white' }}
            activeDot={{ r: 6, fill: '#6366F1' }}
          />

          {metricKey === 'weight' && minEntry && minValue !== null && (
            <ReferenceDot
              x={minEntry.date as any}
              y={minValue}
              r={5}
              fill="#10b981"
              stroke="white"
              strokeWidth={2}
              label={{
                value: `Low ${minValue.toFixed(1)}`,
                position: 'top',
                fill: '#10b981',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
