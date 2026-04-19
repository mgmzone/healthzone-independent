
import React from 'react';
import WeightForecastChart from './weight-forecast/WeightForecastChart';
import { Period, WeighIn } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { convertWeight } from '@/lib/weight/convertWeight';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
}

// This is a wrapper component that redirects to the actual implementation
export default function WeightForecastChartWrapper(props: WeightForecastChartProps) {
  const { profile } = useAuth();
  
  // Get the target weight from the period (more accurate than profile target weight)
  const targetWeight = props.currentPeriod?.targetWeight || profile?.targetWeight || undefined;
  
  const displayTargetWeight = targetWeight
    ? convertWeight(targetWeight, props.isImperial || false)
    : undefined;

  // Shallow-copy weighIns so the child doesn't mutate parent state if it ever tries to.
  const weighInsCopy = props.weighIns.map(w => ({ ...w }));
  
  return (
    <div className="w-full h-full">
      <WeightForecastChart 
        weighIns={weighInsCopy} 
        currentPeriod={props.currentPeriod}
        isImperial={props.isImperial || false}
        targetWeight={displayTargetWeight}
      />
    </div>
  );
}
