import { WeighIn, Period } from '@/lib/types';
import { addWeeks, differenceInWeeks } from 'date-fns';
import { WeeklyWeightData, ProjectionResult } from './types';

/**
 * Projects future weight based on current trend and applies rules for healthy weight loss/gain
 */
export const calculateWeightProjection = (
  weeklyData: WeeklyWeightData[],
  startWeight: number,
  targetWeight: number,
  startDate: Date,
  totalWeeks: number,
  isImperial: boolean
): ProjectionResult => {
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
    
    // Set maximum healthy weekly weight loss/gain rates (in lbs/kg)
    // These are the maximum rates we'll allow in our projections
    const MAX_WEEKLY_LOSS_IMPERIAL = 2.0;  // 2 lbs per week
    const MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL = 1.5;  // 1.5 lbs per week when near goal
    const NEAR_GOAL_THRESHOLD = 0.75;  // When 75% to goal, slow down more
    
    // Convert to kg if needed
    const MAX_WEEKLY_LOSS = isImperial ? MAX_WEEKLY_LOSS_IMPERIAL : MAX_WEEKLY_LOSS_IMPERIAL / 2.20462;
    const MAX_WEEKLY_LOSS_NEAR_GOAL = isImperial ? MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL : MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL / 2.20462;
    
    for (let week = lastRealDataPoint.week + 1; week < totalWeeks; week++) {
      // Calculate weeks from last real data point
      const weeksFromLastReal = week - lastRealDataPoint.week;
      
      // Generate a sensible projection even if current trend is contrary to goal
      let adjustedWeeklyRate = initialWeeklyRate;
      
      if (isWeightLoss) {
        // For weight loss goals
        if (initialWeeklyRate >= 0) {
          // If current trend shows weight gain or maintenance, assume reasonable loss
          adjustedWeeklyRate = isImperial ? -MAX_WEEKLY_LOSS : -MAX_WEEKLY_LOSS / 2.20462;
        } else {
          // Cap the weekly loss rate to our max healthy values
          const maxLoss = percentCompleted >= NEAR_GOAL_THRESHOLD ? 
            -MAX_WEEKLY_LOSS_NEAR_GOAL : -MAX_WEEKLY_LOSS;
          
          // Ensure weight loss is not faster than our healthy max
          // But don't change the rate if it's already less than our max
          if (initialWeeklyRate < maxLoss) {
            adjustedWeeklyRate = maxLoss;
          }
          
          // Apply a very gentle tapering effect that ensures continued progress
          const minEffectiveness = 0.7; // Maintain at least 70% effectiveness over time
          const taperingFactor = minEffectiveness + 
            (1 - minEffectiveness) * Math.exp(-0.02 * weeksFromLastReal);
          
          adjustedWeeklyRate *= taperingFactor;
        }
      } else {
        // Similar logic for weight gain goals
        if (initialWeeklyRate <= 0) {
          // If current trend shows weight loss but goal is gain, assume reasonable gain
          adjustedWeeklyRate = isImperial ? MAX_WEEKLY_LOSS / 2 : (MAX_WEEKLY_LOSS / 2) / 2.20462;
        } else {
          // Cap the weekly gain rate
          const maxGain = percentCompleted >= NEAR_GOAL_THRESHOLD ? 
            MAX_WEEKLY_LOSS_NEAR_GOAL : MAX_WEEKLY_LOSS;
          
          // Ensure weight gain is not faster than our healthy max
          if (initialWeeklyRate > maxGain) {
            adjustedWeeklyRate = maxGain;
          }
          
          // Apply gentle tapering for weight gain too
          const minEffectiveness = 0.7;
          const taperingFactor = minEffectiveness + 
            (1 - minEffectiveness) * Math.exp(-0.02 * weeksFromLastReal);
          
          adjustedWeeklyRate *= taperingFactor;
        }
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
      // Only consider future dates for target date estimation
      if (!targetWeightFound && 
          ((isWeightLoss && projectedWeight <= targetWeight) || 
           (!isWeightLoss && projectedWeight >= targetWeight)) &&
          projectionDate > now) {
        targetDate = projectionDate;
        targetWeekNum = week;
        targetWeightFound = true;
      }
    }
    
    // If we found the target date, keep only projections up to 2 weeks after target date
    if (targetWeekNum > 0) {
      const maxProjectionWeek = targetWeekNum + 2; // target week plus 2 additional weeks
      
      // Filter out projections beyond our cut-off
      const filteredData = weeklyData.filter(data => 
        !data.isProjected || data.week <= maxProjectionWeek
      );
      
      return { chartData: filteredData, targetDate };
    }
  }
  
  return { chartData: weeklyData, targetDate };
};
