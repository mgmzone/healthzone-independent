
import { supabase } from '@/lib/supabase';
import { subDays } from 'date-fns';
import { getFastingLogs } from '@/lib/services/fasting/getFastingLogs';

// Constants for healthy weight loss/gain rates
const MAX_WEEKLY_LOSS_IMPERIAL = 2.0;  // 2 lbs per week
const MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL = 1.5;  // 1.5 lbs per week when near goal
const NEAR_GOAL_THRESHOLD = 0.75;  // When 75% to goal, slow down

/**
 * Checks if user has aggressive fasting and exercise habits
 * that might accelerate weight loss/gain rates
 */
export const getUserHabits = async (): Promise<boolean> => {
  let hasAggressiveHabits = false;
  
  try {
    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    // Get fasting logs for the past 14 days
    const fastingLogs = await getFastingLogs(30);
    
    // Get exercise logs
    const twoWeeksAgo = subDays(new Date(), 14).toISOString();
    const { data: exerciseLogs } = await supabase
      .from('exercise_logs')
      .select('minutes')
      .eq('user_id', session.user.id)
      .gte('date', twoWeeksAgo);
      
    // Calculate average fasting hours per day
    let totalFastingHours = 0;
    let daysWithFasting = 0;
    
    // Calculate the last 14 days period
    const fourteenDaysAgo = subDays(new Date(), 14);
    
    // Count completed fasts in the last 14 days
    const recentFasts = fastingLogs.filter(log => {
      const startDate = new Date(log.startTime);
      return startDate >= fourteenDaysAgo && log.endTime;
    });
    
    // Calculate total fasting hours
    if (recentFasts.length > 0) {
      totalFastingHours = recentFasts.reduce((total, log) => {
        if (log.fastingHours) {
          return total + log.fastingHours;
        }
        return total;
      }, 0);
      
      daysWithFasting = Math.min(14, recentFasts.length);
      
      // Calculate average fasting hours per day
      const avgFastingHours = daysWithFasting > 0 ? totalFastingHours / daysWithFasting : 0;
      
      // Calculate average exercise minutes per day
      let totalExerciseMinutes = 0;
      if (exerciseLogs && exerciseLogs.length > 0) {
        totalExerciseMinutes = exerciseLogs.reduce((total, log) => total + (log.minutes || 0), 0);
      }
      const avgExerciseMinutes = exerciseLogs && exerciseLogs.length > 0 ? 
        totalExerciseMinutes / Math.min(14, exerciseLogs.length) : 0;
      
      // Check if user has aggressive habits
      hasAggressiveHabits = avgFastingHours >= 18 && avgExerciseMinutes > 30;
    }
  } catch (error) {
    console.error("Error checking fasting and exercise habits:", error);
  }
  
  return hasAggressiveHabits;
};

/**
 * Calculates an appropriate weekly weight loss rate based on various factors
 */
export const calculateWeeklyLossRate = (
  initialRate: number,
  weeksFromLastReal: number,
  targetWeekNum: number,
  currentWeek: number,
  percentCompleted: number,
  hasAggressiveHabits: boolean,
  isImperial: boolean
): number => {
  // Enhanced max weight loss rate for users with aggressive habits
  const ENHANCED_MAX_WEEKLY_LOSS_IMPERIAL = hasAggressiveHabits ? 2.5 : MAX_WEEKLY_LOSS_IMPERIAL;
  const ENHANCED_MAX_WEEKLY_LOSS = isImperial ? ENHANCED_MAX_WEEKLY_LOSS_IMPERIAL : ENHANCED_MAX_WEEKLY_LOSS_IMPERIAL / 2.20462;
  const MAX_WEEKLY_LOSS = isImperial ? MAX_WEEKLY_LOSS_IMPERIAL : MAX_WEEKLY_LOSS_IMPERIAL / 2.20462;
  const MAX_WEEKLY_LOSS_NEAR_GOAL = isImperial ? MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL : MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL / 2.20462;
  
  let adjustedWeeklyRate = initialRate;
  
  // If current trend shows weight gain or maintenance when goal is loss
  if (initialRate >= 0) {
    // Assume reasonable loss
    adjustedWeeklyRate = -ENHANCED_MAX_WEEKLY_LOSS;
  } else {
    // Determine how close we are to target date (if found already)
    let weeksToTarget = -1;
    if (targetWeekNum > 0) {
      weeksToTarget = targetWeekNum - currentWeek;
    }
    
    // Apply more appropriate weight loss rate
    let maxLoss;
    if (weeksToTarget > 0 && weeksToTarget <= 4) {
      // Taper down weight loss in last 4 weeks
      const taperFactor = weeksToTarget / 4; // 1.0 to 0.25
      const minWeeklyLoss = isImperial ? 1.0 : 1.0 / 2.20462;
      const maxWeeklyLoss = ENHANCED_MAX_WEEKLY_LOSS;
      maxLoss = -(minWeeklyLoss + (maxWeeklyLoss - minWeeklyLoss) * taperFactor);
    } else if (percentCompleted >= NEAR_GOAL_THRESHOLD) {
      // Near goal threshold
      maxLoss = -MAX_WEEKLY_LOSS_NEAR_GOAL;
    } else {
      // Use enhanced max loss for users with aggressive habits
      maxLoss = -ENHANCED_MAX_WEEKLY_LOSS;
    }
    
    // Ensure weight loss is not faster than our healthy max
    if (initialRate < maxLoss) {
      adjustedWeeklyRate = maxLoss;
    }
    
    // Apply a very gentle tapering effect that ensures continued progress
    const minEffectiveness = 0.7; // Maintain at least 70% effectiveness over time
    const taperingFactor = minEffectiveness + 
      (1 - minEffectiveness) * Math.exp(-0.02 * weeksFromLastReal);
    
    adjustedWeeklyRate *= taperingFactor;
  }
  
  return adjustedWeeklyRate;
};

/**
 * Calculates an appropriate weekly weight gain rate based on various factors
 */
export const calculateWeeklyGainRate = (
  initialRate: number,
  weeksFromLastReal: number,
  percentCompleted: number,
  hasAggressiveHabits: boolean,
  isImperial: boolean
): number => {
  // Enhanced max weight gain rate for users with aggressive habits
  const ENHANCED_MAX_WEEKLY_LOSS_IMPERIAL = hasAggressiveHabits ? 2.5 : MAX_WEEKLY_LOSS_IMPERIAL;
  const ENHANCED_MAX_WEEKLY_LOSS = isImperial ? ENHANCED_MAX_WEEKLY_LOSS_IMPERIAL : ENHANCED_MAX_WEEKLY_LOSS_IMPERIAL / 2.20462;
  
  let adjustedWeeklyRate = initialRate;
  
  // If current trend shows weight loss but goal is gain
  if (initialRate <= 0) {
    // Assume reasonable gain (half the rate of loss)
    adjustedWeeklyRate = isImperial ? ENHANCED_MAX_WEEKLY_LOSS / 2 : (ENHANCED_MAX_WEEKLY_LOSS / 2) / 2.20462;
  } else {
    // Cap the weekly gain rate
    const maxGain = percentCompleted >= NEAR_GOAL_THRESHOLD ? 
      (isImperial ? MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL : MAX_WEEKLY_LOSS_NEAR_GOAL_IMPERIAL / 2.20462) : 
      ENHANCED_MAX_WEEKLY_LOSS;
    
    // Ensure weight gain is not faster than our healthy max
    if (initialRate > maxGain) {
      adjustedWeeklyRate = maxGain;
    }
    
    // Apply gentle tapering for weight gain too
    const minEffectiveness = 0.7;
    const taperingFactor = minEffectiveness + 
      (1 - minEffectiveness) * Math.exp(-0.02 * weeksFromLastReal);
    
    adjustedWeeklyRate *= taperingFactor;
  }
  
  return adjustedWeeklyRate;
};
