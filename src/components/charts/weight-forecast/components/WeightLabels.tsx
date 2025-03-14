
import React from 'react';
import { Label } from 'recharts';
import { WeeklyWeightData } from '../utils/types';

interface WeightLabelsProps {
  data: WeeklyWeightData[];
  isImperial: boolean;
}

export const WeightLabels: React.FC<WeightLabelsProps> = ({ data, isImperial }) => {
  // We don't want to show labels for every data point as it would be too crowded
  // Show labels for first, last, and a few key points in between
  const getPointsToLabel = (data: WeeklyWeightData[]): WeeklyWeightData[] => {
    if (data.length <= 1) return data;
    
    const labeledPoints: WeeklyWeightData[] = [];
    
    // Always include first and last points
    labeledPoints.push(data[0]);
    
    // Add some important points in the middle
    // For datasets with many points, we'll select points at regular intervals
    if (data.length > 5) {
      const interval = Math.floor(data.length / 5);
      for (let i = interval; i < data.length - 1; i += interval) {
        if (i < data.length && data[i]) {
          labeledPoints.push(data[i]);
        }
      }
    } else {
      // For small datasets, include all non-projected points
      for (let i = 1; i < data.length - 1; i++) {
        if (!data[i].isProjected) {
          labeledPoints.push(data[i]);
        }
      }
    }
    
    // Include the last point
    if (data.length > 1) {
      labeledPoints.push(data[data.length - 1]);
    }
    
    return labeledPoints;
  };
  
  const pointsToLabel = getPointsToLabel(data);
  
  return (
    <>
      {pointsToLabel.map((point, index) => {
        const weightValue = point.weight.toFixed(1);
        const dateStr = point.date instanceof Date 
          ? point.date.toISOString() 
          : typeof point.date === 'string' 
            ? point.date 
            : '';
        
        return (
          <Label
            key={`label-${index}-${dateStr}`}
            content={
              <CustomLabel 
                x={undefined}
                y={undefined}
                value={weightValue}
                index={index}
                payload={point}
              />
            }
            position="top"
          />
        );
      })}
    </>
  );
};

interface CustomLabelProps {
  x?: number;
  y?: number;
  value: string;
  index: number;
  payload: any;
}

const CustomLabel: React.FC<CustomLabelProps> = (props) => {
  const { x, y, value } = props;
  
  if (x === undefined || y === undefined) {
    return null;
  }
  
  return (
    <text 
      x={x} 
      y={y - 10} 
      fill="#555555" 
      fontSize={10} 
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};
