
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ExerciseLog, TimeFilter } from '@/lib/types';

interface ExerciseChartProps {
  data: ExerciseLog[];
  timeFilter: TimeFilter;
  metricType: 'minutes' | 'distance' | 'heartRate';
  className?: string;
}

const ExerciseChart: React.FC<ExerciseChartProps> = ({ 
  data,
  timeFilter,
  metricType,
  className
}) => {
  // Format data for the chart
  const chartData = data.map(exercise => {
    const date = new Date(exercise.date);
    return {
      date: format(date, 'MMM dd'),
      fullDate: date,
      type: exercise.type,
      minutes: exercise.minutes,
      distance: exercise.distance || 0,
      heartRate: exercise.highestHeartRate || 0,
      color: getExerciseColor(exercise.type),
    };
  });

  const getYAxisLabel = () => {
    switch (metricType) {
      case 'minutes':
        return 'Minutes';
      case 'distance':
        return 'Distance (km)';
      case 'heartRate':
        return 'Heart Rate (bpm)';
      default:
        return '';
    }
  };

  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            label={{ 
              value: getYAxisLabel(), 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 12 } 
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value, name, props) => {
              const { payload } = props;
              const unit = metricType === 'minutes' ? 'min' : metricType === 'distance' ? 'km' : 'bpm';
              return [`${value} ${unit}`, `${capitalizeFirstLetter(payload.type)}`];
            }}
          />
          <Legend 
            formatter={(value) => capitalizeFirstLetter(value)}
          />
          <Bar 
            dataKey={metricType} 
            name={metricType}
            radius={[4, 4, 0, 0]}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getExerciseColor = (type: string) => {
  switch (type) {
    case 'walk':
      return '#3B82F6'; // blue
    case 'run':
      return '#F59E0B'; // amber
    case 'bike':
      return '#10B981'; // emerald
    case 'elliptical':
      return '#8B5CF6'; // violet
    default:
      return '#6B7280'; // gray
  }
};

export default ExerciseChart;
