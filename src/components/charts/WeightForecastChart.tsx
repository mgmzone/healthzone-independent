
import React from 'react';
import WeightForecastChart from './weight-forecast/WeightForecastChart';
import { Period, WeighIn } from '@/lib/types';

interface WeightForecastChartProps {
  weighIns: WeighIn[];
  currentPeriod: Period | undefined;
  isImperial?: boolean;
}

// This is a wrapper component that redirects to the actual implementation
export default function WeightForecastChartWrapper(props: WeightForecastChartProps) {
  return <WeightForecastChart {...props} />;
}
