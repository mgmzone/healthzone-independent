
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
  
  // Fill in actual weights from weigh-ins
  weighIns.forEach(entry => {
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
