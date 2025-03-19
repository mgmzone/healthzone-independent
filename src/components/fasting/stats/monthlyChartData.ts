
import { FastingLog } from '@/lib/types';
import {
  differenceInSeconds,
  subMonths,
  startOfDay,
  endOfDay,
  min,
  max,
  addDays,
  format,
  getWeekOfMonth,
  isWithinInterval
} from 'date-fns';

/**
 * Prepare monthly chart data
 */
export const prepareMonthlyChartData = (fastingLogs: FastingLog[]) => {
  // Create weekly data points (up to 5 weeks for a month view)
  const data = Array.from({ length: 5 }, (_, i) => ({ 
    day: `Week ${i + 1}`, 
    fasting: 0,
    eating: 0
  }));
  
  // Ensure we have logs before proceeding
  if (!fastingLogs || fastingLogs.length === 0) {
    console.log('Monthly - No logs to process');
    return data;
  }
  
  // Set up time frame - past month
  const now = new Date();
  const monthAgo = subMonths(now, 1);
  
  console.log('Monthly - Processing logs count:', fastingLogs.length);
  console.log('Monthly - Time frame:', monthAgo.toISOString(), 'to', now.toISOString());
  
  // Track fasting and total hours for each week
  const fastingSecondsByWeek = Array(5).fill(0);
  const totalSecondsByWeek = Array(5).fill(0);
  
  // For each week in the month, determine the elapsed time
  for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
    // Calculate this week's start (from month ago)
    const weekStart = addDays(monthAgo, weekIndex * 7);
    
    // Calculate week end date (capped at now)
    const weekEnd = min([addDays(weekStart, 6), now]);
    
    // If this week hasn't started yet, skip it
    if (weekStart > now) continue;
    
    // Calculate total elapsed seconds for this week
    totalSecondsByWeek[weekIndex] = Math.max(0, differenceInSeconds(weekEnd, weekStart));
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Skip logs with invalid dates
      if (!(log.startTime instanceof Date) || (log.endTime && !(log.endTime instanceof Date))) {
        console.error(`Monthly - Invalid dates for log #${index}:`, log);
        return;
      }
      
      const startTime = log.startTime;
      // For active fast, use current time as end time
      const endTime = log.endTime ? log.endTime : new Date();
      
      // Skip logs completely before our time frame
      if (endTime < monthAgo) {
        console.log(`Monthly - Log #${index} before month range, skipping`);
        return;
      }
      
      // Adjust start time if it's before our time frame
      const effectiveStartTime = startTime < monthAgo ? monthAgo : startTime;
      
      console.log(`Monthly - Processing log #${index}:`, {
        id: log.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        effectiveStart: effectiveStartTime.toISOString(),
      });
      
      // For each week, calculate fasting time within that week
      for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
        // Calculate this week's boundaries
        const weekStart = addDays(monthAgo, weekIndex * 7);
        // Cap week end at now
        const weekEnd = min([addDays(weekStart, 6), now]);
        
        // Skip weeks that haven't started yet
        if (weekStart > now) continue;
        
        // Skip if the log ends before this week starts or starts after this week ends
        if (endTime < weekStart || effectiveStartTime > weekEnd) continue;
        
        // Calculate intersection of fast with this week
        const overlapStart = max([weekStart, effectiveStartTime]);
        const overlapEnd = min([weekEnd, endTime]);
        
        if (overlapStart <= overlapEnd) {
          const fastingSecondsInWeek = differenceInSeconds(overlapEnd, overlapStart);
          fastingSecondsByWeek[weekIndex] += fastingSecondsInWeek;
          console.log(`Monthly - Adding ${(fastingSecondsInWeek / 3600).toFixed(2)}h to Week ${weekIndex + 1}`);
        }
      }
    } catch (error) {
      console.error(`Monthly - Error processing log #${index}:`, error);
    }
  });
  
  // Build the chart data
  for (let i = 0; i < 5; i++) {
    if (totalSecondsByWeek[i] > 0) {
      // Convert seconds to hours
      const totalHours = totalSecondsByWeek[i] / 3600;
      const fastingHours = fastingSecondsByWeek[i] / 3600;
      
      // Set fasting hours (capped at total hours)
      data[i].fasting = Math.min(fastingHours, totalHours);
      
      // Calculate eating hours (total - fasting, minimum 0)
      const eatingHours = Math.max(0, totalHours - fastingHours);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
      
      console.log(`Monthly - Final Week ${i + 1}: fasting=${data[i].fasting.toFixed(2)}h, eating=${eatingHours.toFixed(2)}h, total=${totalHours.toFixed(2)}h`);
    }
  }
  
  console.log('Monthly - Chart data:', data);
  
  return data;
};
