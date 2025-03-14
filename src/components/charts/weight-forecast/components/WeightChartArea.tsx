
import React from 'react';
import { Area, Dot } from 'recharts';

// Define a more specific type for the renderDot function
type DotRendererProps = {
  cx: number;
  cy: number;
  payload: any;
  value: number;
  index: number;
};

type DotRenderer = (props: DotRendererProps) => React.ReactElement | null;

interface WeightChartAreaProps {
  renderDot: DotRenderer;
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

export const createDotRenderer = (): DotRenderer => {
  return (props: DotRendererProps): React.ReactElement | null => {
    const { cx, cy, payload } = props;
    
    if (!payload || payload.isProjected) {
      return null;
    }
    
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
  };
};
