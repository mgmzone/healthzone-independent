
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
  if (timeFilter === 'week') {
    return prepareWeeklyChartData(fastingLogs);
  } else if (timeFilter === 'month') {
    return prepareMonthlyChartData(fastingLogs);
  } else {
    return prepareYearlyChartData(fastingLogs);
  }
};
