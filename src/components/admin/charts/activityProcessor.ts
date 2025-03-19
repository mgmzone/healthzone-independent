
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { ActivityLogItem } from '@/lib/services/admin';
import { TimeFilter, TimeFilteredData } from './types';
import { getDateRangeAndFormat, parseWeekday } from './dateUtils';
import { getEmptyTimeFilterData } from './emptyDataGenerator';
import { generateSummaryData } from './summaryData';
import { SystemStats } from '@/lib/services/admin';

// Process activity logs into time-filtered data
export const processActivityLogs = (
  logs: ActivityLogItem[],
  filter: TimeFilter
): TimeFilteredData[] => {
  // Return empty data structure if no logs
  if (logs.length === 0) {
    return getEmptyTimeFilterData(filter);
  }

  // For 'all' filter, we return summary data with zero counts
  if (filter === 'all') {
    return getEmptyTimeFilterData('all');
  }

  // Get date range, format, and grouping function based on the filter
  const { startDate, endDate, dateFormat, groupingFunction } = getDateRangeAndFormat(filter);
  
  // Initialize data array based on the filter
  const data = getEmptyTimeFilterData(filter);

  // Count activities by time period
  logs.forEach(log => {
    const logDate = typeof log.date === 'string' ? parseISO(log.date) : log.date;
    
    // Skip if outside the date range
    if (isBefore(logDate, startDate) || isAfter(logDate, endDate)) {
      return;
    }
    
    const key = groupingFunction(logDate);
    
    // Find the corresponding data entry
    const entry = data.find(d => {
      switch (filter) {
        case 'day':
          return format(new Date().setHours(parseInt(key), 0, 0, 0), dateFormat) === d.name;
        case 'week':
          return format(parseWeekday(key), dateFormat) === d.name;
        case 'month':
          return parseInt(key).toString() === d.name;
        case 'year':
          return format(new Date(new Date().getFullYear(), parseInt(key) - 1, 1), dateFormat) === d.name;
        default:
          return false;
      }
    });
    
    if (entry) {
      if (log.type === 'weighIn') {
        entry.weighIns = (entry.weighIns || 0) + 1;
      } else if (log.type === 'fast') {
        entry.fasts = (entry.fasts || 0) + 1;
      } else if (log.type === 'exercise') {
        entry.exercises = (entry.exercises || 0) + 1;
      }
    }
  });
  
  return data;
};

// Create a combined function to get chart data
export const getChartData = (
  stats: SystemStats,
  logs: ActivityLogItem[],
  timeFilter: TimeFilter
): TimeFilteredData[] => {
  if (timeFilter === 'all') {
    return generateSummaryData(stats);
  } else {
    return processActivityLogs(logs, timeFilter);
  }
};
