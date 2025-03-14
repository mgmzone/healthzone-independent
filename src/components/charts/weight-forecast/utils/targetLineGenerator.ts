
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
  
  // All weights in database are stored in kg, convert them if needed
  // The startWeight and targetWeight in period object are always in kg
  const startWeight = isImperial ? period.startWeight * 2.20462 : period.startWeight;
  
  // Use the provided targetWeight if available, otherwise use the one from the period
  // Both need to be converted to display units (kg or lbs)
  const finalTargetWeight = targetWeight !== undefined ? 
    (isImperial ? targetWeight : targetWeight / 2.20462) : 
    (isImperial ? period.targetWeight * 2.20462 : period.targetWeight);
  
  console.log('Target line generation:', {
    periodStartDate,
    startWeight,
    targetWeight,
    finalTargetWeight,
    isImperial,
    weightLossPerWeek: period.weightLossPerWeek
  });
  
  // Calculate weight loss per day based on the period's weightLossPerWeek
  // The weightLossPerWeek is stored in kg/week, so convert if needed
  const weightLossPerWeekInDisplayUnits = isImperial ? 
    period.weightLossPerWeek * 2.20462 : period.weightLossPerWeek;
  
  const weightLossPerDay = (weightLossPerWeekInDisplayUnits / 7);
  
  // If weight loss per day is zero or not valid, can't generate a line
  if (!weightLossPerDay) return [];
  
  // Calculate how many days it would take to reach the target weight
  const weightToLose = startWeight - finalTargetWeight;
  const daysToTarget = Math.ceil(weightToLose / weightLossPerDay);
  
  console.log('Days to target calculation:', {
    weightToLose,
    weightLossPerDay,
    daysToTarget
  });
  
  // If target is above starting weight, this is a weight gain goal
  // In that case we need to adjust our calculation
  const isWeightGain = finalTargetWeight > startWeight;
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
      if (expectedWeight > finalTargetWeight) {
        targetLine.push(createChartDataPoint(
          currentDate, 
          finalTargetWeight, 
          false, 
          false
        ));
        break;
      }
    } else {
      // For weight loss, subtract weight each day
      expectedWeight = startWeight - (i * weightLossPerDay);
      // Stop if we go below target
      if (expectedWeight < finalTargetWeight) {
        targetLine.push(createChartDataPoint(
          currentDate, 
          finalTargetWeight, 
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
