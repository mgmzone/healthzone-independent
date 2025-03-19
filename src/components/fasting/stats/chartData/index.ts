
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
  
  // Log a sample of the logs to verify format
  if (fastingLogs.length > 0) {
    console.log('ChartData Sample log:', {
      first: fastingLogs[0],
      startTimeIsDate: fastingLogs[0].startTime instanceof Date,
      endTimeIsDate: fastingLogs[0].endTime instanceof Date
    });
  }
  
  let result;
  if (timeFilter === 'week') {
    result = prepareWeeklyChartData(fastingLogs);
  } else if (timeFilter === 'month') {
    result = prepareMonthlyChartData(fastingLogs);
  } else {
    result = prepareYearlyChartData(fastingLogs);
  }
  
  console.log(`ChartData result for ${timeFilter}:`, result);
  return result;
};
