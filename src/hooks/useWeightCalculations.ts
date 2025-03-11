
import { WeighIn } from '@/lib/types';
import { isWithinInterval, startOfWeek, startOfMonth, subDays } from 'date-fns';

export const useWeightCalculations = (weighIns: WeighIn[], isImperial: boolean) => {
  // Convert weight if needed based on measurement unit
  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    return isImperial ? weight * 2.20462 : weight;
  };

  const getLatestWeight = () => {
    if (weighIns.length === 0) return null;
    return weighIns[0];
  };

  // Ensure consistent formatting with exactly one decimal place
  const formatWeightValue = (value: number): string => {
    // We don't round here to avoid losing precision
    return value.toFixed(1);
  };

  // Filter weighIns by specified time period
  const filterWeighInsByTimePeriod = (timePeriod: 'week' | 'month' | 'period') => {
    if (weighIns.length === 0) return [];
    
    const today = new Date();
    
    if (timePeriod === 'week') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
      return weighIns.filter(entry => 
        isWithinInterval(new Date(entry.date), { 
          start: weekStart, 
          end: today 
        })
      );
    } else if (timePeriod === 'month') {
      const monthStart = startOfMonth(today);
      return weighIns.filter(entry => 
        isWithinInterval(new Date(entry.date), { 
          start: monthStart, 
          end: today 
        })
      );
    }
    
    // For 'period' or any other value, return all weighIns
    return [...weighIns];
  };

  const getStartingWeight = (timeFilter: 'week' | 'month' | 'period') => {
    const filteredEntries = filterWeighInsByTimePeriod(timeFilter);
    if (filteredEntries.length === 0) return null;
    
    // Get the earliest entry in the filtered range
    const earliestEntry = filteredEntries[filteredEntries.length - 1];
    // Return the exact converted weight without rounding
    return convertWeight(earliestEntry.weight);
  };

  const calculateWeightChange = (days: number) => {
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
    const latestWeightConverted = convertWeight(latestWeight.weight);
    const previousWeightConverted = convertWeight(closestPreviousWeighIn.weight);
    
    // Use our consistent formatting function
    const changeValue = Number(formatWeightValue(latestWeightConverted - previousWeightConverted));
    
    return {
      value: changeValue.toFixed(1),
      days: Math.round((latestDate.getTime() - new Date(closestPreviousWeighIn.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  // Calculate weight change for filtered data
  const calculateFilteredWeightChange = (timeFilter: 'week' | 'month' | 'period') => {
    const filteredEntries = filterWeighInsByTimePeriod(timeFilter);
    
    if (filteredEntries.length < 2) return { value: "0.0" };
    
    const latestEntry = filteredEntries[0];
    const earliestEntry = filteredEntries[filteredEntries.length - 1];
    
    const latestWeightConverted = convertWeight(latestEntry.weight);
    const earliestWeightConverted = convertWeight(earliestEntry.weight);
    
    // Calculate exact difference without rounding
    const exactChange = latestWeightConverted - earliestWeightConverted;
    
    return {
      value: exactChange.toFixed(1),
      days: Math.round((new Date(latestEntry.date).getTime() - new Date(earliestEntry.date).getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  // Calculate weight change between first and last weigh-ins
  const calculateTotalChange = () => {
    if (weighIns.length < 2) return "0.0";
    
    const latestWeight = weighIns[0];
    const firstWeight = weighIns[weighIns.length - 1];
    
    // Calculate the exact weight difference
    const latestWeightConverted = convertWeight(latestWeight.weight);
    const firstWeightConverted = convertWeight(firstWeight.weight);
    
    // Use our consistent formatting function
    const changeValue = formatWeightValue(latestWeightConverted - firstWeightConverted);
    
    return changeValue;
  };

  return {
    convertWeight,
    getLatestWeight,
    calculateWeightChange,
    calculateTotalChange,
    formatWeightValue,
    filterWeighInsByTimePeriod,
    calculateFilteredWeightChange,
    getStartingWeight
  };
};
