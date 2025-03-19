
import { FastingLog } from '@/lib/types';
import {
  differenceInSeconds,
  subMonths,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isBefore,
  isAfter,
  min,
  max
} from 'date-fns';

/**
 * Prepare monthly chart data
 */
export const prepareMonthlyChartData = (fastingLogs: FastingLog[]) => {
  // Find the maximum week number in the current month
  let maxWeekNumber = 0;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthAgo = subMonths(now, 1);
  
  // Create weekly data points (up to 5 weeks for a month view)
  const data = Array.from({ length: 5 }, (_, i) => ({ 
    day: `Week ${i + 1}`, 
    fasting: 0,
    eating: 0
  }));
  
  // Track fasting seconds for each week
  const fastingSecondsByWeek = Array(5).fill(0);
  // Track total hours accounted for in each week (for accurate eating window calculation)
  const totalHoursByWeek = Array(5).fill(0);
  
  // Process each fasting log
  fastingLogs.forEach(log => {
    // Include current active fast, skip other non-completed fasts
    if (!log.endTime && log !== fastingLogs[0]) return;
    
    const startTime = new Date(log.startTime);
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Skip logs outside the last month
    if (startTime < monthAgo || endTime < monthAgo) return;
    
    // Adjust start time if before our window
    const effectiveStartTime = max([monthAgo, startTime]);
    
    // Determine which week this fast belongs to (0-indexed)
    // 0 = first week of the month, 1 = second week, etc.
    const weekIndex = Math.floor((effectiveStartTime.getTime() - monthAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekIndex >= 0 && weekIndex < 5) {
      // Calculate this week's start and end
      const weekStart = new Date(monthAgo);
      weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Calculate the intersection of the fast with this week
      const fastStartForWeek = max([weekStart, effectiveStartTime]);
      const fastEndForWeek = min([weekEnd, endTime]);
      
      // Calculate fasting seconds for this week (only if there's overlap)
      if (fastStartForWeek <= fastEndForWeek) {
        const fastingSecondsForWeek = differenceInSeconds(fastEndForWeek, fastStartForWeek);
        fastingSecondsByWeek[weekIndex] += fastingSecondsForWeek;
        
        // For the first/current week, track total elapsed hours
        if (weekIndex === 0) {
          const today = new Date();
          const weekElapsedSeconds = differenceInSeconds(
            min([today, weekEnd]), 
            weekStart
          );
          totalHoursByWeek[weekIndex] = weekElapsedSeconds / 3600;
        }
        // For past weeks, total is 24*7 hours
        else {
          totalHoursByWeek[weekIndex] = 24 * 7; // 168 hours in a week
        }
      }
    }
  });
  
  // Calculate eating hours based on weekly total hours
  for (let i = 0; i < 5; i++) {
    if (totalHoursByWeek[i] > 0) {
      // Convert fasting seconds to hours
      const fastingHours = fastingSecondsByWeek[i] / 3600;
      
      // Update fasting hours
      data[i].fasting = fastingHours;
      
      // Calculate eating hours (total - fasting)
      const eatingHours = Math.max(totalHoursByWeek[i] - fastingHours, 0);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
    }
  }
  
  return data;
};
