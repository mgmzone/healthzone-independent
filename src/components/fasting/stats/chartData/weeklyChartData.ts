
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
  isWithinInterval
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
  
  console.log('Weekly - Starting preparation with', fastingLogs.length, 'logs');
  
  // Ensure we have logs before proceeding
  if (!fastingLogs || fastingLogs.length === 0) {
    console.log('Weekly - No logs to process');
    return data;
  }
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
  const weekEnd = min([endOfWeek(now, { weekStartsOn: 0 }), now]);

  // Track fasting seconds for each day of the week
  const fastingSecondsByDay = Array(7).fill(0);
  const totalHoursByDay = Array(7).fill(0);
  
  console.log('Weekly - Current date:', now.toISOString());
  console.log('Weekly - Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  
  // Calculate total elapsed hours for each day in the week (up to current time)
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekStart, i);
    const isToday = isSameDay(dayDate, now);
    const isPastDay = isBefore(dayDate, startOfDay(now));
    
    if (isPastDay) {
      totalHoursByDay[i] = 24; // Full day
    } else if (isToday) {
      // For today, calculate elapsed hours
      const elapsedSeconds = differenceInSeconds(now, startOfDay(now));
      totalHoursByDay[i] = elapsedSeconds / 3600;
    }
    // Future days remain at 0 hours
    
    console.log(`Weekly - Day ${days[i]}: total hours = ${totalHoursByDay[i].toFixed(2)}`);
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Ensure we have valid date objects
      if (!(log.startTime instanceof Date)) {
        console.error(`Invalid startTime for log #${index}:`, log.startTime);
        return; // Skip this log
      }
      
      const startTime = log.startTime;
      const endTime = log.endTime instanceof Date ? log.endTime : new Date();
      
      // Debug log
      console.log(`Processing log #${log.id}:`, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: (differenceInSeconds(endTime, startTime) / 3600).toFixed(2) + 'h'
      });
      
      // Only include logs that overlap with the current week
      if (endTime < weekStart || startTime > weekEnd) {
        console.log(`Log #${log.id} outside current week, skipping`);
        return;
      }
      
      // Adjust start/end times to be within the week
      const effectiveStartTime = startTime < weekStart ? weekStart : startTime;
      const effectiveEndTime = endTime > weekEnd ? weekEnd : endTime;
      
      // Handle fasts that span multiple days by splitting hours for each day
      let currentDay = new Date(effectiveStartTime);
      currentDay.setHours(0, 0, 0, 0); // Start at beginning of the day
      
      while (currentDay <= effectiveEndTime) {
        const dayStart = startOfDay(currentDay);
        const dayEnd = endOfDay(currentDay);
        
        // Calculate the intersection of the fast with this day
        const fastStartForDay = max([dayStart, effectiveStartTime]);
        const fastEndForDay = min([dayEnd, effectiveEndTime]);
        
        // Calculate seconds of fasting for this day (only if there's overlap)
        if (isBefore(fastStartForDay, fastEndForDay)) {
          const fastingSecondsForDay = differenceInSeconds(fastEndForDay, fastStartForDay);
          
          const dayIndex = currentDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
          fastingSecondsByDay[dayIndex] += fastingSecondsForDay;
          
          console.log(`Adding ${(fastingSecondsForDay / 3600).toFixed(2)}h to ${days[dayIndex]}`);
        }
        
        // Move to the next day
        currentDay.setDate(currentDay.getDate() + 1);
      }
    } catch (error) {
      console.error(`Error processing log:`, error);
    }
  });
  
  // Calculate fasting and eating hours for the chart display
  for (let i = 0; i < 7; i++) {
    // Only display data for days that have elapsed (past days or today)
    if (totalHoursByDay[i] > 0) {
      // Convert seconds to hours
      const fastingHours = fastingSecondsByDay[i] / 3600;
      
      // Set fasting hours (cap at the total available hours)
      data[i].fasting = Math.min(fastingHours, totalHoursByDay[i]);
      
      // Eating hours = total elapsed hours - fasting hours (with a minimum of 0)
      const eatingHours = Math.max(0, totalHoursByDay[i] - fastingHours);
      data[i].eating = -eatingHours; // Negative for display below the x-axis
      
      console.log(`Final day ${days[i]}: fasting=${data[i].fasting.toFixed(2)}h, eating=${Math.abs(data[i].eating).toFixed(2)}h`);
    }
  }
  
  console.log('Weekly chart data prepared:', data);
  return data;
};
