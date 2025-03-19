
import { FastingLog } from '@/lib/types';
import { differenceInSeconds, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

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
  
  // Fill in actual hours from logs
  fastingLogs.forEach(log => {
    if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
    
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Only include logs from the current week
    if (!isWithinInterval(startTime, { start: weekStart, end: weekEnd })) return;
    
    const dayIndex = startTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
    const cappedFastingHours = Math.min(fastDurationInHours, 24);
    data[dayIndex].fasting = cappedFastingHours;
    
    // For the horizontal layout, we make eating negative so it appears below the x-axis
    if (log.endTime) {
      data[dayIndex].eating = -Math.max(24 - cappedFastingHours, 0);
    }
  });
  
  return data;
};
