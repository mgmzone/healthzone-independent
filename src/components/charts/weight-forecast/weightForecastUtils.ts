
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, differenceInWeeks, format } from 'date-fns';
import { convertWeight as convertWeightUtil } from '@/lib/weight/convertWeight';

export interface WeeklyWeightData {
  week: number;
  date: Date;
  weight: number;
  isProjected: boolean;
}

export interface ProjectionResult {
  chartData: WeeklyWeightData[];
  targetDate: Date | null;
}

/**
 * Calculate chart data including projections
 */
export const calculateChartData = (
  weighIns: WeighIn[], 
  currentPeriod: Period | undefined, 
  isImperial: boolean
): ProjectionResult => {
  if (!currentPeriod || weighIns.length === 0) {
    return { chartData: [], targetDate: null };
  }
  
  const startDate = new Date(currentPeriod.startDate);
  const endDate = currentPeriod.endDate ? new Date(currentPeriod.endDate) : addWeeks(new Date(), 12); // Default 12 weeks if no end date
  const totalWeeks = differenceInWeeks(endDate, startDate) + 1;
  
  // Convert target weight to display units (kg to lbs if imperial)
  const targetWeight = isImperial ? currentPeriod.targetWeight * 2.20462 : currentPeriod.targetWeight;
  
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

  // Initialize target date as null
  let targetDate: Date | null = null;
  
  // If we have at least 2 weeks of data, calculate weight loss projection
  if (weeklyData.length >= 2) {
    const lastRealDataPoint = weeklyData[weeklyData.length - 1];
    const firstDataPoint = weeklyData[0];
    
    // Calculate average weekly weight change from real data
    // If more data points are available, use a weighted average that gives more importance to recent trends
    let totalChangeSum = 0;
    let weekCount = 0;
    let weightSum = 0;

    // Calculate weighted average change rate, giving more weight to recent data
    for (let i = 1; i < weeklyData.length; i++) {
      const weeklyChange = weeklyData[i].weight - weeklyData[i-1].weight;
      const weight = Math.pow(1.2, i); // Exponential weighting - more recent = more important
      totalChangeSum += weeklyChange * weight;
      weightSum += weight;
      weekCount++;
    }
    
    // If we don't have at least 2 data points, use simple calculation
    const initialWeeklyRate = weekCount > 0 
      ? totalChangeSum / weightSum 
      : (lastRealDataPoint.weight - firstDataPoint.weight) / 
        (lastRealDataPoint.week - firstDataPoint.week || 1);
    
    // Project future weeks with adaptive rate of change - but limit to the period end date
    const now = new Date();
    let targetWeightFound = false;
    
    for (let week = lastRealDataPoint.week + 1; week < totalWeeks; week++) {
      // Calculate a diminishing factor (starts at 1.0 and gradually decreases)
      // The rate drops by 10% every 4 weeks, but at a decreasing rate over time
      const weeksFromLastReal = week - lastRealDataPoint.week;
      const diminishingFactor = Math.pow(0.9, weeksFromLastReal / 4);
      
      // Apply the diminishing factor to the weekly rate
      const adjustedWeeklyRate = initialWeeklyRate * diminishingFactor;
      
      // Calculate the projected weight for this week
      const projectedWeight = lastRealDataPoint.weight + 
        (adjustedWeeklyRate * weeksFromLastReal);
      
      const projectionDate = addWeeks(startDate, week);
      
      // Only add projection points up to the end date of the period
      if (projectionDate <= endDate) {
        weeklyData.push({
          week,
          date: projectionDate,
          weight: projectedWeight,
          isProjected: true
        });

        // Check if we've reached or passed the target weight
        // Only consider future dates for target date estimation
        if (!targetWeightFound && 
            ((initialWeeklyRate < 0 && projectedWeight <= targetWeight) || 
             (initialWeeklyRate > 0 && projectedWeight >= targetWeight)) &&
            projectionDate > now) {
          targetDate = projectionDate;
          targetWeightFound = true;
        }
      }
    }
  }
  
  return { chartData: weeklyData, targetDate };
};

/**
 * Calculate min and max weight for chart display
 */
export const calculateWeightRange = (chartData: WeeklyWeightData[], targetWeight?: number) => {
  if (chartData.length === 0) return { minWeight: 0, maxWeight: 100 };
  
  const weights = [...chartData.map(d => d.weight)];
  if (targetWeight !== undefined) {
    weights.push(targetWeight);
  }
  
  // Calculate a reasonable min/max range for the chart - round to nearest 5
  const minWeight = Math.floor(Math.min(...weights) / 5) * 5;
  const maxWeight = Math.ceil(Math.max(...weights) / 5) * 5;
  
  return { minWeight, maxWeight };
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return 'Unknown';
  return format(date, 'MMM d, yyyy');
};
