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
  // Set sustainable rate based on units
  const sustainableRate = isImperial ? 2.0 : 0.9; // 2 lbs or 0.9 kg per week
  
  // If the initial rate is already at or below the sustainable rate, keep it
  if (initialRate <= sustainableRate) {
    return initialRate;
  }
  
  // Calculate progress factor (increases as we approach target)
  const progressFactor = Math.min(1, percentCompleted * 1.5);
  
  // Calculate time factor (increases as we move further into future)
  const timeFactor = Math.min(1, weeksFromLastReal / 12);  // Gradually over 12 weeks
  
  // Combined factor gives more weight to whichever is higher
  const combinedFactor = Math.max(progressFactor, timeFactor);
  
  // Calculate adjusted rate - moves from initial rate towards sustainable rate
  let adjustedRate = initialRate - ((initialRate - sustainableRate) * combinedFactor);
  
  // Apply habit adjustments if relevant
  if (hasAggressiveHabits && adjustedRate < initialRate * 0.8) {
    // With good habits, slow the decrease rate
    adjustedRate = Math.min(initialRate * 0.8, adjustedRate * 1.2);
  }
  
  // Set minimum reasonable rate
  const minRate = isImperial ? 0.5 : 0.25; // 0.5 lbs or 0.25 kg
  
  // Ensure we don't go below the minimum rate
  return Math.max(adjustedRate, minRate);
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
  // Set sustainable gain rate based on units
  const sustainableRate = isImperial ? 1.0 : 0.45; // 1 lb or 0.45 kg per week
  
  // Calculate time factor (increases as we move further into future)
  const timeFactor = Math.min(1, weeksFromLastReal / 8);  // Gradually over 8 weeks
  
  // Calculate progress factor (increases as we approach target)
  const progressFactor = Math.min(1, percentCompleted * 1.2);
  
  // Combined factor
  const combinedFactor = Math.max(progressFactor, timeFactor);
  
  // For weight gain, we go from initial rate towards sustainable rate
  let adjustedRate = initialRate - ((initialRate - sustainableRate) * combinedFactor);
  
  // For muscle gain with exercise, maintain slightly higher rate
  if (hasAggressiveHabits) {
    const maxBoostRate = isImperial ? 1.5 : 0.7; // 1.5 lbs or 0.7 kg max with proper training
    adjustedRate = Math.min(maxBoostRate, adjustedRate * 1.1);
  }
  
  // Ensure at least minimum rate
  const minRate = isImperial ? 0.25 : 0.1; // 0.25 lbs or 0.1 kg
  
  return Math.max(adjustedRate, minRate);
};
