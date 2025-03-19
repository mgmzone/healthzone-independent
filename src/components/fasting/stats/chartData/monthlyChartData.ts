import { FastingLog } from '@/lib/types';
import { differenceInSeconds, subMonths } from 'date-fns';

/**
 * Prepare monthly chart data
 */
export const prepareMonthlyChartData = (fastingLogs: FastingLog[]) => {
  // Find the maximum week number in the logs
  let maxWeekNumber = 0;
  fastingLogs.forEach(log => {
    const startTime = new Date(log.startTime);
    const referenceStartDate = new Date(2025, 1, 23); // 2/23/2025
    const daysSinceStart = Math.floor((startTime.getTime() - referenceStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;
    maxWeekNumber = Math.max(maxWeekNumber, weekNumber);
  });
  
  // Ensure we have at least 4 weeks for display
  maxWeekNumber = Math.max(maxWeekNumber, 4);
  
  // Create an array with all weeks in ascending order (Week 1 to Week N)
  const weeks = Array.from({ length: maxWeekNumber }, (_, i) => `Week ${i + 1}`);
  
  // Initialize data with 0 hours for all weeks
  const data = weeks.map(week => ({ 
    day: week, 
    fasting: 0,
    eating: 0
  }));

  // Keep track of days with data for each week
  const daysWithDataByWeek = Array(maxWeekNumber).fill(0);

  // Fill in actual hours from logs
  const now = new Date();
  fastingLogs.forEach(log => {
    if (!log.endTime && log !== fastingLogs[0]) return; // Skip non-completed fasts except the current one
    
    const startTime = new Date(log.startTime);
    // For active fast, use current time as end time
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Only include logs from the past month
    if (startTime < subMonths(now, 1)) return;
    
    // Calculate week number based on reference date
    const referenceStartDate = new Date(2025, 1, 23); // 2/23/2025
    const daysSinceStart = Math.floor((startTime.getTime() - referenceStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;
    
    if (weekNumber <= maxWeekNumber) {
      // Find the corresponding week in our array
      const weekIndex = data.findIndex(item => item.day === `Week ${weekNumber}`);
      if (weekIndex !== -1) {
        const fastDurationInHours = differenceInSeconds(endTime, startTime) / 3600;
        data[weekIndex].fasting += fastDurationInHours;
        
        // Track days with data
        if (log.endTime) {
          daysWithDataByWeek[weekIndex]++;
        }
      }
    }
  });
  
  // Calculate eating hours for each week and make them negative for the chart
  for (let i = 0; i < data.length; i++) {
    if (daysWithDataByWeek[i] > 0) {
      // For each day with data, total possible hours = 24 * days
      // Eating time = total possible hours - fasting time
      const totalHoursInPeriod = daysWithDataByWeek[i] * 24;
      const eatingHours = Math.max(totalHoursInPeriod - data[i].fasting, 0);
      // Make eating hours negative so they appear below the x-axis
      data[i].eating = -eatingHours;
    }
  }
  
  return data;
};
