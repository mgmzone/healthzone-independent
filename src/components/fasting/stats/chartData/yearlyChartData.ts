
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
  
  // Keep track of days with fasting data for each month
  const daysWithFastingByMonth = Array(12).fill(0);
  
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
    
    // Track days with fasting data
    if (log.endTime) {
      // Increment the counter for this month (we'll use this to calculate eating time)
      daysWithFastingByMonth[monthIndex]++;
    }
  });
  
  // Calculate eating hours for each month and make them negative for the chart
  for (let i = 0; i < 12; i++) {
    if (daysWithFastingByMonth[i] > 0) {
      // Calculate eating hours for days that have fasting data
      // Total hours in period = days with fasting * 24
      const totalHoursInPeriod = daysWithFastingByMonth[i] * 24;
      const eatingHours = Math.max(totalHoursInPeriod - data[i].fasting, 0);
      // Make eating hours negative so they appear below the x-axis
      data[i].eating = -eatingHours;
    }
  }
  
  return data;
};
