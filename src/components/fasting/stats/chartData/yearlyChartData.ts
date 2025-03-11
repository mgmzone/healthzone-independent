
import { FastingLog } from '@/lib/types';
import { differenceInSeconds, subYears } from 'date-fns';

/**
 * Prepare yearly chart data
 */
export const prepareYearlyChartData = (fastingLogs: FastingLog[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map(month => ({ 
    day: month, 
    fasting: 0,
    eating: 0
  }));
  
  // Fill in actual hours from logs
  const now = new Date();
  fastingLogs.forEach(log => {
    if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
    
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Only include logs from the past year
    if (startTime < subYears(now, 1)) return;
    
    const monthIndex = startTime.getMonth();
    const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
    data[monthIndex].fasting += fastDurationInHours;
    
    // Only add eating time for completed fasts
    if (log.endTime) {
      const daysInMonth = new Date(startTime.getFullYear(), startTime.getMonth() + 1, 0).getDate();
      const totalHoursInMonth = daysInMonth * 24;
      const eatingHours = Math.min(totalHoursInMonth - data[monthIndex].fasting, totalHoursInMonth / 2);
      data[monthIndex].eating = Math.max(eatingHours, 0);
    }
  });
  
  return data;
};
