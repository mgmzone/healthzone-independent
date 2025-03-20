
import { FastingLog } from '@/lib/types';
import { 
  differenceInSeconds,
  differenceInDays,
  subMonths,
  startOfMonth, 
  endOfMonth,
  isWithinInterval,
  min,
  max,
  format,
  isBefore
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
 * Prepare period chart data (last 6 months)
 */
export const prepareYearlyChartData = (fastingLogs: FastingLog[]) => {
  // Ensure we have logs before proceeding
  if (!fastingLogs || fastingLogs.length === 0) {
    console.log('Period - No logs to process');
    return [];
  }
  
  // Get the dates for the current period (last 6 months)
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 6);
  
  console.log('Period - Time frame:', sixMonthsAgo.toISOString(), 'to', now.toISOString());
  
  // Create a map to track data for each month
  const monthData = new Map();
  const monthHasActivity = new Map();
  
  // Initialize month totals and activity flags
  for (let i = 0; i < 6; i++) {
    const monthDate = subMonths(now, i);
    const monthKey = format(monthDate, 'MMM');
    
    monthData.set(monthKey, {
      fastingSeconds: 0,
      totalHours: 0
    });
    monthHasActivity.set(monthKey, false);
  }
  
  // Process each fasting log
  fastingLogs.forEach((log, index) => {
    try {
      // Normalize date objects
      const startTime = ensureDate(log.startTime);
      // For active fast, use current time as end time
      const endTime = log.endTime ? ensureDate(log.endTime) : new Date();
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error(`Period - Invalid date for log #${index}:`, log);
        return;
      }
      
      // Debug log
      console.log(`Period - Processing log #${index}:`, {
        id: log.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: (differenceInSeconds(endTime, startTime) / 3600).toFixed(2) + 'h',
        isInPeriod: (endTime >= sixMonthsAgo)
      });
      
      // Skip logs outside the period
      if (endTime < sixMonthsAgo) {
        console.log(`Period - Log #${index} outside period window, skipping`);
        return;
      }
      
      // Adjust start time if it's before our window
      const effectiveStartTime = isBefore(startTime, sixMonthsAgo) ? sixMonthsAgo : startTime;
      
      // For each month in our period, check if this fast falls within it
      for (let i = 0; i < 6; i++) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'MMM');
        
        const monthStart = max([startOfMonth(monthDate), sixMonthsAgo]);
        const monthEnd = min([endOfMonth(monthDate), now]);
        
        // Track total hours for this month (for months with activity)
        const totalHours = Math.max(0, (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60));
        monthData.get(monthKey).totalHours = totalHours;
        
        // Skip if this fast doesn't overlap with this month
        if (endTime < monthStart || effectiveStartTime > monthEnd) continue;
        
        // Calculate intersection of fast with this month
        const fastStartInMonth = max([monthStart, effectiveStartTime]);
        const fastEndInMonth = min([monthEnd, endTime]);
        
        // Calculate fasting seconds that fall within this month
        const fastingSecondsInMonth = differenceInSeconds(fastEndInMonth, fastStartInMonth);
        monthData.get(monthKey).fastingSeconds += fastingSecondsInMonth;
        
        // Mark this month as having activity
        monthHasActivity.set(monthKey, true);
        
        console.log(`Period - Adding ${(fastingSecondsInMonth / 3600).toFixed(2)}h to ${monthKey}`);
      }
    } catch (error) {
      console.error(`Period - Error processing log #${index}:`, error);
    }
  });
  
  // Only include months with actual fasting activity
  const result = [];
  
  // Calculate eating hours based on total elapsed time minus fasting time
  for (const [monthKey, data] of monthData.entries()) {
    // Only include data for months with fasting activity
    if (monthHasActivity.get(monthKey) && data.totalHours > 0) {
      // Convert seconds to hours and cap at total hours
      const fastingHours = Math.min(data.fastingSeconds / 3600, data.totalHours);
      
      // Calculate eating hours (total elapsed - fasting)
      const eatingHours = Math.max(0, data.totalHours - fastingHours);
      
      result.push({
        day: monthKey,
        fasting: fastingHours,
        eating: eatingHours // Will be made negative in prepareChartData
      });
      
      console.log(`Period - Final Month ${monthKey}: fasting=${fastingHours.toFixed(2)}h, total=${data.totalHours.toFixed(2)}h, eating=${eatingHours.toFixed(2)}h`);
    }
  }
  
  // Sort months in the correct order (most recent last)
  const monthOrder = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  result.sort((a, b) => {
    const indexA = monthOrder.indexOf(a.day);
    const indexB = monthOrder.indexOf(b.day);
    return indexA - indexB;
  });
  
  // For debugging
  console.log('Period - Chart data:', result);
  
  return result;
};
