
import { FastingLog } from '@/lib/types';
import { 
  differenceInSeconds, 
  startOfWeek, 
  endOfWeek, 
  startOfDay, 
  endOfDay,
  isBefore,
  min,
  max,
  format,
  isSameDay,
  addDays,
  isWithinInterval,
  subDays
} from 'date-fns';

/**
 * Prepare weekly chart data
 */
export const prepareWeeklyChartData = (fastingLogs: FastingLog[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = days.map(day => ({ 
    day, 
    fasting: 0,
    eating: 0
  }));
  
  // Ensure we have logs before proceeding
  if (!fastingLogs || fastingLogs.length === 0) {
    console.log('Weekly - No logs to process');
    return data;
  }
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
  const todayEnd = now; // Only count up to current time today

  // Track fasting seconds for each day of the week
  const fastingSecondsByDay = Array(7).fill(0);
  const totalHoursByDay = Array(7).fill(0);
  
  console.log('Weekly - Current date:', now.toISOString());
  console.log('Weekly - Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  console.log('Weekly - Processing logs count:', fastingLogs.length);
  
  // Calculate total elapsed hours for each day in the week (up to current time)
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekStart, i);
    const dayStart = startOfDay(dayDate);
    const dayEnd = isSameDay(dayDate, now) ? now : endOfDay(dayDate);
    
    // If this day is in the future, the elapsed time is 0
    if (dayStart > now) {
      totalHoursByDay[i] = 0;
    } else {
      // Calculate elapsed hours for this day
      const elapsedSeconds = differenceInSeconds(dayEnd, dayStart);
      totalHoursByDay[i] = elapsedSeconds / 3600;
    }
    
    console.log(`Weekly - Day ${days[i]}: totalHours=${totalHoursByDay[i]}`);
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Skip logs with invalid dates
      if (!(log.startTime instanceof Date) || (log.endTime && !(log.endTime instanceof Date))) {
        console.error(`Weekly - Invalid dates for log #${index}:`, log);
        return;
      }
      
      const startTime = log.startTime;
      // For active fast, use current time as end time
      const endTime = log.endTime ? log.endTime : now;
      
      // Only include logs that overlap with the current week
      if (endTime < weekStart || startTime > weekEnd) {
        console.log(`Weekly - Log #${index} outside week range, skipping`);
        return;
      }
      
      // For logs that overlap with the week, calculate the portion that falls within the week
      const effectiveStartTime = startTime < weekStart ? weekStart : startTime;
      const effectiveEndTime = endTime > weekEnd ? weekEnd : endTime;
      
      console.log(`Weekly - Processing log #${index}:`, {
        id: log.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        effectiveStart: effectiveStartTime.toISOString(),
        effectiveEnd: effectiveEndTime.toISOString(),
        duration: (differenceInSeconds(effectiveEndTime, effectiveStartTime) / 3600).toFixed(2) + 'h',
      });
      
      // For each day of the week, add the fasting time that falls on that day
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayDate = addDays(weekStart, dayIndex);
        const dayStart = startOfDay(dayDate);
        const dayEnd = endOfDay(dayDate);
        
        // Skip if this day is after the effective fast time range
        if (dayStart > effectiveEndTime) continue;
        
        // Skip if this day is before the effective fast time range
        if (dayEnd < effectiveStartTime) continue;
        
        // Calculate the overlap between the fast and this day
        const overlapStart = Math.max(dayStart.getTime(), effectiveStartTime.getTime());
        const overlapEnd = Math.min(dayEnd.getTime(), effectiveEndTime.getTime());
        
        if (overlapEnd > overlapStart) {
          // Calculate seconds of fasting for this day 
          const fastingSecondsForDay = (overlapEnd - overlapStart) / 1000;
          fastingSecondsByDay[dayIndex] += fastingSecondsForDay;
          
          console.log(`Weekly - Adding ${(fastingSecondsForDay / 3600).toFixed(2)}h to ${days[dayIndex]}`);
        }
      }
    } catch (error) {
      console.error(`Weekly - Error processing log #${index}:`, error);
    }
  });
  
  // Build the chart data
  for (let i = 0; i < 7; i++) {
    // Only include data for days with elapsed time (today and past days)
    if (totalHoursByDay[i] > 0) {
      // Convert seconds to hours for fasting
      const fastingHours = fastingSecondsByDay[i] / 3600;
      
      // Cap fasting hours at 24 hours per day
      data[i].fasting = Math.min(fastingHours, 24); 
      
      // Calculate eating hours (total time - fasting time)
      // If fasting is more than the total hours in a day, there was no eating
      const eatingHours = Math.max(0, totalHoursByDay[i] - fastingHours);
      
      // Make eating negative for the chart display
      data[i].eating = -eatingHours;
      
      console.log(`Weekly - Final day ${days[i]}: fasting=${data[i].fasting.toFixed(2)}h, eating=${Math.abs(data[i].eating).toFixed(2)}h, total=${totalHoursByDay[i].toFixed(2)}h`);
    }
  }
  
  console.log('Weekly - Chart data:', data);
  
  return data;
};
