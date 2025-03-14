
// This file is no longer needed as we've simplified our chart approach
// Basic weight calculations are now handled directly in the component

import { WeighIn, Period } from '@/lib/types';

/**
 * A simple function to filter weigh-ins within a period
 */
export const getWeighInsForPeriod = (
  weighIns: WeighIn[], 
  currentPeriod: Period | undefined, 
  isImperial: boolean
): WeighIn[] => {
  if (!currentPeriod || weighIns.length === 0) {
    return [];
  }
  
  const startDate = new Date(currentPeriod.startDate);
  const endDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : new Date();
  
  return weighIns.filter(weighIn => {
    const weighInDate = new Date(weighIn.date);
    return weighInDate >= startDate && weighInDate <= endDate;
  });
};
