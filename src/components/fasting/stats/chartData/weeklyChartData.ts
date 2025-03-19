
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
  format
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
  const weekEnd = min([endOfWeek(now), now]);

  // Track fasting seconds for each day of the week
  const fastingSecondsByDay = Array(7).fill(0);
  
  console.log('Weekly - Current date:', now.toISOString());
  console.log('Weekly - Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  console.log('Weekly - Processing logs count:', fastingLogs.length);
  console.log('Weekly - Logs:', fastingLogs.map(log => ({
    id: log.id,
    start: new Date(log.startTime).toISOString(),
    end: log.endTime ? new Date(log.endTime).toISOString() : 'active'
  })));
  
  // Process each fast and distribute its hours to the appropriate days
  fastingLogs.forEach((log, index) => {
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Debug log
    console.log(`Weekly - Log #${index}:`, {
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
  });
  
  // Calculate fasting and eating hours
  for (let i = 0; i < 7; i++) {
    // Convert seconds to hours
    const fastingHours = fastingSecondsByDay[i] / 3600;
    
    // Only calculate eating time for past days or today (up to current time)
    const now = new Date();
    const today = now.getDay();
    const isToday = i === today;
    const isPastDay = i < today || (i > today && fastingHours > 0); // Consider days with data as "past" even if weekend before weekday
    
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
      
      console.log(`Weekly - Today (${days[i]}): fasting=${fastingHours.toFixed(2)}h, elapsed=${elapsedHoursToday.toFixed(2)}h, eating=${eatingHours.toFixed(2)}h`);
    }
    // For past days, fasting + eating should equal 24 hours
    else if (isPastDay) {
      // Set fasting hours (already calculated)
      data[i].fasting = fastingHours;
      
      // Eating hours = 24 - fasting hours (with a minimum of 0)
      const eatingHours = Math.max(24 - fastingHours, 0);
      data[i].eating = -eatingHours; // Negative for display below the x-axis
      
      console.log(`Weekly - Past day (${days[i]}): fasting=${fastingHours.toFixed(2)}h, eating=${eatingHours.toFixed(2)}h`);
    }
    // For future days, just show 0 for both
    else {
      data[i].fasting = 0;
      data[i].eating = 0;
    }
  }
  
  console.log('Weekly chart data:', data);
  console.log('Weekly fasting hours by day:', fastingSecondsByDay.map(s => (s / 3600).toFixed(2)));
  
  return data;
};
