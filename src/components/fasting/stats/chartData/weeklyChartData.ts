
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
  const weekEnd = min([endOfWeek(now, { weekStartsOn: 0 }), now]);

  // Track fasting seconds for each day of the week
  const fastingSecondsByDay = Array(7).fill(0);
  const totalHoursByDay = Array(7).fill(0);
  
  console.log('Weekly - Current date:', now.toISOString());
  console.log('Weekly - Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  console.log('Weekly - Processing logs count:', fastingLogs.length);
  
  // Log the first few logs for debugging
  if (fastingLogs.length > 0) {
    console.log('Weekly - First few logs:', fastingLogs.slice(0, 3).map(log => ({
      id: log.id,
      start: log.startTime instanceof Date ? log.startTime.toISOString() : 'invalid date',
      end: log.endTime instanceof Date ? log.endTime.toISOString() : 'active/invalid'
    })));
  }
  
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
    
    console.log(`Weekly - Day ${days[i]} (${i}): isPastDay=${isPastDay}, isToday=${isToday}, totalHours=${totalHoursByDay[i]}`);
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Ensure we have valid date objects
      if (!(log.startTime instanceof Date)) {
        console.error(`Weekly - Invalid startTime for log #${index}:`, log.startTime);
        return; // Skip this log
      }
      
      const startTime = log.startTime;
      // For active fast, use current time as end time
      const endTime = log.endTime instanceof Date ? log.endTime : new Date();
      
      // Debug log
      console.log(`Weekly - Processing log #${index}:`, {
        id: log.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: (differenceInSeconds(endTime, startTime) / 3600).toFixed(2) + 'h',
        isInWeek: (endTime >= weekStart && startTime <= weekEnd)
      });
      
      // Only include logs that overlap with the current week
      if (endTime < weekStart || startTime > weekEnd) {
        console.log(`Weekly - Log #${index} outside current week, skipping`);
        return;
      }
      
      // If the fast starts before the week, adjust it to the week start
      const effectiveStartTime = startTime < weekStart ? weekStart : startTime;
      // If the fast ends after the week, adjust it to the week end
      const effectiveEndTime = endTime > weekEnd ? weekEnd : endTime;
      
      console.log(`Weekly - Effective time range for log #${index}:`, 
        effectiveStartTime.toISOString(), 'to', effectiveEndTime.toISOString());
      
      // Handle fasts that span multiple days by splitting hours for each day
      let currentDay = new Date(effectiveStartTime);
      currentDay.setHours(0, 0, 0, 0); // Start at beginning of the day
      
      while (currentDay <= effectiveEndTime) {
        // Calculate start and end times for this day's portion of the fast
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
          
          console.log(`Weekly - Adding ${(fastingSecondsForDay / 3600).toFixed(2)}h to day ${days[dayIndex]} (${format(currentDay, 'yyyy-MM-dd')})`);
        }
        
        // Move to the next day
        currentDay.setDate(currentDay.getDate() + 1);
      }
    } catch (error) {
      console.error(`Weekly - Error processing log #${index}:`, error);
    }
  });
  
  // Calculate fasting and eating hours for the chart display
  for (let i = 0; i < 7; i++) {
    // Convert seconds to hours
    const fastingHours = fastingSecondsByDay[i] / 3600;
    
    // Only display data for days that have elapsed (past days or today)
    if (totalHoursByDay[i] > 0) {
      // Set fasting hours (cap at the total available hours)
      data[i].fasting = Math.min(fastingHours, totalHoursByDay[i]);
      
      // Eating hours = total elapsed hours - fasting hours (with a minimum of 0)
      const eatingHours = Math.max(0, totalHoursByDay[i] - fastingHours);
      data[i].eating = -eatingHours; // Negative for display below the x-axis
      
      console.log(`Weekly - Final day (${days[i]}): fasting=${data[i].fasting.toFixed(2)}h, eating=${Math.abs(data[i].eating).toFixed(2)}h, total=${totalHoursByDay[i].toFixed(2)}h`);
    }
  }
  
  console.log('Weekly - Chart data:', data);
  
  return data;
};
