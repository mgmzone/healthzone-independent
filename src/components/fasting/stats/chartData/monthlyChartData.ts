
import { FastingLog } from '@/lib/types';
import {
  differenceInSeconds,
  subMonths,
  startOfDay,
  endOfDay,
  min,
  max,
  startOfWeek,
  endOfWeek,
  differenceInHours,
  addDays,
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
    const weekElapsedHours = differenceInHours(weekEnd, weekStart);
    totalHoursByWeek[weekIndex] = weekElapsedHours;
    
    console.log(`Monthly - Week ${weekIndex + 1} from ${weekStart.toISOString()} to ${weekEnd.toISOString()}, elapsed: ${weekElapsedHours}h`);
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    const startTime = new Date(log.startTime);
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Debug log
    console.log(`Monthly - Log #${index}:`, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
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
        
        console.log(`Monthly - Adding ${fastingHoursInWeek}h to Week ${weekIndex + 1}`);
      }
    }
  });
  
  // Calculate eating hours based on total elapsed time minus fasting time
  for (let i = 0; i < 5; i++) {
    if (totalHoursByWeek[i] > 0) {
      // Set fasting hours
      data[i].fasting = fastingHoursByWeek[i];
      
      // Calculate eating hours (total - fasting, minimum 0)
      const eatingHours = Math.max(0, totalHoursByWeek[i] - fastingHoursByWeek[i]);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
    }
  }
  
  // For debugging
  console.log('Monthly chart data:', data);
  console.log('Total hours by week:', totalHoursByWeek);
  console.log('Fasting hours by week:', fastingHoursByWeek);
  
  return data;
};
