
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, differenceInWeeks } from 'date-fns';

export interface WeeklyWeightData {
  week: number;
  date: Date;
  weight: number;
  isProjected: boolean;
}

/**
 * Convert weight based on measurement system
 */
export const convertWeight = (weight: number, isImperial: boolean): number => {
  return isImperial ? weight * 2.20462 : weight;
};

/**
 * Calculate chart data including projections
 */
export const calculateChartData = (
  weighIns: WeighIn[], 
  currentPeriod: Period | undefined, 
  isImperial: boolean
): WeeklyWeightData[] => {
  if (!currentPeriod || weighIns.length === 0) return [];
  
  const startDate = new Date(currentPeriod.startDate);
  const endDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : addWeeks(new Date(), 12); // Default 12 weeks if no end date
  const totalWeeks = differenceInWeeks(endDate, startDate) + 1;
  
  // Group weigh-ins by week
  const weeklyWeights: Map<number, number[]> = new Map();
  
  // Initialize with starting weight
  const startWeight = convertWeight(currentPeriod.startWeight, isImperial);
  weeklyWeights.set(0, [startWeight]);
  
  // Fill in actual weights from weigh-ins
  weighIns.forEach(entry => {
    const entryDate = new Date(entry.date);
    const weekNum = differenceInWeeks(entryDate, startDate);
    
    if (weekNum >= 0 && weekNum < totalWeeks) {
      if (!weeklyWeights.has(weekNum)) {
        weeklyWeights.set(weekNum, []);
      }
      weeklyWeights.get(weekNum)?.push(convertWeight(entry.weight, isImperial));
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
  
  // If we have at least 2 weeks of data, calculate weight loss projection
  if (weeklyData.length >= 2) {
    const lastRealDataPoint = weeklyData[weeklyData.length - 1];
    const firstDataPoint = weeklyData[0];
    
    // Calculate average weekly weight change from real data
    const totalChange = lastRealDataPoint.weight - firstDataPoint.weight;
    const weeksPassed = lastRealDataPoint.week - firstDataPoint.week || 1; // Avoid division by zero
    const initialWeeklyRate = totalChange / weeksPassed;
    
    // Project future weeks with decreasing rate of change
    for (let week = lastRealDataPoint.week + 1; week < totalWeeks; week++) {
      // Calculate a diminishing factor (starts at 1.0 and gradually decreases)
      // The rate drops by 10% every 4 weeks
      const weeksFromLastReal = week - lastRealDataPoint.week;
      const diminishingFactor = Math.pow(0.9, weeksFromLastReal / 4);
      
      // Apply the diminishing factor to the weekly rate
      const adjustedWeeklyRate = initialWeeklyRate * diminishingFactor;
      
      // Calculate the projected weight for this week
      const projectedWeight = lastRealDataPoint.weight + 
        (adjustedWeeklyRate * weeksFromLastReal);
      
      weeklyData.push({
        week,
        date: addWeeks(startDate, week),
        weight: projectedWeight,
        isProjected: true
      });
    }
  }
  
  return weeklyData;
};

/**
 * Calculate min and max weight for chart display
 */
export const calculateWeightRange = (chartData: WeeklyWeightData[]) => {
  if (chartData.length === 0) return { minWeight: 0, maxWeight: 100 };
  
  const minWeight = Math.floor(Math.min(...chartData.map(d => d.weight)) - 5);
  const maxWeight = Math.ceil(Math.max(...chartData.map(d => d.weight)) + 5);
  
  return { minWeight, maxWeight };
};
