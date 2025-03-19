
import { FastingLog } from '@/lib/types';
import { prepareWeeklyChartData } from './weeklyChartData';
import { prepareMonthlyChartData } from './monthlyChartData';
import { prepareYearlyChartData } from './yearlyChartData';

export type ChartDataItem = {
  day: string;
  fasting: number;
  eating: number;
};

/**
 * Ensure date is a proper Date object
 */
const ensureDate = (date: any): Date => {
  if (date instanceof Date) return date;
  try {
    // Handle serialized Supabase dates
    if (date && typeof date === 'object' && '_type' in date) {
      if (date._type === 'Date') {
        if (date.value && typeof date.value === 'object' && 'iso' in date.value) {
          return new Date(date.value.iso);
        }
      }
    }
    // If it's a string, directly parse it
    if (typeof date === 'string') {
      return new Date(date);
    }
    // Create date from whatever we received
    return new Date(date);
  } catch (error) {
    console.error('Failed to parse date:', date, error);
    return new Date(); // Fallback to current date
  }
};

/**
 * Prepare chart data based on time filter and fasting logs
 */
export const prepareChartData = (
  fastingLogs: FastingLog[], 
  timeFilter: 'week' | 'month' | 'year'
): ChartDataItem[] => {
  console.log(`prepareChartData called for ${timeFilter} with ${fastingLogs?.length || 0} logs`);
  
  // Guard against null logs
  if (!fastingLogs || !Array.isArray(fastingLogs) || fastingLogs.length === 0) {
    console.log(`No logs for ${timeFilter} chart`);
    return getEmptyData(timeFilter);
  }
  
  // Normalize date objects in logs
  const normalizedLogs = fastingLogs.map(log => {
    const normalizedLog = { ...log };
    
    try {
      // Convert startTime to Date
      normalizedLog.startTime = ensureDate(log.startTime);
      
      // Convert endTime to Date if it exists
      if (log.endTime) {
        normalizedLog.endTime = ensureDate(log.endTime);
      }
    } catch (error) {
      console.error('Error normalizing log dates:', error);
    }
    
    return normalizedLog;
  }).filter(log => 
    log.startTime instanceof Date && !isNaN(log.startTime.getTime())
  );
  
  console.log(`Normalized ${normalizedLogs.length} logs for ${timeFilter} chart`);
  
  // Log a sample of the normalized logs
  if (normalizedLogs.length > 0) {
    console.log('Sample normalized log:', {
      id: normalizedLogs[0].id,
      startTime: normalizedLogs[0].startTime.toISOString(),
      endTime: normalizedLogs[0].endTime instanceof Date 
        ? normalizedLogs[0].endTime.toISOString() 
        : 'No end time'
    });
  }
  
  // Call the appropriate prepare function based on time filter
  let result: ChartDataItem[] = [];
  try {
    if (timeFilter === 'week') {
      result = prepareWeeklyChartData(normalizedLogs);
    } else if (timeFilter === 'month') {
      result = prepareMonthlyChartData(normalizedLogs);
    } else {
      result = prepareYearlyChartData(normalizedLogs);
    }
  } catch (error) {
    console.error(`Error preparing ${timeFilter} chart data:`, error);
    return getEmptyData(timeFilter);
  }
  
  // Validate result
  if (!Array.isArray(result) || result.length === 0) {
    console.warn(`Invalid or empty result from prepare${timeFilter} function`);
    return getEmptyData(timeFilter);
  }
  
  // Ensure all numeric values are proper numbers, not NaN
  const sanitizedResult = result.map(item => ({
    day: item.day,
    fasting: isNaN(Number(item.fasting)) ? 0 : Number(item.fasting),
    eating: isNaN(Number(item.eating)) ? 0 : Number(item.eating)
  }));
  
  console.log(`Chart data for ${timeFilter} prepared:`, JSON.stringify(sanitizedResult, null, 2));
  return sanitizedResult;
};

/**
 * Get empty data for different time filters
 */
const getEmptyData = (timeFilter: 'week' | 'month' | 'year'): ChartDataItem[] => {
  if (timeFilter === 'week') {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
      day,
      fasting: 0,
      eating: 0
    }));
  } else if (timeFilter === 'month') {
    return Array.from({ length: 5 }, (_, i) => ({
      day: `Week ${i + 1}`,
      fasting: 0,
      eating: 0
    }));
  } else {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      day: month,
      fasting: 0,
      eating: 0
    }));
  }
};
