
import React from 'react';
import WeightForecastChart from './weight-forecast/WeightForecastChart';
import { Period, WeighIn } from '@/lib/types';
import { useAuth } from '@/lib/auth';

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
  
  // Convert target weight to display units if needed
  const displayTargetWeight = targetWeight && props.isImperial ? 
    targetWeight * 2.20462 : targetWeight;
  
  console.log('WeightForecastChartWrapper:', {
    periodTargetWeight: props.currentPeriod?.targetWeight,
    profileTargetWeight: profile?.targetWeight,
    displayTargetWeight,
    isImperial: props.isImperial,
    weighInsCount: props.weighIns?.length || 0
  });
  
  // Create a deep copy of weighIns to prevent any mutation issues
  const weighInsCopy = props.weighIns.map(w => ({...w}));
  
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
