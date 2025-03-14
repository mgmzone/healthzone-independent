
import { Period } from '@/lib/types';
import { addDays, differenceInDays } from 'date-fns';
import { createChartDataPoint } from './forecastUtils';

/**
 * Generates the ideal weight loss line based on period settings
 */
export const generateTargetLine = (
  period: Period,
  isImperial: boolean,
  targetWeight?: number
) => {
  // Get the period start date and target weight
  const periodStartDate = new Date(period.startDate);
  const startWeight = isImperial ? period.startWeight * 2.20462 : period.startWeight;
  const weightTarget = targetWeight !== undefined ? 
    (isImperial ? targetWeight : targetWeight / 2.20462) : 
    (isImperial ? period.targetWeight * 2.20462 : period.targetWeight);
  
  // Calculate weight loss per day based on the period's weightLossPerWeek
  const weightLossPerDay = (period.weightLossPerWeek / 7);
  
  // If weight loss per day is zero or not valid, can't generate a line
  if (!weightLossPerDay) return [];
  
  // Calculate how many days it would take to reach the target weight
  const weightToLose = startWeight - weightTarget;
  const daysToTarget = Math.ceil(weightToLose / weightLossPerDay);
  
  // If target is above starting weight, this is a weight gain goal
  // In that case we need to adjust our calculation
  const isWeightGain = weightTarget > startWeight;
  const adjustedDaysToTarget = isWeightGain ? 
    Math.ceil(Math.abs(weightToLose) / weightLossPerDay) : daysToTarget;
  
  // If days to target is negative or zero, return empty array
  if (adjustedDaysToTarget <= 0) return [];
  
  // Generate data points from start to predicted target date
  const targetLine = [];
  
  // Add starting point
  targetLine.push(createChartDataPoint(
    periodStartDate, 
    startWeight, 
    false, 
    false
  ));
  
  // Calculate expected weight for each day and add to line
  for (let i = 1; i <= adjustedDaysToTarget; i++) {
    const currentDate = addDays(periodStartDate, i);
    let expectedWeight;
    
    if (isWeightGain) {
      // For weight gain, add weight each day
      expectedWeight = startWeight + (i * weightLossPerDay);
      // Stop if we exceed target
      if (expectedWeight > weightTarget) {
        targetLine.push(createChartDataPoint(
          currentDate, 
          weightTarget, 
          false, 
          false
        ));
        break;
      }
    } else {
      // For weight loss, subtract weight each day
      expectedWeight = startWeight - (i * weightLossPerDay);
      // Stop if we go below target
      if (expectedWeight < weightTarget) {
        targetLine.push(createChartDataPoint(
          currentDate, 
          weightTarget, 
          false, 
          false
        ));
        break;
      }
    }
    
    targetLine.push(createChartDataPoint(
      currentDate, 
      expectedWeight, 
      false, 
      false
    ));
  }
  
  return targetLine;
};
