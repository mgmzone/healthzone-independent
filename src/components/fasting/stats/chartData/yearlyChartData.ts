
import { FastingLog } from '@/lib/types';
import { 
  differenceInSeconds,
  differenceInDays,
  subYears, 
  startOfMonth, 
  endOfMonth,
  isWithinInterval,
  min,
  max,
  getDaysInMonth
} from 'date-fns';

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
  
  // Track fasting seconds for each month
  const fastingSecondsByMonth = Array(12).fill(0);
  // Track total elapsed hours for each month
  const totalHoursByMonth = Array(12).fill(0);
  
  // Get the dates for the past year
  const now = new Date();
  const yearAgo = subYears(now, 1);
  
  // Process each fast and distribute hours to appropriate months
  fastingLogs.forEach(log => {
    // Include current active fast, skip other non-completed fasts
    if (!log.endTime && log !== fastingLogs[0]) return;
    
    const startTime = new Date(log.startTime);
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Skip logs outside the past year
    if (endTime < yearAgo) return;
    
    // Adjust start time if it's before our window
    const effectiveStartTime = startTime < yearAgo ? yearAgo : startTime;
    
    // Handle fasts that span multiple months
    let currentMonth = new Date(effectiveStartTime);
    currentMonth.setDate(1); // Set to first day of month for iteration
    
    while (currentMonth <= endTime) {
      const monthIndex = currentMonth.getMonth();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      // Calculate the intersection of the fast with this month
      const fastStartForMonth = max([monthStart, effectiveStartTime]);
      const fastEndForMonth = min([monthEnd, endTime]);
      
      // Calculate fasting seconds for this month (only if there's overlap)
      if (fastStartForMonth <= fastEndForMonth) {
        const fastingSecondsForMonth = differenceInSeconds(fastEndForMonth, fastStartForMonth);
        fastingSecondsByMonth[monthIndex] += fastingSecondsForMonth;
        
        // For the current month, calculate elapsed hours up to now
        const isCurrentMonth = monthIndex === now.getMonth();
        if (isCurrentMonth) {
          const monthElapsedSeconds = differenceInSeconds(
            now, 
            monthStart
          );
          totalHoursByMonth[monthIndex] = monthElapsedSeconds / 3600;
        }
        // For past months, use total hours in the month
        else if (monthEnd < now) {
          const daysInMonth = getDaysInMonth(monthStart);
          totalHoursByMonth[monthIndex] = daysInMonth * 24;
        }
      }
      
      // Move to the next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  });
  
  // Calculate fasting and eating hours for each month
  for (let i = 0; i < 12; i++) {
    if (totalHoursByMonth[i] > 0) {
      // Convert seconds to hours
      const fastingHours = fastingSecondsByMonth[i] / 3600;
      
      // Set the fasting hours
      data[i].fasting = fastingHours;
      
      // Calculate eating hours (total elapsed - fasting)
      const eatingHours = Math.max(totalHoursByMonth[i] - fastingHours, 0);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
    }
  }
  
  return data;
};
