
import { FastingLog } from '@/lib/types';
import { differenceInSeconds, subDays } from 'date-fns';

/**
 * Prepare weekly chart data
 */
export const prepareWeeklyChartData = (fastingLogs: FastingLog[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Reorder days to start with the current week
  const orderedDays = [
    ...days.slice(dayOfWeek + 1),
    ...days.slice(0, dayOfWeek + 1)
  ];
  
  // Initialize data with 0 hours for fasting
  const data = orderedDays.map(day => ({ 
    day, 
    fasting: 0,
    eating: 0
  }));
  
  // Fill in actual hours from logs
  fastingLogs.forEach(log => {
    if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
    
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Only include logs from the past week
    if (startTime < subDays(now, 7)) return;
    
    const dayIndex = data.findIndex(d => d.day === days[startTime.getDay()]);
    if (dayIndex !== -1) {
      const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
      const cappedFastingHours = Math.min(fastDurationInHours, 24);
      data[dayIndex].fasting = cappedFastingHours;
      
      // Only add eating time for completed fasts
      if (log.endTime) {
        data[dayIndex].eating = Math.max(24 - cappedFastingHours, 0);
      }
    }
  });
  
  return data;
};
