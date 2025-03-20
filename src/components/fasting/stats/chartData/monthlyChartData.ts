
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
 * Ensure date is a proper Date object
 */
const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  
  try {
    // Handle serialized Supabase dates
    if (date && typeof date === 'object' && '_type' in date) {
      if (date._type === 'Date' && date.value && date.value.iso) {
        return new Date(date.value.iso);
      }
    }
    // Try to create date from whatever we received
    return new Date(date);
  } catch (error) {
    console.error('Failed to parse date:', date, error);
    return new Date(); // Fallback to current date
  }
};

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
  
  // Create arrays to track fasting and total hours for each week
  const fastingHoursByWeek = Array(5).fill(0);
  const totalHoursByWeek = Array(5).fill(0);
  
  console.log('Monthly - Processing logs count:', fastingLogs.length);
  console.log('Monthly - Time frame:', monthAgo.toISOString(), 'to', now.toISOString());
  
  // For each week in the month, determine the start/end and elapsed hours
  for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
    // Calculate this week's start (from month ago)
    const weekStart = addDays(monthAgo, weekIndex * 7);
    
    // Calculate week end date
    const weekEnd = min([addDays(weekStart, 6), now]);
    
    // If this week hasn't started yet, skip it
    if (weekStart > now) continue;
    
    // Calculate total elapsed hours for this week (up to current time)
    const weekElapsedHours = Math.max(0, (weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60));
    totalHoursByWeek[weekIndex] = weekElapsedHours;
    
    console.log(`Monthly - Week ${weekIndex + 1} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}, elapsed: ${weekElapsedHours.toFixed(2)}h`);
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Normalize date objects
      const startTime = ensureDate(log.startTime);
      // For active fast, use current time as end time
      const endTime = log.endTime ? ensureDate(log.endTime) : new Date();
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error(`Monthly - Invalid date for log #${index}:`, log);
        return;
      }
      
      // Debug log
      console.log(`Monthly - Processing log #${index}:`, {
        id: log.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: (differenceInSeconds(endTime, startTime) / 3600).toFixed(2) + 'h',
        isInMonth: (endTime >= monthAgo)
      });
      
      // Skip logs completely outside our month window
      if (endTime < monthAgo) {
        console.log(`Monthly - Log #${index} outside month window, skipping`);
        return;
      }
      
      // Adjust start time if it's before our window
      const effectiveStartTime = startTime < monthAgo ? monthAgo : startTime;
      
      // For each week, check if this fast falls within it
      for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
        // Calculate this week's boundaries
        const weekStart = addDays(monthAgo, weekIndex * 7);
        const weekEnd = min([addDays(weekStart, 6), now]);
        
        // If this week hasn't started yet or fast ends before this week, skip
        if (weekStart > now || endTime < weekStart) continue;
        
        // If fast starts after this week ends, skip
        if (effectiveStartTime > weekEnd) continue;
        
        // Calculate intersection of fast with this week
        const fastStartInWeek = max([weekStart, effectiveStartTime]);
        const fastEndInWeek = min([weekEnd, endTime]);
        
        // Calculate fasting hours that fall within this week
        if (fastStartInWeek <= fastEndInWeek) {
          const fastingSecondsInWeek = differenceInSeconds(fastEndInWeek, fastStartInWeek);
          const fastingHoursInWeek = fastingSecondsInWeek / 3600;
          fastingHoursByWeek[weekIndex] += fastingHoursInWeek;
          
          console.log(`Monthly - Adding ${fastingHoursInWeek.toFixed(2)}h to Week ${weekIndex + 1}`);
        }
      }
    } catch (error) {
      console.error(`Monthly - Error processing log #${index}:`, error);
    }
  });
  
  // Calculate eating hours based on total elapsed time minus fasting time
  for (let i = 0; i < 5; i++) {
    if (totalHoursByWeek[i] > 0) {
      // Set fasting hours (capped at total hours)
      data[i].fasting = Math.min(fastingHoursByWeek[i], totalHoursByWeek[i]);
      
      // Calculate eating hours (total - fasting, minimum 0)
      const eatingHours = Math.max(0, totalHoursByWeek[i] - fastingHoursByWeek[i]);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
      
      console.log(`Monthly - Final Week ${i + 1}: fasting=${data[i].fasting.toFixed(2)}h, total=${totalHoursByWeek[i].toFixed(2)}h, eating=${eatingHours.toFixed(2)}h`);
    }
  }
  
  // Only keep weeks with activity
  const filteredData = data.filter((week, i) => totalHoursByWeek[i] > 0);
  
  // For debugging
  console.log('Monthly - Chart data:', filteredData);
  
  return filteredData;
};
