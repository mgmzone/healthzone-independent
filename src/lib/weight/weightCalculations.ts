
import { WeighIn } from '@/lib/types';
import { subDays } from 'date-fns';
import { convertWeight } from './convertWeight';
import { formatWeightValue } from './formatWeight';
import { filterWeighInsByTimePeriod } from './weightFilters';

/**
 * Functions for weight-related calculations
 */

/**
 * Gets the latest (most recent) weight entry
 */
export const getLatestWeight = (weighIns: WeighIn[]) => {
  if (weighIns.length === 0) return null;
  return weighIns[0];
};

/**
 * Gets the starting weight for a given time period
 */
export const getStartingWeight = (
  weighIns: WeighIn[], 
  timeFilter: 'week' | 'month' | 'period',
  isImperial: boolean
): number | null => {
  const filteredEntries = filterWeighInsByTimePeriod(weighIns, timeFilter);
  if (filteredEntries.length === 0) return null;
  
  // Get the earliest entry in the filtered range
  const earliestEntry = filteredEntries[filteredEntries.length - 1];
  // Return the exact converted weight without rounding
  return convertWeight(earliestEntry.weight, isImperial);
};

/**
 * Calculates weight change over a specific number of days
 */
export const calculateWeightChange = (
  weighIns: WeighIn[], 
  days: number,
  isImperial: boolean
) => {
  if (weighIns.length < 2) return null;
  
  const latestWeight = weighIns[0];
  const latestDate = new Date(latestWeight.date);
  
  const targetDate = new Date(latestDate);
  targetDate.setDate(targetDate.getDate() - days);
  
  let closestPreviousWeighIn = null;
  
  for (let i = 1; i < weighIns.length; i++) {
    const weighInDate = new Date(weighIns[i].date);
    if (weighInDate <= targetDate || i === weighIns.length - 1) {
      closestPreviousWeighIn = weighIns[i];
      break;
    }
  }
  
  if (!closestPreviousWeighIn) return null;
  
  // Calculate the exact weight difference
  const latestWeightConverted = convertWeight(latestWeight.weight, isImperial);
  const previousWeightConverted = convertWeight(closestPreviousWeighIn.weight, isImperial);
  
  // Use our consistent formatting function
  const changeValue = Number(formatWeightValue(latestWeightConverted - previousWeightConverted));
  
  return {
    value: changeValue.toFixed(1),
    days: Math.round((latestDate.getTime() - new Date(closestPreviousWeighIn.date).getTime()) / (1000 * 60 * 60 * 24))
  };
};

/**
 * Calculates weight change for a filtered time period
 */
export const calculateFilteredWeightChange = (
  weighIns: WeighIn[],
  timeFilter: 'week' | 'month' | 'period',
  isImperial: boolean
) => {
  const filteredEntries = filterWeighInsByTimePeriod(weighIns, timeFilter);
  
  if (filteredEntries.length < 2) return { value: "0.0" };
  
  const latestEntry = filteredEntries[0];
  const earliestEntry = filteredEntries[filteredEntries.length - 1];
  
  const latestWeightConverted = convertWeight(latestEntry.weight, isImperial);
  const earliestWeightConverted = convertWeight(earliestEntry.weight, isImperial);
  
  // Calculate exact difference without rounding
  const exactChange = latestWeightConverted - earliestWeightConverted;
  
  return {
    value: exactChange.toFixed(1),
    days: Math.round((new Date(latestEntry.date).getTime() - new Date(earliestEntry.date).getTime()) / (1000 * 60 * 60 * 24))
  };
};

/**
 * Calculates total weight change from first to last weigh-in
 */
export const calculateTotalChange = (weighIns: WeighIn[], isImperial: boolean): string => {
  if (weighIns.length < 2) return "0.0";
  
  const latestWeight = weighIns[0];
  const firstWeight = weighIns[weighIns.length - 1];
  
  // Calculate the exact weight difference
  const latestWeightConverted = convertWeight(latestWeight.weight, isImperial);
  const firstWeightConverted = convertWeight(firstWeight.weight, isImperial);
  
  // Use our consistent formatting function
  return formatWeightValue(latestWeightConverted - firstWeightConverted);
};
