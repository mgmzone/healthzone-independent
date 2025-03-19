
import { FastingLog } from '@/lib/types';
import { 
  differenceInSeconds, 
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
  
  // Track days with data for each month
  const daysWithDataByMonth = Array(12).fill(0);
  const totalFastingHoursByMonth = Array(12).fill(0);
  
  // Get the dates for the past year
  const now = new Date();
  const yearAgo = subYears(now, 1);
  
  // Process each fast and distribute hours to appropriate months
  fastingLogs.forEach(log => {
    if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
    
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
      
      // Calculate fasting hours for this month (only if there's overlap)
      if (fastStartForMonth <= fastEndForMonth) {
        const fastingSecondsForMonth = differenceInSeconds(fastEndForMonth, fastStartForMonth);
        const fastingHoursForMonth = fastingSecondsForMonth / 3600;
        
        totalFastingHoursByMonth[monthIndex] += fastingHoursForMonth;
        
        // Track that we have data for this month
        daysWithDataByMonth[monthIndex]++;
      }
      
      // Move to the next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
  });
  
  // Calculate average fasting hours per day and corresponding eating hours for each month
  for (let i = 0; i < 12; i++) {
    if (daysWithDataByMonth[i] > 0) {
      // Get the total days in the month (approximate for an average month)
      const daysInMonth = getDaysInMonth(new Date(now.getFullYear(), i));
      
      // Set the fasting hours
      data[i].fasting = totalFastingHoursByMonth[i];
      
      // Calculate total possible hours for the month
      const totalPossibleHours = daysWithDataByMonth[i] * 24;
      
      // Calculate eating hours (total possible - fasting)
      const eatingHours = Math.max(totalPossibleHours - totalFastingHoursByMonth[i], 0);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
    }
  }
  
  return data;
};
