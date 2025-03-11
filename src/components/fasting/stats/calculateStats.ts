
import { FastingLog } from '@/lib/types';
import { differenceInSeconds, subDays, subMonths, subYears, startOfDay } from 'date-fns';

/**
 * Calculate statistics based on fasting logs and time filter
 */
export const calculateStats = (fastingLogs: FastingLog[], timeFilter: 'week' | 'month' | 'year') => {
  // Filter logs based on time filter
  const now = new Date();
  const filterDate = timeFilter === 'week' 
    ? subDays(now, 7) 
    : timeFilter === 'month' 
      ? subMonths(now, 1) 
      : subYears(now, 1);
  
  const filteredLogs = fastingLogs.filter(log => new Date(log.startTime) >= filterDate);
  
  // Calculate total fasting time in hours
  const totalFastingHours = filteredLogs.reduce((total, log) => {
    // Skip incomplete logs except for the active one
    if (!log.endTime && log !== fastingLogs[0]) return total;
    
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    const fastDurationInSeconds = differenceInSeconds(endTime, startTime);
    return total + (fastDurationInSeconds / 3600);
  }, 0);
  
  // Find longest fast
  let longestFastHours = 0;
  filteredLogs.forEach(log => {
    if (!log.endTime && log !== fastingLogs[0]) return;
    
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
    
    if (fastDurationInHours > longestFastHours) {
      longestFastHours = fastDurationInHours;
    }
  });
  
  // Count days with at least one fast
  const daysWithFast = new Set();
  filteredLogs.forEach(log => {
    const date = startOfDay(new Date(log.startTime)).toISOString();
    daysWithFast.add(date);
  });
  
  // Ensure we're returning numeric values, not undefined
  return {
    totalFasts: filteredLogs.length || 0,
    longestFast: longestFastHours || 0,
    totalFastingTime: totalFastingHours || 0,
    daysWithFast: daysWithFast.size || 0,
  };
};
