
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
    dataFirstPoint: data.length > 0 ? data[0] : null,
    dataSample: data.slice(0, 5)
  });

  // Ensure we have processed data with proper timestamp values
  const processedData = data.map(point => {
    // Convert Date objects to timestamps for Recharts
    const date = point.date instanceof Date 
      ? point.date.getTime() 
      : (typeof point.date === 'object' && point.date?._type === 'Date') 
        ? point.date.value.value 
        : new Date(point.date).getTime();
        
    return {
      ...point,
      date
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData}
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
          tickFormatter={(timestamp) => {
            try {
              return format(new Date(timestamp), 'MMM d');
            } catch (err) {
              console.error('Error formatting date:', timestamp, err);
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
