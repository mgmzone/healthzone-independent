
// This file is no longer needed as we've simplified our chart approach
// Basic data processing is now handled directly in the component

import { WeighIn, Period } from '@/lib/types';

// Simplified function to get weigh-ins for a period
export const getWeighInsForPeriod = (
  weighIns: WeighIn[],
  currentPeriod: Period
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
