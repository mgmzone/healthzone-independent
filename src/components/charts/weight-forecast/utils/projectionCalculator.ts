
import { WeighIn, Period } from '@/lib/types';
import { addWeeks, addDays } from 'date-fns';
import { WeeklyWeightData, ProjectionResult } from './types';
import { 
  getUserHabits, 
  calculateWeeklyLossRate, 
  calculateWeeklyGainRate 
} from './weightRateCalculator';
import { findTargetDate } from './targetDateCalculator';

/**
 * Projects future weight based on current trend and applies rules for healthy weight loss/gain
 * using a model that gradually decreases weight loss rate over time
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
    
    // Calculate initial weekly weight change rate from real data
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
    
    // Calculate the weighted average weekly rate or use the simple difference if not enough data
    const initialWeeklyRate = weekCount > 0 
      ? Math.abs(totalChangeSum / weightSum)
      : Math.abs((lastRealDataPoint.weight - firstDataPoint.weight) / 
        (lastRealDataPoint.week - firstDataPoint.week || 1));
    
    // Project future weeks
    const now = new Date();
    let targetWeightFound = false;
    let targetWeekNum = -1;
    
    // Determine if this is a weight loss or gain goal
    const isWeightLoss = targetWeight < startWeight;
    
    // Set the final sustainable rate (in appropriate units)
    const finalSustainableRate = isImperial ? 2.0 : 0.9; // 2 lbs or 0.9 kg per week
    
    // Check for user habits (fasting, exercise) to customize projection
    const hasAggressiveHabits = await getUserHabits();
    
    // Calculate total weight to lose and weight direction (loss or gain)
    const totalWeightToLose = Math.abs(targetWeight - startWeight);
    const weightLostSoFar = Math.abs(lastRealDataPoint.weight - startWeight);
    const percentCompleted = totalWeightToLose > 0 ? weightLostSoFar / totalWeightToLose : 0;
    
    console.log('Projection starting with:', {
      initialWeeklyRate,
      finalSustainableRate,
      startWeight,
      currentWeight: lastRealDataPoint.weight,
      targetWeight,
      percentCompleted,
      isWeightLoss
    });
    
    let currentWeight = lastRealDataPoint.weight;
    
    // Improved projection logic that uses actual rate more heavily early on
    for (let week = lastRealDataPoint.week + 1; week < totalWeeks; week++) {
      // Calculate progress towards goal for rate adjustment
      const progressTowardsGoal = isWeightLoss 
        ? (startWeight - currentWeight) / (startWeight - targetWeight)
        : (currentWeight - startWeight) / (targetWeight - startWeight);
      
      // Adjust weekly rate based on progress - gradually decrease to sustainable rate
      let adjustedWeeklyRate;
      
      if (isWeightLoss) {
        // Use a more realistic projection that starts with actual rate and transitions to target
        // The transition happens slower at the beginning to account for initial fast weight loss
        const transitionFactor = Math.min(1, progressTowardsGoal * 1.2); // Slows down the transition
        
        // Blend the initial rate (actual rate) with the sustainable rate based on progress
        adjustedWeeklyRate = initialWeeklyRate - 
          (initialWeeklyRate - finalSustainableRate) * transitionFactor;
          
        // Ensure we don't go below the sustainable rate  
        adjustedWeeklyRate = Math.max(adjustedWeeklyRate, finalSustainableRate);
      } else {
        // For weight gain: use existing calculation but cap at sustainable rate
        adjustedWeeklyRate = Math.min(
          calculateWeeklyGainRate(
            initialWeeklyRate,
            week - lastRealDataPoint.week,
            percentCompleted,
            hasAggressiveHabits,
            isImperial
          ),
          finalSustainableRate
        );
      }
      
      // Apply the weekly rate to the current weight
      if (isWeightLoss) {
        currentWeight -= adjustedWeeklyRate;
      } else {
        currentWeight += adjustedWeeklyRate;
      }
      
      const projectionDate = addWeeks(startDate, week);
      
      // Store projection points
      weeklyData.push({
        week,
        date: projectionDate,
        weight: currentWeight,
        isProjected: true
      });
      
      // Log progression every 4 weeks
      if ((week - lastRealDataPoint.week) % 4 === 0) {
        console.log(`Week ${week} (${projectionDate.toISOString().split('T')[0]}): ${currentWeight.toFixed(1)} (rate: ${adjustedWeeklyRate.toFixed(2)})`);
      }

      // Check if we've reached or passed the target weight
      if (!targetWeightFound && 
          ((isWeightLoss && currentWeight <= targetWeight) || 
           (!isWeightLoss && currentWeight >= targetWeight)) &&
          projectionDate > now) {
        targetDate = projectionDate;
        targetWeekNum = week;
        targetWeightFound = true;
        console.log(`Target weight reached at week ${week} (${projectionDate.toISOString().split('T')[0]})`);
      }
    }
    
    // Process data to determine target date and trim projection if needed
    return findTargetDate(weeklyData, targetWeekNum, targetDate);
  }
  
  // Return all data and target date (even if null)
  return { chartData: weeklyData, targetDate };
};
