
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
 * Prepare chart data based on time filter and fasting logs
 */
export const prepareChartData = (
  fastingLogs: FastingLog[], 
  timeFilter: 'week' | 'month' | 'year'
): ChartDataItem[] => {
  console.log(`prepareChartData called for ${timeFilter} with ${fastingLogs.length} logs`);
  
  // Log details about input logs
  if (fastingLogs.length > 0) {
    const sampleLog = fastingLogs[0];
    console.log('ChartData Sample log:', {
      id: sampleLog.id,
      startTime: sampleLog.startTime,
      startTimeIsDate: sampleLog.startTime instanceof Date,
      startTimeType: typeof sampleLog.startTime,
      endTime: sampleLog.endTime,
      endTimeIsDate: sampleLog.endTime instanceof Date,
      endTimeType: typeof sampleLog.endTime
    });
  }
  
  // Force logs array to be non-null
  const safeLogsArray = Array.isArray(fastingLogs) ? fastingLogs : [];
  
  let result;
  if (timeFilter === 'week') {
    result = prepareWeeklyChartData(safeLogsArray);
  } else if (timeFilter === 'month') {
    result = prepareMonthlyChartData(safeLogsArray);
  } else {
    result = prepareYearlyChartData(safeLogsArray);
  }
  
  // Validate result
  if (!Array.isArray(result)) {
    console.error(`Invalid result from prepare${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}ChartData:`, result);
    return [];
  }
  
  // Ensure all numeric values are proper numbers, not NaN
  const sanitizedResult = result.map(item => ({
    day: item.day,
    fasting: isNaN(Number(item.fasting)) ? 0 : Number(item.fasting),
    eating: isNaN(Number(item.eating)) ? 0 : Number(item.eating)
  }));
  
  console.log(`ChartData result for ${timeFilter}:`, sanitizedResult);
  return sanitizedResult;
};
