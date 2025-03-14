
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
  
  // Get the target weight from the user profile
  const targetWeight = profile?.targetWeight || undefined;
  
  return <WeightForecastChart {...props} targetWeight={targetWeight} />;
}
