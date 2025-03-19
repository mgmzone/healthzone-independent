
import { FastingLog } from '@/lib/types';
import { 
  differenceInSeconds, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  startOfDay, 
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
  min,
  max
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
  
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  // Track fasting seconds for each day of the week
  const fastingSecondsByDay = Array(7).fill(0);
  
  // For debugging
  console.log('Processing weekly chart data with', fastingLogs.length, 'logs');
  console.log('Current week:', weekStart, 'to', weekEnd);
  
  // Process each fast and distribute its hours to the appropriate days
  fastingLogs.forEach(log => {
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    // For completed fasts, use the actual end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Only include logs that overlap with the current week
    if (endTime < weekStart || startTime > weekEnd) {
      console.log('Skipping log outside current week:', log.id, startTime, endTime);
      return;
    }
    
    console.log('Processing log within week:', log.id, startTime, endTime);
    
    // If the fast starts before the week, adjust it to the week start
    const effectiveStartTime = startTime < weekStart ? weekStart : startTime;
    // If the fast ends after the week, adjust it to the week end
    const effectiveEndTime = endTime > weekEnd ? weekEnd : endTime;
    
    // Handle fasts that span multiple days by splitting hours for each day
    let currentDay = new Date(effectiveStartTime);
    
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
        
        console.log('Day', days[dayIndex], 'adding', fastingSecondsForDay / 3600, 'hours');
      }
      
      // Move to the next day
      currentDay = new Date(dayStart);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  });
  
  // Calculate fasting and eating hours
  for (let i = 0; i < 7; i++) {
    // Convert seconds to hours
    const fastingHours = fastingSecondsByDay[i] / 3600;
    
    // Only calculate eating time for past days or today (up to current time)
    const now = new Date();
    const today = now.getDay();
    const isToday = i === today;
    const isPastDay = i < today;
    
    // For current day, calculate available hours based on elapsed time
    if (isToday) {
      const startOfToday = startOfDay(now);
      const elapsedSecondsToday = differenceInSeconds(now, startOfToday);
      const elapsedHoursToday = elapsedSecondsToday / 3600;
      
      // Set fasting hours (already calculated)
      data[i].fasting = fastingHours;
      
      // Calculate eating hours as elapsed hours minus fasting hours
      const eatingHours = Math.max(elapsedHoursToday - fastingHours, 0);
      data[i].eating = -eatingHours; // Negative for display below the x-axis
      
      console.log('Today', days[i], 'fasting:', fastingHours, 'eating:', -eatingHours, 'elapsed:', elapsedHoursToday);
    }
    // For past days, fasting + eating should equal 24 hours
    else if (isPastDay) {
      // Set fasting hours (already calculated)
      data[i].fasting = fastingHours;
      
      // Eating hours = 24 - fasting hours (with a minimum of 0)
      const eatingHours = Math.max(24 - fastingHours, 0);
      data[i].eating = -eatingHours; // Negative for display below the x-axis
      
      console.log('Past day', days[i], 'fasting:', fastingHours, 'eating:', -eatingHours);
    }
    // For future days, just show 0 for both
    else {
      data[i].fasting = 0;
      data[i].eating = 0;
      
      console.log('Future day', days[i], 'fasting: 0, eating: 0');
    }
  }
  
  console.log('Weekly chart data:', data);
  
  return data;
};
