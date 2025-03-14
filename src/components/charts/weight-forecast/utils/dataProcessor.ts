
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, differenceInWeeks } from 'date-fns';
import { WeeklyWeightData } from './types';

/**
 * Processes raw weigh-in data into weekly averages
 */
export const processWeeklyData = (
  weighIns: WeighIn[],
  currentPeriod: Period,
  startDate: Date,
  totalWeeks: number,
  isImperial: boolean
): WeeklyWeightData[] => {
  // Group weigh-ins by week
  const weeklyWeights: Map<number, number[]> = new Map();
  
  // Initialize with starting weight
  const startWeight = isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight;
  weeklyWeights.set(0, [startWeight]);
  
  // Sort the weigh-ins by date (newest first) to ensure we get all recent entries
  const sortedWeighIns = [...weighIns].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Create a map to track the latest entry for each unique date (to avoid duplication)
  const uniqueEntries = new Map<string, WeighIn>();
  
  // Add unique entries to the map, keeping only the most recent for each date
  sortedWeighIns.forEach(entry => {
    const dateKey = new Date(entry.date).toISOString().split('T')[0];
    if (!uniqueEntries.has(dateKey)) {
      uniqueEntries.set(dateKey, entry);
    }
  });
  
  // Process all unique weigh-in entries
  Array.from(uniqueEntries.values()).forEach(entry => {
    const entryDate = new Date(entry.date);
    const weekNum = differenceInWeeks(entryDate, startDate);
    
    if (weekNum >= 0 && weekNum < totalWeeks) {
      if (!weeklyWeights.has(weekNum)) {
        weeklyWeights.set(weekNum, []);
      }
      // Convert weight from kg to display unit if needed
      const entryWeight = isImperial ? entry.weight * 2.20462 : entry.weight;
      weeklyWeights.get(weekNum)?.push(entryWeight);
    }
  });
  
  // Create a sorted array of weekly averages
  const weeklyData: WeeklyWeightData[] = [];
  
  // Calculate average for each week
  for (let week = 0; week < totalWeeks; week++) {
    const weights = weeklyWeights.get(week) || [];
    
    if (weights.length > 0) {
      const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      weeklyData.push({
        week,
        date: addWeeks(startDate, week),
        weight: avgWeight,
        isProjected: false
      });
    }
  }
  
  // Sort data chronologically
  weeklyData.sort((a, b) => a.week - b.week);
  
  return weeklyData;
};

// For daily chart data (to show all recent weigh-ins)
export const processDailyData = (
  weighIns: WeighIn[],
  currentPeriod: Period,
  isImperial: boolean
): WeeklyWeightData[] => {
  // Initialize with starting weight
  const startDate = new Date(currentPeriod.startDate);
  const startWeight = isImperial ? currentPeriod.startWeight * 2.20462 : currentPeriod.startWeight;
  
  // Create a map to track the latest entry for each unique date
  const uniqueEntries = new Map<string, WeighIn>();
  
  // Add the starting point
  const startEntry: WeeklyWeightData = {
    week: 0,
    date: startDate,
    weight: startWeight,
    isProjected: false
  };
  
  // Sort weigh-ins by date (oldest to newest)
  const sortedWeighIns = [...weighIns].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Add each unique weigh-in
  sortedWeighIns.forEach(entry => {
    const entryDate = new Date(entry.date);
    // Only include entries that are after the period start date
    if (entryDate >= startDate) {
      const dateKey = entryDate.toISOString().split('T')[0];
      uniqueEntries.set(dateKey, entry);
    }
  });
  
  // Convert to our data format
  const dailyData: WeeklyWeightData[] = [startEntry];
  
  Array.from(uniqueEntries.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate > startDate) {
        dailyData.push({
          week: differenceInWeeks(entryDate, startDate),
          date: entryDate,
          weight: isImperial ? entry.weight * 2.20462 : entry.weight,
          isProjected: false
        });
      }
    });
  
  return dailyData;
};
