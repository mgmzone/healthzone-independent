
import React from 'react';
import { Area, Dot } from 'recharts';
import { WeeklyWeightData } from '../utils/types';

interface WeightChartAreaProps {
  renderDot: (props: any) => React.ReactElement | null;
}

export const WeightChartArea: React.FC<WeightChartAreaProps> = ({ renderDot }) => {
  return (
    <Area
      type="monotone"
      dataKey="weight"
      stroke="#33C3F0"
      fill="#D3E4FD"
      name="Weight"
      dot={renderDot}
    />
  );
};

export const createDotRenderer = () => {
  return (props: any): React.ReactElement | null => {
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
};
