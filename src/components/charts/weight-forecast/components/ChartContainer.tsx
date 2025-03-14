
import React from 'react';
import { 
  LineChart,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { format } from 'date-fns';
import CustomTooltip from '../CustomTooltip';

interface ChartContainerProps {
  data: any[];
  minWeight: number;
  maxWeight: number;
  isImperial: boolean;
  domainStart: number;
  domainEnd: number;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  minWeight,
  maxWeight,
  isImperial,
  domainStart,
  domainEnd,
  children
}) => {
  console.log('ChartContainer rendering with domain:', { 
    domainStart, 
    domainEnd,
    dateStart: new Date(domainStart),
    dateEnd: new Date(domainEnd),
    minWeight,
    maxWeight,
    dataLength: data.length,
    dataFirstPoint: data.length > 0 ? data[0] : null
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 30,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date"
          tickFormatter={(dateValue) => {
            try {
              return format(new Date(dateValue), 'MMM d');
            } catch (err) {
              console.error('Error formatting date:', dateValue, err);
              return '';
            }
          }}
          tick={{ fill: '#666', fontSize: 12 }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={{ stroke: '#E0E0E0' }}
          domain={[domainStart, domainEnd]}
          type="number"
          scale="time"
          allowDataOverflow={true}
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
          allowDataOverflow={true}
        />
        <Tooltip content={<CustomTooltip isImperial={isImperial} />} />
        {children}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartContainer;
