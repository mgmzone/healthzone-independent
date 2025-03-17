
import { FastingLog } from '@/lib/types';
import { differenceInSeconds, differenceInDays, isAfter, isSameDay, addDays } from 'date-fns';

/**
 * Calculate the current fasting streak in days
 */
export const calculateCurrentStreak = (fastingLogs: FastingLog[]): number => {
  if (!fastingLogs.length) return 0;
  
  // Sort logs by startTime (most recent first, which should already be the case)
  const sortedLogs = [...fastingLogs].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  const today = new Date();
  let currentDate = today;
  let streakDays = 0;
  
  // Check if there's a fast today
  const hasFastToday = sortedLogs.some(log => 
    isSameDay(new Date(log.startTime), today) || 
    (log.endTime && isSameDay(new Date(log.endTime), today))
  );
  
  if (hasFastToday) {
    streakDays = 1;
  }
  
  // Check previous days
  for (let i = 1; i <= 365; i++) { // Limit to a year for performance
    const previousDay = addDays(today, -i);
    
    const hasFastOnDay = sortedLogs.some(log => 
      isSameDay(new Date(log.startTime), previousDay) || 
      (log.endTime && isSameDay(new Date(log.endTime), previousDay))
    );
    
    if (!hasFastOnDay) {
      // Streak is broken
      break;
    }
    
    streakDays++;
  }
  
  return streakDays;
};

/**
 * Calculate average daily fasting hours
 */
export const calculateAverageDailyFasting = (fastingLogs: FastingLog[]): number => {
  if (!fastingLogs.length) return 0;
  
  // Consider only completed fasts (with endTime)
  const completedLogs = fastingLogs.filter(log => log.endTime);
  if (!completedLogs.length) return 0;
  
  const totalFastingSeconds = completedLogs.reduce((total, log) => {
    const startTime = new Date(log.startTime);
    const endTime = new Date(log.endTime!);
    return total + differenceInSeconds(endTime, startTime);
  }, 0);
  
  // Convert seconds to hours
  const totalHours = totalFastingSeconds / 3600;
  
  // Return average hours per fast
  return totalHours / completedLogs.length;
};

/**
 * Find the longest fast duration in hours
 */
export const findLongestFast = (fastingLogs: FastingLog[]): number => {
  if (!fastingLogs.length) return 0;
  
  // Consider only completed fasts (with endTime)
  const completedLogs = fastingLogs.filter(log => log.endTime);
  if (!completedLogs.length) return 0;
  
  let longestDuration = 0;
  
  completedLogs.forEach(log => {
    const startTime = new Date(log.startTime);
    const endTime = new Date(log.endTime!);
    const durationInSeconds = differenceInSeconds(endTime, startTime);
    const durationInHours = durationInSeconds / 3600;
    
    if (durationInHours > longestDuration) {
      longestDuration = durationInHours;
    }
  });
  
  return longestDuration;
};
