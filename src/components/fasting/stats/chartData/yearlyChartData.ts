
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
  getDaysInMonth,
  format
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
  
  console.log('Yearly - Processing logs count:', fastingLogs.length);
  console.log('Yearly - Logs:', fastingLogs.map(log => ({
    id: log.id,
    start: new Date(log.startTime).toISOString(),
    end: log.endTime ? new Date(log.endTime).toISOString() : 'active'
  })));
  
  // Get the dates for the past year
  const now = new Date();
  const yearAgo = subYears(now, 1);
  
  console.log('Yearly - Time frame:', yearAgo.toISOString(), 'to', now.toISOString());
  
  // Calculate total elapsed hours for each month in the past year
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    // Get current month and year
    const currentMonthDate = new Date(now);
    currentMonthDate.setMonth(now.getMonth() - (11 - monthIndex));
    
    // Skip future months or months before past year
    if (currentMonthDate > now || currentMonthDate < yearAgo) continue;
    
    const monthStart = max([startOfMonth(currentMonthDate), yearAgo]);
    const monthEnd = min([endOfMonth(currentMonthDate), now]);
    
    // Calculate total hours in this month up to now
    const totalHours = (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60);
    totalHoursByMonth[monthIndex] = totalHours;
    
    console.log(`Yearly - Month ${months[monthIndex]} from ${monthStart.toISOString()} to ${monthEnd.toISOString()}, elapsed: ${totalHours}h`);
  }
  
  // Process each fast and distribute hours to appropriate months
  fastingLogs.forEach((log, index) => {
    const startTime = new Date(log.startTime);
    const endTime = log.endTime ? new Date(log.endTime) : new Date();
    
    // Debug log
    console.log(`Yearly - Log #${index}:`, {
      id: log.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: (differenceInSeconds(endTime, startTime) / 3600).toFixed(2) + 'h',
      isInYear: (endTime >= yearAgo)
    });
    
    // Skip logs outside the past year
    if (endTime < yearAgo) {
      console.log(`Yearly - Log #${index} outside year window, skipping`);
      return;
    }
    
    // Adjust start time if it's before our window
    const effectiveStartTime = startTime < yearAgo ? yearAgo : startTime;
    
    // Handle fasts that span multiple months
    let currentDate = new Date(effectiveStartTime);
    const monthEnd = endOfMonth(currentDate);
    
    // If the fast ends in the same month it started
    if (endTime <= monthEnd) {
      const monthIndex = currentDate.getMonth();
      const fastingSeconds = differenceInSeconds(endTime, effectiveStartTime);
      fastingSecondsByMonth[monthIndex] += fastingSeconds;
      console.log(`Yearly - Single month fast: Adding ${(fastingSeconds / 3600).toFixed(2)}h to ${months[monthIndex]}`);
    } else {
      // Handle fast spanning multiple months
      
      // First partial month
      let monthIndex = currentDate.getMonth();
      let fastingSeconds = differenceInSeconds(monthEnd, effectiveStartTime);
      fastingSecondsByMonth[monthIndex] += fastingSeconds;
      console.log(`Yearly - First month: Adding ${(fastingSeconds / 3600).toFixed(2)}h to ${months[monthIndex]}`);
      
      // Full months in between
      let currentMonth = new Date(monthEnd);
      currentMonth.setDate(1);
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      
      while (endOfMonth(currentMonth) < endTime) {
        monthIndex = currentMonth.getMonth();
        const monthStart = startOfMonth(currentMonth);
        const thisMonthEnd = endOfMonth(currentMonth);
        fastingSeconds = differenceInSeconds(thisMonthEnd, monthStart);
        fastingSecondsByMonth[monthIndex] += fastingSeconds;
        console.log(`Yearly - Full month: Adding ${(fastingSeconds / 3600).toFixed(2)}h to ${months[monthIndex]}`);
        
        // Move to next month
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      // Last partial month
      monthIndex = currentMonth.getMonth();
      const lastMonthStart = startOfMonth(currentMonth);
      fastingSeconds = differenceInSeconds(endTime, lastMonthStart);
      fastingSecondsByMonth[monthIndex] += fastingSeconds;
      console.log(`Yearly - Last month: Adding ${(fastingSeconds / 3600).toFixed(2)}h to ${months[monthIndex]}`);
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
      const eatingHours = Math.max(0, totalHoursByMonth[i] - fastingHours);
      
      // Make eating hours negative for the chart
      data[i].eating = -eatingHours;
      
      console.log(`Yearly - Month ${months[i]}: fasting=${fastingHours.toFixed(2)}h, total=${totalHoursByMonth[i]}h, eating=${eatingHours.toFixed(2)}h`);
    }
  }
  
  // For debugging
  console.log('Yearly chart data:', data);
  console.log('Total hours by month:', totalHoursByMonth);
  console.log('Fasting hours by month:', fastingSecondsByMonth.map(s => (s / 3600).toFixed(2)));
  
  return data;
};
