
import { WeighIn, Period } from '@/lib/types';
import { addWeeks } from 'date-fns';
import { WeeklyWeightData, ProjectionResult } from './types';
import { 
  getUserHabits, 
  calculateWeeklyLossRate, 
  calculateWeeklyGainRate 
} from './weightRateCalculator';
import { findTargetDate } from './targetDateCalculator';

/**
 * Projects future weight based on current trend and applies rules for healthy weight loss/gain
 */
export const calculateWeightProjection = async (
  weeklyData: WeeklyWeightData[],
  startWeight: number,
  targetWeight: number,
  startDate: Date,
  totalWeeks: number,
  isImperial: boolean
): Promise<ProjectionResult> => {
  // Initialize target date as null
  let targetDate: Date | null = null;
  
  // If we have at least 2 weeks of data, calculate weight loss projection
  if (weeklyData.length >= 2) {
    const lastRealDataPoint = weeklyData[weeklyData.length - 1];
    const firstDataPoint = weeklyData[0];
    
    // Calculate average weekly weight change from real data
    // Using weighted average calculation that gives more importance to recent trends
    let totalChangeSum = 0;
    let weightSum = 0;
    let weekCount = 0;

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
    
    // Project future weeks
    const now = new Date();
    let targetWeightFound = false;
    let targetWeekNum = -1;
    
    // Calculate total weight to lose and weight direction (loss or gain)
    const totalWeightToLose = Math.abs(targetWeight - startWeight);
    const weightLostSoFar = Math.abs(lastRealDataPoint.weight - startWeight);
    const percentCompleted = totalWeightToLose > 0 ? weightLostSoFar / totalWeightToLose : 0;
    const remainingWeight = Math.abs(targetWeight - lastRealDataPoint.weight);
    
    // Determine if this is a weight loss or gain goal
    const isWeightLoss = targetWeight < startWeight;
    
    // Check for user habits (fasting, exercise) to customize projection
    const hasAggressiveHabits = await getUserHabits();
    
    for (let week = lastRealDataPoint.week + 1; week < totalWeeks; week++) {
      // Calculate weeks from last real data point
      const weeksFromLastReal = week - lastRealDataPoint.week;
      
      // Generate a sensible projection based on goal direction
      let adjustedWeeklyRate = initialWeeklyRate;
      
      if (isWeightLoss) {
        adjustedWeeklyRate = calculateWeeklyLossRate(
          initialWeeklyRate,
          weeksFromLastReal,
          targetWeekNum,
          week,
          percentCompleted,
          hasAggressiveHabits,
          isImperial
        );
      } else {
        adjustedWeeklyRate = calculateWeeklyGainRate(
          initialWeeklyRate,
          weeksFromLastReal,
          percentCompleted,
          hasAggressiveHabits,
          isImperial
        );
      }
      
      // Calculate the projected weight for this week
      const projectedWeight = lastRealDataPoint.weight + 
        (adjustedWeeklyRate * weeksFromLastReal);
      
      const projectionDate = addWeeks(startDate, week);
      
      // Store projection points
      weeklyData.push({
        week,
        date: projectionDate,
        weight: projectedWeight,
        isProjected: true
      });

      // Check if we've reached or passed the target weight
      if (!targetWeightFound && 
          ((isWeightLoss && projectedWeight <= targetWeight) || 
           (!isWeightLoss && projectedWeight >= targetWeight)) &&
          projectionDate > now) {
        targetDate = projectionDate;
        targetWeekNum = week;
        targetWeightFound = true;
      }
    }
    
    // Process data to determine target date and trim projection if needed
    return findTargetDate(weeklyData, targetWeekNum, targetDate);
  }
  
  // Return all data and target date (even if null)
  return { chartData: weeklyData, targetDate };
};
