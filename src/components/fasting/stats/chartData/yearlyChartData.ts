
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
 * Ensure date is a proper Date object
 */
const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  
  try {
    // Handle serialized Supabase dates
    if (date && typeof date === 'object' && '_type' in date) {
      if (date._type === 'Date' && date.value && date.value.iso) {
        return new Date(date.value.iso);
      }
    }
    // Try to create date from whatever we received
    return new Date(date);
  } catch (error) {
    console.error('Failed to parse date:', date, error);
    return new Date(); // Fallback to current date
  }
};

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
  
  // Ensure we have logs before proceeding
  if (!fastingLogs || fastingLogs.length === 0) {
    console.log('Yearly - No logs to process');
    return [];
  }
  
  // Track fasting seconds for each month
  const fastingSecondsByMonth = Array(12).fill(0);
  // Track total elapsed hours for each month
  const totalHoursByMonth = Array(12).fill(0);
  // Track which months have activity
  const monthHasActivity = Array(12).fill(false);
  
  console.log('Yearly - Processing logs count:', fastingLogs.length);
  
  // Get the dates for the past year
  const now = new Date();
  const yearAgo = subYears(now, 1);
  
  console.log('Yearly - Time frame:', yearAgo.toISOString(), 'to', now.toISOString());
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Normalize date objects
      const startTime = ensureDate(log.startTime);
      // For active fast, use current time as end time
      const endTime = log.endTime ? ensureDate(log.endTime) : new Date();
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error(`Yearly - Invalid date for log #${index}:`, log);
        return;
      }
      
      // Debug log
      console.log(`Yearly - Processing log #${index}:`, {
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
      
      // For each month, check if this fast falls within it
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        // Get current month and year (going backward from now)
        const currentMonthDate = new Date(now);
        currentMonthDate.setMonth(now.getMonth() - (11 - monthIndex));
        
        // Skip future months or months before past year
        if (currentMonthDate > now || currentMonthDate < yearAgo) continue;
        
        const monthStart = max([startOfMonth(currentMonthDate), yearAgo]);
        const monthEnd = min([endOfMonth(currentMonthDate), now]);
        
        // Calculate total hours in this month up to now (only for months with activity)
        const totalHours = Math.max(0, (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60));
        totalHoursByMonth[monthIndex] = totalHours;
        
        // Check if this fast overlaps with this month
        if (endTime < monthStart || effectiveStartTime > monthEnd) continue;
        
        // Calculate intersection of fast with this month
        const fastStartInMonth = max([monthStart, effectiveStartTime]);
        const fastEndInMonth = min([monthEnd, endTime]);
        
        // Calculate fasting seconds that fall within this month
        const fastingSecondsInMonth = differenceInSeconds(fastEndInMonth, fastStartInMonth);
        fastingSecondsByMonth[monthIndex] += fastingSecondsInMonth;
        
        // Mark this month as having activity
        monthHasActivity[monthIndex] = true;
        
        console.log(`Yearly - Adding ${(fastingSecondsInMonth / 3600).toFixed(2)}h to ${months[monthIndex]}`);
      }
    } catch (error) {
      console.error(`Yearly - Error processing log #${index}:`, error);
    }
  });
  
  // Calculate eating hours based on total elapsed time minus fasting time
  // But only for months with actual fasting activity
  const result = [];
  for (let i = 0; i < 12; i++) {
    // Only include data for months with fasting activity
    if (monthHasActivity[i] && totalHoursByMonth[i] > 0) {
      // Convert seconds to hours and cap at total hours
      const fastingHours = Math.min(fastingSecondsByMonth[i] / 3600, totalHoursByMonth[i]);
      
      // Calculate eating hours (total elapsed - fasting)
      const eatingHours = Math.max(0, totalHoursByMonth[i] - fastingHours);
      
      result.push({
        day: months[i],
        fasting: fastingHours,
        eating: -eatingHours // Make eating hours negative for the chart
      });
      
      console.log(`Yearly - Final Month ${months[i]}: fasting=${fastingHours.toFixed(2)}h, total=${totalHoursByMonth[i].toFixed(2)}h, eating=${eatingHours.toFixed(2)}h`);
    }
  }
  
  // For debugging
  console.log('Yearly - Chart data:', result);
  
  return result;
};
