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

  // Initialize dayTotalTracking to keep track of hours accounted for each day
  const dayTotalTracking = Array(7).fill(0);
  
  // Process each fast and distribute its hours to the appropriate days
  fastingLogs.forEach(log => {
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Only include logs that overlap with the current week
    if (endTime < weekStart || startTime > weekEnd) return;
    
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
      
      // Calculate hours of fasting for this day (only if there's overlap)
      if (isBefore(fastStartForDay, fastEndForDay)) {
        const fastingSecondsForDay = differenceInSeconds(fastEndForDay, fastStartForDay);
        const fastingHoursForDay = fastingSecondsForDay / 3600;
        
        const dayIndex = currentDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        data[dayIndex].fasting += fastingHoursForDay;
        dayTotalTracking[dayIndex] += fastingHoursForDay;
      }
      
      // Move to the next day
      currentDay = new Date(dayStart);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  });
  
  // Calculate eating hours based on the 24-hour cycle minus fasting hours
  for (let i = 0; i < 7; i++) {
    // Only calculate eating time for days within the week that have some data
    if (dayTotalTracking[i] > 0) {
      // Eating hours = 24 - fasting hours (with a minimum of 0)
      const eatingHours = Math.max(24 - dayTotalTracking[i], 0);
      // For the horizontal layout, we make eating negative so it appears below the x-axis
      data[i].eating = -eatingHours;
    }
  }
  
  return data;
};
